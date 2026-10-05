/**
 * What each scene of "The chord formula table" shows, derived from the core: formulas from
 * `CHORDS`, stacks from `stackShape()`, open shapes and inversions from `openVoicing()`, movable
 * shapes from `barreVoicing()`, the simplifying ladder from `simplifyChord()`. Typed lists are
 * only chord names and groupings.
 */
import {
  allPositions,
  barreVoicing,
  homeFret,
  midiAt,
  openVoicing,
  pitchAtPos,
  stackShape,
  type FretPos,
  type StringNumber,
  type Voicing,
} from '../../core/fretboard';
import {
  CHORDS,
  MAJOR_KEY_TONICS,
  chordNotes,
  chordSymbol,
  chordToneDegree,
  degreeOf,
  format,
  interval,
  intervalName,
  parseNote,
  pc,
  simplifyChord,
  type Chord,
  type ChordId,
  type DegreeLabel,
  type IntervalName,
  type NoteName,
} from '../../core/music';

/** The 12 roots, C to B, named as major keys are. */
export const ROOTS: readonly NoteName[] = [...MAJOR_KEY_TONICS].sort((a, b) => pc(a) - pc(b));

export interface ChordNote extends FretPos {
  readonly midi: number;
  readonly degree: DegreeLabel;
  readonly name: string;
  readonly pitch: NoteName;
}

/** A chord tone at a position, labelled by its role in the formula: '11', not '4', in Dm11. */
function chordNote(pos: FretPos, chord: Chord): ChordNote {
  const pitch = pitchAtPos(pos, chordNotes(chord));
  const degree = chordToneDegree(chord, pitch) ?? degreeOf(chord.root, pitch);
  return { ...pos, midi: midiAt(pos), degree, name: format(pitch), pitch };
}

/** The role a degree plays, for colour: root, 3rd, 5th, 7th, or a colour note (2, 4, 9, 11, 13). */
export type Role = 'root' | 'third' | 'fifth' | 'seventh' | 'colour';
export function roleOf(degree: DegreeLabel): Role {
  switch (Number(/(\d+)$/.exec(degree)![1])) {
    case 1:
    case 8:
      return 'root';
    case 3:
      return 'third';
    case 5:
      return 'fifth';
    case 7:
      return 'seventh';
    default:
      return 'colour';
  }
}

// --- Step 1: 7th chords stacked (K4.3) ---

export const SEVENTHS: readonly ChordId[] = ['maj7', 'dom7', 'm7', 'm7b5', 'dim7', 'aug7'];
/** Frets drawn for stacks: a root at fret 16 still fits. */
export const STACK_FRETS = 17;
/**
 * Lowest root fret on string 5 for a four-note stack: three strings up sounds 14 semitones higher,
 * so the 𝄫7 of a diminished 7th (9 semitones) sits 5 frets left of the root.
 */
export const MIN_ROOT_FRET = 5;

export function rootOnFive(root: NoteName): FretPos {
  const f = homeFret(root, 5);
  return { string: 5, fret: f < MIN_ROOT_FRET ? f + 12 : f };
}

export interface Gap {
  readonly from: ChordNote;
  readonly to: ChordNote;
  readonly name: IntervalName;
}

export interface StackView {
  readonly chord: Chord;
  readonly symbol: string;
  readonly notes: readonly ChordNote[];
  readonly spelled: readonly string[];
  readonly formula: readonly DegreeLabel[];
  /** The three stacked 3rds, bottom first. */
  readonly gaps: readonly Gap[];
}

export function stackView(root: NoteName, id: ChordId): StackView {
  const chord = { root, id };
  const notes = stackShape(rootOnFive(root), chord)!.map((p) => chordNote(p, chord));
  return {
    chord,
    symbol: chordSymbol(chord),
    notes,
    spelled: chordNotes(chord).map(format),
    formula: CHORDS[id].formula,
    gaps: notes.slice(1).map((to, i) => ({ from: notes[i]!, to, name: intervalName(degreeOf(notes[i]!.pitch, to.pitch)) })),
  };
}

// --- Step 2: the table (K4.3, K4.4) ---

export type Group = 'triads' | 'sevenths' | 'extended';
export const TABLE: Readonly<Record<Group, readonly ChordId[]>> = {
  triads: ['major', 'minor', 'aug', 'dim', 'sus2', 'sus4', 'power'],
  sevenths: SEVENTHS,
  extended: ['maj9', 'm9', 'dom9', 'm11', 'dom11', 'add2'],
};
export const GROUPS: readonly Group[] = ['triads', 'sevenths', 'extended'];
export const TABLE_FRETS = 15;

export interface TableView {
  readonly chord: Chord;
  readonly symbol: string;
  readonly formula: readonly DegreeLabel[];
  readonly spelled: readonly string[];
  /** Every place a chord tone sounds from fret 0 to `TABLE_FRETS`. */
  readonly neck: readonly ChordNote[];
}

export function tableView(root: NoteName, id: ChordId): TableView {
  const chord = { root, id };
  const spelledNotes = chordNotes(chord);
  return {
    chord,
    symbol: chordSymbol(chord),
    formula: CHORDS[id].formula,
    spelled: spelledNotes.map(format),
    neck: spelledNotes.flatMap((n) => allPositions(n, TABLE_FRETS)).map((p) => chordNote(p, chord)),
  };
}

// --- Step 3: open 7th and m11 chords (K4.3, K4.5, K4.6) ---

/** The open 7th and m11 chords shown, by name; shapes come from `openVoicing()`. */
export const OPEN_SEVENTHS: readonly Chord[] = (
  [
    ['E', 'dom7'],
    ['A', 'dom7'],
    ['D', 'dom7'],
    ['G', 'dom7'],
    ['C', 'dom7'],
    ['B', 'dom7'],
    ['A', 'm7'],
    ['E', 'm7'],
    ['D', 'm7'],
    ['C', 'maj7'],
    ['G', 'maj7'],
    ['D', 'maj7'],
    ['A', 'maj7'],
    ['A', 'm11'],
    ['E', 'm11'],
  ] as const
).map(([r, id]) => ({ root: parseNote(r), id }));

export interface VoicingView {
  readonly chord: Chord;
  readonly symbol: string;
  readonly notes: readonly ChordNote[];
  readonly muted: readonly StringNumber[];
  /** Barre fret when the shape is moved; 0 for an open chord. */
  readonly fret: number;
}

const toView = (chord: Chord, v: Voicing, fret = 0, symbol = chordSymbol(chord)): VoicingView => ({
  chord,
  symbol,
  notes: v.notes.map((p) => chordNote(p, chord)),
  muted: v.muted,
  fret,
});

export function openView(chord: Chord): VoicingView {
  return toView(chord, openVoicing(chord)!);
}

/** The triad under a 7th or m11 chord, as an open shape when it has one (E7 → E, Am11 → Am). */
export function baseTriadView(chord: Chord): VoicingView | null {
  const base = simplifyChord(chord).at(-1)!;
  const v = openVoicing(base);
  return v ? toView(base, v) : null;
}

/** The A-shape barre of a 7th or m11 chord on any root: Dm11 = x55565. */
export const MOVABLE: readonly ChordId[] = ['dom7', 'm7', 'maj7', 'm11'];
export function movableView(root: NoteName, id: ChordId): VoicingView {
  const chord = { root, id };
  const v = barreVoicing(chord, 'A', homeFret(root, 5) === 0 ? 12 : undefined)!;
  return toView(chord, v, v.fret);
}

// --- Step 4: inversions (K4.7) ---

export const INVERSION_CHORDS: readonly Chord[] = (
  [
    ['C', 'major'],
    ['G', 'major'],
    ['D', 'major'],
    ['A', 'minor'],
    ['E', 'minor'],
    ['G', 'dom7'],
  ] as const
).map(([r, id]) => ({ root: parseNote(r), id }));

/** Basses an open voicing exists for, as degrees of the chord: '1', '3', '5', 'b7'… */
export function bassOptions(chord: Chord): DegreeLabel[] {
  const notes = chordNotes(chord);
  return CHORDS[chord.id].formula.filter((_, i) => openVoicing(chord, { bass: notes[i]! }) !== null);
}

/** The chord over a bass degree: 'C/E' with E lowest. The root position has no slash. */
export function inversionView(chord: Chord, bass: DegreeLabel): VoicingView {
  const note = transposeDegree(chord, bass);
  const v = openVoicing(chord, { bass: note })!;
  const symbol = bass === '1' ? chordSymbol(chord) : `${chordSymbol(chord)}/${format(note)}`;
  return toView(chord, v, 0, symbol);
}

const transposeDegree = (chord: Chord, degree: DegreeLabel): NoteName =>
  chordNotes(chord)[CHORDS[chord.id].formula.indexOf(degree)]!;

/** C – G/B – Am – G: the bass walks down C B A G while the chords stay close. */
export const WALKDOWN: readonly { readonly chord: Chord; readonly bass: DegreeLabel }[] = [
  { chord: { root: parseNote('C'), id: 'major' }, bass: '1' },
  { chord: { root: parseNote('G'), id: 'major' }, bass: '3' },
  { chord: { root: parseNote('A'), id: 'minor' }, bass: '1' },
  { chord: { root: parseNote('G'), id: 'major' }, bass: '1' },
];

// --- Step 5: simplify (K4.8) ---

export const LADDERS: readonly Chord[] = (
  [
    ['G', 'dom11'],
    ['C', 'm11'],
    ['F', 'maj9'],
    ['D', 'dom9'],
    ['B', 'm7b5'],
    ['E', 'add2'],
  ] as const
).map(([r, id]) => ({ root: parseNote(r), id }));

export interface Rung {
  readonly chord: Chord;
  readonly symbol: string;
  readonly formula: readonly DegreeLabel[];
  readonly spelled: readonly string[];
  /** The degree this rung dropped from the one above (none for the top). */
  readonly dropped: DegreeLabel | null;
  /** The notes as a close stack over a low root, for listening. */
  readonly midis: readonly number[];
}

/** Low root of a ladder: on string 6 or 5, whichever home fret is lower. */
const lowRoot = (root: NoteName): number =>
  Math.min(midiAt({ string: 6, fret: homeFret(root, 6) }), midiAt({ string: 5, fret: homeFret(root, 5) }));

/** A chord as a close stack over its low root, for listening: every formula degree once. */
export const chordMidis = (chord: Chord): number[] =>
  CHORDS[chord.id].formula.map((d) => lowRoot(chord.root) + interval(d).semitones);

export function ladder(chord: Chord): Rung[] {
  const steps = simplifyChord(chord);
  return steps.map((c, i) => {
    const formula = CHORDS[c.id].formula;
    const above = i > 0 ? CHORDS[steps[i - 1]!.id].formula : null;
    return {
      chord: c,
      symbol: chordSymbol(c),
      formula,
      spelled: chordNotes(c).map(format),
      dropped: above ? above.find((d) => !formula.includes(d))! : null,
      midis: chordMidis(c),
    };
  });
}
