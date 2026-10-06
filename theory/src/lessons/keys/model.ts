import type { LessonCopy } from '../types';

export type StepId = 'family' | 'numbers' | 'home' | 'twoFive' | 'relative';

/** Strings the scenes of this lesson show. `{name}` placeholders are filled by the UI. */
export interface SceneCopy {
  readonly strum: string;
  readonly stop: string;
  readonly key: string;
  readonly playLoop: string;
  /** Legend names of the chord colours. */
  readonly quality: { readonly major: string; readonly minor: string; readonly dim: string };
  readonly family: {
    readonly size: string;
    readonly triads: string;
    readonly sevenths: string;
    readonly playAll: string;
    readonly scale: string;
    /** {roman} {symbol} {notes} {start} */
    readonly caption: string;
  };
  readonly numbers: {
    readonly progression: string;
    readonly grid: string;
    /** {key} {chords} {travel} */
    readonly caption: string;
  };
  readonly home: {
    readonly question: string;
    readonly listen: string;
    readonly leadIn: string;
    readonly choices: string;
    /** {symbol} {key} */
    readonly right: string;
    /** {symbol} {home} */
    readonly vi: string;
    /** {symbol} {roman} */
    readonly away: string;
    readonly next: string;
    /** {right} {total} {streak} */
    readonly score: string;
  };
  readonly twoFive: {
    readonly pull: string;
    readonly hang: string;
    readonly resolve: string;
    /** {v} {i} */
    readonly hangCaption: string;
    /** {v} {i} */
    readonly resolveCaption: string;
    readonly approach: string;
    readonly off: string;
    readonly intoI: string;
    readonly intoIV: string;
    readonly grid: string;
    /** {chords} */
    readonly offCaption: string;
    /** {ii} {v} {target} */
    readonly onCaption: string;
  };
  readonly relative: {
    readonly home: string;
    /** {root} */
    readonly majorHome: string;
    /** {root} */
    readonly minorHome: string;
    /** {root} */
    readonly rowMajor: string;
    /** {root} */
    readonly rowMinor: string;
    /** {chords} {scale} {root} */
    readonly caption: string;
    /** {root} */
    readonly majorScale: string;
    /** {root} */
    readonly minorScale: string;
  };
}

export type KeysCopy = LessonCopy<StepId, SceneCopy>;
