import type { NoteValueId } from '../../core/rhythm';
import type { LessonCopy } from '../types';
import type { CountLevel, StrumPresetId } from './scenes';

export type StepId = 'beat' | 'lengths' | 'counting' | 'strum' | 'fingers';

/** Strings the scenes of this lesson show. `{name}` placeholders are filled by the UI. */
export interface SceneCopy {
  /** The tempo slider, shared by every scene. */
  readonly tempo: {
    readonly label: string;
    /** {bpm} */
    readonly value: string;
  };
  readonly start: string;
  readonly stop: string;
  readonly beat: {
    readonly grid: string;
    readonly idle: string;
    /** {n} */
    readonly caption: string;
  };
  readonly lengths: {
    readonly value: string;
    readonly names: Readonly<Record<NoteValueId, string>>;
    readonly legendNote: string;
    readonly legendRest: string;
    /** {name} {beats} {count} */
    readonly caption: string;
    readonly hint: string;
    /** {name} {beats} */
    readonly note: string;
    /** {beats} */
    readonly rest: string;
  };
  readonly counting: {
    readonly level: string;
    readonly levels: Readonly<Record<CountLevel, string>>;
    readonly sound: string;
    readonly notes: string;
    readonly clickOnly: string;
    /** The words between beats. Numbers are said as numbers. */
    readonly syllables: { readonly e: string; readonly and: string; readonly a: string };
    readonly idle: string;
  };
  readonly strum: {
    readonly pattern: string;
    readonly presets: Readonly<Record<StrumPresetId, string>>;
    readonly custom: string;
    readonly down: string;
    readonly up: string;
    readonly hit: string;
    readonly miss: string;
    /** {n} {stroke} {state} */
    readonly cell: string;
    /** {pattern} */
    readonly caption: string;
  };
  readonly fingers: {
    readonly startFret: string;
    readonly perBeat: string;
    readonly tab: string;
    readonly idle: string;
    /** {string} {fret} {finger} */
    readonly caption: string;
    readonly checklistTitle: string;
    readonly checklist: readonly string[];
  };
}

export type RhythmCopy = LessonCopy<StepId, SceneCopy>;
