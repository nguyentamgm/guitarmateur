/**
 * Level 15's questions (docs/ear-levels.md "Level 15"), drawn from a question's seed: a key whose
 * root sits at the answer's fret of the thickest string, and a short tune in it. Eight notes, two
 * over each chord of I–IV–V7–I (i–iv–V7–i in minor), each a tone of its chord; the tune starts on
 * the root, and ends on it at step A, else on the home chord's 3 or 5. Step C plays it alone.
 */
import { interval, mod, pc, type Chord, type DegreeLabel, type Key } from '@shared/core/music';
import { choice, mulberry32 } from '@shared/core/rng';
import { cadenceChords } from './context';
import { diatonicDegrees } from './degrees';
import { THICKEST_STRING_MIDI, type Level } from './levels';
import type { RoundQuestion } from './round';

export interface FindRootQuestion {
  readonly key: Key;
  /** The tune, MIDI, in MIDDLE_RANGE. */
  readonly melody: readonly number[];
  /** One chord under every two notes of the tune, or none (step C). */
  readonly chords: readonly Chord[] | null;
}

/** The note a fret of the thickest string sounds, as a pitch class. */
export const fretPitchClass = (fret: number): number => mod(THICKEST_STRING_MIDI + fret, 12);

/**
 * Where the root sits: the tonic's pitch in MIDI 50–61 (D3–C♯4), so the tune, from the 5 below
 * the root to the 5 above it, stays in MIDDLE_RANGE (45–69).
 */
const ROOT_LOW = 50;
const BELOW = 5;
const ABOVE = 7;

/** Each chord's tones the tune may land on, by place in the mode's scale (from 0). The V7 gets 5
 * and 2 only: its 3rd is the raised 7th in a minor key, which the mode's scale does not have. */
const CHORD_TONES: readonly (readonly number[])[] = [
  [0, 2, 4],
  [3, 5, 0],
  [4, 1],
  [0, 2, 4],
];

export function findRootQuestion(level: Level, q: RoundQuestion): FindRootQuestion {
  if (level.kind !== 'findRoot') throw new Error(`Level ${level.id} has no find-the-root question`);
  const rng = mulberry32(q.seed);
  const step = level.steps[q.step]!;
  const root = fretPitchClass(q.answer as number);
  const key = choice(
    rng,
    step.keys.filter((k) => pc(k.tonic) === root),
  );
  const scale = diatonicDegrees(key.mode);
  const rootMidi = ROOT_LOW + mod(root - ROOT_LOW, 12);
  // A degree's pitch in the tune's range nearest the note before it.
  const place = (d: DegreeLabel, near: number): number => {
    const s = interval(d).semitones;
    const options = [s - 12, s, s + 12]
      .map((o) => rootMidi + o)
      .filter((m) => m >= rootMidi - BELOW && m <= rootMidi + ABOVE);
    return options.sort((a, b) => Math.abs(a - near) - Math.abs(b - near))[0]!;
  };
  const melody: number[] = [];
  CHORD_TONES.forEach((tones, chord) => {
    for (let i = 0; i < 2; i++) {
      const first = chord === 0 && i === 0;
      const last = chord === CHORD_TONES.length - 1 && i === 1;
      const at =
        first || (last && step.endsOnRoot) ? 0 : last ? choice(rng, [2, 4]) : choice(rng, tones);
      melody.push(place(scale[at]!, melody.at(-1) ?? rootMidi));
    }
  });
  return {
    key,
    melody,
    chords: step.chords ? cadenceChords(key).map((c) => c.chord) : null,
  };
}
