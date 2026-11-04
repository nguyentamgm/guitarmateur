import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { TONICS, midi, type Chord } from '../music';
import { TUNINGS, positions, mergedBox } from '../fretboard';
import { PHRASES, type Phrase } from './vocabulary';
import { realizePhrase, spell } from './realize';
import { callAndResponse, candidates, displaced, nativeLevel, withRest, type PhraseContext } from './select';
import { generateLick, type LickParams } from './index';

const A = TONICS.find((t) => t.letter === 'A' && t.alter === 0)!;
const D = TONICS.find((t) => t.letter === 'D' && t.alter === 0)!;
const a7: Chord = { tonic: A, quality: 'dom7' };
const pos = positions(TUNINGS.standard, { tonic: A, scaleId: 'minorPentatonic' });
const box = mergedBox(pos, [pos.find((p) => p.minFret === 5)!.index]);
const byId = (id: string) => PHRASES.find((p) => p.id === id)!;
/** A2, the A that the key-relative phrases are written from when they sit in the 5th-fret box. */
const A3 = 57;
const ctx = (level: LickParams['level'], baseMidi = A3) => ({ box, chord: a7, targetChord: a7, targetRole: 'R' as const, level, baseMidi });

describe('the vocabulary itself', () => {
  it('every phrase is well formed: ordered, non-overlapping, ending on its landing at the bar line', () => {
    for (const p of PHRASES) {
      const ns = p.notes;
      for (let i = 1; i < ns.length; i++) {
        expect(ns[i]!.at, p.id).toBeGreaterThanOrEqual(ns[i - 1]!.at + ns[i - 1]!.dur - 1e-9);
      }
      const last = ns.at(-1)!;
      expect(last.at + last.dur, p.id).toBe(p.beats);
      expect(last.p && 'target' in last.p, p.id).toBe(true);
      expect(ns[0]!.at, p.id).toBeGreaterThanOrEqual(0);
    }
  });

  it('bends and releases follow from the note before; releases come straight after a bend', () => {
    for (const p of PHRASES) {
      p.notes.forEach((nt, i) => {
        const bend = nt.tech === 'bendFull' || nt.tech === 'bendHalf';
        if (bend || nt.tech === 'release') expect(nt.p, p.id).toBeUndefined();
        if (nt.tech === 'release') expect(p.notes[i - 1]!.tech, p.id).toMatch(/^bend/);
        if (bend || nt.tech === 'release') expect(i, p.id).toBeGreaterThan(0);
      });
    }
  });

  it('chromatic notes move by half step to a neighbour', () => {
    for (const p of PHRASES) {
      p.notes.forEach((nt, i) => {
        if (!nt.chromatic || !nt.p || !('s' in nt.p)) return;
        const near = [p.notes[i - 1], p.notes[i + 1]].map((x) => (x?.p && 's' in x.p ? x.p.s : undefined));
        expect(near.some((s) => s !== undefined && Math.abs(s - (nt.p as { s: number }).s) === 1), p.id).toBe(true);
      });
    }
  });

  it('most phrases use no technique at all — a lick does not need one', () => {
    const plain = PHRASES.filter((p) => p.notes.every((n) => !n.tech && n.partner === undefined));
    expect(plain.length / PHRASES.length).toBeGreaterThan(0.5);
  });

  it('has phrases written for every level', () => {
    for (const level of [1, 2, 3, 4, 5]) expect(PHRASES.some((p) => nativeLevel(p) === level)).toBe(true);
  });
});

describe('realizePhrase', () => {
  it('plays the 4-to-5 bend as the 4th fretted on a top string and pushed up a whole step', () => {
    const notes = realizePhrase(byId('four-to-five-bend'), ctx(3))!;
    expect(notes).not.toBeNull();
    const [four, bent] = notes;
    expect(bent!.technique).toBe('bendFull');
    expect(midi(bent!.pitch) - midi(four!.pitch)).toBe(2);
    expect(bent!.string).toBe(four!.string);
    expect(bent!.fret).toBe(four!.fret + 2);
    expect(four!.string).toBeGreaterThanOrEqual(3);
    expect(bent!.vibrato).toBe(true);
    expect(notes.at(-1)!.role).toBe('R');
  });

  it('lets a released bend back down to the cell it started from', () => {
    const notes = realizePhrase(byId('bend-release-descent'), ctx(3))!;
    const [origin, bent, released] = notes;
    expect(released!.technique).toBe('release');
    expect(released!.string).toBe(origin!.string);
    expect(released!.fret).toBe(origin!.fret);
    expect(midi(released!.pitch)).toBe(midi(origin!.pitch));
    expect(bent!.fret).toBe(origin!.fret + 2);
  });

  it('puts the double stop partner on the next string up, a 3rd above', () => {
    const notes = realizePhrase(byId('double-stop-shuffle'), ctx(3))!;
    const ds = notes[0]!;
    expect(ds.partner).toBeDefined();
    expect(ds.partner!.string).toBe(ds.string + 1);
    expect(midi(ds.partner!.pitch) - midi(ds.pitch)).toBe(4);
  });

  it('plays the same phrase plain below level 3: no bends, double stops or vibrato', () => {
    for (const id of ['double-stop-shuffle', 'minor-descent']) {
      const notes = realizePhrase(byId(id), ctx(2));
      for (const n of notes ?? []) {
        expect(n.technique).toBeUndefined();
        expect(n.partner).toBeUndefined();
        expect(n.vibrato).toBeUndefined();
      }
    }
    // A bend phrase cannot be played plain where its bent note is not in the box.
    expect(realizePhrase(byId('four-to-five-bend'), ctx(2))?.some((n) => n.technique) ?? false).toBe(false);
  });

  it('turns down a phrase whose notes are not in the scale', () => {
    // A major arpeggio over A7 needs C♯, which A minor pentatonic does not have.
    expect(realizePhrase(byId('arpeggio-turn'), { ...ctx(3), chord: { tonic: A, quality: 'M' } })).toBeNull();
  });

  it('spells notes outside the scale with the smallest accidental, sharp going up and flat going down', () => {
    expect(spell(56, box, 57)).toMatchObject({ letter: 'G', alter: 1 }); // G♯ up into A
    expect(spell(56, box, 55)).toMatchObject({ letter: 'A', alter: -1 }); // A♭ down into G
    expect(spell(53, box, 52)).toMatchObject({ letter: 'F', alter: 0 }); // F, never E♯
  });
});

describe('selection and variation', () => {
  const pctx = (params: Partial<LickParams>): PhraseContext => ({
    box,
    chord: a7,
    targetChord: a7,
    tonicPc: 9,
    params: { level: 3, targetRole: 'R', resolveToNext: false, seed: 0, ...params },
  });

  it('offers turnarounds mostly at the end of the progression', () => {
    const weight = (turnaround: boolean) =>
      candidates(pctx({ turnaround }), 4).filter((c) => c.item.kind === 'turnaround').reduce((s, c) => s + c.weight, 0);
    expect(weight(true)).toBeGreaterThan(weight(false) * 10);
  });

  it('only offers phrases the level can play', () => {
    for (const c of candidates(pctx({ level: 1 }), 4)) expect(nativeLevel(c.item)).toBe(1);
  });

  it('call and response: the call hangs on an open chord tone, the answer starts in bar 2 and lands', () => {
    const p = byId('short-call-answer');
    const cr = callAndResponse(p, p, mulberry32(1));
    expect(cr.beats).toBe(8);
    const callEnd = cr.notes[p.notes.length - 1]!.p!;
    expect('ct' in callEnd && ['5', '7', '3'].includes(callEnd.ct)).toBe(true);
    expect(cr.notes[p.notes.length]!.at).toBeGreaterThanOrEqual(4);
    expect('target' in cr.notes.at(-1)!.p!).toBe(true);
  });

  it('displacement moves the phrase half a beat later and still ends on the bar line', () => {
    const d = displaced(byId('three-step-home'))!;
    expect(d.notes[0]!.at).toBe(0.5);
    expect(d.notes.at(-1)!.at + d.notes.at(-1)!.dur).toBe(4);
  });

  it('a rest variation leaves one inner note out and keeps the landing', () => {
    const p: Phrase = byId('minor-descent');
    const r = withRest(p, mulberry32(3))!;
    expect(r.notes.length).toBe(p.notes.length - 1);
    expect(r.notes[0]).toEqual(p.notes[0]);
    expect(r.notes.at(-1)).toEqual(p.notes.at(-1));
  });
});

describe('generateLick — vocabulary in use', () => {
  it('draws most licks from the vocabulary, from many different phrases', () => {
    const sources = new Map<string, number>();
    for (let seed = 0; seed < 100; seed++) {
      const src = generateLick(box, a7, null, { level: 3, targetRole: 'R', resolveToNext: false, seed }).source!;
      sources.set(src, (sources.get(src) ?? 0) + 1);
    }
    expect(100 - (sources.get('generated') ?? 0)).toBeGreaterThan(55);
    expect(sources.size).toBeGreaterThan(8);
  });

  it('does not put a technique in every lick, even at level 4', () => {
    let plain = 0;
    for (let seed = 0; seed < 100; seed++) {
      const lick = generateLick(box, a7, null, { level: 4, targetRole: 'R', resolveToNext: false, seed });
      if (lick.notes.every((n) => !n.technique && !n.partner)) plain++;
    }
    expect(plain).toBeGreaterThan(10);
    expect(plain).toBeLessThan(90);
  });

  it('rarely repeats the phrase the previous chord just played', () => {
    let same = 0;
    let total = 0;
    for (let seed = 0; seed < 80; seed++) {
      const first = generateLick(box, a7, null, { level: 3, targetRole: 'R', resolveToNext: false, seed });
      if (first.source === 'generated') continue;
      const second = generateLick(box, { tonic: D, quality: 'dom7' }, null, {
        level: 3, targetRole: 'R', resolveToNext: false, seed: seed + 500, previousSource: first.source,
      });
      total++;
      if (second.source === first.source) same++;
    }
    expect(same / total).toBeLessThan(0.1);
  });
});

describe('harmonic fit', () => {
  it('curls the chord’s own minor 3rd, so the curl is never played over a chord it clashes with', () => {
    const F = TONICS.find((t) => t.letter === 'F' && t.alter === 0)!;
    const curl = byId('minor-third-curl');
    // Over F major the chord's ♭3 is A♭, not in A minor pentatonic: not offered.
    for (const base of [41, 53, 65]) {
      expect(realizePhrase(curl, { ...ctx(3, base), chord: { tonic: F, quality: 'M' }, targetChord: { tonic: F, quality: 'M' } })).toBeNull();
    }
    // Over A7 it bends C toward C♯, the chord's 3rd.
    const notes = [45, 57, 69].map((b) => realizePhrase(curl, ctx(3, b))).find((x) => x)!;
    const bent = notes.find((n) => n.technique === 'bendHalf')!;
    expect(((midi(bent.pitch) - 9) % 12 + 12) % 12).toBe(4);
  });

  it('plays a turnaround on the last chord most of the time', () => {
    let turnarounds = 0;
    for (let seed = 0; seed < 60; seed++) {
      const lick = generateLick(box, { tonic: TONICS.find((t) => t.letter === 'E' && t.alter === 0)!, quality: 'dom7' }, null, {
        level: 3, targetRole: 'R', resolveToNext: false, seed, turnaround: true,
      });
      if (lick.source && PHRASES.find((p) => p.id === lick.source)?.kind === 'turnaround') turnarounds++;
    }
    expect(turnarounds).toBeGreaterThan(20);
  });
});
