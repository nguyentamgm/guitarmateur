/**
 * What each scene of "The major scale and interval shapes" shows, derived from the core. Names
 * come from `neckNote()` / `scaleNeck()` in the key's scale, shapes from `shapeAt()`.
 */
import { STRINGS, homeFret, midiAt, neckNote, scaleNeck, shapeAt, type FretPos, type NeckNote } from '../../core/fretboard';
import {
  INTERVAL_TABLE,
  LETTERS,
  MAJOR_KEY_TONICS,
  format,
  interval,
  intervalName,
  letterIndex,
  letterSemitone,
  mod,
  parseNote,
  pc,
  scaleNotes,
  scaleSteps,
  transpose,
  type Alter,
  type DegreeLabel,
  type IntervalQuality,
  type Letter,
  type NoteName,
} from '../../core/music';

/** The 12 major keys, named by `majorKeyTonic()`, in pitch order from C. */
export const KEYS: readonly NoteName[] = [...MAJOR_KEY_TONICS].sort((a, b) => pc(a) - pc(b));

// --- Step 1: the formula (K2.1, K0.2) ---

export const FORMULA_STRING = 5;
/** Home on string 5 sits at fret 0–11, so its octave never passes fret 23. */
export const FORMULA_FRETS = 23;

export interface FormulaStep {
  /** Frets to the next note: 2 (whole step) or 1 (half step). */
  readonly size: number;
  readonly half: boolean;
}

export interface FormulaRun {
  /** Degrees 1–7, then '8': home an octave up. */
  readonly notes: readonly NeckNote[];
  readonly steps: readonly FormulaStep[];
}

/** The major scale laid along string 5 from the key's home fret. */
export function formulaRun(tonic: NoteName): FormulaRun {
  const context = scaleNotes(tonic, 'major');
  const sizes = scaleSteps('major');
  let fret = homeFret(tonic, FORMULA_STRING);
  const notes = Array.from({ length: 8 }, (_, i) => {
    if (i > 0) fret += sizes[i - 1]!;
    const n = neckNote({ string: FORMULA_STRING, fret }, tonic, context);
    return i === 7 ? { ...n, degree: '8' } : n;
  });
  return { notes, steps: sizes.map((size) => ({ size, half: size === 1 })) };
}

// --- Step 2: one letter each (K2.2, K0.5) ---

export const SPELLING_FRETS = 12;

/** The same pitch written with another letter: B♭ as A♯, F as E♯. */
export function respell(n: NoteName, letter: Letter): NoteName {
  const alter = mod(pc(n) - letterSemitone(letter) + 6, 12) - 6;
  if (alter < -2 || alter > 2) throw new RangeError(`${format(n)} cannot be spelled with ${letter}`);
  return { letter, alter: alter as Alter };
}

/** Degree 4 spelled with the letter of degree 3 (F major: A♯ for B♭). Same fret, wrong letter. */
export function wrongFourth(tonic: NoteName): NoteName {
  const scale = scaleNotes(tonic, 'major');
  return respell(scale[3]!, scale[2]!.letter);
}

export interface LetterCell {
  readonly letter: Letter;
  /** Scale notes written with this letter: one when spelled right. */
  readonly notes: readonly string[];
}

export interface SpellingView {
  readonly notes: readonly string[];
  /** The seven letters from the tonic's letter up. */
  readonly letters: readonly LetterCell[];
  readonly right: NoteName;
  readonly wrong: NoteName;
}

export function spellingView(tonic: NoteName, misspell: boolean): SpellingView {
  const scale = scaleNotes(tonic, 'major');
  const right = scale[3]!;
  const wrong = wrongFourth(tonic);
  const notes = misspell ? scale.map((n, i) => (i === 3 ? wrong : n)) : scale;
  const start = letterIndex(tonic.letter);
  const letters = Array.from({ length: 7 }, (_, i) => {
    const letter = LETTERS[(start + i) % 7]!;
    return { letter, notes: notes.filter((n) => n.letter === letter).map(format) };
  });
  return { notes: notes.map(format), letters, right, wrong };
}

// --- Step 3: interval names (K2.3) ---

/** The fixed home of the interval scene: C on string 5. */
export const INTERVAL_TONIC: NoteName = parseNote('C');
export const INTERVAL_ROOT: FretPos = { string: 5, fret: homeFret(INTERVAL_TONIC, 5) };
export const INTERVAL_FRETS = 8;

export interface IntervalTarget extends FretPos {
  readonly midi: number;
  readonly semitones: number;
}

/** Every position from home up to its octave within the scene's frets. */
export function intervalTargets(): IntervalTarget[] {
  const root = midiAt(INTERVAL_ROOT);
  const out: IntervalTarget[] = [];
  for (const string of STRINGS) {
    for (let fret = 0; fret <= INTERVAL_FRETS; fret++) {
      const m = midiAt({ string, fret });
      if (m >= root && m - root <= 12) out.push({ string, fret, midi: m, semitones: m - root });
    }
  }
  return out;
}

/** Names for a distance clicked without context: one label, or both #4 and b5 at 6 semitones. */
export function labelsFor(semitones: number): DegreeLabel[] {
  return INTERVAL_TABLE.filter((r) => r.semitones === semitones && (semitones === 6 || !r.label.startsWith('#'))).map(
    (r) => r.label,
  );
}

/**
 * The same number one semitone lower or higher: major → minor, perfect → diminished, either →
 * augmented. Null past one accidental, and for the unison and octave, which stay perfect here.
 */
export function alterLabel(label: DegreeLabel, by: 1 | -1): DegreeLabel | null {
  const m = /^(b|#)?(\d+)$/.exec(label);
  if (!m || m[2] === '1' || m[2] === '8') return null;
  const acc = (m[1] === 'b' ? -1 : m[1] === '#' ? 1 : 0) + by;
  if (acc < -1 || acc > 1) return null;
  const next = `${acc < 0 ? 'b' : acc > 0 ? '#' : ''}${m[2]}`;
  return next;
}

/** The clicked note moved one fret on its string, renamed by `alterLabel`; null off the scene. */
export function alterTarget(
  target: IntervalTarget,
  label: DegreeLabel,
  by: 1 | -1,
): { target: IntervalTarget; label: DegreeLabel } | null {
  const next = alterLabel(label, by);
  const fret = target.fret + by;
  if (!next || fret < 0 || fret > INTERVAL_FRETS) return null;
  const pos = { string: target.string, fret };
  return { target: { ...pos, midi: midiAt(pos), semitones: target.semitones + by }, label: next };
}

export interface IntervalReading {
  readonly label: DegreeLabel;
  readonly number: number;
  readonly quality: IntervalQuality;
  readonly semitones: number;
  /** The upper note, spelled by letter count from the tonic. */
  readonly note: NoteName;
}

export function readInterval(tonic: NoteName, label: DegreeLabel): IntervalReading {
  const iv = interval(label);
  return { label, ...intervalName(label), semitones: iv.semitones, note: transpose(tonic, iv) };
}

// --- Step 4: interval shapes (K2.4, K0.4) ---

export interface ShapeChoice {
  readonly label: DegreeLabel;
  readonly stringsUp: 1 | 2;
}

/** The shapes of K2.4: thirds to fifths on the next string, sixths to the octave two strings up. */
export const SHAPES: readonly ShapeChoice[] = [
  ...['b3', '3', '4', '#4', '5'].map((label) => ({ label, stringsUp: 1 as const })),
  ...['b6', '6', 'b7', '7', '8'].map((label) => ({ label, stringsUp: 2 as const })),
];

export const SHAPE_FRETS = 12;
export const SHAPE_START: FretPos = INTERVAL_ROOT;

export interface Stamp {
  readonly from: FretPos;
  readonly to: FretPos;
  /** Frets right (+) or left (−) of the root. */
  readonly offset: number;
  /** The shape spans G→B, so its upper note sits one fret further right. */
  readonly crossesB: boolean;
}

/** The shape pressed onto the neck at `from`, or null if it falls off the drawn frets. */
export function stamp(from: FretPos, shape: ShapeChoice): Stamp | null {
  const to = shapeAt(from, shape.label, shape.stringsUp);
  if (!to || to.fret > SHAPE_FRETS) return null;
  return { from, to, offset: to.fret - from.fret, crossesB: from.string >= 3 && to.string <= 2 };
}

// --- Step 5: degrees in one position (K2.1, K2.3) ---

export const DEGREE_FRETS = 15;

export interface DegreeWindow {
  readonly minFret: number;
  readonly maxFret: number;
  /** Home on string 6, inside the window. */
  readonly home: FretPos;
  /** Every scale note in the window, lowest pitch first. */
  readonly notes: readonly NeckNote[];
}

/** Five frets around home on string 6, from one fret below it; home at fret 0 moves up to 12. */
export function degreeWindow(tonic: NoteName): DegreeWindow {
  const h = homeFret(tonic, 6) || 12;
  const minFret = h - 1;
  const maxFret = h + 3;
  const notes = scaleNeck(tonic, 'major', DEGREE_FRETS)
    .filter((n) => n.fret >= minFret && n.fret <= maxFret)
    .sort((a, b) => a.midi - b.midi);
  return { minFret, maxFret, home: { string: 6, fret: h }, notes };
}
