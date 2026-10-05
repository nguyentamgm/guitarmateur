/**
 * What each scene of the Pentatonic Map shows, derived from the core. No fret is typed by hand:
 * pairs come from string gaps, boxes from `positions()`, key moves from `homeFret()`/`keyShift()`.
 */
import {
  STRINGS,
  byHomeFret,
  allPositions,
  gapToNextString,
  homeFret,
  keyShift,
  midiAt,
  pitchAtPos,
  positions,
  type FretPos,
  type StringNumber,
} from '../../core/fretboard';
import {
  degreeOf,
  format,
  MINOR_KEY_TONICS,
  parseNote,
  pc,
  relativeMajorTonic,
  scaleNotes,
  scaleSteps,
  type DegreeLabel,
  type NoteName,
} from '../../core/music';

const SCALE = 'minorPentatonic';
/** The lesson's example key: A minor pentatonic, home at fret 5 on string 6. */
export const EXAMPLE_TONIC: NoteName = parseNote('A');
/** Frets drawn on the full-neck scenes. */
export const NECK_FRETS = 15;

export interface NeckNote extends FretPos {
  readonly midi: number;
  /** Spelled name in the scale's context, e.g. 'C', 'B♭'. */
  readonly name: string;
  /** Degree over the tonic: '1', 'b3'… */
  readonly degree: DegreeLabel;
  readonly isTonic: boolean;
}

/** Every note of a minor pentatonic from fret 0 to `maxFret`, on every string. */
export function scaleNeck(tonic: NoteName, maxFret = NECK_FRETS): NeckNote[] {
  const context = scaleNotes(tonic, SCALE);
  return context
    .flatMap((n) => allPositions(n, maxFret))
    .map((pos) => {
      const pitch = pitchAtPos(pos, context);
      return {
        ...pos,
        midi: midiAt(pos),
        name: format(pitch),
        degree: degreeOf(tonic, pitch),
        isTonic: pc(pitch) === pc(tonic),
      };
    });
}

// --- Step 1: the grid (K0.2, K0.4) ---

export interface StringPair {
  /** The fretted note on the thicker string. */
  readonly low: FretPos;
  /** The open thinner string that sounds the same pitch. */
  readonly high: FretPos;
  readonly odd: boolean;
}

/** Each string against the next thinner one: fret 5, except G→B at fret 4. */
export function stringPairs(): StringPair[] {
  return STRINGS.filter((s) => s !== 1).map((s) => {
    const gap = gapToNextString(s)!;
    return {
      low: { string: s, fret: gap },
      high: { string: (s - 1) as StringNumber, fret: 0 },
      odd: gap !== 5,
    };
  });
}

// --- Step 2: the formula (K3.2) ---

export interface FormulaNote extends FretPos {
  readonly midi: number;
  readonly degree: DegreeLabel;
  readonly isTonic: boolean;
}

export interface FormulaStrip {
  /** Home, the four notes above it, and home again an octave up. */
  readonly notes: readonly FormulaNote[];
  /** Frets between consecutive notes: 3 2 2 3 2. */
  readonly steps: readonly number[];
}

/** The scale laid along string 6 from its home fret. */
export function formulaStrip(tonic: NoteName = EXAMPLE_TONIC): FormulaStrip {
  const steps = scaleSteps(SCALE);
  const degrees = [...scaleNotes(tonic, SCALE).map((n) => degreeOf(tonic, n)), '1'];
  let fret = homeFret(tonic, 6);
  const notes = degrees.map((degree, i) => {
    if (i > 0) fret += steps[i - 1]!;
    const pos: FretPos = { string: 6, fret };
    return { ...pos, midi: midiAt(pos), degree, isTonic: degree === '1' };
  });
  return { notes, steps };
}

// --- Step 3: five boxes (K3.4) ---

export interface Box {
  readonly index: number;
  readonly minFret: number;
  readonly maxFret: number;
  /** The box's 12 notes, lowest pitch first. */
  readonly notes: readonly (FretPos & { readonly midi: number })[];
}

export function boxes(tonic: NoteName = EXAMPLE_TONIC): Box[] {
  return positions({ tonic, scale: SCALE, notesPerString: 2 }).map((p) => ({
    index: p.index,
    minFret: p.minFret,
    maxFret: p.maxFret,
    notes: p.notes.map((n) => ({ string: n.string, fret: n.fret, midi: midiAt(n) })),
  }));
}

/** Up through the notes, then back down without repeating the top one. */
export function upAndDown<T>(notes: readonly T[]): T[] {
  return [...notes, ...notes.slice(0, -1).reverse()];
}

export const inBox = (box: Pick<Box, 'minFret' | 'maxFret'>, pos: FretPos): boolean =>
  pos.fret >= box.minFret && pos.fret <= box.maxFret;

// --- Step 4: changing key (K0.7, K3.5) ---

/** Minor keys by home fret on string 6 (0…11), named by the core's minor-key rule. */
export const FINDER_KEYS: readonly NoteName[] = byHomeFret(MINOR_KEY_TONICS);

export interface KeyView {
  readonly tonic: NoteName;
  readonly homeFret: number;
  readonly box1: Box;
  readonly notes: readonly NeckNote[];
}

export function keyView(tonic: NoteName): KeyView {
  return { tonic, homeFret: homeFret(tonic, 6), box1: boxes(tonic)[0]!, notes: scaleNeck(tonic) };
}

/** Frets the whole shape slides from one key to another, the short way (−6…+5). */
export const slide = (from: NoteName, to: NoteName): number => keyShift(from, to);

// --- Step 5: same notes, other home (K3.1, K3.3) ---

export type HomeMode = 'minor' | 'major';

export interface HomeView {
  readonly mode: HomeMode;
  readonly home: NoteName;
  /** The A minor pentatonic notes; `degree` and `isTonic` are relative to the chosen home. */
  readonly notes: readonly NeckNote[];
}

export function homeView(mode: HomeMode, minorTonic: NoteName = EXAMPLE_TONIC): HomeView {
  const home = mode === 'minor' ? minorTonic : relativeMajorTonic(minorTonic);
  const notes = scaleNeck(minorTonic).map((n) => {
    const name = parseNote(n.name);
    return { ...n, degree: degreeOf(home, name), isTonic: pc(name) === pc(home) };
  });
  return { mode, home, notes };
}
