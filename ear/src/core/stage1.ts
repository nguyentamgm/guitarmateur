/**
 * Stage 1's questions (docs/ear-levels.md "Stage 1"): the notes of a level 1–4 question, drawn from
 * its seed, so the same question always sounds the same. Single notes in MIDDLE_RANGE; a gap is
 * in frets (semitones).
 */
import { int, mulberry32, type Rng } from '@shared/core/rng';
import { MIDDLE_RANGE, type Frets, type Level } from './levels';
import { OPEN_MIDI, type GuitarString } from './position';
import type { RoundQuestion } from './round';

const gapIn = (rng: Rng, f: Frets): number => int(rng, f.min, f.max);

/**
 * A start note so that moves of `steps` semitones (signed, one after the other) all stay in the
 * middle range.
 */
function startFor(rng: Rng, steps: readonly number[]): number {
  let at = 0;
  let lo = 0;
  let hi = 0;
  for (const s of steps) {
    at += s;
    lo = Math.min(lo, at);
    hi = Math.max(hi, at);
  }
  return int(rng, MIDDLE_RANGE.low - lo, MIDDLE_RANGE.high - hi);
}

/** The notes from a start, moving by `steps`. */
function walk(rng: Rng, steps: readonly number[]): number[] {
  const notes = [startFor(rng, steps)];
  for (const s of steps) notes.push(notes.at(-1)! + s);
  return notes;
}

/** The notes of a Stage 1 question, low or high as its answer says; [] for any other level. */
export function stageOneNotes(level: Level, q: RoundQuestion): number[] {
  const rng = mulberry32(q.seed);
  switch (level.kind) {
    case 'sameDifferent': {
      const gap = gapIn(rng, level.steps[q.step]!.gap);
      // Different goes up or down; the same note twice is still two notes.
      const move = q.answer === 'same' ? 0 : rng() < 0.5 ? gap : -gap;
      return walk(rng, [move]);
    }
    case 'higherLower': {
      const gap = gapIn(rng, level.steps[q.step]!.gap);
      return walk(rng, [q.answer === 'higher' ? gap : -gap]);
    }
    case 'contour': {
      const f = level.steps[q.step]!.gap;
      const [a, b] = [gapIn(rng, f), gapIn(rng, f)];
      const moves = { up: [a, b], down: [-a, -b], upDown: [a, -b], downUp: [-a, b] }[
        q.answer as 'up'
      ];
      return walk(rng, moves);
    }
    case 'distance': {
      const s = level.steps[q.step]!;
      const gap = gapIn(rng, q.answer === 'close' ? s.close : s.far);
      return walk(rng, [s.direction === 'either' && rng() < 0.5 ? -gap : gap]);
    }
    default:
      return [];
  }
}

/** Two notes on one string: the thinnest string both fit on from its open note, and their frets. */
export function onOneString(notes: readonly number[]): { string: GuitarString; frets: number[] } {
  const low = Math.min(...notes);
  const strings: readonly GuitarString[] = [1, 2, 3, 4, 5, 6];
  const string = strings.find((s) => OPEN_MIDI[s] <= low) ?? 6;
  return { string, frets: notes.map((m) => m - OPEN_MIDI[string]) };
}
