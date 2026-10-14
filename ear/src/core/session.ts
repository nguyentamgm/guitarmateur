/**
 * The session: a pure reducer from (state, event) to the next state and the effects to carry out
 * (docs/ear.md "Session"). The effects say what should sound; the audio driver (#219) plays them
 * and reports back with `audioDone`, so this file never touches audio and is tested without it.
 */
import { int, mulberry32 } from '@shared/core/rng';
import { interval, type DegreeLabel, type Key } from '@shared/core/music';
import { degreeId } from './degrees';
import {
  nextQuestion,
  questionTonic,
  sameKey,
  type Question,
  type QuestionSettings,
} from './questions';
import { resolution, type ResolutionStep } from './resolution';

/**
 * When the cadence plays: before every question; at the start and when the key changes; or never,
 * with the drone holding the key instead.
 */
export type ContextPolicy = 'everyQuestion' | 'keyChange' | 'droneOnly';
export const CONTEXT_POLICIES: readonly ContextPolicy[] = [
  'everyQuestion',
  'keyChange',
  'droneOnly',
];

export interface SessionSettings extends QuestionSettings {
  readonly context: ContextPolicy;
  /** Walk the note home to the tonic after each answer. */
  readonly resolution: boolean;
  /** Hold the drone under the whole session ('droneOnly' holds it whatever this says). */
  readonly drone: boolean;
  /** Go on to the next question by itself, AUTO_NEXT_BEATS after the answer's sounds. */
  readonly autoNext: boolean;
}

/**
 * idle → context → prompt → waiting → (answered →) resolving → review → context or prompt …
 * 'answered' is the wrong-answer comparison; a right answer goes straight on.
 */
export type Phase = 'idle' | 'context' | 'prompt' | 'waiting' | 'answered' | 'resolving' | 'review';

/** Beats of drone alone before the first note in a key, when no cadence plays ('droneOnly'). */
export const DRONE_LEAD_BEATS = 4;
/** Beats of quiet in review before auto-next asks the next question. */
export const AUTO_NEXT_BEATS = 2;

/**
 * What should sound. One with `done` reports `audioDone(done)` when it ends; replays have none.
 * Every effect after a `cancelAudio` replaces what was scheduled, but never the drone.
 */
export type Effect =
  /** The cadence (context.ts `cadence()`), its tonic at `tonic`. */
  | {
      readonly type: 'playContext';
      readonly key: Key;
      readonly tonic: number;
      readonly done?: Phase;
    }
  | { readonly type: 'playNote'; readonly midi: number; readonly done?: Phase }
  /** A wrong answer: the note picked, then the right note. */
  | {
      readonly type: 'playCompare';
      readonly answer: number;
      readonly right: number;
      readonly done: Phase;
    }
  /** The walk home, one note per RESOLUTION_NOTE_BEATS. */
  | {
      readonly type: 'playResolution';
      readonly steps: readonly ResolutionStep[];
      readonly done: Phase;
    }
  /** Nothing new for `beats` at the tempo, then `audioDone(done)`. */
  | { readonly type: 'wait'; readonly beats: number; readonly done: Phase }
  /** Start the key's drone (context.ts `droneNotes()`), replacing any drone sounding. */
  | { readonly type: 'startDrone'; readonly key: Key }
  | { readonly type: 'stopDrone' }
  /** Drop everything scheduled and its pending `audioDone`; the drone keeps going. */
  | { readonly type: 'cancelAudio' }
  /** The first answer to a question: the one stats count. */
  | {
      readonly type: 'score';
      readonly question: Question;
      readonly answer: DegreeLabel;
      readonly right: boolean;
    };

export type SessionEvent =
  | { readonly type: 'start' }
  | { readonly type: 'next' }
  | { readonly type: 'answer'; readonly degree: DegreeLabel }
  | { readonly type: 'replayNote' }
  | { readonly type: 'replayContext' }
  | { readonly type: 'playTonic' }
  | { readonly type: 'audioDone'; readonly phase: Phase }
  | { readonly type: 'settingsChanged'; readonly settings: SessionSettings }
  | { readonly type: 'stop' };

export interface SessionScore {
  /** Questions answered this session. */
  readonly asked: number;
  /** Of those, right first try. */
  readonly right: number;
  /** Right first try in a row, up to now. */
  readonly streak: number;
}

export interface SessionState {
  readonly phase: Phase;
  readonly settings: SessionSettings;
  /** Seeds the next question's draw; each question draws the seed after it. */
  readonly seed: number;
  /** Questions asked under these settings, oldest first, the current one last. */
  readonly history: readonly Question[];
  /** The question on screen; it stays after `stop`. */
  readonly question: Question | null;
  /** The first answer to the current question (a degree id), the one that counts. */
  readonly answer: DegreeLabel | null;
  readonly score: SessionScore;
}

export interface Step {
  readonly state: SessionState;
  readonly effects: readonly Effect[];
}

const NO_SCORE: SessionScore = { asked: 0, right: 0, streak: 0 };

export function initialSession(settings: SessionSettings, seed: number): SessionState {
  return {
    phase: 'idle',
    settings,
    seed,
    history: [],
    question: null,
    answer: null,
    score: NO_SCORE,
  };
}

const droneOn = (s: SessionSettings): boolean => s.drone || s.context === 'droneOnly';

const sameDegrees = (a: readonly DegreeLabel[], b: readonly DegreeLabel[]): boolean => {
  const ids = (d: readonly DegreeLabel[]) => [...new Set(d.map(degreeId))].sort().join();
  return ids(a) === ids(b);
};

/** Settings under which the current question no longer stands: another key, degree set or register. */
const questionChanged = (a: SessionSettings, b: SessionSettings): boolean =>
  !sameKey(a.key, b.key) || !sameDegrees(a.degrees, b.degrees) || a.register !== b.register;

/** Where degree `d` sounds next to the question's note: in the octave up from the tonic at or below it. */
function midiNear(q: Question, d: DegreeLabel): number {
  return q.midi - interval(degreeId(q.degree)).semitones + interval(degreeId(d)).semitones;
}

const tonicOf = (state: SessionState, q: Question): number => questionTonic(q.key, state.settings);

/**
 * Ask the next question from `state.history`: its context first when the policy wants one (or the
 * drone alone, when the key is new and no cadence plays), else the note at once. A context cut
 * short by new settings starts over, as for a new key.
 */
function ask(state: SessionState, effects: Effect[] = []): Step {
  const rng = mulberry32(state.seed);
  const prev = state.question;
  const q = nextQuestion(state.settings, state.history, rng);
  const keyChanged = prev === null || !sameKey(prev.key, q.key);
  const freshKey = keyChanged || state.phase === 'context';
  const { context } = state.settings;
  const next = {
    ...state,
    seed: int(rng, 0, 0xffffffff),
    history: [...state.history, q],
    question: q,
    answer: null,
  };
  const out: Effect[] = [{ type: 'cancelAudio' }, ...effects];
  if (keyChanged && droneOn(state.settings)) out.push({ type: 'startDrone', key: q.key });
  if (context === 'everyQuestion' || (context === 'keyChange' && freshKey)) {
    out.push({ type: 'playContext', key: q.key, tonic: tonicOf(next, q), done: 'context' });
    return { state: { ...next, phase: 'context' }, effects: out };
  }
  if (context === 'droneOnly' && freshKey) {
    out.push({ type: 'wait', beats: DRONE_LEAD_BEATS, done: 'context' });
    return { state: { ...next, phase: 'context' }, effects: out };
  }
  out.push({ type: 'playNote', midi: q.midi, done: 'prompt' });
  return { state: { ...next, phase: 'prompt' }, effects: out };
}

/** After the answer's sounds: review, with auto-next's pause when it is on. */
function review(state: SessionState): Step {
  const effects: Effect[] = state.settings.autoNext
    ? [{ type: 'wait', beats: AUTO_NEXT_BEATS, done: 'review' }]
    : [];
  return { state: { ...state, phase: 'review' }, effects };
}

/** The walk home when resolution is on, else review. */
function resolve(state: SessionState, q: Question): Step {
  if (!state.settings.resolution) return review(state);
  const steps = resolution(q.key, q.degree, q.midi);
  return {
    state: { ...state, phase: 'resolving' },
    effects: [{ type: 'playResolution', steps, done: 'resolving' }],
  };
}

/** The first answer: scored, then the comparison when wrong, then the walk home. */
function firstAnswer(state: SessionState, q: Question, degree: DegreeLabel): Step {
  const answer = degreeId(degree);
  const right = answer === degreeId(q.degree);
  const { asked, right: rightCount, streak } = state.score;
  const scored: SessionState = {
    ...state,
    answer,
    score: {
      asked: asked + 1,
      right: rightCount + (right ? 1 : 0),
      streak: right ? streak + 1 : 0,
    },
  };
  const effects: Effect[] = [
    { type: 'cancelAudio' },
    { type: 'score', question: q, answer, right },
  ];
  if (!right) {
    effects.push({
      type: 'playCompare',
      answer: midiNear(q, answer),
      right: q.midi,
      done: 'answered',
    });
    return { state: { ...scored, phase: 'answered' }, effects };
  }
  const then = resolve(scored, q);
  return { state: then.state, effects: [...effects, ...then.effects] };
}

/** New settings: the drone follows them; a question they no longer allow is dropped unscored. */
function changeSettings(state: SessionState, settings: SessionSettings): Step {
  const old = state.settings;
  const next = { ...state, settings };
  if (state.phase === 'idle') return { state: next, effects: [] };
  const q = state.question!;
  if (questionChanged(old, settings)) {
    // A new key restarts the drone in ask(); otherwise it only follows the drone setting.
    const effects: Effect[] = [];
    if (droneOn(old) && !droneOn(settings)) effects.push({ type: 'stopDrone' });
    if (!droneOn(old) && droneOn(settings) && sameKey(q.key, settings.key)) {
      effects.push({ type: 'startDrone', key: q.key });
    }
    return ask({ ...next, history: [] }, effects);
  }
  if (droneOn(old) && !droneOn(settings)) return { state: next, effects: [{ type: 'stopDrone' }] };
  if (!droneOn(old) && droneOn(settings))
    return { state: next, effects: [{ type: 'startDrone', key: q.key }] };
  return { state: next, effects: [] };
}

/** The replays: the note, the cadence or the tonic, none of them scored. */
function replay(
  state: SessionState,
  q: Question,
  event: 'replayNote' | 'replayContext' | 'playTonic',
): Effect {
  const tonic = tonicOf(state, q);
  if (event === 'replayContext') return { type: 'playContext', key: q.key, tonic };
  return { type: 'playNote', midi: event === 'playTonic' ? tonic : q.midi };
}

const ignored = (state: SessionState): Step => ({ state, effects: [] });

/**
 * One event. Events that make no sense in the current phase are ignored: the state comes back
 * unchanged with no effects.
 */
export function step(state: SessionState, event: SessionEvent): Step {
  const { phase, question: q } = state;
  switch (event.type) {
    case 'start':
      if (phase !== 'idle') return ignored(state);
      return ask({ ...state, history: [], question: null, answer: null, score: NO_SCORE });

    case 'stop':
      if (phase === 'idle') return ignored(state);
      return {
        state: { ...state, phase: 'idle' },
        effects: [{ type: 'cancelAudio' }, { type: 'stopDrone' }],
      };

    case 'settingsChanged':
      return changeSettings(state, event.settings);

    case 'next':
      return phase === 'review' ? ask(state) : ignored(state);

    case 'audioDone':
      if (event.phase !== phase || !q) return ignored(state);
      switch (phase) {
        case 'context':
          return {
            state: { ...state, phase: 'prompt' },
            effects: [{ type: 'playNote', midi: q.midi, done: 'prompt' }],
          };
        case 'prompt':
          return { state: { ...state, phase: 'waiting' }, effects: [] };
        case 'answered':
          return resolve(state, q);
        case 'resolving':
          return review(state);
        case 'review':
          return ask(state);
        default:
          return ignored(state);
      }

    case 'answer':
      if (!q) return ignored(state);
      if (phase === 'prompt' || phase === 'waiting') return firstAnswer(state, q, event.degree);
      // After the first answer, a button just plays its note, next to the question's, to compare.
      if (phase === 'review') {
        return {
          state,
          effects: [{ type: 'cancelAudio' }, { type: 'playNote', midi: midiNear(q, event.degree) }],
        };
      }
      return ignored(state);

    case 'replayNote':
    case 'replayContext':
    case 'playTonic':
      if (!q || (phase !== 'waiting' && phase !== 'review')) return ignored(state);
      return { state, effects: [{ type: 'cancelAudio' }, replay(state, q, event.type)] };
  }
}
