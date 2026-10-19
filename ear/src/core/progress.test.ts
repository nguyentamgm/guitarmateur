import { describe, expect, it } from 'vitest';
import { LEVELS, findLevel } from './levels';
import { NEW_LEVEL, currentLevel, isUnlocked, levelProgress, recordRoundEffect, type Progress } from './progress';
import { startRound, stepRound, type RoundEffect, type RoundQuestion } from './round';

const ids = LEVELS.map((l) => l.id);
const unlocked = (p: Progress) => ids.filter((id) => isUnlocked(p, id));
const done = (...levels: number[]): Progress =>
  Object.fromEntries(levels.map((id) => [id, { ...NEW_LEVEL, done: true }]));
const question = (level: number, answer: RoundQuestion['answer']): RoundQuestion => ({ level, step: 0, answer, seed: 1 });

describe('unlocking', () => {
  it('opens only level 1 for a new learner', () => {
    expect(unlocked({})).toEqual([1]);
    expect(currentLevel({})).toBe(1);
  });

  it('opens level n + 1 once level n is done', () => {
    for (const id of ids.slice(0, -1)) {
      const before = Object.fromEntries(ids.filter((i) => i < id).map((i) => [i, { ...NEW_LEVEL, done: true }]));
      expect(isUnlocked(before, id + 1), `level ${id + 1}`).toBe(false);
      expect(isUnlocked({ ...before, ...done(id) }, id + 1), `level ${id + 1}`).toBe(true);
    }
  });

  it('keeps a level shut until the one before it is done, whatever else is', () => {
    expect(unlocked(done(1, 2, 5))).toEqual([1, 2, 3, 6]);
    expect(currentLevel(done(1, 2, 5))).toBe(3);
  });

  it('points at the last level once every level is done, and knows no other ids', () => {
    expect(currentLevel(done(...ids))).toBe(15);
    expect(isUnlocked(done(...ids), 16)).toBe(false);
    expect(isUnlocked({}, 0)).toBe(false);
  });

  it('reads a level never played as new', () => {
    expect(levelProgress({}, 4)).toEqual({ step: 0, best: 0, done: false, counts: {} });
  });
});

describe('recordRoundEffect', () => {
  it('keeps the step reached, up or down', () => {
    let p = recordRoundEffect({}, 2, { type: 'step', step: 2 });
    expect(p[2]!.step).toBe(2);
    p = recordRoundEffect(p, 2, { type: 'step', step: 1 });
    expect(p[2]!.step).toBe(1);
  });

  it("counts first answers under the question's level", () => {
    let p = recordRoundEffect({}, 2, { type: 'score', question: question(2, 'higher'), answer: 'lower', right: false });
    p = recordRoundEffect(p, 2, { type: 'score', question: question(2, 'higher'), answer: 'higher', right: true });
    p = recordRoundEffect(p, 3, { type: 'score', question: question(4, 'far'), answer: 'far', right: true });
    expect(p[2]!.counts).toEqual({ higher: { asked: 2, right: 1 } });
    expect(p[4]!.counts).toEqual({ far: { asked: 1, right: 1 } });
    expect(p[3]).toBeUndefined();
  });

  it('keeps the best round, and done once passed, never undone', () => {
    let p = recordRoundEffect({}, 1, { type: 'end', right: 7, passed: false });
    expect(p[1]).toMatchObject({ best: 7, done: false });
    p = recordRoundEffect(p, 1, { type: 'end', right: 9, passed: true });
    p = recordRoundEffect(p, 1, { type: 'end', right: 3, passed: false });
    expect(p[1]).toMatchObject({ best: 9, done: true });
    expect(unlocked(p)).toEqual([1, 2]);
  });

  it('changes nothing on effects that are not progress', () => {
    const p = done(1);
    for (const e of [
      { type: 'ask', question: question(1, 'same') },
      { type: 'replay', question: question(1, 'same') },
      { type: 'offerEasier' },
      { type: 'playDemo', level: 1, step: 0 },
    ] as RoundEffect[]) {
      expect(recordRoundEffect(p, 1, e)).toBe(p);
    }
  });

  it('unlocks the next level after a passing round played through', () => {
    const level = findLevel(1)!;
    let p: Progress = {};
    // A round starts at the step stored; 10 right climb A → B → C and pass on C.
    let { state } = startRound(level, levelProgress(p, level.id).step, 7);
    for (let i = 0; i < 10; i++) {
      for (const event of [{ type: 'answer', answer: state.questions.at(-1)!.answer }, { type: 'next' }] as const) {
        const out = stepRound(state, event);
        state = out.state;
        for (const e of out.effects) p = recordRoundEffect(p, level.id, e);
      }
    }
    expect(p[1]).toMatchObject({ step: 2, best: 10, done: true });
    expect(Object.values(p[1]!.counts).reduce((n, c) => n + c!.asked, 0)).toBe(10);
    expect(unlocked(p)).toEqual([1, 2]);
  });
});

describe('a stage test', () => {
  const test = (stage: 1 | 2 | 3 | 4 | 5, right: number, passed: boolean): RoundEffect => ({
    type: 'end',
    right,
    passed,
    test: stage,
  });

  it('9 of 10 marks the stage and every one before it done, so the next stage opens', () => {
    const start: Progress = { 2: { ...NEW_LEVEL, best: 6, counts: { higher: { asked: 3, right: 2 } } } };
    const p = recordRoundEffect(start, 10, test(3, 9, true));
    expect(ids.filter((id) => levelProgress(p, id).done)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(unlocked(p)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(currentLevel(p)).toBe(11);
    // Scores and counts stay as they were: a skipped level has played no round.
    expect(p[2]).toEqual({ ...start[2], done: true });
    expect(levelProgress(p, 10).best).toBe(0);
  });

  it('8 of 10 changes nothing', () => {
    const start = done(1);
    expect(recordRoundEffect(start, 4, test(1, 8, false))).toBe(start);
  });
});
