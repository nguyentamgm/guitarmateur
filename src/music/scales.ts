import { IV, type Interval } from './interval';
import { pc, transpose, type NoteName, type PitchClass } from './pitch';
import type { Key } from './key';

export type ScaleId = 'minorPentatonic' | 'majorPentatonic' | 'blues';

export interface ScaleDef {
  id: ScaleId;
  /** Display name. */
  name: string;
  /** Intervals from the tonic, ascending, excluding the octave. */
  intervals: Interval[];
  /**
   * "Decorated" scales inherit their box shapes from a base scale and merely fill in extra passing
   * tones (e.g. the blues ♭5). `intervals` still lists the full set; `decoration` records which
   * base to borrow shapes from and which intervals are the added tones.
   */
  decoration?: {
    baseScaleId: ScaleId;
    addedIntervals: Interval[];
  };
}

/**
 * Scale registry. Adding a scale is adding a row here (plus a harmony row) — never an `if` in an
 * engine. A future `majorBlues` = majorPentatonic + ♭3 is one entry decorated on majorPentatonic.
 */
export const SCALES: Record<ScaleId, ScaleDef> = {
  minorPentatonic: {
    id: 'minorPentatonic',
    name: 'Minor Pentatonic',
    intervals: [IV.P1, IV.m3, IV.P4, IV.P5, IV.m7],
  },
  majorPentatonic: {
    id: 'majorPentatonic',
    name: 'Major Pentatonic',
    intervals: [IV.P1, IV.M2, IV.M3, IV.P5, IV.M6],
  },
  blues: {
    id: 'blues',
    name: 'Blues Scale',
    intervals: [IV.P1, IV.m3, IV.P4, IV.d5, IV.P5, IV.m7],
    decoration: { baseScaleId: 'minorPentatonic', addedIntervals: [IV.d5] },
  },
};

/** Ordered list of scale ids for registry-driven pickers. */
export const SCALE_IDS: ScaleId[] = ['minorPentatonic', 'majorPentatonic', 'blues'];

/** Spelled note names of a scale, ascending from the tonic (excluding the octave). */
export function scaleNoteNames(key: Key): NoteName[] {
  return SCALES[key.scaleId].intervals.map((iv) => transpose(key.tonic, iv));
}

/** Pitch classes present in a scale. */
export function scalePcs(key: Key): Set<PitchClass> {
  return new Set(scaleNoteNames(key).map(pc));
}
