/**
 * Backing patterns: which notes a backing plays on each eighth of a bar of a chord (K5.4, K7.1).
 * Pure MIDI data; the scenes schedule it on a clock and swing it when the style swings.
 */
import { BOOGIE, CHORDS, interval, mod, pc, type Chord, type NoteName } from '../music';

/** The chord root as a low bass note: between low E (40) and the D♯ above it (51), string 6 frets 0–11. */
export const bassMidi = (root: NoteName): number => 40 + mod(pc(root) - 4, 12);

/** A chord as MIDI notes, low to high: the bass root, then the formula an octave above. */
export function chordMidis(chord: Chord): number[] {
  const root = bassMidi(chord.root);
  return [root, ...CHORDS[chord.id].formula.map((d) => root + 12 + interval(d).semitones)];
}

/**
 * 'shuffle': the blues boogie, root and a top note rocking 5 5 6 6 ♭7 ♭7 6 6, every eighth.
 * 'strum': the whole chord, down, down-up, up, down-up (a common pop strum).
 * 'rock': palm-muted power-chord eighths.
 * 'comp': jazz comping, the chord without its bass on 1 and the "and" of 2, a bass on 1 and 3.
 */
export type BackingStyle = 'shuffle' | 'strum' | 'rock' | 'comp';
export const BACKING_STYLES: readonly BackingStyle[] = ['shuffle', 'strum', 'rock', 'comp'];

export const EIGHTHS_PER_BAR = 8;

/** Whether the style is played with a swing feel (K1.5). */
export const STYLE_SWINGS: Readonly<Record<BackingStyle, boolean>> = { shuffle: true, strum: false, rock: false, comp: true };

export interface BackingHit {
  /** Low to high. */
  readonly midis: readonly number[];
  /** How long it rings, in eighths. */
  readonly eighths: number;
  /** Strummed across the strings rather than struck together. */
  readonly stroke?: 'down' | 'up';
  /** Palm-muted chug (K6.5). */
  readonly muted?: boolean;
}

/** Strum strokes of one bar, by eighth: D . D U . U D U */
const STRUM: readonly ('down' | 'up' | null)[] = ['down', null, 'down', 'up', null, 'up', 'down', 'up'];

/** What the backing plays on eighth `eighth` (0–7) of a bar of `chord`. Empty on a rest. */
export function backingAt(chord: Chord, style: BackingStyle, eighth: number): BackingHit[] {
  const e = mod(eighth, EIGHTHS_PER_BAR);
  const bass = bassMidi(chord.root);
  switch (style) {
    case 'shuffle':
      return [{ midis: [bass, bass + interval(BOOGIE[e]!).semitones], eighths: 1 }];
    case 'strum': {
      const stroke = STRUM[e];
      if (!stroke) return [];
      let next = e + 1;
      while (next < EIGHTHS_PER_BAR && !STRUM[next]) next++;
      return [{ midis: chordMidis(chord), eighths: next - e, stroke }];
    }
    case 'rock':
      return [{ midis: [bass, bass + 7, bass + 12], eighths: 1, muted: true }];
    case 'comp': {
      const hits: BackingHit[] = [];
      if (e === 0 || e === 4) hits.push({ midis: [e === 0 ? bass : bass + 7 - (bass + 7 > 51 ? 12 : 0)], eighths: 4 });
      if (e === 0 || e === 3) hits.push({ midis: chordMidis(chord).slice(1), eighths: e === 0 ? 2 : 4 });
      return hits;
    }
  }
}
