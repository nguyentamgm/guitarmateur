/**
 * What each level kind sounds like (docs/ear-levels.md): the bridge from a round's question
 * (core/round.ts) to the parts of timeline.ts. Each stage issue adds its kinds (#256 on); until a
 * level's kind is here, the map shows that level as coming soon.
 */
import type { AnswerId, Level, QuestionKind } from '../core/levels';
import type { RoundQuestion } from '../core/round';
import { notePart, waitPart, type Part } from './timeline';

/** One of a level intro's examples: an answer, and how it sounds. */
export interface DemoExample {
  readonly answer: AnswerId;
  readonly part: Part;
}

export interface LevelSounds {
  /** The question's sound, drawn from its seed: the same every time it plays. */
  question(level: Level, q: RoundQuestion): Part;
  /** After a wrong answer: what `picked` would have sounded like, then what it was. */
  compare(level: Level, q: RoundQuestion, picked: AnswerId): Part;
  /** The intro's 2–3 examples at difficulty step `step`, each with its answer. */
  demo(level: Level, step: number): readonly DemoExample[];
}

export type KindSounds = Readonly<Partial<Record<QuestionKind, LevelSounds>>>;

/** The kinds built so far. */
export const LEVEL_SOUNDS: KindSounds = {};

/** The welcome's sound check: one guitar note, A3, in the middle of the guitar. */
export const SOUND_CHECK_MIDI = 57;
export const soundCheckPart = (): Part => notePart(SOUND_CHECK_MIDI, 60);

/**
 * After a right answer, the next question comes this long after: the old trainer's auto-next wait
 * (2 beats at its 90 BPM), to judge with beginners in #259.
 */
export const RIGHT_PAUSE_BEATS = 2;
export const RIGHT_PAUSE_BPM = 90;
export const rightPausePart = (): Part => waitPart(RIGHT_PAUSE_BEATS, RIGHT_PAUSE_BPM);
