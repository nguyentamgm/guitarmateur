import { choice, type Rng } from './rng';
import type { LickParams } from './model';

export interface RhythmSlot {
  startBeat: number;
  durationBeats: number;
  /** A silent slot: contributes to the beat grid but produces no note. */
  rest?: boolean;
}
export type RhythmPattern = RhythmSlot[];

const LENGTH_BEATS = 4;

const q = (startBeat: number): RhythmSlot => ({ startBeat, durationBeats: 1 });
const h = (startBeat: number): RhythmSlot => ({ startBeat, durationBeats: 2 });
const e = (startBeat: number): RhythmSlot => ({ startBeat, durationBeats: 0.5 });
const restE = (startBeat: number): RhythmSlot => ({ startBeat, durationBeats: 0.5, rest: true });

/** Level 1 — sparse, on-beat quarters/halves (3–4 notes). */
const LEVEL1: RhythmPattern[] = [
  [q(0), q(1), q(2), q(3)],
  [h(0), q(2), q(3)],
  [q(0), h(1), q(3)],
];

/** Level 2 — quarters + paired 8ths (4–6 notes). */
const LEVEL2: RhythmPattern[] = [
  [q(0), q(1), e(2), e(2.5), q(3)],
  [e(0), e(0.5), q(1), q(2), q(3)],
  [q(0), e(1), e(1.5), q(2), q(3)],
  [e(0), e(0.5), e(1), e(1.5), q(2), q(3)],
  [h(0), e(2), e(2.5), q(3)],
];

/** Level 3 — straight 8ths, 8th rests, pickup starts (6–8 notes). */
const LEVEL3: RhythmPattern[] = [
  [e(0), e(0.5), e(1), e(1.5), e(2), e(2.5), e(3), e(3.5)],
  [e(0), e(0.5), e(1), restE(1.5), e(2), restE(2.5), e(3), e(3.5)],
  [restE(0), e(0.5), e(1), e(1.5), e(2), e(2.5), e(3), e(3.5)],
  [e(0), restE(0.5), e(1), e(1.5), restE(2), e(2.5), e(3), e(3.5)],
];

const LIBRARY: Record<LickParams['level'], RhythmPattern[]> = {
  1: LEVEL1,
  2: LEVEL2,
  3: LEVEL3,
  // M4 ships syncopation/tuplets for levels 4–5; until then they reuse level 3's pool.
  4: LEVEL3,
  5: LEVEL3,
};

/** Deterministic pick of one pattern from the level's pool. */
export function pickPattern(level: LickParams['level'], rng: Rng): RhythmPattern {
  return choice(rng, LIBRARY[level]);
}

/** The non-rest slots — these are the ones that receive a `LickNote`. */
export function activeSlots(pattern: RhythmPattern): RhythmSlot[] {
  return pattern.filter((s) => !s.rest);
}

/** Total beats spanned by a pattern (rests included) — always `LENGTH_BEATS` for v1 patterns. */
export function patternLengthBeats(pattern: RhythmPattern): number {
  return pattern.reduce((sum, s) => sum + s.durationBeats, 0);
}

export { LENGTH_BEATS };
