import type { Chord } from '../../core/music';
import type { Sound } from '../sound';

export interface DrillQuestion {
  readonly answer: string; // one of the drill's answer ids
  readonly sound: Sound;
  readonly compare?: Sound; // played after a wrong answer
  readonly detail?: string; // fills {detail} in copy: a chord symbol, a fret, a note name
  readonly chord?: Chord;
  readonly run?: number; // optional run count for repetition avoidance
}

export interface Drill {
  readonly answers: readonly string[];
  next(random: () => number, previous?: DrillQuestion): DrillQuestion;
}
