/**
 * What each scene of "Electric guitar" shows, derived from the core: power chords from
 * `powerChord()`, double stops from `doubleStops()` over `positions()`, octaves from `octaveUp()`,
 * the boogie from `BOOGIE` and `shapeAt()`. Riffs and melodies are written as scale degrees.
 */
import {
  byHomeFret,
  doubleStops,
  fretsOf,
  homeFret,
  midiAt,
  octaveUp,
  pitchAtPos,
  positions,
  powerChord,
  shapeAt,
  type FretPos,
  type StringNumber,
} from '../../core/fretboard';
import {
  BOOGIE,
  MAJOR_KEY_TONICS,
  bluesChord,
  chordSymbol,
  degreeOf,
  format,
  interval,
  majorKeyTonic,
  minorKeyTonic,
  mod,
  parseNote,
  scaleNotes,
  twelveBar,
  type BluesDegree,
  type DegreeLabel,
  type NoteName,
  type TwelveBarOptions,
} from '../../core/music';

export interface StopNote extends FretPos {
  readonly midi: number;
  /** Degree inside the shape or over the key: '1', '5', '8', '♭3'… as labels. */
  readonly degree: DegreeLabel;
}

const at = (pos: FretPos, degree: DegreeLabel): StopNote => ({ ...pos, midi: midiAt(pos), degree });

// --- Step 1: power chords (K4.2) ---

/** Strings a power chord is rooted on in this lesson, and the frets the root may take on a 12-fret neck. */
export const POWER_STRINGS: readonly (6 | 5)[] = [6, 5];
export const POWER_FRETS = 12;
export const MAX_ROOT_FRET = POWER_FRETS - 2;

export interface PowerView {
  readonly notes: readonly StopNote[];
  /** 'A5', 'B♭5': the root named as a key is (fewest accidentals). */
  readonly symbol: string;
}

export function powerView(root: FretPos, octave = true): PowerView {
  const shape = powerChord(root, octave)!;
  const name = majorKeyTonic(midiAt(root));
  return {
    notes: shape.map((p, i) => at(p, ['1', '5', '8'][i]!)),
    symbol: chordSymbol({ root: name, id: 'power' }),
  };
}

/** A 3rd over the root, an octave up, to hear the power chord fit under both: major (4) or minor (3). */
export const thirdOver = (root: FretPos, quality: 'major' | 'minor'): number =>
  midiAt(root) + 12 + interval(quality === 'major' ? '3' : 'b3').semitones;

// --- Step 2: palm mute and a riff (K6.5) ---

export interface RiffEvent {
  /** Eighth note it starts on. */
  readonly cell: number;
  readonly cells: number;
  /** Root of the power chord as a degree of the key's minor pentatonic. */
  readonly degree: DegreeLabel;
  /** A palm-muted chug, or a chord left to ring. */
  readonly mute: boolean;
}

/** Two bars of eighths: ring the I, chug it, climb ♭III and IV, again, then ♭III to IV. */
export const RIFF: readonly RiffEvent[] = [
  { cell: 0, cells: 2, degree: '1', mute: false },
  { cell: 2, cells: 1, degree: '1', mute: true },
  { cell: 3, cells: 1, degree: '1', mute: true },
  { cell: 4, cells: 2, degree: 'b3', mute: false },
  { cell: 6, cells: 2, degree: '4', mute: false },
  { cell: 8, cells: 2, degree: '1', mute: false },
  { cell: 10, cells: 1, degree: '1', mute: true },
  { cell: 11, cells: 1, degree: '1', mute: true },
  { cell: 12, cells: 1, degree: 'b3', mute: false },
  { cell: 13, cells: 3, degree: '4', mute: false },
];
export const RIFF_CELLS = 16;
export const RIFF_TONIC: NoteName = parseNote('E');
export const RIFF_BPM = 112;

export interface RiffChord extends RiffEvent {
  readonly root: FretPos;
  readonly symbol: string;
  /** The full chord when it rings, the two low notes when it chugs. */
  readonly notes: readonly StopNote[];
}

export function riffChords(tonic: NoteName = RIFF_TONIC): RiffChord[] {
  return RIFF.map((e) => {
    const root: FretPos = { string: 6, fret: homeFret(tonic, 6) + interval(e.degree).semitones };
    const view = powerView(root, !e.mute);
    return { ...e, root, symbol: view.symbol, notes: view.notes };
  });
}

// --- Step 3: double stops (K6.6) ---

export const STOP_TONIC: NoteName = parseNote('A');

export interface StopPair {
  readonly low: StopNote;
  readonly high: StopNote;
  /** 5 = perfect 4th, 4 = major 3rd (only on G–B). */
  readonly semitones: number;
  /** Spelled in the key: 'E', 'A'. */
  readonly names: readonly [string, string];
}

/** Box `k` of A minor pentatonic: its notes and every same-fret pair on adjacent strings. */
export function stopsView(k: number, tonic: NoteName = STOP_TONIC): { box: { minFret: number; maxFret: number }; notes: StopNote[]; pairs: StopPair[] } {
  const box = positions({ tonic, scale: 'minorPentatonic', notesPerString: 2 })[k - 1]!;
  const context = scaleNotes(tonic, 'minorPentatonic');
  const note = (p: FretPos) => at(p, degreeOf(tonic, pitchAtPos(p, context)));
  const pairs = doubleStops(box.notes).map((d) => ({
    low: note(d.low),
    high: note(d.high),
    semitones: d.semitones,
    names: [format(pitchAtPos(d.low, context)), format(pitchAtPos(d.high, context))] as const,
  }));
  return { box, notes: box.notes.map(note), pairs };
}

/** Frets a double stop slides in from: two below, never past the nut. */
export const slideFrom = (fret: number): number => Math.max(0, fret - 2);

// --- Step 4: octaves (K6.7, K0.6) ---

/** Lower string of each octave pair: 6/4 and 5/3 take +2; 4/2 and 3/1 cross G→B and take +3. */
export const OCTAVE_STRINGS: readonly StringNumber[] = [6, 5, 4, 3];
/** The phrase played in octaves: up the minor pentatonic from home to 5 and back. */
export const OCTAVE_PHRASE: readonly DegreeLabel[] = ['1', 'b3', '4', '5', '4', 'b3', '1'];
/** Home of the phrase: fret 5 of the lower string, so every string set uses the same frets. */
export const OCTAVE_HOME_FRET = 5;

export interface OctavePair {
  readonly low: StopNote;
  readonly high: StopNote;
  /** The string in between, muted by the underside of the first finger. */
  readonly muted: StringNumber;
}

export function octaveView(lower: StringNumber): { tonic: NoteName; pairs: OctavePair[] } {
  const home: FretPos = { string: lower, fret: OCTAVE_HOME_FRET };
  const tonic = minorKeyTonic(midiAt(home));
  const pairs = OCTAVE_PHRASE.map((d) => {
    const low: FretPos = { string: lower, fret: OCTAVE_HOME_FRET + interval(d).semitones };
    return { low: at(low, d), high: at(octaveUp(low)!, d), muted: (lower - 1) as StringNumber };
  });
  return { tonic, pairs };
}

// --- Step 5: the boogie (K4.2, K6.5, K5.4) ---

export const BOOGIE_KEYS: readonly NoteName[] = byHomeFret(MAJOR_KEY_TONICS);
export const BOOGIE_TONIC: NoteName = parseNote('A');
export const BOOGIE_BPM = 96;
/** Frets drawn: in E♭ the V sits at fret 13 on string 5 and its ♭7 reaches fret 18 on string 4. */
export const BOOGIE_FRETS = 18;

export interface BoogieBar {
  readonly degree: BluesDegree;
  readonly symbol: string;
  /** Root of the shape: I on string 6, IV and V on string 5 next to it. */
  readonly root: FretPos;
}

export function boogieForm(tonic: NoteName = BOOGIE_TONIC, opts: TwelveBarOptions = {}): BoogieBar[] {
  const home: FretPos = { string: 6, fret: homeFret(tonic, 6) };
  const rootOf = (degree: BluesDegree): FretPos => {
    if (degree === 'I') return home;
    const name = bluesChord(tonic, degree).root;
    const frets = fretsOf(name, 5, 14);
    const fret = frets.reduce((a, b) => (Math.abs(b - home.fret) < Math.abs(a - home.fret) ? b : a));
    return { string: 5, fret };
  };
  return twelveBar(opts).map((degree) => ({ degree, symbol: chordSymbol(bluesChord(tonic, degree)), root: rootOf(degree) }));
}

/** The two notes of eighth `eighth` of a bar: the root, and the boogie's moving top note one string up. */
export function boogieShape(root: FretPos, eighth: number): [StopNote, StopNote] {
  const degree = BOOGIE[mod(eighth, BOOGIE.length)]!;
  return [at(root, '1'), at(shapeAt(root, degree, 1)!, degree)];
}

/** The three places the top finger visits over a root: 5, 6, ♭7. */
export const boogieTops = (root: FretPos): StopNote[] =>
  ['5', '6', 'b7'].map((d) => at(shapeAt(root, d, 1)!, d));
