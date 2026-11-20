import type { StringNumber } from '../core/fretboard';
import type { ChordId, DegreeLabel, Mode } from '../core/music';
import type { Lang } from '../i18n';
import type { ConceptId } from '../lessons';
import type { SongId } from './songs';

export type PathId = 'accompany';
export type StageId = 'A' | 'B' | 'C' | 'D';
export type PartId = 'listen' | 'understand' | 'play' | 'challenge';
export const PARTS: readonly PartId[] = ['listen', 'understand', 'play', 'challenge'];

/** A key by its tonic's name ('G', 'F#', 'Bb') and mode; parsed with parseNote() where used. */
export interface SessionKey {
  readonly tonic: string;
  readonly mode: Mode;
}

/** A chord by its place in the key: a scale degree (the key's own triad), or a root + quality. */
export type ChordSpec = number | { readonly root: DegreeLabel; readonly id: ChordId };

/** Every drill of the plan; a drill's generator is added by the issue that first uses it. */
export type DrillId =
  | 'quality'
  | 'onBeat'
  | 'finished'
  | 'rootNote'
  | 'moves'
  | 'chordCount'
  | 'fourOrFive'
  | 'minorBar'
  | 'keyMode'
  | 'seventh'
  | 'meter'
  | 'sameChord'
  | 'oddChord';

/** One interactive piece of a part. `key` names its copy in `copy.blocks[key]`. */
export type Block =
  | {
      readonly kind: 'lesson';
      readonly key: string;
      readonly lesson: string;
      readonly step: string;
    }
  | {
      readonly kind: 'chords';
      readonly key: string;
      readonly in: SessionKey;
      readonly chords: readonly ChordSpec[];
    }
  | {
      readonly kind: 'strumAlong';
      readonly key: string;
      readonly in: SessionKey;
      readonly bars: readonly ChordSpec[];
      readonly bpm: number;
      readonly beatsPerBar?: 3 | 4;
      readonly pattern?: string;
      readonly keys?: readonly string[];
      readonly numeralsOnly?: boolean;
    }
  | { readonly kind: 'listen'; readonly key: string; readonly drill: DrillId }
  | { readonly kind: 'reveal'; readonly key: string; readonly drill: DrillId }
  | {
      readonly kind: 'melodyEcho';
      readonly key: string;
      readonly tonic: string;
      readonly string: StringNumber;
      /** Fixed phrases as major-scale degrees (1–8), played in order; or null for random phrases of `notes` notes. */
      readonly phrases: readonly (readonly number[])[] | null;
      readonly notes?: 3 | 4;
    }
  | {
      readonly kind: 'changeTap';
      readonly key: string;
      readonly in: SessionKey;
      readonly pool: readonly ChordSpec[];
      /** How many bars a chord may last. */
      readonly holds: readonly (1 | 2)[];
      readonly bars: number;
      readonly bpm: number;
    }
  | {
      readonly kind: 'fillBars';
      readonly key: string;
      readonly in: SessionKey;
      readonly keys?: readonly string[];
      readonly pool: readonly ChordSpec[];
      readonly bars: number;
      readonly bpm: number;
    }
  | {
      readonly kind: 'song';
      readonly key: string;
      readonly song: SongId;
      readonly in: SessionKey;
      readonly pool: readonly ChordSpec[];
      readonly start: 'all' | 'none';
      readonly keys?: readonly string[];
      readonly bpm?: number;
    }
  | {
      readonly kind: 'transpose';
      readonly key: string;
      readonly bars: readonly ChordSpec[];
      readonly tonics: readonly string[];
      /** Show the capo table for the open shapes of this major key (e.g. 'G'). */
      readonly capoShapes?: string;
    };

export interface ListenCopy {
  readonly intro: string;
  readonly ask: string;
  readonly answers: Readonly<Record<string, string>>;
  readonly right: string;
  readonly wrong: string;
}

export interface RevealCopy {
  readonly intro: string;
  readonly ask: string;
  readonly answer: string;
}

export interface MelodyEchoCopy {
  readonly intro: string;
  readonly ask: string;
  readonly right: string;
  readonly higher: string;
  readonly lower: string;
  readonly done: string;
}

export interface ChangeTapCopy {
  readonly intro: string;
  readonly ask: string;
  readonly result: string;
}

export interface FillBarsCopy {
  readonly intro: string;
  readonly ask: string;
  readonly allRight: string;
  readonly someWrong: string;
}

export interface SongCopy {
  readonly intro: string;
  readonly ask: string;
  readonly result: string;
  readonly allRight: string;
}

export interface TransposeCopy {
  readonly intro: string;
  readonly caption: string;
}

export interface BaseBlockCopy {
  readonly intro: string;
}

export type BlockCopy =
  | BaseBlockCopy
  | ListenCopy
  | RevealCopy
  | MelodyEchoCopy
  | ChangeTapCopy
  | FillBarsCopy
  | SongCopy
  | TransposeCopy;

/** The copy fields each block kind must have (checked by sessions.test.ts). */
export const BLOCK_COPY_FIELDS: Readonly<Record<Block['kind'], readonly string[]>> = {
  lesson: ['intro'],
  chords: ['intro'],
  strumAlong: ['intro'],
  listen: ['intro', 'ask', 'answers', 'right', 'wrong'],
  reveal: ['intro', 'ask', 'answer'],
  melodyEcho: ['intro', 'ask', 'right', 'higher', 'lower', 'done'],
  changeTap: ['intro', 'ask', 'result'],
  fillBars: ['intro', 'ask', 'allRight', 'someWrong'],
  song: ['intro', 'ask', 'result', 'allRight'],
  transpose: ['intro', 'caption'],
};

export interface SessionCopy {
  readonly title: string;
  readonly summary: string; // one line for the path page
  readonly goal: string; // "After this session you can …"
  readonly needs: string; // "A guitar in tune. About 15 minutes."
  readonly recap: readonly string[];
  readonly parts: Readonly<
    Record<PartId, { readonly title: string; readonly body: readonly string[] }>
  >;
  readonly blocks: Readonly<Record<string, BlockCopy>>;
  readonly check: readonly {
    readonly question: string;
    readonly options: readonly string[];
    readonly why: string;
  }[];
  readonly canDo: readonly string[]; // "I can …" boxes; all ticked = done
}

export interface Session {
  readonly slug: string; // English, URL-safe: /theory/s/<slug>
  readonly path: PathId;
  readonly stage: StageId;
  readonly concepts: readonly ConceptId[];
  readonly parts: Readonly<Record<PartId, readonly Block[]>>;
  /** Index of the right option of each check question. */
  readonly checkAnswers: readonly number[];
  readonly copy: Readonly<Record<Lang, SessionCopy>>;
  /** Optional Ear training level (1–15) for extra ear practice after the challenge part. */
  readonly earLevel?: number;
  /** Optional key and chords to open Practice on, shown once the session is done. */
  readonly practice?: SessionPractice;
  /** Optional interactive controls displayed in the session's sticky settings bar. */
  readonly settings?: readonly SessionSettingId[];
}

export type SessionSettingId = 'strumSpeed';

/** A key and a progression (one chord per bar) to practise licks over in Practice. */
export interface SessionPractice {
  readonly in: SessionKey;
  readonly bars: readonly ChordSpec[];
}

/** Every block of a session, in page order. */
export const sessionBlocks = (s: Session): Block[] => PARTS.flatMap((p) => s.parts[p]);
