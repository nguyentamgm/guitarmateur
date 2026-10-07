import type { LessonCopy } from '../types';
import type { BendOutcome, DemoId } from './scenes';

export type StepId = 'blueNote' | 'shuffle' | 'twelveBar' | 'bends' | 'legato';

/** Strings the scenes of this lesson show. `{name}` placeholders are filled by the UI. */
export interface SceneCopy {
  readonly play: string;
  readonly stop: string;
  readonly tempo: string;
  /** {bpm} */
  readonly bpm: string;
  /** Name of the pitch-over-time picture. */
  readonly curve: string;
  readonly blueNote: {
    readonly box: string;
    readonly scale: string;
    readonly minor: string;
    readonly major: string;
    readonly blue: string;
    readonly on: string;
    readonly off: string;
    readonly playPhrase: string;
    /** {degree} */
    readonly legend: string;
    /** {degrees} */
    readonly phrase: string;
  };
  readonly shuffle: {
    readonly feel: string;
    readonly straight: string;
    readonly shuffle: string;
    readonly swing: string;
    readonly trip: string;
    readonly let: string;
    readonly grid: string;
    /** {pct} {at} */
    readonly caption: string;
  };
  readonly twelveBar: {
    readonly key: string;
    readonly quickChange: string;
    readonly turnaround: string;
    readonly on: string;
    readonly off: string;
    readonly form: string;
    /** {n} {chord} {degree} */
    readonly playing: string;
    /** {key} */
    readonly idle: string;
  };
  readonly bends: {
    readonly bend: string;
    /** {from} {to} */
    readonly pair: string;
    readonly curl: string;
    readonly playBend: string;
    /** {from} {to} {string} {fret} {target} */
    readonly caption: string;
    /** {string} {fret} */
    readonly curlCaption: string;
    readonly quizTitle: string;
    readonly listen: string;
    readonly outcomes: Readonly<Record<BendOutcome, string>>;
    /** {outcome} */
    readonly right: string;
    /** {outcome} */
    readonly wrong: string;
    readonly next: string;
    /** {right} {total} */
    readonly score: string;
  };
  readonly legato: {
    readonly technique: string;
    readonly demos: Readonly<Record<DemoId, string>>;
    readonly captions: Readonly<Record<DemoId, string>>;
    readonly lick: string;
    readonly key: string;
    readonly newLick: string;
    /** Label of the box chips. */
    readonly box: string;
    readonly playLick: string;
    readonly tab: string;
    readonly marks: string;
    /** {n} {chord} */
    readonly playing: string;
    readonly lickIdle: string;
  };
}

export type BluesCopy = LessonCopy<StepId, SceneCopy>;
