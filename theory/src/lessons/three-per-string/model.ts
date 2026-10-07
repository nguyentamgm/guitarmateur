import type { SequenceId } from '../../core/fretboard';
import type { LessonCopy } from '../types';
import type { StringShape } from './scenes';

export type StepId = 'strings' | 'tile' | 'triplets' | 'keys';

/** Strings the scenes of this lesson show. `{name}` placeholders are filled by the UI. */
export interface SceneCopy {
  readonly strings: {
    readonly labels: string;
    readonly degrees: string;
    readonly notes: string;
    readonly fingers: string;
    readonly play: string;
    readonly stop: string;
    /** Names of the three string shapes, shown in the legend. */
    readonly shapes: Readonly<Record<StringShape, string>>;
    /** Legend of the "+2 +2" tags beside each string. */
    readonly gaps: string;
    /** {key} {min} {max} */
    readonly caption: string;
  };
  readonly tile: {
    readonly position: string;
    readonly cross: string;
    readonly stop: string;
    /** {n} {min} {max} {degree} {count} {next} */
    readonly caption: string;
    /** {n} {next} */
    readonly playing: string;
  };
  readonly triplets: {
    readonly position: string;
    readonly pattern: string;
    readonly patterns: Readonly<Record<SequenceId, string>>;
    readonly direction: string;
    readonly up: string;
    readonly down: string;
    readonly start: string;
    readonly stop: string;
    readonly tempo: string;
    /** {bpm} */
    readonly bpm: string;
    readonly tab: string;
    readonly trip: string;
    readonly let: string;
    /** {pattern} {n} {count} */
    readonly idle: string;
    /** {bpm} */
    readonly playing: string;
  };
  readonly keys: {
    readonly key: string;
    readonly scale: string;
    /** {key} */
    readonly major: string;
    /** {key} */
    readonly minor: string;
    readonly position: string;
    readonly play: string;
    readonly stop: string;
    readonly legendRoot: string;
    /** {scale} {n} {min} {max} {other} {m} */
    readonly caption: string;
    /** {scale} {root} */
    readonly playing: string;
  };
}

export type ThreePerStringCopy = LessonCopy<StepId, SceneCopy>;
