/**
 * Intervals carry a letter distance AND a semitone count; the letter distance is what makes
 * spelling automatic (a minor third above G♭ is B𝄫, never A). K2.3–K2.6.
 *
 * Formulas throughout Theory are written as degree labels ('1', 'b3', '#5', 'bb7', '9'), the same
 * notation as docs/theory-knowledge, and converted here.
 */
import { LETTERS, letterIndex, letterSemitone, mod, format, type Alter, type NoteName, type Pitch, pitchAt, midi } from './pitch';

export interface Interval {
  /** Letter distance: unison 0, second 1, … octave 7, ninth 8. */
  readonly degrees: number;
  readonly semitones: number;
}

/** Semitones of each major-scale degree above the root (degree 1..7). */
const MAJOR = [0, 2, 4, 5, 7, 9, 11];

/** A degree label: optional accidentals then a degree number 1–13. */
export type DegreeLabel = string;

/** 'b3' → { degrees: 2, semitones: 3 }; '9' → { degrees: 8, semitones: 14 }; 'bb7' → { 6, 9 }. */
export function interval(label: DegreeLabel): Interval {
  const m = /^(bb|b|##|#)?(\d{1,2})$/.exec(label);
  if (!m) throw new SyntaxError(`Not a degree label: "${label}"`);
  const n = Number(m[2]);
  if (n < 1 || n > 15) throw new RangeError(`Degree out of range: "${label}"`);
  const acc = { '': 0, b: -1, bb: -2, '#': 1, '##': 2 }[m[1] ?? '']!;
  const degrees = n - 1;
  const semitones = MAJOR[degrees % 7]! + 12 * Math.floor(degrees / 7) + acc;
  return { degrees, semitones };
}

/** Transpose a note name up by an interval with correct spelling. */
export function transpose(n: NoteName, iv: Interval): NoteName {
  const from = letterIndex(n.letter);
  const to = from + iv.degrees;
  const letter = LETTERS[mod(to, 7)]!;
  const target = letterSemitone(n.letter) + n.alter + iv.semitones;
  const natural = letterSemitone(letter) + 12 * Math.floor(to / 7);
  const alter = target - natural;
  if (alter < -2 || alter > 2) {
    throw new RangeError(`${format(n)} + ${iv.degrees}/${iv.semitones} needs alter ${alter}`);
  }
  return { letter, alter: alter as Alter };
}

/** Transpose a pitch, keeping spelling and computing the new octave. */
export function transposePitch(p: Pitch, iv: Interval): Pitch {
  return pitchAt(transpose(p, iv), midi(p) + iv.semitones);
}

/** Transpose down (the inverse of `transpose`). */
export function transposeDown(n: NoteName, iv: Interval): NoteName {
  return transpose(n, { degrees: -iv.degrees, semitones: -iv.semitones });
}

/** The interval from `a` up to `b` within one octave, as a degree label relative to `a`. */
export function degreeOf(root: NoteName, n: NoteName): DegreeLabel {
  const degrees = mod(letterIndex(n.letter) - letterIndex(root.letter), 7);
  const semis = mod(letterSemitone(n.letter) + n.alter - (letterSemitone(root.letter) + root.alter), 12);
  let acc = semis - MAJOR[degrees]!;
  if (acc > 6) acc -= 12;
  if (acc < -6) acc += 12;
  const prefix = { [-2]: 'bb', [-1]: 'b', 0: '', 1: '#', 2: '##' }[acc];
  if (prefix === undefined) throw new RangeError(`No degree label for ${format(n)} over ${format(root)}`);
  return `${prefix}${degrees + 1}`;
}

/** Interval names for display, keyed by degree label (vi + en live in lesson content, not here). */
export const INTERVAL_TABLE: readonly { label: DegreeLabel; semitones: number }[] = [
  '1', 'b2', '2', 'b3', '3', '4', '#4', 'b5', '5', '#5', 'b6', '6', 'b7', '7', '8',
].map((label) => ({ label, semitones: interval(label).semitones }));
