import type { Chord, ToneRole } from '../music';
import type { Pitch } from '../music';
import type { Box } from '../fretboard';

export type Technique = 'hammer' | 'pull' | 'slide' | 'bendHalf' | 'bendFull';

export interface LickNote {
  string: number;
  fret: number;
  pitch: Pitch;
  /** Offset from lick start, in beats. */
  startBeat: number;
  /** 0.25 = 16th, 0.5 = 8th, 1 = quarter, 1.5 = dotted, etc. */
  durationBeats: number;
  /** Articulation *into* this note from the previous one. */
  technique?: Technique;
  /** Chord-tone role vs. the card's chord, if any. */
  role?: ToneRole;
}

export interface Lick {
  notes: LickNote[];
  /** v1: one 4/4 bar = 4 beats per chord. */
  lengthBeats: number;
  /** Computed score, 1..5 scale. */
  difficulty: number;
}

export interface LickParams {
  level: 1 | 2 | 3 | 4 | 5;
  targetRole: 'R' | '3' | '5';
  /** Land on the *next* chord's target at the bar line (M4). */
  resolveToNext: boolean;
  seed: number;
}

export type GenerateLick = (box: Box, chord: Chord, next: Chord | null, params: LickParams) => Lick;
