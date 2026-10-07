/**
 * The neck as a grid measured in semitones (M0). Strings use guitar numbering: 1 = thinnest
 * (high E), 6 = thickest (low E), matching tab and docs/theory-knowledge (K0.1).
 */
import {
  interval,
  midi,
  mod,
  parseNote,
  pc,
  pitchAt,
  spellMidi,
  transpose,
  type NoteName,
  type Pitch,
} from '../music';

export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6;
export const STRINGS: readonly StringNumber[] = [6, 5, 4, 3, 2, 1];

/** Standard tuning, indexed by string number. */
export const STANDARD_TUNING: Readonly<Record<StringNumber, Pitch>> = {
  6: { ...parseNote('E'), octave: 2 },
  5: { ...parseNote('A'), octave: 2 },
  4: { ...parseNote('D'), octave: 3 },
  3: { ...parseNote('G'), octave: 3 },
  2: { ...parseNote('B'), octave: 3 },
  1: { ...parseNote('E'), octave: 4 },
};

export const MAX_FRET = 24;

export interface FretPos {
  readonly string: StringNumber;
  readonly fret: number;
}

export function openMidi(s: StringNumber): number {
  return midi(STANDARD_TUNING[s]);
}

export function midiAt(pos: FretPos): number {
  return openMidi(pos.string) + pos.fret;
}

/**
 * The spelled pitch at a position. With `context` (a scale's notes), a matching pitch class uses
 * the scale's spelling (B♭ in F minor); otherwise falls back to sharps or flats.
 */
export function pitchAtPos(pos: FretPos, context: readonly NoteName[] = [], prefer: 'sharp' | 'flat' = 'sharp'): Pitch {
  const m = midiAt(pos);
  const hit = context.find((n) => pc(n) === mod(m, 12));
  return hit ? pitchAt(hit, m) : spellMidi(m, prefer);
}

/** Semitones between a string and the next higher one: 5, except G→B which is 4 (K0.4). */
export function gapToNextString(s: StringNumber): number | null {
  if (s === 1) return null;
  return openMidi((s - 1) as StringNumber) - openMidi(s);
}

/** Frets (0..maxFret) on a string where a note name sounds. */
export function fretsOf(name: NoteName, s: StringNumber, maxFret = 12): number[] {
  const first = mod(pc(name) - mod(openMidi(s), 12), 12);
  const out: number[] = [];
  for (let f = first; f <= maxFret; f += 12) out.push(f);
  return out;
}

/** Home fret (0..11) of a note on string 6 or 5 — the one table worth memorising (K0.7). */
export function homeFret(name: NoteName, s: 6 | 5 = 6): number {
  return fretsOf(name, s, 11)[0]!;
}

/** Keys in the order their home notes sit on string 6, fret 0 to 11: how the finder lists them. */
export const byHomeFret = (names: readonly NoteName[]): NoteName[] => [...names].sort((a, b) => homeFret(a) - homeFret(b));

/**
 * An interval shape (K2.4): the note `label` above `pos`, played `stringsUp` strings higher.
 * Each string crossed takes back its gap (5, or 4 for G→B). Null off the neck.
 */
export function shapeAt(pos: FretPos, label: string, stringsUp: number): FretPos | null {
  const target = pos.string - stringsUp;
  if (!Number.isInteger(stringsUp) || stringsUp < 0 || target < 1) return null;
  const string = target as StringNumber;
  const fret = pos.fret + interval(label).semitones - (openMidi(string) - openMidi(pos.string));
  return fret < 0 || fret > MAX_FRET ? null : { string, fret };
}

/**
 * The same note one octave up, two strings higher: +2 frets, or +3 when the jump crosses the
 * G→B pair (K0.6). Null on strings 2 and 1.
 */
export const octaveUp = (pos: FretPos): FretPos | null => shapeAt(pos, '8', 2);

/** Every position of a note's pitch class across the neck, low string first. */
export function allPositions(name: NoteName, maxFret = 12): FretPos[] {
  return STRINGS.flatMap((s) => fretsOf(name, s, maxFret).map((fret) => ({ string: s, fret })));
}

/** Convenience: spell a note an interval above another (used by lessons for labels). */
export const above = (n: NoteName, label: string): NoteName => transpose(n, interval(label));

/** Same string and fret. */
export const samePos = (a: FretPos, b: FretPos): boolean => a.string === b.string && a.fret === b.fret;
