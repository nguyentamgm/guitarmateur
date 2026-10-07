/**
 * What each scene of "Chords are stacked intervals" shows, derived from the core: notes from
 * `chordNotes()`, stacked shapes from `triadShape()`, open shapes from `openVoicing()`. The only
 * typed lists are chord names (which open chords to show) and qualities.
 */
import { homeFret, midiAt, neckNote, openVoicing, pitchAtPos, triadShape, type FretPos, type StringNumber } from '../../core/fretboard';
import {
  CHORDS,
  MAJOR_KEY_TONICS,
  chordNotes,
  chordSymbol,
  degreeOf,
  format,
  intervalName,
  mod,
  parseNote,
  pc,
  type Chord,
  type ChordId,
  type DegreeLabel,
  type IntervalName,
  type NoteName,
} from '../../core/music';

/** Frets drawn for the stacked shapes: a root as high as fret 13 still fits its augmented 5th. */
export const STACK_FRETS = 17;
/**
 * Lowest root fret on string 5. Two strings up sounds 10 semitones higher, so the ♭5 of a
 * diminished chord sits 4 frets left of the root: below fret 4 it would fall off the nut.
 */
export const MIN_ROOT_FRET = 4;

/** The 12 roots, C to B, named as major keys are (D♭, E♭, F♯, A♭, B♭). */
export const ROOTS: readonly NoteName[] = [...MAJOR_KEY_TONICS].sort((a, b) => pc(a) - pc(b));

/** The root on string 5, at its home fret, or an octave up when that is too close to the nut. */
export function rootOnFive(root: NoteName): FretPos {
  const f = homeFret(root, 5);
  return { string: 5, fret: f < MIN_ROOT_FRET ? f + 12 : f };
}

export interface ChordNote extends FretPos {
  readonly midi: number;
  /** Degree in the chord: '1', '3', 'b3', '#5', '4'… */
  readonly degree: DegreeLabel;
  /** Spelled from the formula: E♭ in Cm, G♯ in C+. */
  readonly name: string;
  readonly pitch: NoteName;
}

function chordNote(pos: FretPos, chord: Chord): ChordNote {
  const context = chordNotes(chord);
  return { ...neckNote(pos, chord.root, context), pitch: pitchAtPos(pos, context) };
}

export interface Gap {
  readonly from: ChordNote;
  readonly to: ChordNote;
  readonly name: IntervalName;
}

export interface StackView {
  readonly chord: Chord;
  readonly symbol: string;
  /** Root, middle, top: one per string, 5 → 4 → 3. */
  readonly notes: readonly ChordNote[];
  /** Spelled notes of the chord: C E♭ G. */
  readonly spelled: readonly string[];
  readonly formula: readonly DegreeLabel[];
  /** Root → middle, middle → top: the two stacked intervals. */
  readonly stack: readonly [Gap, Gap];
  /** Root → top. */
  readonly outer: Gap;
}

const gap = (from: ChordNote, to: ChordNote): Gap => ({ from, to, name: intervalName(degreeOf(from.pitch, to.pitch)) });

export function stackView(root: NoteName, id: ChordId): StackView {
  const chord: Chord = { root, id };
  const shape = triadShape(rootOnFive(root), chord)!;
  const notes = shape.map((p) => chordNote(p, chord));
  const [r, m, t] = notes as [ChordNote, ChordNote, ChordNote];
  return {
    chord,
    symbol: chordSymbol(chord),
    notes,
    spelled: chordNotes(chord).map(format),
    formula: CHORDS[id].formula,
    stack: [gap(r, m), gap(m, t)],
    outer: gap(r, t),
  };
}

// --- Step 2: qualities; step 3: sus ---

export const QUALITIES: readonly ChordId[] = ['major', 'minor', 'aug', 'dim'];
export const SUS_KINDS: readonly ChordId[] = ['sus2', 'major', 'sus4'];

// --- Step 4: open chords (K4.5) ---

/** The open chords the lesson shows, by name; their shapes come from `openVoicing()`. */
export const OPEN_CHORDS: readonly Chord[] = [
  ['C', 'major'],
  ['A', 'major'],
  ['G', 'major'],
  ['E', 'major'],
  ['D', 'major'],
  ['A', 'minor'],
  ['E', 'minor'],
  ['D', 'minor'],
  ['A', 'sus4'],
  ['D', 'sus4'],
  ['E', 'sus4'],
  ['A', 'sus2'],
  ['D', 'sus2'],
].map(([r, id]) => ({ root: parseNote(r!), id: id as ChordId }));

export interface OpenView {
  readonly chord: Chord;
  readonly symbol: string;
  readonly notes: readonly ChordNote[];
  readonly muted: readonly StringNumber[];
  /** The same root's other quality among the lesson's open chords (E ↔ Em), if there is one. */
  readonly partner: Chord | null;
}

export function openView(chord: Chord): OpenView {
  const v = openVoicing(chord)!;
  const other: ChordId | null = chord.id === 'major' ? 'minor' : chord.id === 'minor' ? 'major' : null;
  const partner = OPEN_CHORDS.find((c) => c.id === other && pc(c.root) === pc(chord.root)) ?? null;
  return { chord, symbol: chordSymbol(chord), notes: v.notes.map((p) => chordNote(p, chord)), muted: v.muted, partner };
}

// --- Step 5: build it yourself ---

export const QUIZ_KINDS: readonly ChordId[] = ['major', 'minor', 'aug', 'dim', 'sus2', 'sus4'];

export interface BuildQuestion {
  readonly root: NoteName;
  readonly id: ChordId;
}

export const BUILD_POOL: readonly BuildQuestion[] = QUIZ_KINDS.flatMap((id) => ROOTS.map((root) => ({ root, id })));

export function buildQuestion(random: () => number, previous?: BuildQuestion, kinds: readonly ChordId[] = QUIZ_KINDS): BuildQuestion {
  const all = BUILD_POOL.filter((q) => kinds.includes(q.id));
  const pool = previous ? all.filter((q) => !(q.id === previous.id && pc(q.root) === pc(previous.root))) : all;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]!;
}

export type BuildClick =
  | { readonly kind: 'root' }
  | { readonly kind: 'tone'; readonly degree: DegreeLabel }
  | { readonly kind: 'miss'; readonly semitones: number };

/** What a clicked note is to the question's chord: the root, one of its tones (any octave), or not in it. */
export function judgeBuild(q: BuildQuestion, pos: FretPos): BuildClick {
  const semis = mod(midiAt(pos) - midiAt(rootOnFive(q.root)), 12);
  if (semis === 0) return { kind: 'root' };
  const formula = CHORDS[q.id].formula;
  const chord = { root: q.root, id: q.id };
  const hit = chordNotes(chord).findIndex((n, i) => i > 0 && mod(pc(n) - pc(q.root), 12) === semis);
  return hit < 0 ? { kind: 'miss', semitones: semis } : { kind: 'tone', degree: formula[hit]! };
}

/** The degrees still to find: every formula tone but the root. */
export const toFind = (q: BuildQuestion): DegreeLabel[] => CHORDS[q.id].formula.slice(1);
