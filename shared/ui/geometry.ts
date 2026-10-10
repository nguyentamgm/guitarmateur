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
  /** Centre x of a fret's playing space (open strings: just left of the nut). */
  x(fret: number): number;
  /** x of the fret wire on the right of a fret's space. */
  wireX(fret: number): number;
  y(string: StringNumber): number;
}

export function neckGeometry(frets: number, opts: { fretWidth?: number; stringGap?: number; from?: number } = {}): NeckGeometry {
  const from = Math.max(0, Math.min(opts.from ?? 0, frets - 1));
  const fretWidth = opts.fretWidth ?? 52;
  const stringGap = opts.stringGap ?? 26;
  const nutX = 44;
  const top = 22;
  const right = 14;
  const bottom = 40;
  return {
    frets,
    from,
    width: nutX + (frets - from) * fretWidth + right,
    height: top + 5 * stringGap + bottom,
    nutX,
    fretWidth,
    top,
    stringGap,
    x: (f) => (f === 0 ? nutX - 18 : nutX + (f - from - 0.5) * fretWidth),
    wireX: (f) => nutX + (f - from) * fretWidth,
    y: (s) => top + (s - 1) * stringGap,
  };
}

/** Left and right x of a frame around frets `minFret`…`maxFret` (fret 0 reaches past the nut). */
export function boxSpan(g: NeckGeometry, minFret: number, maxFret: number): { left: number; right: number } {
  return { left: minFret === 0 ? g.nutX - 36 : g.wireX(minFret - 1), right: g.wireX(maxFret) };
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
