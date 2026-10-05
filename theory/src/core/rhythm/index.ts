/**
 * Time as a grid (M1). One bar of 4/4 is 4 beats; each beat splits into 1, 2 or 4 equal cells.
 * Lengths are counted in sixteenth cells (a beat = 4 cells), so a note is a bar of N cells and a
 * rest is an empty one (K1.2). Pure numbers: no audio, no DOM, no other Theory module.
 */

export const BEATS_PER_BAR = 4;
/** Sixteenth cells in one beat. */
export const CELLS_PER_BEAT = 4;
export const CELLS_PER_BAR = BEATS_PER_BAR * CELLS_PER_BEAT;

/** Tempo limits the lessons offer. */
export const MIN_BPM = 40;
export const MAX_BPM = 200;

export const clampBpm = (bpm: number): number => Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)));

/** Seconds per beat: 60 / BPM (K1.1). */
export const beatSeconds = (bpm: number): number => 60 / bpm;

/** Seconds per cell when a beat is split into `perBeat` cells. */
export const cellSeconds = (bpm: number, perBeat: number): number => beatSeconds(bpm) / perBeat;

// --- Note lengths (K1.2) ---

export type NoteValueId = 'whole' | 'dottedHalf' | 'half' | 'dottedQuarter' | 'quarter' | 'eighth' | 'sixteenth';

/** Length of each note value in sixteenth cells; a rest of the same name lasts as long. */
export const NOTE_CELLS: Readonly<Record<NoteValueId, number>> = {
  whole: 16,
  dottedHalf: 12,
  half: 8,
  dottedQuarter: 6,
  quarter: 4,
  eighth: 2,
  sixteenth: 1,
};

/** Longest first. */
export const NOTE_VALUES: readonly NoteValueId[] = ['whole', 'dottedHalf', 'half', 'dottedQuarter', 'quarter', 'eighth', 'sixteenth'];

export const lengthInBeats = (id: NoteValueId): number => NOTE_CELLS[id] / CELLS_PER_BEAT;

/** The note value that lasts exactly `cells`, if there is one. */
export const valueOfLength = (cells: number): NoteValueId | undefined => NOTE_VALUES.find((id) => NOTE_CELLS[id] === cells);

export interface Slot {
  /** First cell, 0-based. */
  readonly start: number;
  /** Cells it lasts. */
  readonly length: number;
  readonly rest: boolean;
}

/**
 * Fill one bar with a note value, back to back. What does not fit at the end becomes one rest, so
 * the bar always adds up to 16 cells (a dotted half leaves a quarter rest).
 */
export function fillBar(id: NoteValueId): Slot[] {
  const len = NOTE_CELLS[id];
  const slots: Slot[] = [];
  let start = 0;
  for (; start + len <= CELLS_PER_BAR; start += len) slots.push({ start, length: len, rest: false });
  if (start < CELLS_PER_BAR) slots.push({ start, length: CELLS_PER_BAR - start, rest: true });
  return slots;
}

/** Turn one slot into a rest of the same length, or back into a note. */
export const toggleRest = (slots: readonly Slot[], index: number): Slot[] =>
  slots.map((s, i) => (i === index ? { ...s, rest: !s.rest } : s));

/** Cells covered, which must be the whole bar. */
export const slotsCells = (slots: readonly Slot[]): number => slots.reduce((n, s) => n + s.length, 0);

// --- Counting (K1.3) ---

/** A spoken count syllable: the beat number, or "e", "and", "a" between beats. */
export type Syllable = { readonly kind: 'beat'; readonly n: number } | { readonly kind: 'e' | 'and' | 'a' };

export type PerBeat = 1 | 2 | 4;
export const PER_BEAT: readonly PerBeat[] = [1, 2, 4];

/** Syllables of one bar: "1 2 3 4", "1 & 2 & …" or "1 e & a 2 e & a …". */
export function countBar(perBeat: PerBeat): Syllable[] {
  const between: Record<PerBeat, readonly ('e' | 'and' | 'a')[]> = { 1: [], 2: ['and'], 4: ['e', 'and', 'a'] };
  return Array.from({ length: BEATS_PER_BAR }, (_, b) => [
    { kind: 'beat', n: b + 1 } as const,
    ...between[perBeat].map((kind) => ({ kind })),
  ]).flat();
}

/** True for a cell that starts a beat, when a beat has `perBeat` cells. */
export const isBeat = (cell: number, perBeat: number): boolean => cell % perBeat === 0;

// --- Strumming (K1.4) ---

export type Stroke = 'down' | 'up';

/**
 * The hand never stops: down on every beat, up on every "and". With 8 cells per bar (eighths),
 * even cells are down strokes and odd cells are up strokes, whether or not they hit the strings.
 */
export const pendulum = (cell: number): Stroke => (cell % 2 === 0 ? 'down' : 'up');

export const STRUM_CELLS = 8;

/**
 * Parse a pattern such as 'D-DU-UDU': D = down hit, U = up hit, '-' = the hand moves but misses
 * the strings. Throws if a letter fights the pendulum (a D on an "and"), so bad data fails tests.
 */
export function parseStrum(text: string): boolean[] {
  const chars = [...text.replace(/\s+/g, '')];
  if (chars.length !== STRUM_CELLS) throw new RangeError(`A strum pattern has ${STRUM_CELLS} cells: "${text}"`);
  return chars.map((c, i) => {
    if (c === '-') return false;
    const want = pendulum(i) === 'down' ? 'D' : 'U';
    if (c !== want) throw new SyntaxError(`Cell ${i + 1} of "${text}" must be ${want} or -`);
    return true;
  });
}

/** Back to text: 'D-DU-UDU'. */
export const formatStrum = (hits: readonly boolean[]): string =>
  hits.map((h, i) => (h ? (pendulum(i) === 'down' ? 'D' : 'U') : '-')).join('');

/**
 * Start delays of the strings in one strum, `spread` seconds apart, in the order the pick meets
 * them: thickest first going down, thinnest first going up.
 */
export function strumDelays<T>(stringsLowToHigh: readonly T[], stroke: Stroke, spread = 0.012): { item: T; delay: number }[] {
  const order = stroke === 'down' ? stringsLowToHigh : [...stringsLowToHigh].reverse();
  return order.map((item, i) => ({ item, delay: i * spread }));
}

// --- Triplets and swing (K1.5) ---

/** A beat split into three: "1 trip-let 2 trip-let …". */
export type TripletSyllable = { readonly kind: 'beat'; readonly n: number } | { readonly kind: 'trip' | 'let' };

export const TRIPLET_CELLS = BEATS_PER_BAR * 3;

export function countTriplets(): TripletSyllable[] {
  return Array.from({ length: BEATS_PER_BAR }, (_, b) => [
    { kind: 'beat', n: b + 1 } as const,
    { kind: 'trip' } as const,
    { kind: 'let' } as const,
  ]).flat();
}

/**
 * Where an eighth note starts, in beats from the start of the bar, with a swing amount from 0
 * (straight: the "and" halfway through the beat) to 1 (shuffle: the "and" on the last third of
 * a triplet, 2/3 of the way through). Even eighths sit on the beat whatever the swing.
 */
export function swingOnset(eighth: number, swing: number): number {
  const s = Math.min(1, Math.max(0, swing));
  return Math.floor(eighth / 2) + (eighth % 2 === 0 ? 0 : 0.5 + s / 6);
}

/** How long an eighth lasts, in beats, at a swing amount: long–short, 2/3 + 1/3 at full swing. */
export const swingLength = (eighth: number, swing: number): number => swingOnset(eighth + 1, swing) - swingOnset(eighth, swing);

/** Extra delay of an eighth over its straight position, in seconds: what the clock adds when swinging. */
export const swingDelay = (eighth: number, swing: number, bpm: number): number =>
  (swingOnset(eighth, swing) - swingOnset(eighth, 0)) * beatSeconds(bpm);
