import type { ToneRole } from '../music';
import type { Pitch } from '../music';

/**
 * Articulation *into* a note from the one before. `release` lets a bend back down: the note before
 * was bent up, and this one is the string returning to its fretted pitch without a new pick.
 */
export type Technique = 'hammer' | 'pull' | 'slide' | 'bendHalf' | 'bendFull' | 'release';

/** The second note of a double stop: sounded with its note, on a neighbouring string. */
export interface PartnerNote {
  string: number;
  fret: number;
  pitch: Pitch;
}

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
  /** A chromatic approach note: outside the scale, so its cell is not one of the box's dots. */
  chromatic?: boolean;
  /** Held with vibrato ("~" in tab). */
  vibrato?: boolean;
  /** Double stop: a second note struck together with this one. */
  partner?: PartnerNote;
}

export interface Lick {
  notes: LickNote[];
  /** v1: one 4/4 bar = 4 beats per chord. */
  lengthBeats: number;
  /** Computed score, 1..5 scale. */
  difficulty: number;
  /** The vocabulary phrase(s) it was built from (`a+b` for a call and response), or 'generated'. */
  source?: string;
}

export interface LickParams {
  level: 1 | 2 | 3 | 4 | 5;
  targetRole: 'R' | '3' | '5' | '7';
  /** Land on the *next* chord's target at the bar line. */
  resolveToNext: boolean;
  seed: number;
  /** Bars the lick spans (× 4 beats); defaults to 1. */
  bars?: 1 | 2;
  /**
   * Where this lick sits in the solo's arc, 0 = low and calm, 1 = the climax (see
   * `progressionArc`). Steers the register of the landing note; omit for a stand-alone lick.
   */
  arc?: number;
  /** The last chord of the progression: where a turnaround belongs. */
  turnaround?: boolean;
  /** The previous lick's `source`, so the solo does not play the same phrase twice in a row. */
  previousSource?: string;
}
