/**
 * Intervals carry BOTH a letter distance (`degrees`) and a `semitones` count. Keeping the letter
 * distance is what makes spelling automatic: a minor third above F is A♭ (F→A is two letters),
 * never G♯. See `transpose` in ./pitch.ts.
 */
export interface Interval {
  /** Letter distance: unison = 0, second = 1, third = 2, … octave = 7. */
  degrees: number;
  /** Semitone distance. */
  semitones: number;
}

/** Named interval constants used throughout the music core. */
export const IV = {
  P1: { degrees: 0, semitones: 0 },
  m2: { degrees: 1, semitones: 1 },
  M2: { degrees: 1, semitones: 2 },
  m3: { degrees: 2, semitones: 3 },
  M3: { degrees: 2, semitones: 4 },
  P4: { degrees: 3, semitones: 5 },
  d5: { degrees: 4, semitones: 6 },
  P5: { degrees: 4, semitones: 7 },
  m6: { degrees: 5, semitones: 8 },
  M6: { degrees: 5, semitones: 9 },
  m7: { degrees: 6, semitones: 10 },
  M7: { degrees: 6, semitones: 11 },
  P8: { degrees: 7, semitones: 12 },
} as const satisfies Record<string, Interval>;
