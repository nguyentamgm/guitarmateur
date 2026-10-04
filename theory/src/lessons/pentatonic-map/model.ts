import type { LessonCopy } from '../types';

export type StepId = 'grid' | 'formula' | 'boxes' | 'keys' | 'home';

/** Strings the scenes of this lesson show. `{name}` placeholders are filled by the UI. */
export interface SceneCopy {
  readonly grid: {
    readonly run: string;
    readonly stop: string;
    readonly idle: string;
    /** {low} {fret} {high} */
    readonly pair: string;
    /** {low} {fret} {high} */
    readonly oddPair: string;
  };
  readonly formula: {
    readonly run: string;
    readonly stop: string;
    readonly example: string;
    readonly home: string;
  };
  readonly boxes: {
    readonly box: string;
    readonly labels: string;
    readonly degrees: string;
    readonly notes: string;
    readonly play: string;
    readonly stop: string;
    /** {n} {min} {max} */
    readonly caption: string;
  };
  readonly keys: {
    readonly finder: string;
    readonly cycle: string;
    readonly stop: string;
    /** {key} {fret} */
    readonly caption: string;
    /** {key} {fret} {shift} */
    readonly moved: string;
  };
  readonly home: {
    /** Name of the minor/major switch. */
    readonly switch: string;
    readonly minor: string;
    readonly major: string;
    readonly legendMinor: string;
    readonly legendMajor: string;
    readonly legendOther: string;
    /** {home} {fret} */
    readonly caption: string;
  };
}

export type PentatonicMapCopy = LessonCopy<StepId, SceneCopy>;
