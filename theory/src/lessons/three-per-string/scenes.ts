/**
 * What each scene of "Three Notes per String" shows, derived from the core. No fret is typed by
 * hand: positions come from `positions({ notesPerString: 3 })`, drills from `sequence()`, key
 * names from the core's key rules, counts from `countTriplets()`.
 */
import {
  byHomeFret,
  positions,
  sequence,
  STRINGS,
  type Direction,
  type SequenceId,
  type StringNumber,
  neckNote,
  samePos,
  scaleNeck,
  upAndDown,
  type NeckNote,
} from '../../core/fretboard';
import {
  MAJOR_KEY_TONICS,
  parseNote,
  relativeMinorTonic,
  scaleNotes,
  type NoteName,
} from '../../core/music';
import { countTriplets, TRIPLET_CELLS, type TripletSyllable } from '../../core/rhythm';

export { TRIPLET_CELLS };

export type Mode = 'major' | 'minor';
const SCALE_OF = { major: 'major', minor: 'naturalMinor' } as const;

/** Steps 1–3 work in G major: position 1 starts at fret 3 and the whole chain fits frets 2–17. */
export const EXAMPLE_TONIC: NoteName = parseNote('G');

/** The 12 major keys, ordered by home fret on string 6 (E F F♯ G A♭ …). */
export const MAJOR_KEYS: readonly NoteName[] = byHomeFret(MAJOR_KEY_TONICS);

export type { NeckNote };

export interface Position {
  /** 1–7: position k starts on degree k of the scale on string 6. */
  readonly index: number;
  readonly minFret: number;
  readonly maxFret: number;
  /** The position's 18 notes, three per string, lowest pitch first. */
  readonly notes: readonly NeckNote[];
}

/** The seven three-notes-per-string positions of a major or natural minor scale (K2.9). */
export function sevenPositions(tonic: NoteName = EXAMPLE_TONIC, mode: Mode = 'major'): Position[] {
  const scale = SCALE_OF[mode];
  const context = scaleNotes(tonic, scale);
  return positions({ tonic, scale, notesPerString: 3 }).map((p) => ({
    index: p.index,
    minFret: p.minFret,
    maxFret: p.maxFret,
    notes: p.notes.map((n) => neckNote(n, tonic, context)),
  }));
}

/**
 * Frets drawn on every neck: the highest position in any key ends at fret 18, and a next position
 * moved up an octave beside it (step 2: G position 6 → 7 at frets 14–19) at 19. A test checks it.
 */
export const NECK_FRETS = 19;

// --- Step 1: three notes on every string ---

/** Frets between the three notes on a string: whole–whole, whole–half or half–whole. */
export type StringShape = 'ww' | 'wh' | 'hw';

export interface StringRow {
  readonly string: StringNumber;
  readonly notes: readonly [NeckNote, NeckNote, NeckNote];
  readonly shape: StringShape;
  /** Fret gaps, low to high: [2, 2], [2, 1] or [1, 2]. */
  readonly gaps: readonly [number, number];
  /**
   * Fretting fingers, index = 1. A half step goes finger to next finger, so wh = 1-3-4 and
   * hw = 1-2-4; ww = 1-2-4 with the hand stretched across five frets.
   */
  readonly fingers: readonly [number, number, number];
}

/** The fret gaps of each shape, low to high. */
export const SHAPE_GAPS: Readonly<Record<StringShape, readonly [number, number]>> = { ww: [2, 2], wh: [2, 1], hw: [1, 2] };
export const STRING_SHAPES = Object.keys(SHAPE_GAPS) as StringShape[];
const SHAPE_OF: Readonly<Record<string, StringShape>> = Object.fromEntries(STRING_SHAPES.map((s) => [SHAPE_GAPS[s].join(','), s]));
const FINGERS: Readonly<Record<StringShape, readonly [number, number, number]>> = {
  ww: [1, 2, 4],
  wh: [1, 3, 4],
  hw: [1, 2, 4],
};

/** One row per string, string 6 first. Throws if a string is not one of the three shapes. */
export function stringRows(pos: Position): StringRow[] {
  return STRINGS.map((string) => {
    const [a, b, c] = pos.notes.filter((n) => n.string === string);
    if (!a || !b || !c) throw new Error(`string ${string} does not hold three notes`);
    const gaps = [b.fret - a.fret, c.fret - b.fret] as const;
    const shape = SHAPE_OF[gaps.join(',')];
    if (!shape) throw new Error(`string ${string}: gaps ${gaps.join(',')}`);
    return { string, notes: [a, b, c], shape, gaps, fingers: FINGERS[shape] };
  });
}

/** Finger number of each note of a position, by position key '6:3'. */
export function fingerMap(pos: Position): Map<string, number> {
  const out = new Map<string, number>();
  for (const row of stringRows(pos)) row.notes.forEach((n, i) => out.set(`${n.string}:${n.fret}`, row.fingers[i]!));
  return out;
}

// --- Step 2: seven positions tile the neck ---

export interface PositionPair {
  readonly from: Position;
  /** The next position, moved an octave when that puts it beside `from` (7 → 1). */
  readonly to: Position;
  /** Notes both play: the top two notes of `from` on each string are the bottom two of `to`. */
  readonly shared: readonly NeckNote[];
}

const shift = (p: Position, frets: number): Position => ({
  ...p,
  minFret: p.minFret + frets,
  maxFret: p.maxFret + frets,
  notes: p.notes.map((n) => ({ ...n, fret: n.fret + frets, midi: n.midi + frets })),
});

/** Position `k` (1–7) and the one after it, laid side by side. */
export function positionPair(k: number, tonic: NoteName = EXAMPLE_TONIC, mode: Mode = 'major'): PositionPair {
  const all = sevenPositions(tonic, mode);
  const from = all[k - 1]!;
  const next = all[k % all.length]!;
  const options = [-12, 0, 12]
    .map((d) => shift(next, d))
    .filter((p) => p.minFret >= 0)
    .map((to) => ({ to, shared: from.notes.filter((n) => to.notes.some((m) => samePos(m, n))) }));
  const best = options.reduce((a, b) => (b.shared.length > a.shared.length ? b : a));
  return { from, ...best };
}

/** Up the first position, then down the second, without a break. */
export function crossRun(pair: PositionPair): NeckNote[] {
  return [...pair.from.notes, ...[...pair.to.notes].reverse()];
}

// --- Step 3: three notes = one beat ---

/** The position's notes in the order a drill plays them. */
export function drillRun(pos: Position, id: SequenceId, direction: Direction): NeckNote[] {
  return sequence(pos.notes.length, id, direction).map((i) => pos.notes[i]!);
}

/** Notes per beat in the drill: triplets, so a straight run takes one beat per string. */
export const NOTES_PER_BEAT = 3;
export const DRILL_BPM = 60;

const TRIPLET_COUNT = countTriplets();

/** The count syllable a drill note starts on: "1 trip let 2 trip let …", bar after bar. */
export const countAt = (i: number): TripletSyllable => TRIPLET_COUNT[i % TRIPLET_CELLS]!;

/** Steps in one loop of `notes` notes: rounded up to whole bars, so every loop starts on "1". */
export const loopSteps = (notes: number, perBar: number): number => Math.ceil(notes / perBar) * perBar;

/** Columns a bar line goes before: every 12 notes (four beats of triplets). */
export const barStarts = (length: number): number[] =>
  Array.from({ length: Math.ceil(length / TRIPLET_CELLS) }, (_, b) => b * TRIPLET_CELLS).filter((c) => c > 0);

// --- Step 4: any key, and the relative minor ---

export interface KeyView {
  readonly tonic: NoteName;
  readonly relativeMinor: NoteName;
  /** The seven positions numbered for the chosen mode, over its own tonic. */
  readonly positions: readonly Position[];
  /** The scale on the whole neck, degrees and `isTonic` over the chosen mode's tonic. */
  readonly neck: readonly NeckNote[];
}

/**
 * `tonic` is always the major key; minor mode shows its relative minor on the very same frets
 * as the major positions, renumbered from the minor root and labelled over it.
 */
export function keyView(tonic: NoteName, mode: Mode): KeyView {
  const relativeMinor = relativeMinorTonic(tonic);
  const major = sevenPositions(tonic, 'major');
  if (mode === 'major') return { tonic, relativeMinor, positions: major, neck: scaleNeck(tonic, SCALE_OF.major, NECK_FRETS) };
  const context = scaleNotes(relativeMinor, SCALE_OF.minor);
  const positions = major
    .map((p) => ({ ...p, index: renumber(p.index, 'major'), notes: p.notes.map((x) => neckNote(x, relativeMinor, context)) }))
    .sort((a, b) => a.index - b.index);
  return { tonic, relativeMinor, positions, neck: scaleNeck(relativeMinor, SCALE_OF.minor, NECK_FRETS) };
}

/**
 * The same frets under the other numbering. The relative minor's root is degree 6 of the major
 * key, so minor position 1 is major position 6, minor 2 is major 7, and so on.
 */
export function renumber(index: number, from: Mode): number {
  const offset = from === 'major' ? -5 : 5;
  return ((((index - 1 + offset) % 7) + 7) % 7) + 1;
}

/** From the position's lowest root to its highest, then back down: the scale heard from home. */
export function rootRun(pos: Position): NeckNote[] {
  const first = pos.notes.findIndex((n) => n.isTonic);
  const last = pos.notes.findLastIndex((n) => n.isTonic);
  return upAndDown(pos.notes.slice(first, last + 1));
}

/** Eighth notes per bar of the step 4 drone. */
export const DRONE_CELLS = 8;
export const DRONE_BPM = 80;
