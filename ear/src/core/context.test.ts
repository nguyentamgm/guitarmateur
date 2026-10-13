import { describe, expect, it } from 'vitest';
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
import { cadenceChords } from './context';

const KEYS: Key[] = [
  ...MAJOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'major' as const })),
  ...MINOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'minor' as const })),
];
const keyName = (k: Key) => `${format(k.tonic)} ${k.mode}`;
const key = (tonic: string, mode: Key['mode']): Key => ({ tonic: parseNote(tonic), mode });
const symbols = (k: Key, form?: 'full' | 'short') => cadenceChords(k, form).map((c) => chordSymbol(c.chord));

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
      expect(mod(LETTERS.indexOf(k.tonic.letter) - LETTERS.indexOf(third.letter), 7), keyName(k)).toBe(1);
      expect(mod(pc(k.tonic) - pc(third), 12), keyName(k)).toBe(1);
    }
  });
});
