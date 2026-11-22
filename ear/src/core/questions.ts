/** A degree question's range: where its note sounds from the tonic, in guitar range (docs/ear.md). */
import { interval, type DegreeLabel, type Key } from '@shared/core/music';
import { TONIC_OCTAVE } from './context';
import { degreeId, midiOf } from './degrees';

/** Guitar range in standard tuning, E2–E5: every question's pitch is inside it. */
export const LOWEST_MIDI = 40;
export const HIGHEST_MIDI = 76;

/**
 * Where a degree sounds from the tonic: 'above' within the octave up; 'around' on the nearer side
 * (5 to 7 below, the tritone above); 'twoOctaves' in either octave up, at random.
 */
export type Register = 'above' | 'around' | 'twoOctaves';
export const REGISTERS: readonly Register[] = ['above', 'around', 'twoOctaves'];

/** What sets a question's range: the degrees it may ask and where they sound. */
export interface QuestionRange {
  /** The degree ids that may be asked. */
  readonly degrees: readonly DegreeLabel[];
  readonly register: Register;
}

export interface Question {
  readonly key: Key;
  /** A degree id from the active set. */
  readonly degree: DegreeLabel;
  readonly midi: number;
}

/** The degree ids the range allows, each once. */
const activeDegrees = (settings: Pick<QuestionRange, 'degrees'>): DegreeLabel[] => [
  ...new Set(settings.degrees.map(degreeId)),
];

/** Semitones from the tonic the register can put a degree at. */
export function registerOffsets(register: Register, degree: DegreeLabel): number[] {
  const s = interval(degree).semitones;
  if (register === 'around') return [s <= 6 ? s : s - 12];
  return register === 'twoOctaves' ? [s, s + 12] : [s];
}

/**
 * MIDI of the question's tonic: octave TONIC_OCTAVE, dropped an octave at a time until every
 * active degree, wherever the register can put it, fits under HIGHEST_MIDI. No register spans
 * more than 23 semitones, so the lowest note then stays above LOWEST_MIDI.
 */
export function questionTonic(key: Key, settings: QuestionRange): number {
  const top = Math.max(...activeDegrees(settings).flatMap((d) => registerOffsets(settings.register, d)));
  let tonic = midiOf(key, '1', TONIC_OCTAVE);
  while (tonic + top > HIGHEST_MIDI) tonic -= 12;
  return tonic;
}
