import type { SequenceId } from '../../core/fretboard';
import type { LessonCopy } from '../types';
import type { SongKind } from './scenes';

export type StepId = 'boxes' | 'connect' | 'sequences' | 'major' | 'choose';

/** Strings the scenes of this lesson show. `{name}` placeholders are filled by the UI. */
export interface SceneCopy {
  readonly boxes: {
    readonly box: string;
    readonly labels: string;
    readonly degrees: string;
    readonly notes: string;
    readonly play: string;
    readonly stop: string;
    /** Legend of the dashed circles on the B string. */
    readonly kink: string;
    /** {n} {min} {max} */
    readonly caption: string;
  };
  readonly connect: {
    readonly pair: string;
    /** {from} {to} */
    readonly pairItem: string;
    readonly cross: string;
    readonly stop: string;
    /** {from} {to} {count} */
    readonly caption: string;
    /** {from} {to} */
    readonly playing: string;
  };
  readonly sequences: {
    readonly box: string;
    readonly pattern: string;
    readonly patterns: Readonly<Record<SequenceId, string>>;
    readonly direction: string;
    readonly up: string;
    readonly down: string;
    readonly speedUp: string;
    readonly off: string;
    /** {n} */
    readonly on: string;
    readonly start: string;
    readonly stop: string;
    readonly tempo: string;
    /** {bpm} */
    readonly bpm: string;
    readonly tab: string;
    /** {pattern} {n} {count} */
    readonly idle: string;
    /** {round} {bpm} */
    readonly round: string;
  };
  readonly major: {
    readonly key: string;
    readonly play: string;
    readonly stop: string;
    readonly legendMajor: string;
    readonly legendMinor: string;
    /** {key} {minor} {minorFret} {majorFret} */
    readonly caption: string;
    /** {key} */
    readonly playing: string;
  };
  readonly choose: {
    /** {chord} {kind} */
    readonly question: string;
    readonly kinds: Readonly<Record<SongKind, string>>;
    readonly vamp: string;
    readonly hear: string;
    readonly stop: string;
    readonly next: string;
    /** {right} {total} {streak} */
    readonly score: string;
    readonly idle: string;
    /** {fret} {shape} */
    readonly right: string;
    /** {fret} {shape} {key} */
    readonly rightMajor: string;
    /** {fret} {key} {chord} */
    readonly rightBlues: string;
    /** {fret} {key} */
    readonly songRoot: string;
    /** {fret} {key} */
    readonly majorTrick: string;
    /** {fret} {note} {key} */
    readonly other: string;
  };
}

export type PentatonicCopy = LessonCopy<StepId, SceneCopy>;
