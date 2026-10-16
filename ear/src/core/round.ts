/**
 * One round of a level (docs/ear-levels.md "How a level works"): a pure reducer from (state, event)
 * to the next state and the effects to carry out, like session.ts. The round decides each
 * question's right answer and a seed; the level kind's generator turns them into sounds, so this
 * file knows nothing of notes, chords or audio.
 */
import { int, mulberry32, weightedChoice, type Rng } from '@shared/core/rng';
import { askedAnswers, sameAnswer, type AnswerId, type Level } from './levels';
import { missWeight, type Count } from './stats';

/** Questions in a round. */
export const ROUND_QUESTIONS = 10;
/** Right first try in a row that move the round up one step. */
export const UP_AFTER = 5;
/** Wrong in a row that offer an easier step. */
export const EASIER_AFTER = 4;

/** How a round is judged; the "test me" quiz (#264) is a round with its own rules. */
export interface RoundRules {
  readonly questions: number;
  /** Right first try needed to pass. */
  readonly passMark: number;
}

/** A level's round: 8 of 10, on the level's last step. */
export const LEVEL_RULES: RoundRules = { questions: ROUND_QUESTIONS, passMark: 8 };

/**
 * A question: its level and step (a test round mixes levels), its right answer, and the seed the
 * level kind's generator draws its sounds from. The same question always sounds the same.
 */
export interface RoundQuestion {
  readonly level: number;
  readonly step: number;
  readonly answer: AnswerId;
  readonly seed: number;
}

/**
 * question ─answer─▶ feedback ─next─▶ question … ─next (after the last)─▶ done
 *                       │ (4 wrong in a row)
 *                       └─next─▶ stuck ─keepGoing─▶ question
 *                                  └─easier─▶ demo ─next─▶ question
 */
export type RoundPhase = 'question' | 'feedback' | 'stuck' | 'demo' | 'done';

/** Answer counts by answer id (`String(id)`), right meaning right first try. */
export type AnswerCounts = Readonly<Partial<Record<string, Count>>>;

export interface RoundState {
  readonly level: Level;
  readonly rules: RoundRules;
  readonly phase: RoundPhase;
  /** The step the next question is asked at, 0 for A. */
  readonly step: number;
  /** Seeds the next draw; each draw takes the seed after it. */
  readonly seed: number;
  /** Questions asked this round, the current one last. */
  readonly questions: readonly RoundQuestion[];
  /** The first answer to the current question, the one that counts. */
  readonly answer: AnswerId | null;
  /** Right first try this round. */
  readonly right: number;
  readonly rightInRow: number;
  /** Wrong in a row since the last offer of an easier step. */
  readonly wrongInRow: number;
  /** This level's answers so far, this round included: missed ones come up more often. */
  readonly counts: AnswerCounts;
}

export type RoundEvent =
  | { readonly type: 'answer'; readonly answer: AnswerId }
  | { readonly type: 'replay' }
  | { readonly type: 'next' }
  | { readonly type: 'easier' }
  | { readonly type: 'keepGoing' };

export type RoundEffect =
  /** Play a new question. */
  | { readonly type: 'ask'; readonly question: RoundQuestion }
  /** Play the current question again; free, never scored. */
  | { readonly type: 'replay'; readonly question: RoundQuestion }
  /** The first answer to a question: the one that counts. */
  | { readonly type: 'score'; readonly question: RoundQuestion; readonly answer: AnswerId; readonly right: boolean }
  /** The round moved to another step: up after UP_AFTER right, down when the learner chose easier. */
  | { readonly type: 'step'; readonly step: number }
  /** Ask "want to make it a bit easier?". */
  | { readonly type: 'offerEasier' }
  /** Play the level's demo at `step`. */
  | { readonly type: 'playDemo'; readonly level: number; readonly step: number }
  | { readonly type: 'end'; readonly right: number; readonly passed: boolean };

export interface RoundStep {
  readonly state: RoundState;
  readonly effects: readonly RoundEffect[];
}

const lastStep = (level: Level): number => level.steps.length - 1;

/** A level's round passes with the pass mark right, ending on the level's last step. */
export function passes(state: Pick<RoundState, 'level' | 'rules' | 'right' | 'step'>): boolean {
  return state.right >= state.rules.passMark && state.step === lastStep(state.level);
}

/**
 * The next right answer, by `missWeight()`: any the step can ask, except the same one a third time
 * in a row.
 */
function nextAnswer(state: RoundState, rng: Rng): AnswerId {
  const asked = askedAnswers(state.level, state.step);
  const [a, b] = state.questions.slice(-2).map((q) => q.answer);
  const allowed = a !== undefined && a === b && asked.length > 1 ? asked.filter((x) => x !== a) : asked;
  return weightedChoice(
    rng,
    allowed.map((item) => ({ item, weight: missWeight(state.counts[String(item)]) })),
  );
}

/** Ask the next question. */
function ask(state: RoundState): RoundStep {
  const rng = mulberry32(state.seed);
  const answer = nextAnswer(state, rng);
  const question: RoundQuestion = { level: state.level.id, step: state.step, answer, seed: int(rng, 0, 0xffffffff) };
  return {
    state: {
      ...state,
      phase: 'question',
      seed: int(rng, 0, 0xffffffff),
      questions: [...state.questions, question],
      answer: null,
    },
    effects: [{ type: 'ask', question }],
  };
}

/**
 * A new round of `level` at the step the learner reached (held to the level's steps), its first
 * question asked. `counts` are the level's answers from earlier rounds.
 */
export function startRound(level: Level, step: number, seed: number, counts: AnswerCounts = {}): RoundStep {
  return ask({
    level,
    rules: LEVEL_RULES,
    phase: 'question',
    step: Math.min(Math.max(0, Math.trunc(step)), lastStep(level)),
    seed,
    questions: [],
    answer: null,
    right: 0,
    rightInRow: 0,
    wrongInRow: 0,
    counts,
  });
}

/** `counts` with one more answer to `id`. */
function counted(counts: AnswerCounts, id: AnswerId, right: boolean): AnswerCounts {
  const c = counts[String(id)];
  return { ...counts, [String(id)]: { asked: (c?.asked ?? 0) + 1, right: (c?.right ?? 0) + (right ? 1 : 0) } };
}

/**
 * The first answer: scored and counted. UP_AFTER right in a row move the next question up a step
 * (never past the last); a wrong one breaks the run.
 */
function firstAnswer(state: RoundState, q: RoundQuestion, answer: AnswerId): RoundStep {
  const right = sameAnswer(state.level, answer, q.answer);
  const effects: RoundEffect[] = [{ type: 'score', question: q, answer, right }];
  let next: RoundState = {
    ...state,
    phase: 'feedback',
    answer,
    right: state.right + (right ? 1 : 0),
    rightInRow: right ? state.rightInRow + 1 : 0,
    wrongInRow: right ? 0 : state.wrongInRow + 1,
    counts: counted(state.counts, q.answer, right),
  };
  if (next.rightInRow >= UP_AFTER && next.step < lastStep(next.level)) {
    next = { ...next, step: next.step + 1, rightInRow: 0 };
    effects.push({ type: 'step', step: next.step });
  }
  return { state: next, effects };
}

/** After the feedback: the end, an offer of an easier step after EASIER_AFTER wrong in a row, or the next question. */
function afterFeedback(state: RoundState): RoundStep {
  if (state.questions.length >= state.rules.questions) {
    const passed = passes(state);
    return { state: { ...state, phase: 'done' }, effects: [{ type: 'end', right: state.right, passed }] };
  }
  if (state.wrongInRow >= EASIER_AFTER) {
    return { state: { ...state, phase: 'stuck', wrongInRow: 0 }, effects: [{ type: 'offerEasier' }] };
  }
  return ask(state);
}

/** "Yes, easier": one step down (none below A), then the level's demo at that step. */
function easier(state: RoundState): RoundStep {
  const step = Math.max(0, state.step - 1);
  const effects: RoundEffect[] = step === state.step ? [] : [{ type: 'step', step }];
  effects.push({ type: 'playDemo', level: state.level.id, step });
  return { state: { ...state, phase: 'demo', step, rightInRow: 0 }, effects };
}

const ignored = (state: RoundState): RoundStep => ({ state, effects: [] });

/**
 * One event. Events that make no sense in the current phase are ignored: the state comes back
 * unchanged with no effects. Only the first answer to a question counts; later ones are ignored.
 */
export function stepRound(state: RoundState, event: RoundEvent): RoundStep {
  const q = state.questions.at(-1);
  switch (event.type) {
    case 'answer':
      return state.phase === 'question' && q ? firstAnswer(state, q, event.answer) : ignored(state);
    case 'replay':
      return (state.phase === 'question' || state.phase === 'feedback') && q
        ? { state, effects: [{ type: 'replay', question: q }] }
        : ignored(state);
    case 'next':
      if (state.phase === 'feedback') return afterFeedback(state);
      return state.phase === 'demo' ? ask(state) : ignored(state);
    case 'easier':
      return state.phase === 'stuck' ? easier(state) : ignored(state);
    case 'keepGoing':
      return state.phase === 'stuck' ? ask(state) : ignored(state);
  }
}
