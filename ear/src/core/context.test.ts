import { describe, expect, it } from 'vitest';
import { bassMidi, chordMidis } from '@shared/core/audio';
import {
  MAJOR_KEY_TONICS,
  MINOR_KEY_TONICS,
  chordNotes,
  chordSymbol,
  LETTERS,
  format,
  mod,
  parseNote,
  pc,
  type Key,
} from '@shared/core/music';
import { DRONE_HIGH, TONIC_OCTAVE, cadence, cadenceChords, droneNotes } from './context';

const KEYS: Key[] = [
  ...MAJOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'major' as const })),
  ...MINOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'minor' as const })),
];
const keyName = (k: Key) => `${format(k.tonic)} ${k.mode}`;
const key = (tonic: string, mode: Key['mode']): Key => ({ tonic: parseNote(tonic), mode });
const symbols = (k: Key, form?: 'full' | 'short') =>
  cadenceChords(k, form).map((c) => chordSymbol(c.chord));

/** The full cadence, written out by hand for each of the 24 keys (I IV V7 I / i iv V7 i). */
const FULL: Record<string, string[]> = {
  'C major': ['C', 'F', 'G7', 'C'],
  'G major': ['G', 'C', 'D7', 'G'],
  'D major': ['D', 'G', 'A7', 'D'],
  'A major': ['A', 'D', 'E7', 'A'],
  'E major': ['E', 'A', 'B7', 'E'],
  'B major': ['B', 'E', 'F♯7', 'B'],
  'F♯ major': ['F♯', 'B', 'C♯7', 'F♯'],
  'D♭ major': ['D♭', 'G♭', 'A♭7', 'D♭'],
  'A♭ major': ['A♭', 'D♭', 'E♭7', 'A♭'],
  'E♭ major': ['E♭', 'A♭', 'B♭7', 'E♭'],
  'B♭ major': ['B♭', 'E♭', 'F7', 'B♭'],
  'F major': ['F', 'B♭', 'C7', 'F'],
  'A minor': ['Am', 'Dm', 'E7', 'Am'],
  'E minor': ['Em', 'Am', 'B7', 'Em'],
  'B minor': ['Bm', 'Em', 'F♯7', 'Bm'],
  'F♯ minor': ['F♯m', 'Bm', 'C♯7', 'F♯m'],
  'C♯ minor': ['C♯m', 'F♯m', 'G♯7', 'C♯m'],
  'G♯ minor': ['G♯m', 'C♯m', 'D♯7', 'G♯m'],
  'E♭ minor': ['E♭m', 'A♭m', 'B♭7', 'E♭m'],
  'B♭ minor': ['B♭m', 'E♭m', 'F7', 'B♭m'],
  'F minor': ['Fm', 'B♭m', 'C7', 'Fm'],
  'C minor': ['Cm', 'Fm', 'G7', 'Cm'],
  'G minor': ['Gm', 'Cm', 'D7', 'Gm'],
  'D minor': ['Dm', 'Gm', 'A7', 'Dm'],
};

describe('cadenceChords', () => {
  it('is I IV V7 I in major and i iv V7 i in minor, by roman numeral', () => {
    expect(cadenceChords(key('C', 'major')).map((c) => c.roman)).toEqual(['I', 'IV', 'V7', 'I']);
    expect(cadenceChords(key('A', 'minor')).map((c) => c.roman)).toEqual(['i', 'iv', 'V7', 'i']);
    expect(cadenceChords(key('C', 'major'), 'short').map((c) => c.roman)).toEqual(['I', 'V7', 'I']);
    expect(cadenceChords(key('A', 'minor'), 'short').map((c) => c.roman)).toEqual(['i', 'V7', 'i']);
  });

  it('names the four chords of the full cadence and the three of the short one in all 24 keys', () => {
    expect(KEYS).toHaveLength(24);
    expect(Object.keys(FULL).sort()).toEqual(KEYS.map(keyName).sort());
    for (const k of KEYS) {
      const full = FULL[keyName(k)]!;
      expect(symbols(k), keyName(k)).toEqual(full);
      expect(symbols(k, 'short'), keyName(k)).toEqual([full[0], full[2], full[3]]);
      expect(cadenceChords(k).map((c) => c.degree)).toEqual([1, 4, 5, 1]);
      expect(cadenceChords(k, 'short').map((c) => c.degree)).toEqual([1, 5, 1]);
    }
  });

  it('gives the minor V7 the raised 7th: E7 in A minor is E G♯ B D, not G', () => {
    const v7 = cadenceChords(key('A', 'minor'))[2]!.chord;
    expect(chordNotes(v7).map(format)).toEqual(['E', 'G♯', 'B', 'D']);
    expect(chordNotes(v7).map(format)).not.toContain('G');
  });

  it('puts the leading tone in the V7 of every key: its 3rd is a letter and a semitone under the tonic', () => {
    for (const k of KEYS) {
      const third = chordNotes(cadenceChords(k)[2]!.chord)[1]!;
      expect(
        mod(LETTERS.indexOf(k.tonic.letter) - LETTERS.indexOf(third.letter), 7),
        keyName(k),
      ).toBe(1);
      expect(mod(pc(k.tonic) - pc(third), 12), keyName(k)).toBe(1);
    }
  });
});

describe('cadence', () => {
  // A beat is 60 / BPM seconds. Full: 3 chords of 1 beat + the last of 2 + the tonic's 1 = 6 beats;
  // short: 2 × 1 + 2 + 1 = 5 beats. At 60 BPM a beat is 1 s, at 160 BPM 0.375 s.
  it('lasts 6 beats in full and 5 short: 6 s / 5 s at 60 BPM, 2.25 s / 1.875 s at 160 BPM', () => {
    const c = key('C', 'major');
    expect(cadence(c, 60).duration).toBeCloseTo(6, 9);
    expect(cadence(c, 60, 'short').duration).toBeCloseTo(5, 9);
    expect(cadence(c, 160).duration).toBeCloseTo(2.25, 9);
    expect(cadence(c, 160, 'short').duration).toBeCloseTo(1.875, 9);
  });

  it('follows the tempo from 60 to 160 BPM in every key', () => {
    for (let bpm = 60; bpm <= 160; bpm += 10) {
      for (const k of KEYS) {
        expect(cadence(k, bpm).duration, `${keyName(k)} ${bpm}`).toBeCloseTo((6 * 60) / bpm, 9);
        expect(cadence(k, bpm, 'short').duration, `${keyName(k)} ${bpm}`).toBeCloseTo(
          (5 * 60) / bpm,
          9,
        );
      }
    }
  });

  it('clamps the tempo to 40–200 BPM', () => {
    const c = key('C', 'major');
    expect(cadence(c, 0).duration).toBeCloseTo((6 * 60) / 40, 9);
    expect(cadence(c, 10_000).duration).toBeCloseTo((6 * 60) / 200, 9);
  });

  it('plays one chord per beat, the last for two, then the tonic', () => {
    const beat = 60 / 120;
    const full = cadence(key('A', 'minor'), 120);
    expect(full.chords.map((s) => s.start / beat)).toEqual([0, 1, 2, 3]);
    expect(full.chords.map((s) => s.duration / beat)).toEqual([1, 1, 1, 2]);
    expect(full.tonic.time / beat).toBe(5);
    expect(full.tonic.duration / beat).toBe(1);
    const short = cadence(key('A', 'minor'), 120, 'short');
    expect(short.chords.map((s) => s.start / beat)).toEqual([0, 1, 2]);
    expect(short.chords.map((s) => s.duration / beat)).toEqual([1, 1, 2]);
    expect(short.tonic.time / beat).toBe(4);
  });

  it('strums each chord down from its bass root, every string ringing to the end of the chord', () => {
    for (const k of KEYS) {
      for (const step of cadence(k, 160).chords) {
        expect(step.notes.map((n) => n.midi)).toEqual(chordMidis(step.chord));
        expect(step.notes[0]).toMatchObject({ midi: bassMidi(step.chord.root), time: step.start });
        for (let i = 1; i < step.notes.length; i++)
          expect(step.notes[i]!.time).toBeGreaterThan(step.notes[i - 1]!.time);
        for (const n of step.notes)
          expect(n.time + n.duration).toBeCloseTo(step.start + step.duration, 9);
      }
    }
  });

  it('voices E7 in A minor with G♯ (MIDI pitch class 8), not G', () => {
    const e7 = cadence(key('A', 'minor'), 100).chords[2]!;
    const pcs = e7.notes.map((n) => mod(n.midi, 12));
    expect(pcs).toContain(8);
    expect(pcs).not.toContain(7);
  });

  it('sounds the tonic in octave TONIC_OCTAVE (4: MIDI 60–71) in every key', () => {
    expect(TONIC_OCTAVE).toBe(4);
    for (const k of KEYS) {
      const { midi } = cadence(k, 90).tonic;
      expect(mod(midi, 12), keyName(k)).toBe(pc(k.tonic));
      expect(midi, keyName(k)).toBeGreaterThanOrEqual(60);
      expect(midi, keyName(k)).toBeLessThanOrEqual(71);
    }
  });
});

describe('droneNotes', () => {
  it('is 1 and 5, no 3rd, inside MIDI 40–52, in all 24 keys', () => {
    expect(DRONE_HIGH).toBe(52);
    for (const k of KEYS) {
      const notes = droneNotes(k);
      const pcs = notes.map((m) => mod(m, 12));
      expect(notes, keyName(k)).toHaveLength(2);
      expect(notes[0]!, keyName(k)).toBeLessThan(notes[1]!);
      expect(new Set(pcs), keyName(k)).toEqual(new Set([pc(k.tonic), mod(pc(k.tonic) + 7, 12)]));
      expect(pcs, keyName(k)).not.toContain(mod(pc(k.tonic) + 3, 12));
      expect(pcs, keyName(k)).not.toContain(mod(pc(k.tonic) + 4, 12));
      for (const m of notes) {
        expect(m, keyName(k)).toBeGreaterThanOrEqual(40);
        expect(m, keyName(k)).toBeLessThanOrEqual(52);
      }
    }
  });

  it('is the same in major and minor on the same tonic', () => {
    for (const { tonic } of KEYS)
      expect(droneNotes({ tonic, mode: 'minor' })).toEqual(droneNotes({ tonic, mode: 'major' }));
  });

  it('puts the 5th above the bass root while it fits, else below: E → E2 B2, A → A2 E3, B → F♯2 B2', () => {
    expect(droneNotes(key('E', 'minor'))).toEqual([40, 47]);
    expect(droneNotes(key('A', 'major'))).toEqual([45, 52]);
    expect(droneNotes(key('B', 'major'))).toEqual([42, 47]);
  });
});
