/**
 * What each scene of "The neck is a grid" shows, derived from the core. No fret is typed by hand:
 * runs come from `midiAt()`, the tab from `positions()` and `octaveUp()`, octave links from
 * `allPositions()`/`octaveUp()`, home frets from `fretsOf()`.
 */
import {
  STANDARD_TUNING,
  STRINGS,
  allPositions,
  fretsOf,
  homeFret,
  midiAt,
  octaveUp,
  pitchAtPos,
  positions,
  type FretPos,
  type StringNumber,
} from '../../core/fretboard';
import { LETTERS, MAJOR_KEY_TONICS, format, mod, note, parseNote, sameNote, type NoteName } from '../../core/music';

/** Frets drawn on the full-neck scenes. */
export const NECK_FRETS = 15;

export interface PlayedNote extends FretPos {
  readonly midi: number;
}

const played = (pos: FretPos): PlayedNote => ({ ...pos, midi: midiAt(pos) });

/** The seven natural notes, the only names this lesson asks for (K0.7). */
export const NATURALS: readonly NoteName[] = LETTERS.map((l) => note(l));

// --- Step 1: string numbers (K0.1) ---

export interface OpenString extends PlayedNote {
  /** 'E', 'A'… as tuned (no octave). */
  readonly name: string;
}

/** The six open strings, string 1 (thinnest, top of tab) first. */
export function openStrings(): OpenString[] {
  return [...STRINGS]
    .reverse()
    .map((s) => ({ ...played({ string: s, fret: 0 }), name: format(STANDARD_TUNING[s]) }));
}

// --- Step 2: one fret = one semitone (K0.2) ---

/** Frets 0…12 on one string: twelve semitone steps, ending an octave above the open string. */
export function semitoneRun(string: StringNumber): PlayedNote[] {
  return Array.from({ length: 13 }, (_, fret) => played({ string, fret }));
}

// --- Step 3: reading tab (K0.3) ---

/** One vertical slice of tab: every note in it is played at the same time. */
export interface TabColumn {
  readonly notes: readonly PlayedNote[];
}

/** Example key of the tab: open A, the first notes of A minor pentatonic box 1, an octave pair. */
export const TAB_TONIC: NoteName = parseNote('A');

/**
 * A short generated phrase: the open A string (a 0 on tab), six single notes climbing strings 6,
 * 5 and 4, then home on string 6 and its octave on string 4 struck together.
 */
export function tabExample(): TabColumn[] {
  const box = positions({ tonic: TAB_TONIC, scale: 'minorPentatonic', notesPerString: 2 })[0]!;
  const open = { string: 5, fret: homeFret(TAB_TONIC, 5) } as const;
  const singles = box.notes.slice(0, 6).map((n) => ({ notes: [played(n)] }));
  const home = { string: 6, fret: homeFret(TAB_TONIC, 6) } as const;
  return [{ notes: [played(open)] }, ...singles, { notes: [played(home), played(octaveUp(home)!)] }];
}

// --- Step 4: octave shapes (K0.6, K0.4) ---

export interface OctaveLink {
  readonly from: FretPos;
  readonly to: FretPos;
  /** Frets moved: 2, or 3 when the jump crosses onto the B string. */
  readonly shift: number;
  readonly crossesB: boolean;
}

export interface OctaveView {
  readonly tonic: NoteName;
  /** Every place the note sounds, lowest pitch first. */
  readonly notes: readonly PlayedNote[];
  /** Two strings up: +2, or +3 across the B string. */
  readonly links: readonly OctaveLink[];
  /** Frets where string 6 and string 1 both sound the note, two octaves apart. */
  readonly outer: readonly number[];
}

export function octaveView(tonic: NoteName, maxFret = NECK_FRETS): OctaveView {
  const notes = allPositions(tonic, maxFret)
    .map(played)
    .sort((a, b) => a.midi - b.midi || b.string - a.string);
  const links = notes.flatMap((from) => {
    const to = octaveUp(from);
    if (!to || to.fret > maxFret) return [];
    const shift = to.fret - from.fret;
    return [{ from: { string: from.string, fret: from.fret }, to, shift, crossesB: to.string <= 2 }];
  });
  return { tonic, notes, links, outer: fretsOf(tonic, 6, maxFret) };
}

/** Natural notes ordered by their home fret on string 6, for the octave picker. */
export const OCTAVE_KEYS: readonly NoteName[] = [...NATURALS].sort((a, b) => homeFret(a, 6) - homeFret(b, 6));

// --- Step 5: home notes on strings 6 and 5 (K0.7, K0.5) ---

export type HomeString = 6 | 5;
export const HOME_STRINGS: readonly HomeString[] = [6, 5];

export interface HomeCell {
  readonly name: NoteName;
  readonly fret: number;
}

/** Natural notes on a string from the open string up to fret 12, lowest fret first. */
export function naturalHomes(string: HomeString): HomeCell[] {
  return NATURALS.flatMap((name) => fretsOf(name, string, 12).map((fret) => ({ name, fret }))).sort(
    (a, b) => a.fret - b.fret,
  );
}

/** Natural note name at a position, or null between them (sharps and flats). */
export function naturalAt(pos: FretPos): NoteName | null {
  const p = pitchAtPos(pos);
  return p.alter === 0 ? note(p.letter) : null;
}

export interface QuizQuestion {
  readonly name: NoteName;
  readonly string: HomeString;
}

/** 'naturals': A–G only. 'all': the 12 names keys are spelled with (F♯, D♭…), K2.2. */
export type QuizNotes = 'naturals' | 'all';
export const QUIZ_NOTES: Readonly<Record<QuizNotes, readonly NoteName[]>> = {
  naturals: NATURALS,
  all: MAJOR_KEY_TONICS,
};

/**
 * Pick a note and string 6 or 5 with `random()` in [0, 1), never repeating the previous
 * question exactly.
 */
export function quizQuestion(random: () => number, previous?: QuizQuestion, notes: QuizNotes = 'naturals'): QuizQuestion {
  const all = HOME_STRINGS.flatMap((string) => QUIZ_NOTES[notes].map((name) => ({ name, string })));
  const pool = previous ? all.filter((q) => !(q.string === previous.string && sameNote(q.name, previous.name))) : all;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]!;
}

/** Right string, and a fret where the note sounds (fret 12 counts as much as the open string). */
export function isAnswer(q: QuizQuestion, pos: FretPos): boolean {
  return pos.string === q.string && mod(pos.fret - homeFret(q.name, q.string), 12) === 0;
}
