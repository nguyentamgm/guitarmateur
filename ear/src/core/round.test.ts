import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { LEVELS, findLevel, sameAnswer, stepAnswers, type AnswerId, type Level, type LevelOf } from './levels';
import {
  EASIER_AFTER,
  LEVEL_RULES,
  ROUND_QUESTIONS,
  UP_AFTER,
  passes,
  questionLevel,
  startRound,
  startTest,
  stepRound,
  type AnswerCounts,
  type RoundEffect,
  type RoundEvent,
  type RoundState,
} from './round';

const SEEDS = Array.from({ length: 40 }, (_, i) => i * 7919 + 1);
const level2 = findLevel(2)!;

/** The current question's right answer, or a wrong one the step shows. */
function answerFor(state: RoundState, right: boolean): AnswerId {
  const q = state.questions.at(-1)!;
  if (right) return q.answer;
  const level = questionLevel(state, q);
  const shown: readonly AnswerId[] = stepAnswers(level as LevelOf<typeof level.kind>, q.step);
  return shown.find((a) => !sameAnswer(level, a, q.answer))!;
}

/** Steps through events, collecting every effect. */
function run(state: RoundState, events: RoundEvent[]): { state: RoundState; effects: RoundEffect[] } {
  const effects: RoundEffect[] = [];
  for (const e of events) {
    const out = stepRound(state, e);
    state = out.state;
    effects.push(...out.effects);
  }
  return { state, effects };
}

/** Answers the current question right or wrong, then moves on. */
function play(state: RoundState, rights: boolean[]): { state: RoundState; effects: RoundEffect[] } {
  const effects: RoundEffect[] = [];
  for (const r of rights) {
    const out = run(state, [{ type: 'answer', answer: answerFor(state, r) }, { type: 'next' }]);
    state = out.state;
    effects.push(...out.effects);
  }
  return { state, effects };
}

const steps = (effects: RoundEffect[]) => effects.filter((e) => e.type === 'step').map((e) => e.step);
const offers = (effects: RoundEffect[]) => effects.filter((e) => e.type === 'offerEasier').length;
const R = (n: number) => Array<boolean>(n).fill(true);
const W = (n: number) => Array<boolean>(n).fill(false);

describe('startRound', () => {
  it('asks a first question at the step reached, held to the level', () => {
    const { state, effects } = startRound(level2, 1, 1);
    expect(state.phase).toBe('question');
    expect(state.step).toBe(1);
    expect(effects).toEqual([{ type: 'ask', question: state.questions[0] }]);
    expect(state.questions[0]).toMatchObject({ level: 2, step: 1 });
    expect(startRound(level2, 9, 1).state.step).toBe(2);
    expect(startRound(level2, -1, 1).state.step).toBe(0);
  });

  it('draws the same round from the same seed', () => {
    const a = play(startRound(level2, 0, 42).state, [true, false, true, true]);
    const b = play(startRound(level2, 0, 42).state, [true, false, true, true]);
    expect(a.state.questions).toEqual(b.state.questions);
  });
});

describe('a round', () => {
  it('always has 10 questions, however it is answered', () => {
    for (const level of LEVELS) {
      for (const seed of SEEDS.slice(0, 8)) {
        const rng = mulberry32(seed);
        let { state } = startRound(level, Math.floor(rng() * 3), seed);
        const ends: RoundEffect[] = [];
        for (let guard = 0; state.phase !== 'done' && guard < 100; guard++) {
          let event: RoundEvent;
          if (state.phase === 'question') event = { type: 'answer', answer: answerFor(state, rng() < 0.5) };
          else if (state.phase === 'stuck') event = { type: rng() < 0.5 ? 'easier' : 'keepGoing' };
          else event = { type: 'next' };
          const out = stepRound(state, event);
          state = out.state;
          ends.push(...out.effects.filter((e) => e.type === 'end'));
        }
        expect(state.phase, `level ${level.id}`).toBe('done');
        expect(state.questions).toHaveLength(ROUND_QUESTIONS);
        expect(ends).toHaveLength(1);
      }
    }
  });

  it('never asks the same answer three times in a row', () => {
    for (const level of LEVELS) {
      for (const seed of SEEDS) {
        const { state } = play(startRound(level, 2, seed).state, R(10));
        const answers = state.questions.map((q) => q.answer);
        for (let i = 2; i < answers.length; i++) {
          expect(answers[i] === answers[i - 1] && answers[i] === answers[i - 2], `level ${level.id} seed ${seed}`).toBe(false);
        }
      }
    }
  });

  it("asks only answers the step can ask, at the round's step", () => {
    const { state } = play(startRound(findLevel(7)!, 0, 3).state, R(9));
    for (const q of state.questions) expect(['1', 'notRoot']).toContain(q.answer);
    expect(state.questions.map((q) => q.step)).toEqual([0, 0, 0, 0, 0, 1, 1, 1, 1, 1]);
  });

  it('asks the answers missed in this level more often', () => {
    const share = (counts: AnswerCounts) => {
      let higher = 0;
      for (const seed of SEEDS) {
        const { state } = play(startRound(level2, 2, seed, counts).state, R(9));
        higher += state.questions.filter((q) => q.answer === 'higher').length;
      }
      return higher / (SEEDS.length * ROUND_QUESTIONS);
    };
    const missed = share({ higher: { asked: 20, right: 2 }, lower: { asked: 20, right: 20 } });
    expect(share({})).toBeCloseTo(0.5, 1);
    expect(missed).toBeGreaterThan(share({}) + 0.05);
  });

  it('counts each answer, right first try, on top of the counts it started with', () => {
    const { state } = play(startRound(level2, 2, 5, { higher: { asked: 3, right: 1 } }).state, [true, false]);
    const [q1, q2] = state.questions;
    const asked = [q1!.answer, q2!.answer];
    const sum = (id: string) => asked.filter((a) => a === id).length;
    expect(state.counts.higher!.asked).toBe(3 + sum('higher'));
    expect(state.counts.lower?.asked ?? 0).toBe(sum('lower'));
    expect(state.right).toBe(1);
  });
});

describe('getting harder', () => {
  it(`moves up exactly one step after ${UP_AFTER} right in a row`, () => {
    const start = startRound(level2, 0, 9).state;
    const four = play(start, R(4));
    expect(steps(four.effects)).toEqual([]);
    const five = play(four.state, R(1));
    expect(steps(five.effects)).toEqual([1]);
    expect(five.state.step).toBe(1);
    expect(five.state.questions.at(-1)!.step).toBe(1);
    // The run starts over at the new step.
    expect(steps(play(five.state, R(4)).effects)).toEqual([]);
    expect(steps(play(five.state, R(5)).effects)).toEqual([2]);
  });

  it('never moves past the last step, nor down by itself', () => {
    expect(steps(play(startRound(level2, 2, 9).state, R(10)).effects)).toEqual([]);
    expect(steps(play(startRound(level2, 1, 9).state, W(3).concat(R(1), W(3))).effects)).toEqual([]);
  });

  it('starts the run of right answers over after a wrong one', () => {
    expect(steps(play(startRound(level2, 0, 9).state, [...R(4), false, ...R(4)]).effects)).toEqual([]);
  });
});

describe('when stuck', () => {
  it(`offers an easier step after ${EASIER_AFTER} wrong in a row, once, then again after ${EASIER_AFTER} more`, () => {
    let { state } = startRound(level2, 2, 11);
    const three = play(state, W(3));
    expect(offers(three.effects)).toBe(0);
    const four = run(three.state, [{ type: 'answer', answer: answerFor(three.state, false) }, { type: 'next' }]);
    expect(offers(four.effects)).toBe(1);
    expect(four.state.phase).toBe('stuck');
    expect(four.effects.some((e) => e.type === 'ask')).toBe(false);
    // No: carry on, nothing lost.
    const on = stepRound(four.state, { type: 'keepGoing' });
    expect(on.state.step).toBe(2);
    expect(on.effects.map((e) => e.type)).toEqual(['ask']);
    state = on.state;
    expect(offers(play(state, W(3)).effects)).toBe(0);
    expect(offers(play(state, W(4)).effects)).toBe(1);
  });

  it('goes one step down and replays the demo when the learner says yes', () => {
    const stuck = play(startRound(level2, 2, 11).state, W(4)).state;
    const yes = stepRound(stuck, { type: 'easier' });
    expect(yes.state).toMatchObject({ phase: 'demo', step: 1 });
    expect(yes.effects).toEqual([
      { type: 'step', step: 1 },
      { type: 'playDemo', level: 2, step: 1 },
    ]);
    const next = stepRound(yes.state, { type: 'next' });
    expect(next.state.phase).toBe('question');
    expect(next.effects).toEqual([{ type: 'ask', question: next.state.questions.at(-1) }]);
    expect(next.state.questions.at(-1)!.step).toBe(1);
  });

  it('replays the demo at step A, which has no step below', () => {
    const stuck = play(startRound(level2, 0, 11).state, W(4)).state;
    expect(stepRound(stuck, { type: 'easier' }).effects).toEqual([{ type: 'playDemo', level: 2, step: 0 }]);
  });

  it('ends the round instead of offering, after the last question', () => {
    const { state, effects } = play(startRound(level2, 2, 11).state, [...R(6), ...W(4)]);
    expect(offers(effects)).toBe(0);
    expect(state.phase).toBe('done');
  });
});

describe('the pass', () => {
  const ends = (effects: RoundEffect[]) => effects.filter((e) => e.type === 'end');

  it('passes 8 of 10 on the last step', () => {
    const { state, effects } = play(startRound(level2, 2, 13).state, [...R(3), false, ...R(3), false, ...R(2)]);
    expect(ends(effects)).toEqual([{ type: 'end', right: 8, passed: true }]);
    expect(passes(state)).toBe(true);
  });

  it('passes a round that climbs to the last step on the way', () => {
    const { effects } = play(startRound(level2, 1, 13).state, [...R(5), ...R(3), ...W(2)]);
    expect(steps(effects)).toEqual([2]);
    expect(ends(effects)).toEqual([{ type: 'end', right: 8, passed: true }]);
  });

  it('does not pass 8 of 10 before the last step', () => {
    const { state, effects } = play(startRound(level2, 0, 13).state, [...R(5), ...R(3), ...W(2)]);
    expect(state.step).toBe(1);
    expect(ends(effects)).toEqual([{ type: 'end', right: 8, passed: false }]);
  });

  it('never passes 7 of 10', () => {
    for (const seed of SEEDS) {
      const rng = mulberry32(seed);
      const rights = [...R(7), ...W(3)].sort(() => rng() - 0.5);
      const { effects } = play(startRound(level2, 2, seed).state, rights);
      expect(ends(effects)).toEqual([{ type: 'end', right: 7, passed: false }]);
    }
  });

  it("passes on the level's rules: the pass mark and the last step", () => {
    const at = (level: Level, right: number, step: number) => passes({ level, rules: LEVEL_RULES, right, step });
    expect(LEVEL_RULES).toEqual({ questions: 10, passMark: 8, offersEasier: true });
    expect(at(level2, 10, 2)).toBe(true);
    expect(at(level2, 10, 1)).toBe(false);
    expect(at(level2, 7, 2)).toBe(false);
  });
});

describe('only the first answer counts', () => {
  it('ignores a changed answer and lets the question be replayed for free', () => {
    const { state } = startRound(level2, 2, 17);
    const wrong = stepRound(state, { type: 'answer', answer: answerFor(state, false) });
    const changed = stepRound(wrong.state, { type: 'answer', answer: answerFor(state, true) });
    expect(changed).toEqual({ state: wrong.state, effects: [] });
    expect(wrong.state.right).toBe(0);
    const q = state.questions[0]!;
    expect(stepRound(state, { type: 'replay' })).toEqual({ state, effects: [{ type: 'replay', question: q }] });
    expect(stepRound(wrong.state, { type: 'replay' }).effects).toEqual([{ type: 'replay', question: q }]);
  });

  it('ignores events that make no sense in the phase', () => {
    const { state } = startRound(level2, 2, 17);
    for (const type of ['next', 'easier', 'keepGoing'] as const) expect(stepRound(state, { type })).toEqual({ state, effects: [] });
    const done = play(state, R(10)).state;
    expect(done.phase).toBe('done');
    for (const e of [{ type: 'next' }, { type: 'replay' }, { type: 'answer', answer: 'higher' }] as RoundEvent[]) {
      expect(stepRound(done, e)).toEqual({ state: done, effects: [] });
    }
  });

  it('scores the first answer with its question', () => {
    const { state } = startRound(level2, 2, 17);
    const q = state.questions[0]!;
    expect(stepRound(state, { type: 'answer', answer: q.answer }).effects).toEqual([
      { type: 'score', question: q, answer: q.answer, right: true },
    ]);
  });
});

describe('level 15', () => {
  it('takes any fret of the root: 0 and 12 on the thickest string are both E', () => {
    const level = findLevel(15)!;
    for (const seed of SEEDS) {
      const { state } = startRound(level, 0, seed);
      const q = state.questions[0]!;
      if (q.answer !== 0 && q.answer !== 12) continue;
      const other = q.answer === 0 ? 12 : 0;
      expect(stepRound(state, { type: 'answer', answer: other }).state.right).toBe(1);
      return;
    }
    throw new Error('no seed asked the E root');
  });
});

describe('a stage test ("test me")', () => {
  it("asks 10 questions over the stage's levels in turn, each on its last step, and never offers easier", () => {
    for (const seed of SEEDS) {
      const { state, effects } = play(startTest(3, seed).state, W(ROUND_QUESTIONS));
      expect(state.questions.map((q) => q.level)).toEqual([7, 8, 9, 10, 7, 8, 9, 10, 7, 8]);
      for (const q of state.questions) expect(q.step).toBe(findLevel(q.level)!.steps.length - 1);
      expect(offers(effects)).toBe(0);
      expect(steps(effects)).toEqual([]);
      expect(state.phase).toBe('done');
    }
  });

  it('passes with 9 of 10, not 8, and its end names the stage', () => {
    const end = (rights: boolean[]) =>
      play(startTest(1, 5).state, rights).effects.find((e) => e.type === 'end');
    expect(end([...W(1), ...R(9)])).toEqual({ type: 'end', right: 9, passed: true, test: 1 });
    expect(end([...W(2), ...R(8)])).toEqual({ type: 'end', right: 8, passed: false, test: 1 });
  });
});
