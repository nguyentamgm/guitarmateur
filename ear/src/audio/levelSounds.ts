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
import { cadenceQuestion, chordQuestion, homeChord, otherQuality } from '../core/stage2';
import { degreeQuestion } from '../core/stage3';
import { resolution } from '../core/resolution';
import {
  answerComparePart,
  chordPart,
  contextPart,
  joinParts,
  notePart,
  progressionPart,
  resolutionPart,
  slidePart,
  tunePart,
  twoNotesPart,
  waitPart,
  type Part,
} from './timeline';

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

/** A level intro's examples: one question per answer the step shows, from fixed seeds. */
const demoOf =
  (question: LevelSounds['question']): LevelSounds['demo'] =>
  (level, step) =>
    stepAnswers(level as LevelOf<QuestionKind>, step).map((answer, i) => ({
      answer,
      part: question(level, { level: level.id, step, answer, seed: DEMO_SEEDS[i]! }),
    }));

/**
 * Stage 1 (levels 1–4): no picked-against-right comparison, since a wrong answer is best heard by
 * hearing the question again (the tune of level 3, slower).
 */
const stageOneQuestion: LevelSounds['question'] = (level, q) =>
  notesPart(stageOneNotes(level, q), STAGE_ONE_BPM);

const stageOne: LevelSounds = {
  question: stageOneQuestion,
  compare: (level, q) =>
    notesPart(
      stageOneNotes(level, q),
      level.kind === 'contour' ? STAGE_ONE_SLOW_BPM : STAGE_ONE_BPM,
    ),
  demo: demoOf(stageOneQuestion),
};

/** Level 5's tempo: how long a chord rings, and an arpeggio's pace. */
export const CHORD_BPM = 90;

const chordQuestionPart: LevelSounds['question'] = (level, q) => {
  const { chord, style } = chordQuestion(level, q);
  return chordPart(chord, style, CHORD_BPM);
};

/** Level 5: a wrong answer plays the same chord in the quality picked, then as it was. */
const chordQuality: LevelSounds = {
  question: chordQuestionPart,
  compare: (level, q) => {
    const { chord, style } = chordQuestion(level, q);
    return answerComparePart(
      chordPart(otherQuality(chord), style, CHORD_BPM),
      chordPart(chord, style, CHORD_BPM),
      CHORD_BPM,
    );
  },
  demo: demoOf(chordQuestionPart),
};

const cadencePart: LevelSounds['question'] = (level, q) => {
  const { chords, bpm } = cadenceQuestion(level, q);
  return progressionPart(chords, bpm);
};

/** Level 6: a wrong answer plays the same chords, then the home chord after them. */
const finished: LevelSounds = {
  question: cadencePart,
  compare: (level, q) => {
    const { key, chords, bpm } = cadenceQuestion(level, q);
    return progressionPart([...chords, homeChord(key)], bpm);
  },
  demo: demoOf(cadencePart),
};

/** Stage 3's tempo: the cadence, the note and the walk home. */
export const DEGREE_BPM = 90;
/** Silence between the cadence's tonic and the question's note, so the note stands on its own. */
export const DEGREE_GAP_BEATS = 1;

const degreePart: LevelSounds['question'] = (level, q) => {
  const { key, tonic, midi } = degreeQuestion(level, q);
  return joinParts([
    contextPart(key, tonic, DEGREE_BPM),
    waitPart(DEGREE_GAP_BEATS, DEGREE_BPM),
    notePart(midi, DEGREE_BPM),
  ]);
};

/**
 * Levels 7–14: the cadence that sets the key, then the note. A wrong answer walks the note home to
 * the root; on levels 9–10 (1, 3 or 5) it plays the key's chord, then the note alone; on levels 13
 * and 14 the blue note (♭5) slides down into 4, as guitarists play it.
 */
const degree: LevelSounds = {
  question: degreePart,
  compare: (level, q) => {
    const { key, degree: d, midi } = degreeQuestion(level, q);
    if (level.id === 9 || level.id === 10)
      return joinParts([
        chordPart(homeChord(key), 'strum', DEGREE_BPM),
        waitPart(DEGREE_GAP_BEATS, DEGREE_BPM),
        notePart(midi, DEGREE_BPM),
      ]);
    if ((level.id === 13 || level.id === 14) && d === '#4') return slidePart(midi, -1, DEGREE_BPM);
    return resolutionPart(resolution(key, d, midi), DEGREE_BPM);
  },
  demo: demoOf(degreePart),
};

/** The kinds built so far. */
export const LEVEL_SOUNDS: KindSounds = {
  sameDifferent: stageOne,
  higherLower: stageOne,
  contour: stageOne,
  distance: stageOne,
  chordQuality,
  finished,
  degree,
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
