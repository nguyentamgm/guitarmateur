import type { LessonCopy } from '../types';

export type StepId = 'power' | 'mute' | 'doubleStops' | 'octaves' | 'boogie';

/** Strings the scenes of this lesson show. `{name}` placeholders are filled by the UI. */
export interface SceneCopy {
  readonly play: string;
  readonly stop: string;
  readonly tempo: string;
  /** {bpm} */
  readonly bpm: string;
  readonly palmMute: string;
  readonly on: string;
  readonly off: string;
  readonly power: {
    readonly notes: string;
    readonly two: string;
    readonly three: string;
    readonly overMajor: string;
    readonly overMinor: string;
    /** {symbol} {string} {fret} */
    readonly caption: string;
    readonly idle: string;
  };
  readonly mute: {
    readonly grid: string;
    readonly chug: string;
    readonly legendRing: string;
    readonly legendMute: string;
    /** {symbol} */
    readonly playing: string;
    readonly idle: string;
  };
  readonly doubleStops: {
    readonly box: string;
    readonly pair: string;
    readonly slide: string;
    readonly fourth: string;
    readonly third: string;
    /** {low} {high} {fret} {a} {b} {interval} */
    readonly caption: string;
  };
  readonly octaves: {
    readonly strings: string;
    /** {low} {high} */
    readonly pairItem: string;
    readonly mutedMark: string;
    /** {key} {low} {high} {shift} */
    readonly caption: string;
  };
  readonly boogie: {
    readonly key: string;
    readonly quickChange: string;
    readonly turnaround: string;
    readonly form: string;
    /** {key} */
    readonly idle: string;
    /** {n} {chord} {string} */
    readonly playing: string;
  };
}

export type ElectricCopy = LessonCopy<StepId, SceneCopy>;
