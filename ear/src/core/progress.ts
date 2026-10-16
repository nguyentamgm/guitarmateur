/**
 * Progress through the beginner levels (docs/ear-levels.md): pure functions over what the store
 * keeps per level. Whether a level is unlocked is worked out from the levels before it, never
 * stored.
 */
import { LEVELS, findLevel } from './levels';
import { counted, type AnswerCounts, type RoundEffect } from './round';

export interface LevelProgress {
  /** The difficulty step the next round starts at, 0 for A. */
  readonly step: number;
  /** The best round, right first try. */
  readonly best: number;
  /** Passed once: the next level is unlocked. */
  readonly done: boolean;
  /** Every answer asked in this level, by answer id: how often, and how often right first try. */
  readonly counts: AnswerCounts;
}

/** Progress by level id; a level never played is missing. */
export type Progress = Readonly<Partial<Record<number, LevelProgress>>>;

export const NEW_LEVEL: LevelProgress = { step: 0, best: 0, done: false, counts: {} };

export const levelProgress = (progress: Progress, id: number): LevelProgress => progress[id] ?? NEW_LEVEL;

/** Level 1 is always open; any other level once the level before it is done. */
export function isUnlocked(progress: Progress, id: number): boolean {
  if (!findLevel(id)) return false;
  return id === LEVELS[0]!.id || levelProgress(progress, id - 1).done;
}

/** The first unlocked level not done yet, or the last level when every one is done. */
export function currentLevel(progress: Progress): number {
  return LEVELS.find((l) => isUnlocked(progress, l.id) && !levelProgress(progress, l.id).done)?.id ?? LEVELS.at(-1)!.id;
}

const withLevel = (progress: Progress, id: number, change: (p: LevelProgress) => LevelProgress): Progress => ({
  ...progress,
  [id]: change(levelProgress(progress, id)),
});

/**
 * One effect of a round of level `id` (core/round.ts), kept: the step it moved to, the first answer
 * to a question (counted under the question's own level, as a test round mixes them), and the
 * round's end (the best score, and done once passed). Other effects change nothing.
 */
export function recordRoundEffect(progress: Progress, id: number, effect: RoundEffect): Progress {
  switch (effect.type) {
    case 'step':
      return withLevel(progress, id, (p) => ({ ...p, step: effect.step }));
    case 'score':
      return withLevel(progress, effect.question.level, (p) => ({
        ...p,
        counts: counted(p.counts, effect.question.answer, effect.right),
      }));
    case 'end':
      return withLevel(progress, id, (p) => ({
        ...p,
        best: Math.max(p.best, effect.right),
        done: p.done || effect.passed,
      }));
    default:
      return progress;
  }
}
