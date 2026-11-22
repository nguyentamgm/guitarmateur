import type { Box } from './merge';

/** Fretting-hand finger number: 1 = index, 2 = middle, 3 = ring, 4 = pinky. */
export type Finger = 1 | 2 | 3 | 4;

/** Clamp a computed finger offset to 1..4. */
function clampFinger(n: number): Finger {
  return n <= 1 ? 1 : n >= 4 ? 4 : (n as Finger);
}

interface StringSpan {
  min: number;
  max: number;
  frets: Set<number>;
}

/** Return the most frequent number in `values` (tie-break: lowest value). */
function modeLowest(values: readonly number[]): number {
  const counts = new Map<number, number>();
  for (const v of values) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  let best = values[0]!;
  let bestCount = -1;
  for (const [val, count] of counts) {
    if (count > bestCount || (count === bestCount && val < best)) {
      best = val;
      bestCount = count;
    }
  }
  return best;
}

function makeFingeringResolver(box: Box): (string: number, fret: number) => Finger | null {
  const nonDec = box.notes.filter((n) => n.fret > 0 && !n.isDecoration);
  const base = nonDec.length > 0 ? nonDec : box.notes.filter((n) => n.fret > 0);
  if (base.length === 0) return () => null;

  let frettedMin = Infinity;
  let frettedMax = -Infinity;
  for (const n of base) {
    if (n.fret < frettedMin) frettedMin = n.fret;
    if (n.fret > frettedMax) frettedMax = n.fret;
  }

  // Case 1 — Open / 1st position
  if (box.minFret === 0 && frettedMax <= 4) {
    return (_string, fret) => (fret <= 0 ? null : clampFinger(fret));
  }

  // Case 2 — Standard 4-fret box
  if (box.minFret > 0 && frettedMax - frettedMin <= 3) {
    return (_string, fret) => (fret <= 0 ? null : clampFinger(fret - frettedMin + 1));
  }

  // Case 3 — Wide box (B-string shift, 7-note scale stretch, or merged boxes)
  const byString = new Map<number, StringSpan>();
  for (const n of base) {
    let span = byString.get(n.string);
    if (!span) {
      span = { min: n.fret, max: n.fret, frets: new Set([n.fret]) };
      byString.set(n.string, span);
    } else {
      if (n.fret < span.min) span.min = n.fret;
      if (n.fret > span.max) span.max = n.fret;
      span.frets.add(n.fret);
    }
  }

  const boxAnchor = box.minFret === 0 ? 1 : modeLowest([...byString.values()].map((s) => s.min));

  return (string, fret) => {
    if (fret <= 0) return null;
    const span = byString.get(string);
    const sMin = span ? span.min : boxAnchor;
    const sMax = span ? span.max : boxAnchor + 3;

    if (sMin >= boxAnchor && sMax <= boxAnchor + 3) {
      return clampFinger(fret - boxAnchor + 1);
    }
    if (sMax - sMin === 4) {
      if (span && !span.frets.has(sMin + 1)) {
        const d = fret - sMin;
        return d <= 0 ? 1 : d <= 2 ? 2 : d === 3 ? 3 : 4;
      }
      return clampFinger(fret - sMin + 1);
    }
    if (sMax - sMin <= 3) {
      return clampFinger(fret - sMin + 1);
    }
    if (fret <= boxAnchor + 3) {
      return clampFinger(fret - boxAnchor + 1);
    }
    const upperAnchor = Math.max(1, sMax - 3);
    return clampFinger(fret - upperAnchor + 1);
  };
}

/** Suggested fretting-hand fingers (1..4) for every fretted note in `box`, keyed by `"string:fret"`. */
export function boxFingerings(box: Box): ReadonlyMap<string, Finger> {
  const resolve = makeFingeringResolver(box);
  const out = new Map<string, Finger>();
  for (const n of box.notes) {
    if (n.fret <= 0) continue;
    const f = resolve(n.string, n.fret);
    if (f !== null) out.set(`${n.string}:${n.fret}`, f);
  }
  return out;
}

/** Suggested fretting-hand finger (1..4) for `(string, fret)` inside `box`, or `null` for open strings. */
export function fingerForFret(box: Box, string: number, fret: number): Finger | null {
  return makeFingeringResolver(box)(string, fret);
}
