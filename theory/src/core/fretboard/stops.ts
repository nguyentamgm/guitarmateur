/**
 * Two- and three-note shapes built from interval shapes (K2.4): the power chord (K4.2) and the
 * double stops inside a scale position (K6.6). Derived, never typed as frets.
 */
import { midiAt, shapeAt, type FretPos } from './neck';

/** Root, 5th on the next string up, and with `octave` the root again two strings up. Null off the neck. */
export function powerChord(root: FretPos, octave = true): FretPos[] | null {
  const fifth = shapeAt(root, '5', 1);
  const top = octave ? shapeAt(root, '8', 2) : null;
  if (!fifth || (octave && !top)) return null;
  return top ? [root, fifth, top] : [root, fifth];
}

export interface DoubleStop {
  /** Note on the thicker string. */
  readonly low: FretPos;
  /** Note on the next thinner string, same fret. */
  readonly high: FretPos;
  /** 5 (a perfect 4th), or 4 (a major 3rd) on the G–B pair. */
  readonly semitones: number;
}

/** Every pair of notes on adjacent strings at the same fret, low strings first. */
export function doubleStops(notes: readonly FretPos[]): DoubleStop[] {
  return notes
    .flatMap((low) =>
      notes
        .filter((high) => high.string === low.string - 1 && high.fret === low.fret)
        .map((high) => ({ low, high, semitones: midiAt(high) - midiAt(low) })),
    )
    .sort((a, b) => b.low.string - a.low.string || a.low.fret - b.low.fret);
}
