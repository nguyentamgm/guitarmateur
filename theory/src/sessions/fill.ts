import type { ChordSpec } from './types';

function samePlan(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

/** Indexes into `pool`, one per bar: bar 0 is always 0 (the I chord); at least two different chords; not equal to `previous`. */
export function fillPlan(
  random: () => number,
  poolSize: number,
  bars: number,
  previous?: readonly number[],
): number[] {
  if (bars <= 0 || poolSize <= 0) return [];
  if (poolSize === 1 || bars === 1) return Array(bars).fill(0);

  for (let attempt = 0; attempt < 1000; attempt++) {
    const plan: number[] = [0];
    for (let i = 1; i < bars; i++) {
      plan.push(Math.min(poolSize - 1, Math.floor(random() * poolSize)));
    }
    const distinct = new Set(plan).size;
    if (distinct >= 2 && (!previous || !samePlan(plan, previous))) {
      return plan;
    }
  }

  const fallback = [0];
  for (let i = 1; i < bars; i++) {
    fallback.push(i % poolSize === 0 ? 1 : i % poolSize);
  }
  if (previous && samePlan(fallback, previous) && poolSize > 2) {
    fallback[bars - 1] = (fallback[bars - 1]! + 1) % poolSize;
  }
  return fallback;
}

/** Translate a written form into the pool indexes used by playback and guessing. */
export function fixedFillPlan(pool: readonly ChordSpec[], plan: readonly ChordSpec[]): number[] {
  return plan.map((chord) => {
    const index = pool.findIndex((entry) => {
      if (typeof chord === 'number' || typeof entry === 'number') return chord === entry;
      return entry.root === chord.root && entry.id === chord.id;
    });
    if (index < 0) throw new RangeError('The fixed form uses a chord outside its pool');
    return index;
  });
}

/** Judge answers at the selected indexes. The random exercise gives the first bar. */
export function judgeFill(
  plan: readonly number[],
  picks: readonly (number | null)[],
  blanks?: readonly number[],
): boolean[] {
  return plan.map((chord, i) => {
    if (blanks ? !blanks.includes(i) : i === 0) return true;
    return picks[i] === chord;
  });
}
