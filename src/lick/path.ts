import { midi } from '../music';
import type { Box, FretNote } from '../fretboard';
import { weightedChoice, type Rng } from './rng';
import type { Contour } from './contour';
import type { LickParams } from './model';

interface LevelCap {
  /** Max fret span (across the whole lick) once this note is added. */
  maxSpan: number;
  /** Whether a move to a non-adjacent string is allowed. */
  allowSkips: boolean;
}

const LEVEL_CAPS: Record<LickParams['level'], LevelCap> = {
  1: { maxSpan: 4, allowSkips: false },
  2: { maxSpan: 5, allowSkips: false },
  3: { maxSpan: 6, allowSkips: true },
  4: { maxSpan: 8, allowSkips: true },
  5: { maxSpan: Infinity, allowSkips: true },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** How many positions before the immediate previous note count as "recently visited". */
const RECENCY_WINDOW = 2;
/** Weight subtracted per recent-window hit on a (string, fret) pair, suppressing A-B-A bounce. */
const RECENCY_PENALTY = 0.2;

/** Where the melody "should" be at this fraction of the way from first to last, per contour. */
function expectedMidi(contour: Contour, firstMidi: number, lastMidi: number, progress: number): number {
  switch (contour) {
    case 'ascend':
    case 'descend':
      return lerp(firstMidi, lastMidi, progress);
    case 'arch': {
      const peak = Math.max(firstMidi, lastMidi) + 4;
      return progress < 0.5 ? lerp(firstMidi, peak, progress / 0.5) : lerp(peak, lastMidi, (progress - 0.5) / 0.5);
    }
    case 'valley': {
      const trough = Math.min(firstMidi, lastMidi) - 4;
      return progress < 0.5 ? lerp(firstMidi, trough, progress / 0.5) : lerp(trough, lastMidi, (progress - 0.5) / 0.5);
    }
    case 'wave':
      return lerp(firstMidi, lastMidi, progress) + Math.sin(progress * Math.PI * 2) * 3;
  }
}

/**
 * Fill `count` box notes from `first` to `last` (inclusive), walking interior slots with a
 * weighted choice of physical proximity × contour adherence × repeat penalty, subject to the
 * level's span/skip caps. Decoration notes (e.g. blues ♭5) are only offered from level 2 up, and
 * never as `first`/`last` since those are always chord tones.
 */
export function fillPath(
  box: Box,
  first: FretNote,
  last: FretNote,
  count: number,
  contour: Contour,
  level: LickParams['level'],
  rng: Rng,
): FretNote[] {
  if (count <= 1) return [first];

  const cap = LEVEL_CAPS[level];
  const firstMidi = midi(first.pitch);
  const lastMidi = midi(last.pitch);
  const out: FretNote[] = [first];
  let usedMin = Math.min(first.fret, last.fret);
  let usedMax = Math.max(first.fret, last.fret);
  let prev = first;

  for (let i = 1; i < count - 1; i++) {
    const progress = i / (count - 1);
    const strict = box.notes.filter((cand) => {
      if (!cap.allowSkips && Math.abs(cand.string - prev.string) > 1) return false;
      if (cand.isDecoration && level < 2) return false;
      const newMin = Math.min(usedMin, cand.fret);
      const newMax = Math.max(usedMax, cand.fret);
      return newMax - newMin <= cap.maxSpan;
    });
    const pool = strict.length ? strict : box.notes;
    const expected = expectedMidi(contour, firstMidi, lastMidi, progress);
    // Positions visited before `prev` (which the `repeat` factor already penalizes on its own).
    const recent = out.slice(-1 - RECENCY_WINDOW, -1);

    const weighted = pool.map((cand) => {
      const dString = Math.abs(cand.string - prev.string);
      const dFret = Math.abs(cand.fret - prev.fret);
      const proximity = 1 / Math.pow(1.6 * dString + dFret + 1, 2);
      const contourFit = 1 / (1 + Math.abs(midi(cand.pitch) - expected));
      const repeat = cand.string === prev.string && cand.fret === prev.fret ? 0.15 : 1;
      const recencyHits = recent.filter((p) => p.string === cand.string && p.fret === cand.fret).length;
      const recency = Math.max(1 - RECENCY_PENALTY * recencyHits, 0.1);
      return { item: cand, weight: proximity * contourFit * repeat * recency + 1e-6 };
    });
    const chosen = weightedChoice(rng, weighted);
    out.push(chosen);
    usedMin = Math.min(usedMin, chosen.fret);
    usedMax = Math.max(usedMax, chosen.fret);
    prev = chosen;
  }

  out.push(last);
  return out;
}
