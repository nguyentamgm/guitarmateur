/**
 * The beginner levels as data (docs/ear-levels.md "The levels"): what each level asks, its answer
 * buttons and its difficulty steps. Ids and numbers only; the words live in i18n.
 */
import {
  MAJOR_KEY_TONICS,
  MINOR_KEY_TONICS,
  mod,
  parseNote,
  pc,
  type DegreeLabel,
  type Key,
  type Mode,
} from '@shared/core/music';
import { diatonicDegrees, presetDegrees, type PresetId } from './degrees';
import type { Register } from './questions';

/** What a level asks; each kind gets its question generator in the stage issue that first uses it. */
export type QuestionKind =
  | 'sameDifferent'
  | 'higherLower'
  | 'contour'
  | 'distance'
  | 'chordQuality'
  | 'finished'
  | 'degree'
  | 'findRoot';

/** Each kind's answer ids. A degree level's answers are degree ids; 'notRoot' is every other degree. */
export interface AnswerByKind {
  sameDifferent: 'same' | 'different';
  higherLower: 'higher' | 'lower';
  contour: 'up' | 'down' | 'upDown' | 'downUp';
  distance: 'close' | 'far';
  chordQuality: Mode;
  finished: 'finished' | 'notFinished';
  degree: DegreeLabel | 'notRoot';
  /** A fret of the thickest string. */
  findRoot: number;
}

/** Any level's answer id. */
export type AnswerId = AnswerByKind[QuestionKind];

/** A range of frets (semitones), both ends included. */
export interface Frets {
  readonly min: number;
  readonly max: number;
}

/** Two or three notes a number of frets apart (levels 1–3; level 1's gap is when they differ). */
export interface GapStep {
  readonly gap: Frets;
}

/** Level 4: a close gap and a far one; `either` lets the second note go down as well as up. */
export interface DistanceStep {
  readonly close: Frets;
  readonly far: Frets;
  readonly direction: 'up' | 'either';
}

/** Level 5: an open chord, a chord moved up the neck, or its notes one by one. */
export interface ChordStep {
  readonly voicing: 'open' | 'moved' | 'arpeggio';
}

/** Level 6: four chords at this tempo, in one of these keys. */
export interface CadenceStep {
  readonly bpm: number;
  readonly keys: readonly Key[];
}

/** Levels 7–14: chords set one of these keys, then one note of `asks` for the key's mode sounds. */
export interface DegreeStep {
  readonly keys: readonly Key[];
  /** The degree ids asked in a key of each mode the step's keys use. */
  readonly asks: Readonly<Partial<Record<Mode, readonly DegreeLabel[]>>>;
  readonly register: Register;
}

/** Level 15: a short tune in one of these keys, ending on its root or not, over chords or alone. */
export interface FindRootStep {
  readonly keys: readonly Key[];
  readonly endsOnRoot: boolean;
  readonly chords: boolean;
}

export interface StepByKind {
  sameDifferent: GapStep;
  higherLower: GapStep;
  contour: GapStep;
  distance: DistanceStep;
  chordQuality: ChordStep;
  finished: CadenceStep;
  degree: DegreeStep;
  findRoot: FindRootStep;
}

/** A difficulty step; `answers`, when given, replaces the buttons from this step on. */
export type Step<K extends QuestionKind> = StepByKind[K] & {
  readonly answers?: readonly AnswerByKind[K][];
};

export type Stage = 1 | 2 | 3 | 4 | 5;

export interface LevelOf<K extends QuestionKind> {
  /** 1–15, in the order they unlock. */
  readonly id: number;
  readonly stage: Stage;
  readonly kind: K;
  /** The answer ids, in button order, from the first step. */
  readonly answers: readonly AnswerByKind[K][];
  /** Difficulty steps A, B (and C), easiest first. */
  readonly steps: readonly Step<K>[];
  /** Answer buttons, or a tap on one string drawn on screen (levels 14 and 15). */
  readonly answerOn: 'buttons' | 'string';
}

export type Level = { [K in QuestionKind]: LevelOf<K> }[QuestionKind];

/** The answers a step shows: the last `answers` given at or before it, else the level's. */
export function stepAnswers<K extends QuestionKind>(level: LevelOf<K>, step: number): readonly AnswerByKind[K][] {
  const given = level.steps.slice(0, step + 1).findLast((s) => s.answers !== undefined);
  return given?.answers ?? level.answers;
}

/** The thickest string's open note, E2, as a MIDI number. */
const THICKEST_STRING_MIDI = 40;

/**
 * The right answers a step can have, in button order: its degrees asked (level 7's other degrees
 * all as 'notRoot'), the frets of its keys' roots on level 15, else every answer it shows.
 */
export function askedAnswers(level: Level, step: number): readonly AnswerId[] {
  const shown: readonly AnswerId[] = stepAnswers(level as LevelOf<typeof level.kind>, step);
  if (level.kind === 'degree') {
    const s = level.steps[step]!;
    const asked = new Set(
      s.keys.flatMap((k) => s.asks[k.mode] ?? []).map((d) => (shown.includes(d) ? d : 'notRoot')),
    );
    return shown.filter((a) => asked.has(a as string));
  }
  if (level.kind === 'findRoot') {
    const roots = new Set(level.steps[step]!.keys.map((k) => pc(k.tonic)));
    return shown.filter((fret) => roots.has(mod(THICKEST_STRING_MIDI + (fret as number), 12)));
  }
  return shown;
}

/** Whether `a` answers as `b` does: on level 15 any fret of the same note (0 and 12) is right. */
export function sameAnswer(level: Level, a: AnswerId, b: AnswerId): boolean {
  if (level.kind === 'findRoot' && typeof a === 'number' && typeof b === 'number') return mod(a - b, 12) === 0;
  return a === b;
}

const key = (tonic: string, mode: Mode): Key => ({ tonic: parseNote(tonic), mode });
const A_MAJOR = key('A', 'major');
const A_MINOR = key('A', 'minor');
const MAJOR_KEYS: readonly Key[] = MAJOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'major' }));
const MINOR_KEYS: readonly Key[] = MINOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'minor' }));
/** Level 15's first keys: the keys of most beginner songs. */
const BEGINNER_KEYS: readonly Key[] = ['A', 'G', 'E', 'C'].map((t) => key(t, 'major'));

/** A preset the mode offers (every preset used here is). */
const preset = (id: PresetId, mode: Mode): readonly DegreeLabel[] => presetDegrees(id, mode)!;

const MAJOR_TRIAD = preset('triad', 'major');
const MINOR_TRIAD = preset('triad', 'minor');
const PENTATONIC = preset('minorPentatonic', 'minor');
const BLUES = preset('blues', 'minor');
const B7 = [...MINOR_TRIAD, 'b7'];

/** A two-note level's gaps: far, then 3–5 frets, then 1–2. */
const GAPS: readonly GapStep[] = [{ gap: { min: 7, max: 12 } }, { gap: { min: 3, max: 5 } }, { gap: { min: 1, max: 2 } }];

/** Stage 4's steps, asking `degrees`: in A minor above the root, then over two octaves, then in every minor key. */
function minorDegreeSteps(degrees: readonly DegreeLabel[]): Step<'degree'>[] {
  const asks = { minor: degrees };
  return [
    { keys: [A_MINOR], asks, register: 'above' },
    { keys: [A_MINOR], asks, register: 'twoOctaves' },
    { keys: MINOR_KEYS, asks, register: 'twoOctaves' },
  ];
}

const sameDifferent: LevelOf<'sameDifferent'> = {
  id: 1,
  stage: 1,
  kind: 'sameDifferent',
  answers: ['same', 'different'],
  steps: GAPS,
  answerOn: 'buttons',
};

const higherLower: LevelOf<'higherLower'> = {
  id: 2,
  stage: 1,
  kind: 'higherLower',
  answers: ['higher', 'lower'],
  steps: GAPS,
  answerOn: 'buttons',
};

const contour: LevelOf<'contour'> = {
  id: 3,
  stage: 1,
  kind: 'contour',
  answers: ['up', 'down'],
  steps: [
    { gap: { min: 3, max: 7 } },
    { gap: { min: 1, max: 2 } },
    { gap: { min: 1, max: 7 }, answers: ['up', 'down', 'upDown', 'downUp'] },
  ],
  answerOn: 'buttons',
};

const distance: LevelOf<'distance'> = {
  id: 4,
  stage: 1,
  kind: 'distance',
  answers: ['close', 'far'],
  steps: [
    { close: { min: 1, max: 2 }, far: { min: 7, max: 12 }, direction: 'up' },
    { close: { min: 1, max: 2 }, far: { min: 5, max: 5 }, direction: 'up' },
    { close: { min: 1, max: 2 }, far: { min: 5, max: 5 }, direction: 'either' },
  ],
  answerOn: 'buttons',
};

const chordQuality: LevelOf<'chordQuality'> = {
  id: 5,
  stage: 2,
  kind: 'chordQuality',
  answers: ['major', 'minor'],
  steps: [{ voicing: 'open' }, { voicing: 'moved' }, { voicing: 'arpeggio' }],
  answerOn: 'buttons',
};

const finished: LevelOf<'finished'> = {
  id: 6,
  stage: 2,
  kind: 'finished',
  answers: ['finished', 'notFinished'],
  steps: [
    { bpm: 70, keys: [A_MAJOR] },
    { bpm: 100, keys: [A_MAJOR] },
    { bpm: 100, keys: MAJOR_KEYS },
  ],
  answerOn: 'buttons',
};

const rootOrNot: LevelOf<'degree'> = {
  id: 7,
  stage: 3,
  kind: 'degree',
  answers: ['1', 'notRoot'],
  steps: [
    // The other notes are the ones that clearly want to move: 2 and 7.
    { keys: [A_MAJOR], asks: { major: ['1', '2', '7'] }, register: 'above' },
    { keys: [A_MAJOR], asks: { major: diatonicDegrees('major') }, register: 'above' },
    // The root can sound an octave up too: it is still the root.
    { keys: [A_MAJOR], asks: { major: diatonicDegrees('major') }, register: 'twoOctaves' },
  ],
  answerOn: 'buttons',
};

const rootOrFive: LevelOf<'degree'> = {
  id: 8,
  stage: 3,
  kind: 'degree',
  answers: ['1', '5'],
  steps: [
    { keys: [A_MAJOR], asks: { major: ['1', '5'] }, register: 'above' },
    // 5 can sound below the root.
    { keys: [A_MAJOR], asks: { major: ['1', '5'] }, register: 'around' },
    { keys: MAJOR_KEYS, asks: { major: ['1', '5'] }, register: 'around' },
  ],
  answerOn: 'buttons',
};

const majorTriad: LevelOf<'degree'> = {
  id: 9,
  stage: 3,
  kind: 'degree',
  answers: MAJOR_TRIAD,
  steps: [
    { keys: [A_MAJOR], asks: { major: MAJOR_TRIAD }, register: 'above' },
    { keys: [A_MAJOR], asks: { major: MAJOR_TRIAD }, register: 'twoOctaves' },
    { keys: MAJOR_KEYS, asks: { major: MAJOR_TRIAD }, register: 'twoOctaves' },
  ],
  answerOn: 'buttons',
};

const minorTriad: LevelOf<'degree'> = {
  id: 10,
  stage: 3,
  kind: 'degree',
  answers: MINOR_TRIAD,
  steps: [
    { keys: [A_MINOR], asks: { minor: MINOR_TRIAD }, register: 'above' },
    { keys: [A_MINOR], asks: { minor: MINOR_TRIAD }, register: 'twoOctaves' },
    // Happy and sad keys mixed: is it the happy 3 or the sad b3?
    {
      keys: [...MAJOR_KEYS, ...MINOR_KEYS],
      asks: { major: MAJOR_TRIAD, minor: MINOR_TRIAD },
      register: 'twoOctaves',
      answers: ['1', 'b3', '3', '5'],
    },
  ],
  answerOn: 'buttons',
};

const addFlatSeven: LevelOf<'degree'> = {
  id: 11,
  stage: 4,
  kind: 'degree',
  answers: B7,
  steps: minorDegreeSteps(B7),
  answerOn: 'buttons',
};

const pentatonic: LevelOf<'degree'> = {
  id: 12,
  stage: 4,
  kind: 'degree',
  answers: PENTATONIC,
  steps: minorDegreeSteps(PENTATONIC),
  answerOn: 'buttons',
};

const bluesNote: LevelOf<'degree'> = {
  id: 13,
  stage: 4,
  kind: 'degree',
  answers: BLUES,
  steps: minorDegreeSteps(BLUES),
  answerOn: 'buttons',
};

const onTheNeck: LevelOf<'degree'> = {
  id: 14,
  stage: 5,
  kind: 'degree',
  answers: PENTATONIC,
  steps: [
    { keys: [A_MINOR], asks: { minor: PENTATONIC }, register: 'above' },
    { keys: [A_MINOR], asks: { minor: BLUES }, register: 'above', answers: BLUES },
    { keys: MINOR_KEYS, asks: { minor: BLUES }, register: 'above' },
  ],
  answerOn: 'string',
};

/** Level 15's frets: the thickest string, open to the 12th. */
export const FIND_ROOT_FRETS = Array.from({ length: 13 }, (_, fret) => fret);

const findRoot: LevelOf<'findRoot'> = {
  id: 15,
  stage: 5,
  kind: 'findRoot',
  answers: FIND_ROOT_FRETS,
  steps: [
    { keys: BEGINNER_KEYS, endsOnRoot: true, chords: true },
    { keys: [...MAJOR_KEYS, ...MINOR_KEYS], endsOnRoot: false, chords: true },
    { keys: [...MAJOR_KEYS, ...MINOR_KEYS], endsOnRoot: false, chords: false },
  ],
  answerOn: 'string',
};

/** Every level, in the order they unlock. */
export const LEVELS: readonly Level[] = [
  sameDifferent,
  higherLower,
  contour,
  distance,
  chordQuality,
  finished,
  rootOrNot,
  rootOrFive,
  majorTriad,
  minorTriad,
  addFlatSeven,
  pentatonic,
  bluesNote,
  onTheNeck,
  findRoot,
];

export const findLevel = (id: number): Level | undefined => LEVELS.find((l) => l.id === id);
