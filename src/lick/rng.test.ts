import { describe, expect, it } from 'vitest';
import { int, mulberry32, weightedChoice } from './rng';

describe('mulberry32', () => {
  it('returns deterministic sequences: same seed => same values', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqB).toEqual(seqA);
  });

  it('returns different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const seqA = Array.from({ length: 5 }, () => a());
    const seqB = Array.from({ length: 5 }, () => b());
    expect(seqB).not.toEqual(seqA);
  });

  it('returns values in [0, 1)', () => {
    const rng = mulberry32(99);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('int', () => {
  it('returns values within [lo, hi]', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const v = int(rng, 0, 5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(5);
    }
  });

  it('returns both endpoints over many draws', () => {
    const rng = mulberry32(13);
    const draws = Array.from({ length: 500 }, () => int(rng, 3, 7));
    expect(draws).toContain(3);
    expect(draws).toContain(7);
  });
});

describe('weightedChoice', () => {
  it('respects extreme weights', () => {
    const rng = mulberry32(0);
    const items = [
      { item: 'rare', weight: 1 },
      { item: 'common', weight: 99 },
    ];
    const results = Array.from({ length: 200 }, () => weightedChoice(rng, items));
    const commonCount = results.filter((x) => x === 'common').length;
    const rareCount = results.filter((x) => x === 'rare').length;
    expect(commonCount).toBeGreaterThan(rareCount);
  });

  it('returns one of the provided items', () => {
    const rng = mulberry32(55);
    const items = [
      { item: 'a', weight: 1 },
      { item: 'b', weight: 2 },
      { item: 'c', weight: 3 },
    ];
    for (let i = 0; i < 100; i++) {
      const v = weightedChoice(rng, items);
      expect(items.map((x) => x.item)).toContain(v);
    }
  });
});
