/**
 * What each level kind sounds like (docs/ear-levels.md): the bridge from a round's question
 * (core/round.ts) to the parts of timeline.ts. Each stage issue adds its kinds (#256 on); until a
 * level's kind is here, the map shows that level as coming soon.
 */
import {
  stepAnswers,
  type AnswerId,
  type Level,
  type LevelOf,
  type QuestionKind,
} from '../core/levels';
import type { RoundQuestion } from '../core/round';
import { stageOneNotes } from '../core/stage1';
import { notePart, tunePart, twoNotesPart, waitPart, type Part } from './timeline';

/** One of a level intro's examples: an answer, and how it sounds. */
export interface DemoExample {
  readonly answer: AnswerId;
  readonly part: Part;
}

export interface LevelSounds {
  /** The question's sound, drawn from its seed: the same every time it plays. */
  question(level: Level, q: RoundQuestion): Part;
  /** After a wrong answer: what `picked` would have sounded like, then what it was, or the question again. */
  compare(level: Level, q: RoundQuestion, picked: AnswerId): Part;
  /** The intro's 2–3 examples at difficulty step `step`, each with its answer. */
  demo(level: Level, step: number): readonly DemoExample[];
}

export type KindSounds = Readonly<Partial<Record<QuestionKind, LevelSounds>>>;

/** Stage 1's tempo; level 3's wrong answer plays its tune again at STAGE_ONE_SLOW_BPM. */
export const STAGE_ONE_BPM = 90;
export const STAGE_ONE_SLOW_BPM = 60;

/** Two notes, or a tune of three. */
const notesPart = (notes: readonly number[], bpm: number): Part =>
  notes.length === 2 ? twoNotesPart(notes[0]!, notes[1]!, bpm) : tunePart(notes, bpm);

/** The demo's seeds: fixed, so an intro always plays the same examples. */
const DEMO_SEEDS = [11, 22, 33, 44];

/**
 * Stage 1 (levels 1–4): no picked-against-right comparison, since a wrong answer is best heard by
 * hearing the question again (the tune of level 3, slower).
 */
const stageOne: LevelSounds = {
  question: (level, q) => notesPart(stageOneNotes(level, q), STAGE_ONE_BPM),
  compare: (level, q) =>
    notesPart(
      stageOneNotes(level, q),
      level.kind === 'contour' ? STAGE_ONE_SLOW_BPM : STAGE_ONE_BPM,
    ),
  demo: (level, step) =>
    stepAnswers(level as LevelOf<QuestionKind>, step).map((answer, i) => ({
      answer,
      part: notesPart(
        stageOneNotes(level, { level: level.id, step, answer, seed: DEMO_SEEDS[i]! }),
        STAGE_ONE_BPM,
      ),
    })),
};

/** The kinds built so far. */
export const LEVEL_SOUNDS: KindSounds = {
  sameDifferent: stageOne,
  higherLower: stageOne,
  contour: stageOne,
  distance: stageOne,
};

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
