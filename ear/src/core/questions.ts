/** The next question: a degree from the active set, its pitch in guitar range, and the key (docs/ear.md). */
import { choice, weightedChoice, type Rng } from '@shared/core/rng';
import {
  MAJOR_KEY_TONICS,
  MINOR_KEY_TONICS,
  interval,
  pc,
  sameNote,
  type DegreeLabel,
  type Key,
} from '@shared/core/music';
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

/** Questions per key before a new random key; 'fixed' keeps one key. */
export const KEY_CHANGE_EVERY = [10, 25] as const;
export type KeyChange = 'fixed' | (typeof KEY_CHANGE_EVERY)[number];

export interface QuestionSettings {
  /** The key, or the first key when the key changes. */
  readonly key: Key;
  /** The active degree ids (at least MIN_DEGREES of them). */
  readonly degrees: readonly DegreeLabel[];
  readonly register: Register;
  readonly keyChange: KeyChange;
  /** How often each degree comes up relative to the others, by label ('b5' counts for '#4'); missing means 1. */
  readonly weights?: Readonly<Record<DegreeLabel, number>>;
}

export interface Question {
  readonly key: Key;
  /** A degree id from the active set. */
  readonly degree: DegreeLabel;
  readonly midi: number;
}

/** The degree ids the settings allow, each once. */
const activeDegrees = (settings: Pick<QuestionSettings, 'degrees'>): DegreeLabel[] => [
  ...new Set(settings.degrees.map(degreeId)),
];

/** A degree id's weight: finite and positive, else 0; 1 when no label of it is given. */
const weightOf = (settings: QuestionSettings, degree: DegreeLabel): number => {
  const given = Object.entries(settings.weights ?? {}).find(([label]) => degreeId(label) === degree);
  const w = given ? given[1] : 1;
  return Number.isFinite(w) && w > 0 ? w : 0;
};

/** The degree to ask, by weight: any active one, except a third time in a row; uniform if no weight is usable. */
function nextDegree(settings: QuestionSettings, history: readonly Question[], rng: Rng): DegreeLabel {
  const active = activeDegrees(settings);
  const [a, b] = history.slice(-2).map((q) => degreeId(q.degree));
  const allowed = a !== undefined && a === b && active.length > 1 ? active.filter((d) => d !== a) : active;
  const weighted = allowed.map((item) => ({ item, weight: weightOf(settings, item) }));
  return weighted.some((x) => x.weight > 0) ? weightedChoice(rng, weighted) : choice(rng, allowed);
}

/** Same mode and the same spelled tonic. */
export const sameKey = (a: Key, b: Key): boolean => a.mode === b.mode && sameNote(a.tonic, b.tonic);

/**
 * The last question's key until it has been asked `keyChange` times in a row, then a random other
 * tonic in the same mode. The settings' key when fixed, at the start, or after a change of mode.
 */
function nextKey(settings: QuestionSettings, history: readonly Question[], rng: Rng): Key {
  const last = history[history.length - 1]?.key;
  if (settings.keyChange === 'fixed' || !last || last.mode !== settings.key.mode) return settings.key;
  const every = settings.keyChange;
  let run = 0;
  while (run < every && run < history.length && sameKey(history[history.length - 1 - run]!.key, last)) run++;
  if (run < every) return last;
  const tonics = last.mode === 'major' ? MAJOR_KEY_TONICS : MINOR_KEY_TONICS;
  return { tonic: choice(rng, tonics.filter((t) => pc(t) !== pc(last.tonic))), mode: last.mode };
}

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
export function questionTonic(key: Key, settings: Pick<QuestionSettings, 'degrees' | 'register'>): number {
  const top = Math.max(...activeDegrees(settings).flatMap((d) => registerOffsets(settings.register, d)));
  let tonic = midiOf(key, '1', TONIC_OCTAVE);
  while (tonic + top > HIGHEST_MIDI) tonic -= 12;
  return tonic;
}

/**
 * The next question, given the questions asked so far this session (oldest first). The history
 * is the current settings' session: the caller starts a new one when the settings change.
 */
export function nextQuestion(settings: QuestionSettings, history: readonly Question[], rng: Rng): Question {
  const key = nextKey(settings, history, rng);
  const degree = nextDegree(settings, history, rng);
  const midi = questionTonic(key, settings) + choice(rng, registerOffsets(settings.register, degree));
  return { key, degree, midi };
}
