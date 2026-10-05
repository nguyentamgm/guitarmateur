import type { IntervalQuality } from '../../core/music';
import type { LessonCopy } from '../types';
import type { Group, Role } from './scenes';

export type StepId = 'sevenths' | 'table' | 'openSevenths' | 'inversions' | 'simplify';

/** Strings the scenes of this lesson show. `{name}` placeholders are filled by the UI. */
export interface SceneCopy {
  readonly root: string;
  readonly chord: string;
  readonly play: string;
  readonly stop: string;
  readonly together: string;
  readonly arpeggio: string;
  readonly labels: string;
  readonly degrees: string;
  readonly notes: string;
  readonly mutedMark: string;
  /** Interval names: {quality} {number}. */
  readonly interval: {
    readonly name: string;
    readonly numbers: readonly string[];
    readonly qualities: Readonly<Record<IntervalQuality, string>>;
  };
  readonly sevenths: {
    /** {symbol} {formula} {notes} {gaps} */
    readonly caption: string;
  };
  readonly table: {
    readonly group: string;
    readonly groups: Readonly<Record<Group, string>>;
    readonly roles: Readonly<Record<Role, string>>;
    /** {symbol} {formula} {notes} */
    readonly caption: string;
  };
  readonly openSevenths: {
    /** {symbol} */
    readonly compare: string;
    /** {symbol} {degrees} */
    readonly caption: string;
    /** {base} {moved} */
    readonly changed: string;
    readonly movable: string;
    readonly kind: string;
    /** {symbol} {fret} {degrees} */
    readonly movableCaption: string;
  };
  readonly inversions: {
    readonly bass: string;
    /** {note} {degree} */
    readonly bassItem: string;
    /** {symbol} {bass} {degree} */
    readonly caption: string;
    readonly walk: string;
    /** {chords} {basses} */
    readonly walkCaption: string;
  };
  readonly simplify: {
    readonly simpler: string;
    readonly reset: string;
    /** {symbol} {formula} {notes} */
    readonly caption: string;
    /** {from} {to} {degree} */
    readonly dropped: string;
  };
}

export type ChordTableCopy = LessonCopy<StepId, SceneCopy>;
