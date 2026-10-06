/**
 * What each scene of "Pentatonic, the whole neck" shows, derived from the core. No fret is typed
 * by hand: boxes come from `positions()`, drills from `sequence()`, key names from the core's key
 * rules, chords from their formulas.
 */
import {
  allPositions,
  byHomeFret,
  homeFret,
  midiAt,
  pitchAtPos,
  positions,
  sequence,
  type Direction,
  type FretPos,
  type SequenceId,
} from '../../core/fretboard';
import {
  MAJOR_KEY_TONICS,
  MINOR_KEY_TONICS,
  chordSymbol,
  degreeOf,
  format,
  parseNote,
  pc,
  relativeMinorTonic,
  scaleNotes,
  type Chord,
  type DegreeLabel,
  type NoteName,
} from '../../core/music';

export type PentaScale = 'minorPentatonic' | 'majorPentatonic';

/** Steps 1–3 work in A minor pentatonic, the key of the Pentatonic Map. */
export const EXAMPLE_TONIC: NoteName = parseNote('A');
/** Frets drawn on the full-neck scenes. */
export const NECK_FRETS = 15;
/** Step 2 needs two more: box 4 → 5 in A minor ends at fret 17. */
export const PAIR_FRETS = 17;

export interface NeckNote extends FretPos {
  readonly midi: number;
  /** Spelled in the scale's context: 'C', 'B♭'. */
  readonly name: string;
  /** Degree over the scale's tonic. */
  readonly degree: DegreeLabel;
  readonly isTonic: boolean;
}

function neckNote(pos: FretPos, tonic: NoteName, context: readonly NoteName[]): NeckNote {
  const pitch = pitchAtPos(pos, context);
  return { ...pos, midi: midiAt(pos), name: format(pitch), degree: degreeOf(tonic, pitch), isTonic: pc(pitch) === pc(tonic) };
}

/** Every note of a pentatonic from fret 0 to `maxFret`, on every string. */
export function scaleNeck(tonic: NoteName, scale: PentaScale = 'minorPentatonic', maxFret = NECK_FRETS): NeckNote[] {
  const context = scaleNotes(tonic, scale);
  return context.flatMap((n) => allPositions(n, maxFret)).map((pos) => neckNote(pos, tonic, context));
}

export interface Box {
  /** 1–5, numbered from the minor home on string 6 even in a major key (K3.4). */
  readonly index: number;
  readonly minFret: number;
  readonly maxFret: number;
  /** The box's 12 notes, lowest pitch first. */
  readonly notes: readonly NeckNote[];
}

export function boxes(tonic: NoteName = EXAMPLE_TONIC, scale: PentaScale = 'minorPentatonic'): Box[] {
  const context = scaleNotes(tonic, scale);
  return positions({ tonic, scale, notesPerString: 2 }).map((p) => ({
    index: p.index,
    minFret: p.minFret,
    maxFret: p.maxFret,
    notes: p.notes.map((n) => neckNote(n, tonic, context)),
  }));
}

/** Up through the notes, then back down without repeating the top one. */
export function upAndDown<T>(notes: readonly T[]): T[] {
  return [...notes, ...notes.slice(0, -1).reverse()];
}

export const samePos = (a: FretPos, b: FretPos): boolean => a.string === b.string && a.fret === b.fret;

export const inBox = (box: Pick<Box, 'minFret' | 'maxFret'>, pos: FretPos): boolean =>
  pos.fret >= box.minFret && pos.fret <= box.maxFret;

// --- Step 2: joining boxes (K3.5) ---

export interface BoxPair {
  readonly from: Box;
  /** The next box, moved an octave when that puts it beside `from` (box 5 → 1). */
  readonly to: Box;
  /** Notes both boxes play: the top note of `from` on each string is the bottom note of `to`. */
  readonly shared: readonly NeckNote[];
}

const shiftBox = (box: Box, frets: number): Box => ({
  ...box,
  minFret: box.minFret + frets,
  maxFret: box.maxFret + frets,
  notes: box.notes.map((n) => ({ ...n, fret: n.fret + frets, midi: n.midi + frets })),
});

/** Box `k` (1–5) and the box after it, laid side by side. */
export function boxPair(k: number, tonic: NoteName = EXAMPLE_TONIC): BoxPair {
  const all = boxes(tonic);
  const from = all[k - 1]!;
  const next = all[k % all.length]!;
  const options = [-12, 0, 12]
    .map((d) => shiftBox(next, d))
    .filter((b) => b.minFret >= 0)
    .map((to) => ({ to, shared: from.notes.filter((n) => to.notes.some((m) => samePos(m, n))) }));
  const best = options.reduce((a, b) => (b.shared.length > a.shared.length ? b : a));
  return { from, ...best };
}

/** Up the first box, then down the second, without a break. */
export function crossRun(pair: BoxPair): NeckNote[] {
  return [...pair.from.notes, ...[...pair.to.notes].reverse()];
}

// --- Step 3: sequences (K3.6) ---

/** The box's notes in the order a drill plays them. */
export function drillRun(box: Box, id: SequenceId, direction: Direction): NeckNote[] {
  return sequence(box.notes.length, id, direction).map((i) => box.notes[i]!);
}

/** Tempo a drill starts at, and what "speed up" adds after each round. */
export const DRILL_BPM = 60;
export const SPEED_STEP = 4;

// --- Step 4: major keys, the same shape 3 frets down (K3.3) ---

/** The 12 major keys, ordered by home fret on string 6 (E F F♯ G A♭ …). */
export const MAJOR_KEYS: readonly NoteName[] = byHomeFret(MAJOR_KEY_TONICS);

export interface MajorView {
  readonly tonic: NoteName;
  readonly relativeMinor: NoteName;
  /** Where box 1 starts on string 6: the relative minor's home. */
  readonly minorFret: number;
  /** The major home on string 6 inside box 1: always minorFret + 3. */
  readonly majorFret: number;
  readonly box1: Box;
  /** The major pentatonic on the neck; degrees and `isTonic` over the major tonic. */
  readonly notes: readonly NeckNote[];
  /** Major home to its octave and back, inside box 1. */
  readonly run: readonly NeckNote[];
}

/**
 * From the first home note in a box up to the next one an octave higher, then back down: the
 * scale heard from its own home, 1 … 1 … (K3.3).
 */
export function homeRun(box: Box): NeckNote[] {
  const first = box.notes.findIndex((n) => n.isTonic);
  const next = box.notes.findIndex((n, i) => i > first && n.isTonic);
  return upAndDown(box.notes.slice(first, next + 1));
}

export function majorView(tonic: NoteName): MajorView {
  const relativeMinor = relativeMinorTonic(tonic);
  const box1 = boxes(tonic, 'majorPentatonic')[0]!;
  const minorFret = homeFret(relativeMinor, 6);
  return {
    tonic,
    relativeMinor,
    minorFret,
    majorFret: minorFret + 3,
    box1,
    notes: scaleNeck(tonic, 'majorPentatonic'),
    run: homeRun(box1),
  };
}

// --- Step 5: which shape? (K3.7) ---

export type SongKind = 'minor' | 'major' | 'blues';
export const SONG_KINDS: readonly SongKind[] = ['minor', 'major', 'blues'];

export interface QuizQuestion {
  readonly kind: SongKind;
  readonly tonic: NoteName;
}

const CHORD_OF: Readonly<Record<SongKind, Chord['id']>> = { minor: 'minor', major: 'major', blues: 'dom7' };

export const songChord = (q: QuizQuestion): Chord => ({ root: q.tonic, id: CHORD_OF[q.kind] });
export const songChordSymbol = (q: QuizQuestion): string => chordSymbol(songChord(q));

/** Minor song: its home. Major song: its relative minor, 3 frets lower. Blues: its home. */
export const shapeTonic = (q: QuizQuestion): NoteName => (q.kind === 'major' ? relativeMinorTonic(q.tonic) : q.tonic);

/** The fret (0–11) on string 6 where box 1 goes. */
export const answerFret = (q: QuizQuestion): number => homeFret(shapeTonic(q), 6);

/** Both names of a sharp/flat fret ('C♯ / D♭'), or the natural's name. */
export function namesAt(pos: FretPos): string {
  const sharp = format(pitchAtPos(pos, [], 'sharp'));
  const flat = format(pitchAtPos(pos, [], 'flat'));
  return sharp === flat ? sharp : `${sharp} / ${flat}`;
}

export type Verdict = 'right' | 'songRoot' | 'majorTrick' | 'other';

/**
 * Judge a click on string 6 (fret 12 counts as fret 0). On a major song, the song's own root is
 * the common slip; on a minor or blues song, it is the major-key trick, 3 frets below the root.
 */
export function judge(q: QuizQuestion, fret: number): Verdict {
  const at = (f: number) => (((fret - f) % 12) + 12) % 12 === 0;
  if (at(answerFret(q))) return 'right';
  if (q.kind === 'major' && at(homeFret(q.tonic, 6))) return 'songRoot';
  if (q.kind !== 'major' && at(answerFret(q) - 3)) return 'majorTrick';
  return 'other';
}

/** Every question: minor songs in the 12 minor keys, major and blues songs in the 12 major keys. */
export const QUIZ_POOL: readonly QuizQuestion[] = SONG_KINDS.flatMap((kind) =>
  (kind === 'minor' ? MINOR_KEY_TONICS : MAJOR_KEY_TONICS).map((tonic) => ({ kind, tonic })),
);

export function quizQuestion(random: () => number, previous?: QuizQuestion): QuizQuestion {
  const pool = previous
    ? QUIZ_POOL.filter((q) => !(q.kind === previous.kind && pc(q.tonic) === pc(previous.tonic)))
    : QUIZ_POOL;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]!;
}

export interface QuizView {
  /** Box 1 of the shape to use, numbered and labelled in the song's own key. */
  readonly box1: Box;
  /** The scale from the song's home, up and down, inside box 1. */
  readonly run: readonly NeckNote[];
}

export function quizView(q: QuizQuestion): QuizView {
  const box1 = q.kind === 'major' ? boxes(q.tonic, 'majorPentatonic')[0]! : boxes(q.tonic, 'minorPentatonic')[0]!;
  return { box1, run: homeRun(box1) };
}

/** Eighth-note cells of the vamp loop: two bars, the chord on every beat. */
export const VAMP_CELLS = 16;
export const VAMP_BPM = 84;
