/** A seeded random source in [0, 1). No `Math.random` anywhere in `src/lick/` (lint-enforced). */
export type Rng = () => number;

/** mulberry32 — public-domain 32-bit seeded PRNG. Same seed ⇒ same sequence, forever. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random integer in [lo, hi], inclusive both ends. */
export function int(rng: Rng, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

/** Uniform pick from a non-empty array. */
export function choice<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) throw new RangeError('choice: items is empty');
  return items[int(rng, 0, items.length - 1)]!;
}

/** Weighted pick from a non-empty list of `{ item, weight }` (weights must sum > 0). */
export function weightedChoice<T>(rng: Rng, items: readonly { item: T; weight: number }[]): T {
  if (items.length === 0) throw new RangeError('weightedChoice: items is empty');
  const total = items.reduce((sum, x) => sum + x.weight, 0);
  let r = rng() * total;
  for (const it of items) {
    if (r < it.weight) return it.item;
    r -= it.weight;
  }
  return items[items.length - 1]!.item;
}
