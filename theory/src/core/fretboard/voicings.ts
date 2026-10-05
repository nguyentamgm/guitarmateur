/**
 * Chord voicings derived from formulas (K4.1, K4.3, K4.5, K4.7), never typed as frets.
 *
 * Open chords: the bass note (the root, or another note for an inversion) sits on the lowest
 * string where it falls within the first frets. Every higher string plays a chord tone within
 * reach; of all such choices, the one that sounds every essential tone with the fewest fretted
 * notes wins (then the lowest frets). Essential tones are the whole triad, and for bigger chords
 * the root, 3rd, 7th and top colour note: a 5th or a middle colour note may be left out, as
 * guitarists do. That gives the familiar shapes (C x32010, C7 x32310, Am11 x00010…); a chord that
 * needs more than four fingers (F) gets no open voicing rather than a wrong one. Sus chords are
 * the major shape with its 3rd moved: up a fret to the 4, or down two frets to the 2.
 */
import { CHORDS, chordNotes, mod, parseNote, pc, type Chord, type DegreeLabel, type NoteName } from '../music';
import { STRINGS, homeFret, midiAt, openMidi, shapeAt, type FretPos, type StringNumber } from './neck';

/** Highest fret an open chord may use. */
export const OPEN_REACH = 3;
/** Fretting-hand fingers: an open chord frets at most four notes. */
const FINGERS = 4;

export interface Voicing {
  /** Played notes, low string first. */
  readonly notes: readonly FretPos[];
  /** Strings not played (left of the root). */
  readonly muted: readonly StringNumber[];
}

/** Formula degrees an open voicing must sound; the rest may be left out. */
export function essentialDegrees(chord: Chord): DegreeLabel[] {
  const formula = CHORDS[chord.id].formula;
  if (formula.length <= 3) return [...formula];
  // The top colour note (9, 11) counts only past the four notes of a 7th chord.
  const top = formula.length > 4 ? formula[formula.length - 1] : undefined;
  return formula.filter((d, i) => (d !== '5' && i < 4) || d === top);
}

export interface VoicingOptions {
  readonly reach?: number;
  /** Bass note, if not the root: the 3rd for a first inversion, the 5th for a second (K4.7). */
  readonly bass?: NoteName;
}

export function openVoicing(chord: Chord, opts: VoicingOptions | number = {}): Voicing | null {
  const { reach = OPEN_REACH, bass } = typeof opts === 'number' ? { reach: opts } : opts;
  if ((chord.id === 'sus4' || chord.id === 'sus2') && !bass) return susVoicing(chord, reach);
  const notes = chordNotes(chord);
  const tones = new Set(notes.map(pc));
  const essential = new Set(essentialDegrees(chord).map((d) => pc(notes[CHORDS[chord.id].formula.indexOf(d)]!)));
  const bassPc = pc(bass ?? chord.root);
  const fretsFor = (s: StringNumber, ok: (p: number) => boolean): number[] =>
    Array.from({ length: reach + 1 }, (_, f) => f).filter((f) => ok((openMidi(s) + f) % 12));

  const bassIndex = STRINGS.findIndex((s) => s >= 4 && fretsFor(s, (p) => p === bassPc).length > 0);
  if (bassIndex < 0) return null;
  const bassString = STRINGS[bassIndex]!;
  const bassNote: FretPos = { string: bassString, fret: fretsFor(bassString, (p) => p === bassPc)[0]! };
  const upper = STRINGS.slice(bassIndex + 1).map((s) => fretsFor(s, (p) => tones.has(p)).map((fret) => ({ string: s, fret })));
  if (upper.some((o) => o.length === 0)) return null;

  let best: FretPos[] | null = null;
  let bestCost = Infinity;
  const walk = (i: number, picked: FretPos[]) => {
    if (i === upper.length) {
      const all = [bassNote, ...picked];
      const fretted = all.filter((n) => n.fret > 0).length;
      if (fretted > FINGERS) return;
      const sounding = new Set(all.map((n) => midiAt(n) % 12));
      if ([...essential].some((t) => !sounding.has(t))) return;
      const cost = fretted * 100 + all.reduce((sum, n) => sum + n.fret, 0);
      if (cost < bestCost) [best, bestCost] = [all, cost];
      return;
    }
    for (const o of upper[i]!) walk(i + 1, [...picked, o]);
  };
  walk(0, []);
  return best ? { notes: best, muted: STRINGS.slice(0, bassIndex) } : null;
}

/** The major open shape with every 3rd moved to the 4 (+1 fret) or the 2 (−2 frets). */
function susVoicing(chord: Chord, reach: number): Voicing | null {
  const major = openVoicing({ root: chord.root, id: 'major' }, { reach });
  if (!major) return null;
  const third = (pc(chord.root) + 4) % 12;
  const move = chord.id === 'sus4' ? 1 : -2;
  const notes = major.notes.map((n) => (midiAt(n) % 12 === third ? { ...n, fret: n.fret + move } : n));
  if (notes.some((n) => n.fret < 0 || n.fret > reach) || notes.filter((n) => n.fret > 0).length > FINGERS) return null;
  return { notes, muted: major.muted };
}

/**
 * A chord stacked on three neighbouring strings (K4.1): the root, its 3rd (or 2nd, 4th) one string
 * up, its 5th two strings up. Uses the first three degrees of the formula. Null off the neck.
 */
export function triadShape(root: FretPos, chord: Chord): FretPos[] | null {
  const [, middle, top] = CHORDS[chord.id].formula;
  if (!middle || !top) return null;
  const a = shapeAt(root, middle, 1);
  const b = shapeAt(root, top, 2);
  return a && b ? [root, a, b] : null;
}

/**
 * A chord stacked one note per string upwards from the root (K4.1, K4.3): 3rd one string up, 5th
 * two, 7th three. Uses the first four degrees of the formula. Null off the neck.
 */
export function stackShape(root: FretPos, chord: Chord, size: 3 | 4 = 4): FretPos[] | null {
  const formula = CHORDS[chord.id].formula.slice(0, size);
  const notes = formula.map((d, i) => (i === 0 ? root : shapeAt(root, d, i)));
  return notes.every((n): n is FretPos => n !== null) ? notes : null;
}

// --- Barre chords (K4.6) ---

/** The two movable shapes: the open E chord (root on string 6) and the open A chord (root on string 5). */
export type BarreShape = 'E' | 'A';
export const BARRE_SHAPES: readonly BarreShape[] = ['E', 'A'];
export const BARRE_STRING: Readonly<Record<BarreShape, 6 | 5>> = { E: 6, A: 5 };

export interface BarreVoicing extends Voicing {
  readonly shape: BarreShape;
  /** Fret the index finger lies across: the old nut. 0 is the open chord itself. */
  readonly fret: number;
}

/**
 * A barre chord is an open E or A voicing of the same quality, moved up so its root lands on the
 * chord's root; the index finger takes the place of the nut (K4.6). `at` picks the octave: a fret
 * where the root sounds on the shape's string (default: the home fret, 0–11). Null when the open
 * template does not exist for that quality.
 */
export function barreVoicing(chord: Chord, shape: BarreShape, at?: number): BarreVoicing | null {
  const template = openVoicing({ root: parseNote(shape), id: chord.id });
  if (!template) return null;
  const home = homeFret(chord.root, BARRE_STRING[shape]);
  const fret = at === undefined ? home : at;
  if (mod(fret - home, 12) !== 0 || fret < 0) return null;
  return { notes: template.notes.map((n) => ({ ...n, fret: n.fret + fret })), muted: template.muted, shape, fret };
}

/**
 * The barre voicing (in `shapes`, either octave up to `maxFret`) whose barre is nearest
 * `fromFret`; the first shape wins a tie.
 */
export function nearestBarre(chord: Chord, fromFret: number, maxFret = 12, shapes: readonly BarreShape[] = BARRE_SHAPES): BarreVoicing | null {
  const options = shapes.flatMap((shape) => {
    const home = homeFret(chord.root, BARRE_STRING[shape]);
    return [home, home + 12].filter((f) => f <= maxFret).map((f) => barreVoicing(chord, shape, f));
  }).filter((v): v is BarreVoicing => v !== null);
  return options.reduce<BarreVoicing | null>((best, v) => (!best || Math.abs(v.fret - fromFret) < Math.abs(best.fret - fromFret) ? v : best), null);
}
