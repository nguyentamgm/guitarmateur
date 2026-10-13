/** Resolution: after each answer the note walks to the nearest tonic (docs/ear.md "Music rules"). */
import { interval, mod, pc, pitchAt, type DegreeLabel, type Key, type Pitch } from '@shared/core/music';
import { beatSeconds, clampBpm } from '@shared/core/rhythm';
import { degreeId, diatonicDegrees, noteOf } from './degrees';

export interface ResolutionStep {
  /** The degree as the key spells it: 'b5' in minor, '#4' in major; the closing tonic is '1'. */
  readonly degree: DegreeLabel;
  /** The note spelled from the key, in its octave. */
  readonly pitch: Pitch;
  readonly midi: number;
}

/** Each note of the walk lasts an eighth: half a beat of the cadence tempo. */
export const RESOLUTION_NOTE_BEATS = 0.5;

/** Seconds each note of the walk lasts at `bpm` (clamped to 40–200, as the cadence is). */
export function resolutionNoteSeconds(bpm: number): number {
  return RESOLUTION_NOTE_BEATS * beatSeconds(clampBpm(bpm));
}

/** The tritone is spelled #4 in major (it leads up to 5) and b5 in minor (it falls to 4). */
const label = (key: Key, degree: DegreeLabel): DegreeLabel => {
  const id = degreeId(degree);
  return id === '#4' && key.mode === 'minor' ? 'b5' : id;
};

/**
 * The walk from `degree`, sounding at `midi`, to the nearest tonic along the mode's scale: down
 * when the tonic below is nearer, up when the one above is; the tritone, as far from both, goes up
 * in major (#4 → 5) and down in minor (b5 → 4). A note outside the scale first moves the half step
 * to the scale note that way. Down, the walk ends on the tonic below the note (`midi` minus the
 * degree's semitones); up, on the tonic an octave above that one. Degree 1 is just itself.
 */
export function resolution(key: Key, degree: DegreeLabel, midi: number): ResolutionStep[] {
  const start = label(key, degree);
  const s = interval(start).semitones;
  if (pc(noteOf(key, start)) !== mod(midi, 12)) {
    throw new RangeError(`MIDI ${midi} is not degree ${start} of the key`);
  }
  const up = s > 6 || (s === 6 && key.mode === 'major');
  const tonic = midi - s;
  const scale = diatonicDegrees(key.mode).map((d) => ({ degree: d, semitones: interval(d).semitones }));
  const path = up
    ? [...scale.filter((d) => d.semitones > s), { degree: '1', semitones: 12 }]
    : scale.filter((d) => d.semitones < s).reverse();
  return [{ degree: start, semitones: s }, ...path].map((d) => ({
    degree: d.degree,
    pitch: pitchAt(noteOf(key, d.degree), tonic + d.semitones),
    midi: tonic + d.semitones,
  }));
}
