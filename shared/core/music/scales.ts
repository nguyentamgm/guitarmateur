/** Scale registry (K2.1, K2.7, K3.1, K3.2, K6.1). Formulas are degree labels over the tonic. */
import { interval, transpose, type DegreeLabel } from './interval';
import type { NoteName } from './pitch';

export type ScaleId =
  | 'major'
  | 'naturalMinor'
  | 'majorPentatonic'
  | 'minorPentatonic'
  | 'minorBlues'
  | 'majorBlues';

export interface ScaleDef {
  readonly formula: readonly DegreeLabel[];
  /**
   * For "decorated" scales: the scale whose notes define the box shapes. The extra degrees
   * (the blue notes) are drawn inside those boxes instead of widening them. K6.1.
   */
  readonly base?: ScaleId;
  /** 'major' or 'minor' colour of the tonic, used to pick box numbering and relative keys. */
  readonly quality: 'major' | 'minor';
}

export const SCALES: Readonly<Record<ScaleId, ScaleDef>> = {
  major: { formula: ['1', '2', '3', '4', '5', '6', '7'], quality: 'major' },
  naturalMinor: { formula: ['1', '2', 'b3', '4', '5', 'b6', 'b7'], quality: 'minor' },
  majorPentatonic: { formula: ['1', '2', '3', '5', '6'], quality: 'major' },
  minorPentatonic: { formula: ['1', 'b3', '4', '5', 'b7'], quality: 'minor' },
  minorBlues: { formula: ['1', 'b3', '4', 'b5', '5', 'b7'], base: 'minorPentatonic', quality: 'minor' },
  majorBlues: { formula: ['1', '2', 'b3', '3', '5', '6'], base: 'majorPentatonic', quality: 'major' },
};

export const SCALE_IDS = Object.keys(SCALES) as ScaleId[];

/** Spelled notes of a scale, tonic first. */
export function scaleNotes(tonic: NoteName, id: ScaleId): NoteName[] {
  return SCALES[id].formula.map((d) => transpose(tonic, interval(d)));
}

/** Semitones of each degree above the tonic, e.g. minor pentatonic → [0, 3, 5, 7, 10]. */
export function scaleSemitones(id: ScaleId): number[] {
  return SCALES[id].formula.map((d) => interval(d).semitones);
}

/**
 * Distances in frets between consecutive notes, closing back to the octave — the "+3 +2 +2 +3 +2"
 * the lessons animate (K2.1, K3.2).
 */
export function scaleSteps(id: ScaleId): number[] {
  const s = scaleSemitones(id);
  return s.map((v, i) => (i + 1 < s.length ? s[i + 1]! : 12) - v);
}

/** Degrees that a decorated scale adds on top of its base (e.g. minor blues → ['b5']). */
export function decorationDegrees(id: ScaleId): DegreeLabel[] {
  const base = SCALES[id].base;
  if (!base) return [];
  const baseSet = new Set(SCALES[base].formula);
  return SCALES[id].formula.filter((d) => !baseSet.has(d));
}
