import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { fillPlan, judgeFill } from './fill';

describe('fillPlan', () => {
  it('generates a plan with correct length and first entry 0', () => {
    const rng = mulberry32(42);
    const plan = fillPlan(rng, 3, 4);
    expect(plan.length).toBe(4);
    expect(plan[0]).toBe(0);
  });

  it('contains at least two distinct chords', () => {
    const rng = mulberry32(101);
    for (let i = 0; i < 50; i++) {
      const plan = fillPlan(rng, 3, 4);
      expect(new Set(plan).size).toBeGreaterThanOrEqual(2);
    }
  });

  it('differs from the previous plan', () => {
    const rng = mulberry32(202);
    let prev: number[] | undefined;
    for (let i = 0; i < 30; i++) {
      const plan = fillPlan(rng, 3, 4, prev);
      if (prev) {
        expect(plan).not.toEqual(prev);
      }
      prev = plan;
    }
  });
});

describe('judgeFill', () => {
  it('judges [0,1,2,0] with [null,1,0,0] as [true,true,false,true]', () => {
    const plan = [0, 1, 2, 0];
    const picks = [null, 1, 0, 0];
    expect(judgeFill(plan, picks)).toEqual([true, true, false, true]);
  });

  it('marks a null pick in bar >= 1 as wrong and bar 0 as always true', () => {
    const plan = [0, 1, 2, 0];
    const picks = [null, null, null, null];
    expect(judgeFill(plan, picks)).toEqual([true, false, false, false]);
  });
});
