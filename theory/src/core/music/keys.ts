/** Keys, key signatures, relative keys, diatonic chords and roman numerals (K2.2, K2.8, K5.2, K5.3). */
import { CHORDS, identifyChord, type Chord, type ChordId } from './chords';
import { interval, transpose, transposeDown } from './interval';
import type { NoteName } from './pitch';
import { scaleNotes } from './scales';

export type Mode = 'major' | 'minor';

export interface Key {
  readonly tonic: NoteName;
  readonly mode: Mode;
}

/** The sharps or flats a major key needs, in key-signature order (F C G D A E B / B E A D G C F). */
export function keySignature(majorTonic: NoteName): NoteName[] {
  const notes = scaleNotes(majorTonic, 'major').filter((n) => n.alter !== 0);
  const sharps = notes.every((n) => n.alter > 0);
  const order = sharps ? 'FCGDAEB' : 'BEADGCF';
  return [...notes].sort((a, b) => order.indexOf(a.letter) - order.indexOf(b.letter));
}

/** The relative key: same notes, other home (K2.8). C major ↔ A minor. */
export function relativeKey(key: Key): Key {
  return key.mode === 'major'
    ? { tonic: transpose(key.tonic, interval('6')), mode: 'minor' }
    : { tonic: transpose(key.tonic, interval('b3')), mode: 'major' };
}

/** Tonic of the relative minor of a major tonic (6th degree), and back. */
export const relativeMinorTonic = (majorTonic: NoteName): NoteName => transpose(majorTonic, interval('6'));
export const relativeMajorTonic = (minorTonic: NoteName): NoteName => transposeDown(minorTonic, interval('6'));

export interface DiatonicChord {
  /** 1..7 */
  readonly degree: number;
  readonly chord: Chord;
  /** 'I', 'ii', 'vii°', 'Imaj7', 'V7', 'viiø7' … */
  readonly roman: string;
}

/**
 * Build a chord on every degree by stacking every-other scale note (K5.2). `size` 3 gives
 * triads, 4 gives seventh chords. Works for major and natural minor keys.
 */
export function diatonicChords(key: Key, size: 3 | 4 = 3): DiatonicChord[] {
  const scale = scaleNotes(key.tonic, key.mode === 'major' ? 'major' : 'naturalMinor');
  return scale.map((root, i) => {
    const notes = Array.from({ length: size }, (_, k) => scale[(i + 2 * k) % 7]!);
    const id = identifyChord(root, notes);
    if (!id) throw new Error(`Unrecognised diatonic chord on degree ${i + 1}`);
    return { degree: i + 1, chord: { root, id }, roman: romanFor(i + 1, id) };
  });
}

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const LOWER: ReadonlySet<ChordId> = new Set(['minor', 'dim', 'm7', 'm7b5', 'dim7', 'm9', 'm11']);
const ROMAN_SUFFIX: Partial<Record<ChordId, string>> = {
  dim: '°', aug: '+', maj7: 'maj7', m7: '7', dom7: '7', m7b5: 'ø7', dim7: '°7', aug7: '+7',
};

/** Roman numeral for a chord quality on a scale degree: uppercase major, lowercase minor (K5.3). */
export function romanFor(degree: number, id: ChordId): string {
  const base = NUMERALS[degree - 1];
  if (!base) throw new RangeError(`Degree ${degree} out of range`);
  const numeral = LOWER.has(id) ? base.toLowerCase() : base;
  return numeral + (ROMAN_SUFFIX[id] ?? (CHORDS[id].suffix === '' || CHORDS[id].suffix === 'm' ? '' : CHORDS[id].suffix));
}
