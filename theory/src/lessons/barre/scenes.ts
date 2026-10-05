/**
 * What each scene of "Barre chords" shows, derived from the core: every shape is an open E or A
 * voicing moved by `barreVoicing()`, the progression comes from `diatonicChords()`, the shape
 * choice from `nearestBarre()` and a small search. The only typed lists are chord qualities and the degrees of the
 * progression.
 */
import {
  BARRE_STRING,
  barreVoicing,
  byHomeFret,
  midiAt,
  nearestBarre,
  pitchAtPos,
  type BarreShape,
  type BarreVoicing,
  type FretPos,
  type StringNumber,
} from '../../core/fretboard';
import {
  MAJOR_KEY_TONICS,
  chordNotes,
  chordSymbol,
  degreeOf,
  diatonicChords,
  format,
  majorKeyTonic,
  mod,
  parseNote,
  pc,
  type Chord,
  type ChordId,
  type DegreeLabel,
  type NoteName,
} from '../../core/music';

/** Frets drawn: an E-shape barre at fret 12 reaches 14. */
export const BARRE_FRETS = 15;
/** The variants both shapes cover (their open templates exist). */
export const VARIANTS: readonly ChordId[] = ['major', 'minor', 'dom7', 'm7', 'maj7', 'sus4'];

/** The 12 roots, C to B, named as major keys are. */
export const ROOTS: readonly NoteName[] = [...MAJOR_KEY_TONICS].sort((a, b) => pc(a) - pc(b));

export interface ChordNote extends FretPos {
  readonly midi: number;
  readonly degree: DegreeLabel;
  readonly name: string;
}

export interface BarreView {
  readonly chord: Chord;
  readonly symbol: string;
  readonly shape: BarreShape;
  /** Barre fret; 0 is the open chord. */
  readonly fret: number;
  readonly notes: readonly ChordNote[];
  readonly muted: readonly StringNumber[];
}

function toView(chord: Chord, v: BarreVoicing): BarreView {
  const context = chordNotes(chord);
  return {
    chord,
    symbol: chordSymbol(chord),
    shape: v.shape,
    fret: v.fret,
    muted: v.muted,
    notes: v.notes.map((p) => {
      const pitch = pitchAtPos(p, context);
      return { ...p, midi: midiAt(p), degree: degreeOf(chord.root, pitch), name: format(pitch) };
    }),
  };
}

export function barreView(chord: Chord, shape: BarreShape, at?: number): BarreView | null {
  const v = barreVoicing(chord, shape, at);
  return v ? toView(chord, v) : null;
}

// --- Step 1: the moving nut ---

/** The E shape with its barre at `fret` (0–12): the chord is named after the note under the barre on string 6. */
export function slideView(fret: number): BarreView {
  const root = majorKeyTonic(midiAt({ string: 6, fret }));
  return barreView({ root, id: 'major' }, 'E', fret)!;
}

/** Degrees that differ between two views of the same shape, by string: what moved. */
export function movedStrings(a: BarreView, b: BarreView): StringNumber[] {
  return b.notes.filter((n) => a.notes.find((m) => m.string === n.string)?.fret !== n.fret).map((n) => n.string);
}

// --- Step 4: find any barre chord ---

export interface FindQuestion {
  readonly root: NoteName;
  readonly id: ChordId;
}

export const FIND_POOL: readonly FindQuestion[] = VARIANTS.flatMap((id) => ROOTS.map((root) => ({ root, id })));

export function findQuestion(random: () => number, previous?: FindQuestion): FindQuestion {
  const pool = previous ? FIND_POOL.filter((q) => !(q.id === previous.id && pc(q.root) === pc(previous.root))) : FIND_POOL;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]!;
}

export type FindResult =
  | { readonly kind: 'right'; readonly view: BarreView; readonly other: BarreView }
  | { readonly kind: 'wrongString' }
  | { readonly kind: 'wrongNote'; readonly heard: string };

const SHAPE_ON: Readonly<Partial<Record<StringNumber, BarreShape>>> = { 6: 'E', 5: 'A' };

/** A click on string 6 or 5: right when it is the root; then the shape there, and the other shape nearby. */
export function judgeFind(q: FindQuestion, pos: FretPos, maxFret = BARRE_FRETS - 3): FindResult {
  const shape = SHAPE_ON[pos.string];
  if (!shape) return { kind: 'wrongString' };
  if (mod(midiAt(pos) - pc(q.root), 12) !== 0) {
    const sharp = format(pitchAtPos(pos, [], 'sharp'));
    const flat = format(pitchAtPos(pos, [], 'flat'));
    return { kind: 'wrongNote', heard: sharp === flat ? sharp : `${sharp} / ${flat}` };
  }
  const chord = { root: q.root, id: q.id };
  const view = barreView(chord, shape, pos.fret)!;
  const otherShape: BarreShape = shape === 'E' ? 'A' : 'E';
  // The other shape in whichever octave sits nearest the click.
  const other = toView(chord, nearestBarre(chord, pos.fret, maxFret, [otherShape])!);
  return { kind: 'right', view, other };
}

export const shapeString = (shape: BarreShape): 6 | 5 => BARRE_STRING[shape];

// --- Step 5: changes without jumping ---

/** I–vi–IV–V, by scale degree. */
export const PROGRESSION: readonly number[] = [1, 6, 4, 5];
export const PROGRESSION_KEYS: readonly NoteName[] = byHomeFret(MAJOR_KEY_TONICS);
export const PROGRESSION_TONIC: NoteName = parseNote('G');

export function progressionChords(tonic: NoteName): Chord[] {
  const chords = diatonicChords({ tonic, mode: 'major' });
  return PROGRESSION.map((d) => chords[d - 1]!.chord);
}

export type PathMode = 'near' | 'string6';

/** Every voicing of a chord within reach: both shapes, home fret and an octave up. */
function options(chord: Chord, maxFret: number): BarreVoicing[] {
  return (['E', 'A'] as const).flatMap((shape) => {
    const home = barreVoicing(chord, shape)!;
    return [home.fret, home.fret + 12].filter((f) => f <= maxFret).map((f) => barreVoicing(chord, shape, f)!);
  });
}

/**
 * Voicings for a progression played as a loop. 'string6': every chord in the E shape at its home
 * fret. 'near': the first chord stays there (where the hand starts); of every combination of
 * shapes and octaves for the rest, the one whose barre travels least around the loop, ties to
 * the lower position. A handful of chords keeps the search tiny.
 */
export function chordPath(chords: readonly Chord[], mode: PathMode, maxFret = BARRE_FRETS - 3): BarreView[] {
  if (mode === 'string6') return chords.map((c) => toView(c, barreVoicing(c, 'E')!));
  const loop = (frets: readonly number[]) => frets.reduce((sum, f, i) => sum + Math.abs(f - frets[(i + 1) % frets.length]!), 0);
  let best: BarreVoicing[] = [];
  let bestCost = Infinity;
  const walk = (i: number, picked: BarreVoicing[]) => {
    if (i === chords.length) {
      const frets = picked.map((v) => v.fret);
      const cost = loop(frets) * 100 + frets.reduce((a, b) => a + b, 0);
      if (cost < bestCost) [best, bestCost] = [picked, cost];
      return;
    }
    for (const v of options(chords[i]!, maxFret)) walk(i + 1, [...picked, v]);
  };
  if (chords.length > 0) walk(1, [barreVoicing(chords[0]!, 'E')!]);
  return best.map((v, i) => toView(chords[i]!, v));
}

/** Frets the hand travels around the loop, back to the first chord included. */
export function travel(path: readonly BarreView[]): number {
  return path.reduce((sum, v, i) => sum + Math.abs(v.fret - path[(i + 1) % path.length]!.fret), 0);
}
