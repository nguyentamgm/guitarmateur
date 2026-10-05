import type { IntervalQuality } from '../../core/music';
import type { LessonCopy } from '../types';

export type StepId = 'formula' | 'spelling' | 'intervals' | 'shapes' | 'degrees';

/** Strings the scenes of this lesson show. `{name}` placeholders are filled by the UI. */
export interface SceneCopy {
  /** Interval names, shared by steps 3–5. */
  readonly interval: {
    /** {quality} {number} */
    readonly name: string;
    /** Indexed by interval number − 1: unison … octave. */
    readonly numbers: readonly string[];
    readonly qualities: Readonly<Record<IntervalQuality, string>>;
    /** {n} */
    readonly span: string;
    readonly spanOne: string;
  };
  readonly formula: {
    readonly key: string;
    readonly play: string;
    readonly stop: string;
    readonly whole: string;
    readonly half: string;
    /** {note} {fret} */
    readonly idle: string;
    /** {n} {note} */
    readonly step: string;
  };
  readonly spelling: {
    readonly key: string;
    readonly letters: string;
    readonly fourth: string;
    readonly names: string;
    readonly show: string;
    readonly hide: string;
    /** {notes} */
    readonly right: string;
    /** {wrong} {letter} {missing} {key} {right} */
    readonly clash: string;
    /** {key} */
    readonly neck: string;
  };
  readonly intervals: {
    /** {note} */
    readonly home: string;
    readonly play: string;
    readonly lower: string;
    readonly raise: string;
    readonly idle: string;
    /** {from} {to} {name} {span} */
    readonly reading: string;
    readonly or: string;
  };
  readonly shapes: {
    readonly interval: string;
    readonly play: string;
    readonly idle: string;
    readonly up1: string;
    readonly up2: string;
    /** {name} {from} {to} {up} {offset} */
    readonly caption: string;
    readonly crossesB: string;
    readonly offNeck: string;
  };
  readonly degrees: {
    readonly key: string;
    readonly labels: string;
    readonly degrees: string;
    readonly notes: string;
    readonly degree: string;
    /** {key} {fret} */
    readonly idle: string;
    /** {n} {note} {name} {span} */
    readonly heard: string;
  };
}

export type MajorScaleCopy = LessonCopy<StepId, SceneCopy>;
