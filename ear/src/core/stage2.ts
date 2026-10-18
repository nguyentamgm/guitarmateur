/**
 * Stage 2's questions (docs/ear-levels.md "Stage 2"), drawn from a question's seed: level 5's chord,
 * happy (major) or sad (minor), and level 6's four chords, ending on the key's I chord or not.
 */
import { MAJOR_KEY_TONICS, diatonicChords, pc, type Chord, type Key } from '@shared/core/music';
import { choice, mulberry32 } from '@shared/core/rng';
import type { Level } from './levels';
import type { RoundQuestion } from './round';

/** Roots whose major and minor chords are both open chords: E/Em, A/Am, D/Dm. */
const OPEN_ROOTS = MAJOR_KEY_TONICS.filter(
  (t) => ['E', 'A', 'D'].includes(t.letter) && t.alter === 0,
);
/** Step B's chords sit elsewhere on the neck: every other root, as a barre chord would. */
const MOVED_ROOTS = MAJOR_KEY_TONICS.filter((t) => !OPEN_ROOTS.some((o) => pc(o) === pc(t)));

/** Level 5: one chord, major or minor as answered, strummed or (step C) its notes one by one. */
export interface ChordQuestion {
  readonly chord: Chord;
  readonly style: 'strum' | 'arpeggio';
}

export function chordQuestion(level: Level, q: RoundQuestion): ChordQuestion {
  if (level.kind !== 'chordQuality') throw new Error(`Level ${level.id} has no chord question`);
  const rng = mulberry32(q.seed);
  const { voicing } = level.steps[q.step]!;
  const roots =
    voicing === 'open' ? OPEN_ROOTS : voicing === 'moved' ? MOVED_ROOTS : MAJOR_KEY_TONICS;
  const root = choice(rng, roots);
  return {
    chord: { root, id: q.answer === 'minor' ? 'minor' : 'major' },
    style: voicing === 'arpeggio' ? 'arpeggio' : 'strum',
  };
}

/** The same chord in the other quality: what a wrong answer to level 5 sounds like. */
export const otherQuality = (c: Chord): Chord => ({
  ...c,
  id: c.id === 'minor' ? 'major' : 'minor',
});

/** Level 6: four chords in a key, at a tempo. */
export interface CadenceQuestion {
  readonly key: Key;
  readonly chords: readonly Chord[];
  readonly bpm: number;
}

/** By degree of the key: finished ends home on I; not finished stops on V or IV. */
const FINISHED = [1, 4, 5, 1];
const NOT_FINISHED = [
  [1, 4, 1, 5],
  [1, 5, 1, 4],
];

export function cadenceQuestion(level: Level, q: RoundQuestion): CadenceQuestion {
  if (level.kind !== 'finished') throw new Error(`Level ${level.id} has no cadence question`);
  const rng = mulberry32(q.seed);
  const step = level.steps[q.step]!;
  const key = choice(rng, step.keys);
  const degrees = q.answer === 'finished' ? FINISHED : choice(rng, NOT_FINISHED);
  const triads = diatonicChords(key);
  return { key, chords: degrees.map((d) => triads[d - 1]!.chord), bpm: step.bpm };
}

/** The key's I chord: what a wrong answer to level 6 plays after the four, to settle it. */
export const homeChord = (key: Key): Chord => diatonicChords(key)[0]!.chord;
