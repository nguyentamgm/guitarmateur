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

/**
 * One beat of triplet-feel 8ths: 3 attacks per beat (long-short-short). A true
 * 1/3-beat triplet isn't exactly representable on this grid (and would break exact
 * beat-sum arithmetic in floating point), so this approximates the same density/feel
 * using durationBeats already in the grid (0.5 + 0.25 + 0.25).
 */
const tripletBeat = (beat: number): RhythmSlot[] => [e(beat), s(beat + 0.5), s(beat + 0.75)];

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
  [...shuffleUnit(0), ...shuffleUnit(2)], // blues shuffle — long-short (dotted-quarter + 8th) boogie feel, 4 notes
];

/** Level 4 — syncopation, 8th rests, off-beat starts (7–8 notes, high density). */
const LEVEL4: RhythmPattern[] = [
  [e(0), e(0.5), e(1), e(1.5), e(2), e(2.5), e(3), e(3.5)],          // straight 8ths
  [e(0), e(0.5), e(1), restE(1.5), e(2), e(2.5), e(3), e(3.5)],       // 7 notes
  [restE(0), e(0.5), e(1), e(1.5), e(2), e(2.5), e(3), e(3.5)],       // pickup start
  [e(0), e(0.5), e(1), e(1.5), restE(2), e(2.5), e(3), e(3.5)],       // mid rest
  [e(0), restE(0.5), e(1), e(1.5), e(2), e(2.5), e(3), e(3.5)],       // off-beat start
  [e(0), e(0.5), restE(1), e(1.5), e(2), restE(2.5), e(3), e(3.5)],   // 6 notes — lowest, but syncopated
  [...tripletBeat(0), q(1), ...tripletBeat(2), q(3)],                 // triplet-feel 8ths, 8 notes
];

/** Level 5 — 16th pairs/runs, mixed. */
const LEVEL5: RhythmPattern[] = [
  [e(0), e(0.5), e(1), e(1.5), s(2), s(2.25), s(2.5), s(2.75), e(3), e(3.5)],
  [s(0), s(0.25), s(0.5), s(0.75), e(1), e(1.5), e(2), e(2.5), e(3), e(3.5)],
  [e(0), s(0.5), s(0.75), e(1), e(1.5), e(2), e(2.5), e(3), e(3.5)],
  [restE(0), e(0.5), e(1), restS(1.5), s(1.75), e(2), e(2.5), s(3), s(3.25), s(3.5), s(3.75)],
  [s(0), s(0.25), restS(0.5), s(0.75), e(1), restE(1.5), s(2), s(2.25), e(2.5), e(3), e(3.5)],
  [
    ...shuffleBeat(0),
    s(1), s(1.25), s(1.5), s(1.75),
    ...shuffleBeat(2),
    s(3), s(3.25), s(3.5), s(3.75),
  ], // swing 16ths — shuffled beats alternating with straight 16th runs, 12 notes
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
