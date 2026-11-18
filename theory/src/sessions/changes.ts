import type { ChordSpec } from './types';

function sameChord(a: ChordSpec, b: ChordSpec): boolean {
  if (typeof a === 'number' && typeof b === 'number') return a === b;
  if (typeof a === 'object' && typeof b === 'object') {
    return a.root === b.root && a.id === b.id;
  }
  return false;
}

/** One chord per bar: starts on pool[0], each chord lasts one of `holds` bars, a chord never follows itself. */
export function changePlan(
  random: () => number,
  pool: readonly ChordSpec[],
  bars: number,
  holds: readonly (1 | 2)[],
): ChordSpec[] {
  if (bars <= 0 || pool.length === 0 || holds.length === 0) return [];

  const plan: ChordSpec[] = [];
  let currentChord = pool[0]!;

  while (plan.length < bars) {
    const remaining = bars - plan.length;
    const validHolds = holds.filter((h) => h <= remaining);
    const holdChoices = validHolds.length > 0 ? validHolds : holds;
    const hold = holdChoices[Math.floor(random() * holdChoices.length)]!;
    const actualHold = Math.min(hold, remaining);

    for (let i = 0; i < actualHold; i++) {
      plan.push(currentChord);
    }

    if (plan.length < bars) {
      const candidates = pool.filter((c) => !sameChord(c, currentChord));
      const nextCandidates = candidates.length > 0 ? candidates : pool;
      currentChord = nextCandidates[Math.floor(random() * nextCandidates.length)]!;
    }
  }

  return plan;
}

/** Bars (index ≥ 1) whose chord differs from the bar before. */
export function changeBars(plan: readonly ChordSpec[]): number[] {
  const bars: number[] = [];
  for (let i = 1; i < plan.length; i++) {
    if (!sameChord(plan[i]!, plan[i - 1]!)) {
      bars.push(i);
    }
  }
  return bars;
}

export interface TapScore {
  readonly caught: readonly boolean[];
  readonly extra: number;
}

/** `changes` and `taps` in beats from the start. A change is caught by a tap from 0.5 beat before it to 1.5 beats after it; each tap counts for one change at most; the other taps are extra. */
export function judgeTaps(changes: readonly number[], taps: readonly number[]): TapScore {
  const sortedTaps = [...taps].sort((a, b) => a - b);
  const usedTapIndices = new Set<number>();
  const caught: boolean[] = [];

  for (const c of changes) {
    const tapIdx = sortedTaps.findIndex(
      (t, idx) => !usedTapIndices.has(idx) && t >= c - 0.5 && t <= c + 1.5,
    );
    if (tapIdx !== -1) {
      usedTapIndices.add(tapIdx);
      caught.push(true);
    } else {
      caught.push(false);
    }
  }

  const extra = sortedTaps.length - usedTapIndices.size;
  return { caught, extra };
}
