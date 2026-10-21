/**
 * Fretboard drawing geometry, shared by every neck both apps draw. String 1 (high E) is the top
 * line, as in tab. Pure numbers, no DOM.
 */
import { STANDARD_STRING_NAMES, type StringNames, type StringNumber } from '../core/neck';

export interface NeckGeometry {
  /** Highest fret drawn; fret 0 (open) sits left of the nut. */
  readonly frets: number;
  /**
   * The fret wire the drawing starts at: 0 = the nut (the whole neck from the head); above 0, a
   * window of frets `from + 1`…`frets` with no nut (a box in the middle of the neck).
   */
  readonly from: number;
  readonly width: number;
  readonly height: number;
  readonly nutX: number;
  readonly fretWidth: number;
  readonly top: number;
  readonly stringGap: number;
  /** A note dot's radius; the neck's text and margins grow with it (`textScale`). */
  readonly dotRadius: number;
  /** How much larger than the shared neck's (dots of radius 11) its text is drawn. */
  readonly textScale: number;
  /** Centre x of a fret's playing space (open strings: just left of the nut). */
  x(fret: number): number;
  /** x of the fret wire on the right of a fret's space. */
  wireX(fret: number): number;
  y(string: StringNumber): number;
}

/** The shared neck's dot radius: Practice and Theory draw every neck with it. */
export const DOT_RADIUS = 11;

export function neckGeometry(
  frets: number,
  opts: { fretWidth?: number; stringGap?: number; from?: number; dotRadius?: number } = {},
): NeckGeometry {
  const from = Math.max(0, Math.min(opts.from ?? 0, frets - 1));
  const fretWidth = opts.fretWidth ?? 52;
  const stringGap = opts.stringGap ?? 26;
  const dotRadius = opts.dotRadius ?? DOT_RADIUS;
  const grow = dotRadius - DOT_RADIUS;
  // Larger dots need more room: at the nut, for the open-string dots between it and the string
  // names; above and below, for the top string's dots and the fret numbers.
  const nutX = from === 0 ? 44 + 3 * grow : 44;
  const top = dotRadius + 11;
  const right = 14;
  const bottom = dotRadius + 29;
  return {
    frets,
    from,
    width: nutX + (frets - from) * fretWidth + right,
    height: top + 5 * stringGap + bottom,
    nutX,
    fretWidth,
    top,
    stringGap,
    dotRadius,
    textScale: dotRadius / DOT_RADIUS,
    x: (f) => (f === 0 ? nutX - dotRadius - 7 : nutX + (f - from - 0.5) * fretWidth),
    wireX: (f) => nutX + (f - from) * fretWidth,
    y: (s) => top + (s - 1) * stringGap,
  };
}

/** Left and right x of a frame around frets `minFret`…`maxFret` (fret 0 reaches past the nut). */
export function boxSpan(g: NeckGeometry, minFret: number, maxFret: number): { left: number; right: number } {
  return { left: minFret === 0 ? g.nutX - 36 : g.wireX(minFret - 1), right: g.wireX(maxFret) };
}

/** How far from a dot's centre a tap still reaches it, in CSS px: a 40px target (#182, #262). */
export const TAP_REACH_PX = 20;

/**
 * The dot a tap at (x, y), in the drawing's units, is for: the nearest one within `reach` units, so
 * each dot takes the room around it up to halfway to its neighbours. Undefined when none is that close.
 */
export function nearestDot<D extends { readonly string: StringNumber; readonly fret: number }>(
  g: NeckGeometry,
  dots: readonly D[],
  x: number,
  y: number,
  reach: number,
): D | undefined {
  let best: D | undefined;
  let bestDist = reach;
  for (const d of dots) {
    const dist = Math.hypot(g.x(d.fret) - x, g.y(d.string) - y);
    if (dist <= bestDist) {
      best = d;
      bestDist = dist;
    }
  }
  return best;
}

/** Fret markers: single dots, and the double dot at 12. */
export const INLAYS: readonly number[] = [3, 5, 7, 9, 15, 17, 19, 21];
export const DOUBLE_INLAYS: readonly number[] = [12, 24];

/**
 * Keeps a text at `x` readable on a left-handed (mirrored) neck: the transform that mirrors it back
 * around its own x, or none. Callers drawing text in a Fretboard's `children` use it too.
 */
export const upright = (x: number, leftHanded: boolean): string | undefined =>
  leftHanded ? `translate(${2 * x} 0) scale(-1 1)` : undefined;

/** A string's name in a tuning (standard by default): 'e' for the thinnest, capitals elsewhere. */
export const stringName = (s: StringNumber, names: StringNames = STANDARD_STRING_NAMES): string => names[s];
