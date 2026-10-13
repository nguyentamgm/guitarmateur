/** The next question: a degree from the active set, its pitch in guitar range, and the key (docs/ear.md). */
import { choice, type Rng } from '@shared/core/rng';
import { interval, type DegreeLabel, type Key } from '@shared/core/music';
import { TONIC_OCTAVE } from './context';
import { degreeId, midiOf } from './degrees';

/** Guitar range in standard tuning, E2–E5: every question's pitch is inside it. */
export const LOWEST_MIDI = 40;
export const HIGHEST_MIDI = 76;

export interface QuestionSettings {
  readonly key: Key;
  /** The active degree ids (at least MIN_DEGREES of them). */
  readonly degrees: readonly DegreeLabel[];
}

export interface Question {
  readonly key: Key;
  /** A degree id from the active set. */
  readonly degree: DegreeLabel;
  readonly midi: number;
}

/** The degree ids the settings allow, each once. */
const activeDegrees = (settings: QuestionSettings): DegreeLabel[] => [...new Set(settings.degrees.map(degreeId))];

/** The degree to ask: any active one, except a third time in a row. */
function nextDegree(settings: QuestionSettings, history: readonly Question[], rng: Rng): DegreeLabel {
  const active = activeDegrees(settings);
  const [a, b] = history.slice(-2).map((q) => degreeId(q.degree));
  const allowed = a !== undefined && a === b && active.length > 1 ? active.filter((d) => d !== a) : active;
  return choice(rng, allowed);
}

/**
 * MIDI of the question's tonic: octave TONIC_OCTAVE, dropped an octave at a time until every
 * active degree fits under HIGHEST_MIDI.
 */
export function questionTonic(settings: QuestionSettings): number {
  const top = Math.max(...activeDegrees(settings).map((d) => interval(d).semitones));
  let tonic = midiOf(settings.key, '1', TONIC_OCTAVE);
  while (tonic + top > HIGHEST_MIDI) tonic -= 12;
  return tonic;
}

/** The next question, given the questions asked so far this session (oldest first). */
export function nextQuestion(settings: QuestionSettings, history: readonly Question[], rng: Rng): Question {
  const key = settings.key;
  const degree = nextDegree(settings, history, rng);
  return { key, degree, midi: questionTonic(settings) + interval(degree).semitones };
}
