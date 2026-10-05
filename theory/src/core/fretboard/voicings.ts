/**
 * Chord voicings derived from formulas (K4.1, K4.5), never typed as frets.
 *
 * Open chords follow one rule: the root is the bass, on the lowest string where it falls within
 * the first frets; every higher string takes its lowest fret that is a chord tone. That rule gives
 * the familiar open shapes (C x32010, G 320003, D xx0232…); a chord it cannot cover with all its
 * tones (C7), or only with more than four fretted notes (F), gets no open voicing rather than a
 * wrong one. Sus chords are the major shape with its 3rd moved: up a fret to the 4, or down two
 * frets to the 2, as guitarists find them.
 */
import { CHORDS, chordNotes, mod, parseNote, pc, type Chord } from '../music';
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

export function openVoicing(chord: Chord, reach = OPEN_REACH): Voicing | null {
  if (chord.id === 'sus4' || chord.id === 'sus2') return susVoicing(chord, reach);
  const tones = new Set(chordNotes(chord).map(pc));
  const rootPc = pc(chord.root);
  const lowest = (s: StringNumber, ok: (p: number) => boolean): number | null => {
    for (let f = 0; f <= reach; f++) if (ok((openMidi(s) + f) % 12)) return f;
    return null;
  };
  const bassIndex = STRINGS.findIndex((s) => s >= 4 && lowest(s, (p) => p === rootPc) !== null);
  if (bassIndex < 0) return null;
  const notes: FretPos[] = [];
  for (const s of STRINGS.slice(bassIndex)) {
    const fret = notes.length === 0 ? lowest(s, (p) => p === rootPc) : lowest(s, (p) => tones.has(p));
    if (fret === null) return null;
    notes.push({ string: s, fret });
  }
  const covered = new Set(notes.map((n) => midiAt(n) % 12));
  if ([...tones].some((t) => !covered.has(t))) return null;
  if (notes.filter((n) => n.fret > 0).length > FINGERS) return null;
  return { notes, muted: STRINGS.slice(0, bassIndex) };
}

/** The major open shape with every 3rd moved to the 4 (+1 fret) or the 2 (−2 frets). */
function susVoicing(chord: Chord, reach: number): Voicing | null {
  const major = openVoicing({ root: chord.root, id: 'major' }, reach);
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
