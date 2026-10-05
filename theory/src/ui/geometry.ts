/**
 * Fretboard drawing geometry, shared by every scene. String 1 (high E) is the top line, as in
 * tab (K0.1). Pure numbers, no DOM.
 */
import { STANDARD_TUNING, type StringNumber } from '../core/fretboard';

export interface NeckGeometry {
  /** Highest fret drawn; fret 0 (open) sits left of the nut. */
  readonly frets: number;
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

export function neckGeometry(frets: number, opts: { fretWidth?: number; stringGap?: number } = {}): NeckGeometry {
  const fretWidth = opts.fretWidth ?? 52;
  const stringGap = opts.stringGap ?? 26;
  const nutX = 44;
  const top = 22;
  const right = 14;
  const bottom = 40;
  return {
    frets,
    width: nutX + frets * fretWidth + right,
    height: top + 5 * stringGap + bottom,
    nutX,
    fretWidth,
    top,
    stringGap,
    x: (f) => (f === 0 ? nutX - 18 : nutX + (f - 0.5) * fretWidth),
    wireX: (f) => nutX + f * fretWidth,
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

/** 'e' for the thinnest string, capitals elsewhere, as tab is usually labelled. */
export const stringName = (s: StringNumber): string =>
  s === 1 ? STANDARD_TUNING[1].letter.toLowerCase() : STANDARD_TUNING[s].letter;
