import type { ScaleId } from '../../core/music';
import type { LessonCopy } from '../types';
import type { BackingId, PhraseRole } from './scenes';

export type StepId = 'scale' | 'tones' | 'guide' | 'phrase';

/** Strings the scenes of this lesson show. `{name}` placeholders are filled by the UI. */
export interface SceneCopy {
  readonly play: string;
  readonly stop: string;
  readonly key: string;
  readonly tempo: string;
  /** {bpm} */
  readonly bpm: string;
  readonly backing: string;
  readonly backings: Readonly<Record<BackingId, string>>;
  readonly grid: string;
  /** {scale} */
  readonly neck: string;
  /** {root}: the scale's name on that tonic. */
  readonly scales: Readonly<Partial<Record<ScaleId, string>>>;
  readonly scale: {
    readonly choice: string;
    readonly right: string;
    readonly wrong: string;
    /** {scale} {fret} */
    readonly caption: string;
    /** {scale}: box 1 starts at the nut. */
    readonly captionOpen: string;
    /** How each style plays the scale (K7.3). */
    readonly styles: Readonly<Record<BackingId, string>>;
    /** {scale} {notes} */
    readonly wrongCaption: string;
    /** {scale}: the major pentatonic over a blues, which is brighter, not wrong. */
    readonly wrongBlues: string;
  };
  readonly tones: {
    readonly chord: string;
    /** {symbol} {tones} */
    readonly caption: string;
    /** {n} {symbol} {tones} */
    readonly playing: string;
  };
  readonly guide: {
    readonly withLine: string;
    readonly on: string;
    readonly off: string;
    /** {line} */
    readonly line: string;
    /** {n} {symbol} {name} {degree} */
    readonly caption: string;
    /** {n} {symbol} {name} {degree}: the box has no 3rd for this chord. */
    readonly fallback: string;
  };
  readonly phrase: {
    readonly newIdea: string;
    readonly tab: string;
    /** {n}: the count word of an off-beat eighth under the tab, "2&". */
    readonly offbeat: string;
    /** Count word over the empty bar left for the player. */
    readonly yourTurn: string;
    readonly idle: string;
    /** {n} {name} {degree} {symbol} for 'idea' and 'change'; {n} for the others. */
    readonly roles: Readonly<Record<PhraseRole, string>>;
  };
}

export type SoloCopy = LessonCopy<StepId, SceneCopy>;
