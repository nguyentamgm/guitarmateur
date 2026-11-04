import { choice, type Rng } from '@shared/core/rng';
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
export const s = (startBeat: number): RhythmSlot => ({ startBeat, durationBeats: 0.25 });
export const restS = (startBeat: number): RhythmSlot => ({ startBeat, durationBeats: 0.25, rest: true });
/** Dotted 8th — the "long" half of a 16th-grid shuffle/swing pair (long + 16th = 1 beat). */
const de = (startBeat: number): RhythmSlot => ({ startBeat, durationBeats: 0.75 });
/** Dotted quarter — the "long" half of a 2-beat shuffle pair (long + 8th = 2 beats). */
const dq = (startBeat: number): RhythmSlot => ({ startBeat, durationBeats: 1.5 });

/**
 * One beat of blues shuffle: long-short swing, approximating a 2:1 triplet feel
 * (dotted-8th + 16th) on the existing 16th-note grid.
 */
const shuffleBeat = (beat: number): RhythmSlot[] => [de(beat), s(beat + 0.75)];

/**
 * A 2-beat blues shuffle unit (dotted-quarter + 8th) — the classic notated "boogie"
 * long-short bass figure. Levels 1-3 exclude 16th notes, so this is the shuffle feel
 * built entirely from durations ≥ an 8th.
 */
const shuffleUnit = (beat: number): RhythmSlot[] => [dq(beat), e(beat + 1.5)];

/** Quarter rest — a breath long enough to hear at every level. */
const restQ = (startBeat: number): RhythmSlot => ({ startBeat, durationBeats: 1, rest: true });

/*
 * Phrasing rules every pattern below follows, because they are what makes a lick sound like a
 * sentence rather than a scale exercise:
 *
 * - **It breathes.** Most patterns leave a rest somewhere — often a pickup (a rest on the downbeat,
 *   so the phrase starts *after* the 1) or a gap mid-bar that splits it into call and answer.
 * - **It lands and holds.** The last note is at least a beat long (or a syncopated dotted quarter
 *   on the "and" of 2), so the target note rings instead of being thrown away on the last 8th.
 * - **It is not wall-to-wall.** Density still rises with the level, but no level fills every slot.
 */

/** Level 1 — quarters/halves with quarter rests (2–4 notes). */
const LEVEL1: RhythmPattern[] = [
  [q(0), q(1), h(2)],
  [restQ(0), q(1), h(2)],
  [q(0), restQ(1), q(2), q(3)],
  [restQ(0), q(1), q(2), q(3)],
  [h(0), h(2)],
  [q(0), q(1), q(2), q(3)],
];

/** Level 2 — quarters + paired 8ths, pickups and a held landing (4–6 notes). */
const LEVEL2: RhythmPattern[] = [
  [restE(0), e(0.5), e(1), e(1.5), h(2)],
  [e(0), e(0.5), q(1), restQ(2), q(3)],
  [q(0), e(1), e(1.5), h(2)],
  [restQ(0), e(1), e(1.5), e(2), e(2.5), q(3)],
  [e(0), e(0.5), e(1), e(1.5), h(2)],
  [q(0), restE(1), e(1.5), q(2), q(3)],
  [restE(0), e(0.5), q(1), e(2), e(2.5), q(3)],
];

/** Level 3 — 8th lines with rests and syncopated landings, plus the shuffle figure (no 16ths). */
const LEVEL3: RhythmPattern[] = [
  [e(0), e(0.5), e(1), e(1.5), e(2), dq(2.5)], // runs into a held note on the "and" of 2
  [restE(0), e(0.5), e(1), e(1.5), q(2), q(3)],
  [...shuffleUnit(0), e(2), e(2.5), q(3)], // boogie long-short, then a pair into the landing
  [e(0), e(0.5), e(1), restE(1.5), e(2), e(2.5), q(3)],
  [restQ(0), e(1), e(1.5), e(2), e(2.5), q(3)],
  [e(0), e(0.5), q(1), restE(2), e(2.5), q(3)],
  [restE(0), e(0.5), e(1), e(1.5), h(2)],
];

/** Level 4 — denser, syncopated 8ths with off-beat entries (5–7 notes). */
const LEVEL4: RhythmPattern[] = [
  [restE(0), e(0.5), e(1), e(1.5), e(2), e(2.5), q(3)],
  [e(0), e(0.5), restE(1), e(1.5), e(2), e(2.5), q(3)],
  [e(0), e(0.5), e(1), e(1.5), restE(2), e(2.5), q(3)],
  [restE(0), e(0.5), restE(1), e(1.5), e(2), e(2.5), q(3)], // pushed, off-beat phrase
  [restE(0), e(0.5), e(1), e(1.5), e(2), dq(2.5)],
  [e(0), restE(0.5), e(1), e(1.5), e(2), e(2.5), q(3)],
];

/** Level 5 — 16th bursts against 8ths, still landing on a held note. */
const LEVEL5: RhythmPattern[] = [
  [s(0), s(0.25), s(0.5), s(0.75), e(1), e(1.5), e(2), e(2.5), q(3)],
  [restE(0), s(0.5), s(0.75), e(1), e(1.5), s(2), s(2.25), s(2.5), s(2.75), q(3)],
  [e(0), s(0.5), s(0.75), e(1), restE(1.5), s(2), s(2.25), e(2.5), q(3)],
  [...shuffleBeat(0), s(1), s(1.25), s(1.5), s(1.75), e(2), e(2.5), q(3)],
  [restS(0), s(0.25), s(0.5), s(0.75), e(1), e(1.5), e(2), dq(2.5)],
  [s(0), s(0.25), e(0.5), s(1), s(1.25), e(1.5), e(2), e(2.5), q(3)],
];

const LIBRARY: Record<LickParams['level'], RhythmPattern[]> = {
  1: LEVEL1,
  2: LEVEL2,
  3: LEVEL3,
  4: LEVEL4,
  5: LEVEL5,
};

/** Deterministic pick of one pattern from the level's pool. */
export function pickPattern(level: LickParams['level'], rng: Rng): RhythmPattern {
  return choice(rng, LIBRARY[level]);
}

/**
 * Build a `bars`-bar rhythm by tiling one freshly-picked 1-bar pattern per bar, each offset by
 * `LENGTH_BEATS`. Reusing the 1-bar library keeps this a data-assembly step (no new pattern tables)
 * while letting a chord span 2 bars — the second bar can differ from the first, so 2-bar licks
 * aren't just a repeat. Deterministic: successive bars advance the shared `rng`.
 */
export function buildRhythm(level: LickParams['level'], bars: number, rng: Rng): RhythmPattern {
  const out: RhythmPattern = [];
  for (let bar = 0; bar < bars; bar++) {
    const offset = bar * LENGTH_BEATS;
    for (const slot of pickPattern(level, rng)) {
      out.push({ ...slot, startBeat: slot.startBeat + offset });
    }
  }
  return out;
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
