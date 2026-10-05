import type { LessonCopy } from '../types';

export type StepId = 'slide' | 'eShape' | 'aShape' | 'find' | 'changes';

/** Strings the scenes of this lesson show. `{name}` placeholders are filled by the UI. */
export interface SceneCopy {
  readonly strum: string;
  readonly stop: string;
  readonly root: string;
  readonly labels: string;
  readonly degrees: string;
  readonly notes: string;
  /** Names of the variants on chips. */
  readonly kinds: {
    readonly major: string;
    readonly minor: string;
    readonly dom7: string;
    readonly m7: string;
    readonly maj7: string;
    readonly sus4: string;
  };
  readonly slide: {
    readonly fret: string;
    /** {symbol} {fret} */
    readonly caption: string;
    /** {symbol} */
    readonly open: string;
  };
  /** Shared by the E-shape and A-shape steps. */
  readonly shape: {
    readonly variant: string;
    /** {symbol} {shape} {fret} {degrees} */
    readonly caption: string;
    /** {base} {moved} */
    readonly moved: string;
  };
  readonly find: {
    /** {symbol} */
    readonly question: string;
    /** {symbol} {shape} {fret} {otherShape} {otherFret} */
    readonly right: string;
    readonly wrongString: string;
    /** {heard} {root} */
    readonly wrongNote: string;
    readonly next: string;
    /** {right} {total} {streak} */
    readonly score: string;
  };
  readonly changes: {
    readonly key: string;
    readonly path: string;
    readonly near: string;
    readonly string6: string;
    readonly play: string;
    /** {symbol} {shape} {fret} */
    readonly chordItem: string;
    /** {chords} {travel} */
    readonly caption: string;
  };
}

export type BarreCopy = LessonCopy<StepId, SceneCopy>;
