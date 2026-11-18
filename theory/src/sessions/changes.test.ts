import { describe, expect, it } from 'vitest';
import { changeBars, changePlan, judgeTaps } from './changes';
import { mulberry32 } from '@shared/core/rng';

describe('changePlan', () => {
  it('has exactly bars entries and starts on pool[0]', () => {
    const rng = mulberry32(42);
    const pool = [1, 4, 5];
    const plan = changePlan(rng, pool, 8, [2]);
    expect(plan.length).toBe(8);
    expect(plan[0]).toBe(pool[0]);
  });

  it('with holds: [2] changes only on even bars', () => {
    const rng = mulberry32(101);
    const pool = [1, 4, 5];
    for (let trial = 0; trial < 10; trial++) {
      const plan = changePlan(rng, pool, 8, [2]);
      expect(plan.length).toBe(8);
      const changes = changeBars(plan);
      for (const bar of changes) {
        expect(bar % 2).toBe(0);
      }
    }
  });

  it('never has a chord that follows itself', () => {
    const rng = mulberry32(202);
    const pool = [1, 4, 5];
    for (let trial = 0; trial < 10; trial++) {
      const plan = changePlan(rng, pool, 8, [1, 2]);
      expect(plan.length).toBe(8);
      const changes = changeBars(plan);
      // For each change, plan[bar] !== plan[bar - 1]
      for (const bar of changes) {
        expect(plan[bar]).not.toEqual(plan[bar - 1]);
      }
    }
  });

  it('works with holds: [1, 2] and fills exact bar count', () => {
    const rng = mulberry32(303);
    const pool = [1, 4, 5];
    const plan = changePlan(rng, pool, 8, [1, 2]);
    expect(plan.length).toBe(8);
    expect(plan[0]).toBe(1);
  });
});

describe('changeBars', () => {
  it('returns [2, 4, 5] for [1, 1, 4, 4, 5, 1]', () => {
    expect(changeBars([1, 1, 4, 4, 5, 1])).toEqual([2, 4, 5]);
  });

  it('returns empty array when chord never changes', () => {
    expect(changeBars([1, 1, 1, 1])).toEqual([]);
  });

  it('returns all bars from 1 when chord changes every bar', () => {
    expect(changeBars([1, 4, 5, 1])).toEqual([1, 2, 3]);
  });
});

describe('judgeTaps', () => {
  it('scores caught and extra taps correctly: judgeTaps([8, 16], [8.4, 12, 15.7])', () => {
    const score = judgeTaps([8, 16], [8.4, 12, 15.7]);
    expect(score.caught).toEqual([true, true]);
    expect(score.extra).toBe(1);
  });

  it('handles empty taps: judgeTaps([8], []) -> [false], 0', () => {
    const score = judgeTaps([8], []);
    expect(score.caught).toEqual([false]);
    expect(score.extra).toBe(0);
  });

  it('a tap 2 beats late is not a catch', () => {
    const score = judgeTaps([8], [10]);
    expect(score.caught).toEqual([false]);
    expect(score.extra).toBe(1);
  });

  it('accepts taps from 0.5 beat before to 1.5 beats after', () => {
    // Exactly 0.5 before (7.5) -> caught
    expect(judgeTaps([8], [7.5])).toEqual({ caught: [true], extra: 0 });
    // Exactly 1.5 after (9.5) -> caught
    expect(judgeTaps([8], [9.5])).toEqual({ caught: [true], extra: 0 });
    // 0.6 before (7.4) -> not caught
    expect(judgeTaps([8], [7.4])).toEqual({ caught: [false], extra: 1 });
    // 1.6 after (9.6) -> not caught
    expect(judgeTaps([8], [9.6])).toEqual({ caught: [false], extra: 1 });
  });

  it('each tap counts for one change at most, remaining taps are extra', () => {
    // Two taps in the window of change 8 -> first tap catches, second is extra
    const score = judgeTaps([8], [7.9, 8.2]);
    expect(score.caught).toEqual([true]);
    expect(score.extra).toBe(1);
  });
});
