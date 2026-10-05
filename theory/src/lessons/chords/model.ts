import type { IntervalQuality } from '../../core/music';
import type { LessonCopy } from '../types';

export type StepId = 'stack' | 'qualities' | 'sus' | 'open' | 'build';

/** Strings the scenes of this lesson show. `{name}` placeholders are filled by the UI. */
export interface SceneCopy {
  readonly root: string;
  readonly arpeggio: string;
  readonly together: string;
  readonly labels: string;
  readonly degrees: string;
  readonly notes: string;
  /** Interval names: {quality} {number}. */
  readonly interval: {
    readonly name: string;
    /** Indexed by interval number − 1: unison … octave. */
    readonly numbers: readonly string[];
    readonly qualities: Readonly<Record<IntervalQuality, string>>;
  };
  /** Chord quality names, shown on chips. */
  readonly kinds: {
    readonly major: string;
    readonly minor: string;
    readonly aug: string;
    readonly dim: string;
    readonly sus2: string;
    readonly sus4: string;
  };
  readonly stack: {
    /** {symbol} {lower} {upper} {outer} */
    readonly caption: string;
  };
  readonly qualities: {
    readonly quality: string;
    /** {symbol} {formula} {notes} */
    readonly caption: string;
  };
  readonly sus: {
    readonly kind: string;
    readonly resolve: string;
    /** {symbol} {formula} {notes} {lower} {upper} */
    readonly caption: string;
  };
  readonly open: {
    readonly chord: string;
    /** {symbol} */
    readonly switchTo: string;
    readonly strum: string;
    /** Drawn on a string that is not played. */
    readonly mutedMark: string;
    /** {symbol} {degrees} */
    readonly caption: string;
  };
  readonly build: {
    readonly pool: string;
    readonly basic: string;
    readonly all: string;
    /** {symbol} {fret} */
    readonly question: string;
    /** {degree} {symbol} */
    readonly found: string;
    readonly root: string;
    /** {semitones} {symbol} {formula} */
    readonly miss: string;
    /** {symbol} {notes} */
    readonly solved: string;
    readonly next: string;
    /** {right} {total} {streak} */
    readonly score: string;
  };
}

export type ChordsCopy = LessonCopy<StepId, SceneCopy>;
