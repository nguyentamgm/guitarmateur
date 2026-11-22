/**
 * Stage 2's questions (docs/ear-levels.md "Stage 2"), drawn from a question's seed: level 5's chord,
 * happy (major) or sad (minor), and level 6's four chords, ending on the key's I chord or not.
 */
import { MAJOR_KEY_TONICS, diatonicChords, pc, type Chord, type Key, type Mode } from '@shared/core/music';
import { choice, mulberry32 } from '@shared/core/rng';
import type { Level, ProgressionId } from './levels';
import type { RoundQuestion } from './round';

/** Roots whose major and minor chords are both open chords: E/Em, A/Am, D/Dm. */
const OPEN_ROOTS = MAJOR_KEY_TONICS.filter(
  (t) => ['E', 'A', 'D'].includes(t.letter) && t.alter === 0,
);
/** Step B's chords sit elsewhere on the neck: every other root, as a barre chord would. */
const MOVED_ROOTS = MAJOR_KEY_TONICS.filter((t) => !OPEN_ROOTS.some((o) => pc(o) === pc(t)));

/** Level 5 and level 16: one chord, major, minor or dominant 7th as answered, strummed or (step C) its notes one by one. */
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
  const id = q.answer === 'minor' ? 'minor' : q.answer === 'dom7' ? 'dom7' : 'major';
  return {
    chord: { root, id },
    style: voicing === 'arpeggio' ? 'arpeggio' : 'strum',
  };
}

/** The same chord in the quality `picked` (or the other quality on a two-choice level): what a wrong answer sounds like. */
export const otherQuality = (c: Chord, picked?: string): Chord => ({
  ...c,
  id:
    (picked === 'major' || picked === 'minor' || picked === 'dom7') && picked !== c.id
      ? picked
      : c.id === 'minor'
        ? 'major'
        : 'minor',
});

/** Level 6 and level 17: four chords in a key, at a tempo. */
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

/** Level 17's four-bar progressions, by degree of the key; in minor, degree 5 is V7 (dom7). */
const PROGRESSIONS: Readonly<
  Record<
    ProgressionId,
    { readonly mode: Mode; readonly degrees: readonly number[]; readonly dom7At?: number }
  >
> = {
  'I-IV-V-I': { mode: 'major', degrees: [1, 4, 5, 1] },
  'I-V-vi-IV': { mode: 'major', degrees: [1, 5, 6, 4] },
  'i-iv-V7-i': { mode: 'minor', degrees: [1, 4, 5, 1], dom7At: 5 },
};

export function progressionQuestion(level: Level, q: RoundQuestion): CadenceQuestion {
  if (level.kind !== 'progression') throw new Error(`Level ${level.id} has no progression question`);
  const rng = mulberry32(q.seed);
  const step = level.steps[q.step]!;
  const baseKey = choice(rng, step.keys);
  const form = PROGRESSIONS[q.answer as ProgressionId] ?? PROGRESSIONS['I-IV-V-I'];
  const key: Key = { tonic: baseKey.tonic, mode: form.mode };
  const triads = diatonicChords(key);
  const chords = form.degrees.map((d): Chord => {
    const triad = triads[d - 1]!.chord;
    return d === form.dom7At ? { root: triad.root, id: 'dom7' } : triad;
  });
  return { key, chords, bpm: step.bpm };
}

/** The key's I chord: what a wrong answer to level 6 plays after the four, to settle it. */
export const homeChord = (key: Key): Chord => diatonicChords(key)[0]!.chord;
