/**
 * Stage 3's questions (docs/ear-levels.md "Stage 3", levels 7–10), drawn from a question's seed:
 * a key, then one note of it, the degree answered (level 7's "not the root" is any other degree
 * the step asks). Placed as the old trainer placed them (`questionTonic`, the step's register).
 */
import { choice, mulberry32 } from '@shared/core/rng';
import type { DegreeLabel, Key } from '@shared/core/music';
import type { Level } from './levels';
import { questionTonic, registerOffsets, type Question } from './questions';
import type { RoundQuestion } from './round';

export interface DegreeQuestion extends Question {
  /** MIDI of the tonic the cadence ends on, and the note is heard against. */
  readonly tonic: number;
}

export function degreeQuestion(level: Level, q: RoundQuestion): DegreeQuestion {
  if (level.kind !== 'degree') throw new Error(`Level ${level.id} has no degree question`);
  const rng = mulberry32(q.seed);
  const step = level.steps[q.step]!;
  const asks = (key: Key): readonly DegreeLabel[] => step.asks[key.mode] ?? [];
  const can = (d: DegreeLabel) => (q.answer === 'notRoot' ? d !== '1' : d === q.answer);
  // Only a key whose mode asks the answer: on level 10's mixed step, 3 is major's and ♭3 minor's.
  const key = choice(
    rng,
    step.keys.filter((k) => asks(k).some(can)),
  );
  const degree = choice(rng, asks(key).filter(can));
  const tonic = questionTonic(key, { degrees: asks(key), register: step.register });
  return { key, degree, midi: tonic + choice(rng, registerOffsets(step.register, degree)), tonic };
}
