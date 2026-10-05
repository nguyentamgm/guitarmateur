import type { LessonCopy } from '../types';

export type StepId = 'strings' | 'semitones' | 'tab' | 'octaves' | 'home';

/** Strings the scenes of this lesson show. `{name}` placeholders are filled by the UI. */
export interface SceneCopy {
  readonly strings: {
    readonly note: string;
    readonly play: string;
    readonly stop: string;
    readonly idle: string;
    /** {n} {name} */
    readonly caption: string;
  };
  readonly semitones: {
    readonly string: string;
    readonly run: string;
    readonly stop: string;
    readonly idle: string;
    /** {fret} */
    readonly step: string;
    readonly octave: string;
  };
  readonly tab: {
    readonly label: string;
    readonly play: string;
    readonly stop: string;
    readonly idle: string;
    /** {string} {fret} */
    readonly single: string;
    /** {notes} — a list of "string/fret" */
    readonly together: string;
    /** {string} */
    readonly open: string;
  };
  readonly octaves: {
    readonly picker: string;
    readonly play: string;
    readonly stop: string;
    /** {note} {count} */
    readonly caption: string;
    /** Label of the string 6 ↔ string 1 link. */
    readonly twoOctaves: string;
  };
  readonly home: {
    readonly mapTitle: string;
    /** {n} */
    readonly onString: string;
    readonly names: string;
    readonly show: string;
    readonly hide: string;
    /** Label of the naturals / all-12 switch of the quiz. */
    readonly pool: string;
    readonly naturals: string;
    readonly all: string;
    /** {note} {n} */
    readonly question: string;
    readonly next: string;
    /** {note} {n} {fret} */
    readonly right: string;
    /** {n} */
    readonly wrongString: string;
    /** {fret} {heard} */
    readonly wrongFret: string;
    /** {fret} */
    readonly between: string;
    /** {right} {total} */
    readonly score: string;
  };
}

export type FretboardCopy = LessonCopy<StepId, SceneCopy>;
