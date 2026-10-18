import { describe, expect, it } from 'vitest';
import { chordMidis } from '@shared/core/audio';
import { MAJOR_KEY_TONICS, parseNote, type Chord, type Key } from '@shared/core/music';
import { MIDDLE_RANGE } from '../core/levels';
import { resolution } from '../core/resolution';
import {
  RIGHT_CLICK,
  STRUM_SPREAD_SEC,
  answerComparePart,
  chordPart,
  comparePart,
  contextPart,
  demoPart,
  notePart,
  progressionPart,
  resolutionPart,
  tunePart,
  tuningPart,
  twoNotesPart,
  waitPart,
  type Part,
} from './timeline';

const C_MAJOR: Key = { tonic: parseNote('C'), mode: 'major' };
const A_MINOR: Key = { tonic: parseNote('A'), mode: 'minor' };

describe('timeline parts, at 60 BPM (a beat is 1 s)', () => {
  it('context: four strummed chords (guitar), then the tonic as a note; 6 beats in all', () => {
    const p = contextPart(C_MAJOR, 60, 60);
    const chords = p.sounds.filter((s) => s.kind === 'chord');
    const starts = [...new Set(chords.map((s) => Math.floor(s.time)))];
    expect(starts).toEqual([0, 1, 2, 3]);
    expect(p.sounds.at(-1)).toEqual({ kind: 'note', midi: 60, time: 5, length: 1 });
    expect(p.sounds.filter((s) => s.kind === 'note')).toHaveLength(1);
    expect(p.duration).toBe(6);
    expect(contextPart(C_MAJOR, 48, 60, 'short').duration).toBe(5);
    expect(contextPart(C_MAJOR, 48, 60).sounds.at(-1)!.midi).toBe(48);
  });

  it('note: two beats', () => {
    expect(notePart(64, 60)).toEqual({
      sounds: [{ kind: 'note', midi: 64, time: 0, length: 2 }],
      duration: 2,
    });
    expect(notePart(64, 120).duration).toBe(1);
  });

  it('compare: picked for a beat, half a beat of gap, right for a beat, half a beat of rest', () => {
    expect(comparePart(64, 63, 60)).toEqual({
      sounds: [
        { kind: 'note', midi: 64, time: 0, length: 1 },
        { kind: 'note', midi: 63, time: 1.5, length: 1 },
      ],
      duration: 3,
    });
  });

  it('resolution: eighths, the closing tonic a beat (C major 3 → 3 2 1, A minor b5 → b5 4 b3 2 1)', () => {
    expect(resolutionPart(resolution(C_MAJOR, '3', 64), 60)).toEqual({
      sounds: [
        { kind: 'note', midi: 64, time: 0, length: 0.5 },
        { kind: 'note', midi: 62, time: 0.5, length: 0.5 },
        { kind: 'note', midi: 60, time: 1, length: 1 },
      ],
      duration: 2,
    });
    const minor = resolutionPart(resolution(A_MINOR, 'b5', 63), 60);
    expect(minor.sounds.map((s) => [s.midi, s.time])).toEqual([
      [63, 0],
      [62, 0.5],
      [60, 1],
      [59, 1.5],
      [57, 2],
    ]);
    expect(minor.duration).toBe(3);
  });

  it('a tonic alone resolves to itself: one beat', () => {
    expect(resolutionPart(resolution(C_MAJOR, '1', 60), 60)).toEqual({
      sounds: [{ kind: 'note', midi: 60, time: 0, length: 1 }],
      duration: 1,
    });
  });

  it('wait: silence for its beats; the right click: one accented click', () => {
    expect(waitPart(4, 60)).toEqual({ sounds: [], duration: 4 });
    expect(waitPart(2, 120).duration).toBe(1);
    expect(RIGHT_CLICK).toEqual({ sounds: [{ kind: 'click', time: 0 }], duration: 0 });
  });

  it('clamps the tempo as the cadence does (40–200)', () => {
    expect(notePart(60, 10).duration).toBe(notePart(60, 40).duration);
    expect(comparePart(60, 61, 999).duration).toBe(comparePart(60, 61, 200).duration);
  });
});

const chord = (root: string, id: Chord['id'] = 'major'): Chord => ({ root: parseNote(root), id });
const A = chord('A');
const r = (x: number) => +x.toFixed(4);
/** Each sound as [midi, start, length], rounded. */
const notes = (p: Part) => p.sounds.map((s) => [s.midi, r(s.time), r(s.length!)]);

describe("the beginner levels' parts, at 60 BPM (a beat is 1 s)", () => {
  it('two notes: a beat each, half a beat of silence between', () => {
    expect(twoNotesPart(57, 64, 60)).toEqual({
      sounds: [
        { kind: 'note', midi: 57, time: 0, length: 1 },
        { kind: 'note', midi: 64, time: 1.5, length: 1 },
      ],
      duration: 2.5,
    });
    // The same note twice (level 1's "same") is still two notes.
    expect(twoNotesPart(60, 60, 120).sounds.map((s) => [s.midi, s.time])).toEqual([
      [60, 0],
      [60, 0.75],
    ]);
  });

  it('a tune: a beat a note in order, each until the next, the last two beats', () => {
    expect(notes(tunePart([57, 60, 64], 60))).toEqual([
      [57, 0, 1],
      [60, 1, 1],
      [64, 2, 2],
    ]);
    expect(tunePart([57, 60, 64], 60).duration).toBe(4);
    expect(tunePart([], 60)).toEqual({ sounds: [], duration: 0 });
  });

  it('a strummed chord: every string, low to high, STRUM_SPREAD_SEC apart, all ringing to the end', () => {
    const p = chordPart(A, 'strum', 60);
    const voicing = chordMidis(A);
    expect(p.sounds.every((s) => s.kind === 'chord')).toBe(true);
    expect(p.sounds.map((s) => s.midi)).toEqual(voicing);
    p.sounds.forEach((s, i) => {
      expect(s.time).toBeCloseTo(i * STRUM_SPREAD_SEC, 10);
      expect(s.time + s.length!).toBeCloseTo(3, 10);
    });
    // A strum, not a run: the whole spread is under a tenth of a second.
    expect(p.sounds.at(-1)!.time).toBeLessThan(0.1);
    expect(p.duration).toBe(3);
  });

  it('an arpeggio: the same notes one by one, half a beat apart, each stopped by the next', () => {
    const p = chordPart(chord('A', 'minor'), 'arpeggio', 60);
    const voicing = chordMidis(chord('A', 'minor'));
    expect(notes(p)).toEqual([
      [voicing[0], 0, 0.5],
      [voicing[1], 0.5, 0.5],
      [voicing[2], 1, 0.5],
      [voicing[3], 1.5, 1.5],
    ]);
    // No two notes sound at once, so it is heard as single notes.
    for (let i = 1; i < p.sounds.length; i++) {
      const prev = p.sounds[i - 1]!;
      expect(prev.time + prev.length!).toBeLessThanOrEqual(p.sounds[i]!.time + 1e-9);
    }
    expect(p.duration).toBe(3);
  });

  it('a chord plays the voicing given (a chord moved up the neck), and a long arpeggio never rings backwards', () => {
    const moved = [57, 64, 69, 73];
    expect(chordPart(A, 'strum', 60, moved).sounds.map((s) => s.midi)).toEqual(moved);
    const long = chordPart(A, 'arpeggio', 60, [45, 52, 57, 61, 64, 69, 73, 76]);
    expect(long.sounds.every((s) => s.length! > 0)).toBe(true);
    expect(long.duration).toBe(4);
  });

  it('chords stay in the open-chord span of the guitar: low E (40) to the A above the middle (70)', () => {
    for (const root of MAJOR_KEY_TONICS) {
      for (const id of ['major', 'minor'] as const) {
        for (const style of ['strum', 'arpeggio'] as const) {
          const midis = chordPart({ root, id }, style, 90).sounds.map((s) => s.midi!);
          expect(Math.min(...midis)).toBeGreaterThanOrEqual(40);
          expect(Math.max(...midis)).toBeLessThanOrEqual(70);
        }
      }
    }
  });

  it('a progression: a strum every two beats, the last held three (A D E A)', () => {
    const chords = [A, chord('D'), chord('E'), A];
    const p = progressionPart(chords, 60);
    const firsts = chords.map((c) => chordMidis(c)[0]);
    const starts = p.sounds.filter((s) => firsts.includes(s.midi!) && Number.isInteger(s.time));
    expect(starts.map((s) => [s.midi, s.time])).toEqual([
      [45, 0],
      [50, 2],
      [40, 4],
      [45, 6],
    ]);
    expect(p.sounds).toHaveLength(chords.reduce((n, c) => n + chordMidis(c).length, 0));
    // Each chord stops as the next is strummed; the last rings to the end.
    for (const s of p.sounds)
      expect(r(s.time + s.length!)).toBe(s.time < 6 ? Math.floor(s.time) + 2 : 9);
    expect(p.duration).toBe(9);
    expect(progressionPart([], 60).duration).toBe(0);
  });

  it('a wrong answer, for any part: what was picked, a beat of silence, then what it was', () => {
    const picked = chordPart(chord('A', 'minor'), 'strum', 60);
    const right = chordPart(A, 'strum', 60);
    const p = answerComparePart(picked, right, 60);
    expect(p.starts).toEqual([0, 4]);
    expect(p.duration).toBe(7);
    expect(p.sounds.slice(0, picked.sounds.length)).toEqual(picked.sounds);
    expect(p.sounds.slice(picked.sounds.length)).toEqual(
      right.sounds.map((s) => ({ ...s, time: s.time + 4 })),
    );
    // Two notes against two notes: the same shape at another tempo.
    const two = answerComparePart(twoNotesPart(57, 57, 120), twoNotesPart(57, 59, 120), 120);
    expect(two.starts).toEqual([0, 1.75]);
    expect(notes(two).map(([m, t]) => [m, t])).toEqual([
      [57, 0],
      [57, 0.75],
      [57, 1.75],
      [59, 2.5],
    ]);
  });

  it('a demo: the examples in order, two beats apart, each where `starts` says', () => {
    const examples = [
      twoNotesPart(57, 64, 60),
      twoNotesPart(64, 57, 60),
      tunePart([57, 59, 60], 60),
    ];
    const p = demoPart(examples, 60);
    expect(p.starts).toEqual([0, 4.5, 9]);
    expect(p.duration).toBe(13);
    expect(p.sounds.map((s) => s.midi)).toEqual([57, 64, 64, 57, 57, 59, 60]);
    expect(demoPart([], 60)).toEqual({ sounds: [], duration: 0, starts: [] });
  });

  it('tuning: the six open strings E A D G B E, low to high, 2.5 s each whatever the tempo', () => {
    expect(notes(tuningPart())).toEqual([
      [40, 0, 2.5],
      [45, 2.5, 2.5],
      [50, 5, 2.5],
      [55, 7.5, 2.5],
      [59, 10, 2.5],
      [64, 12.5, 2.5],
    ]);
    expect(tuningPart().duration).toBe(15);
  });

  it('single notes and tunes play exactly what they are given, so a level in the middle range stays there', () => {
    const { low, high } = MIDDLE_RANGE;
    expect([low, high]).toEqual([45, 69]);
    const parts = [
      twoNotesPart(low, high, 90),
      tunePart([low, 57, high], 90),
      demoPart([twoNotesPart(low, high, 90)], 90),
    ];
    for (const p of parts) {
      for (const s of p.sounds) {
        expect(s.midi!).toBeGreaterThanOrEqual(low);
        expect(s.midi!).toBeLessThanOrEqual(high);
      }
    }
  });

  it('every new part clamps the tempo as the cadence does (40–200)', () => {
    expect(twoNotesPart(60, 62, 10)).toEqual(twoNotesPart(60, 62, 40));
    expect(tunePart([60, 62], 999)).toEqual(tunePart([60, 62], 200));
    expect(chordPart(A, 'arpeggio', 0)).toEqual(chordPart(A, 'arpeggio', 40));
    expect(progressionPart([A], 500)).toEqual(progressionPart([A], 200));
  });
});
