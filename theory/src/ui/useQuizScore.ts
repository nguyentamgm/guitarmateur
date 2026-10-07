import { useCallback, useState } from 'react';
import { useTheory } from './context';
import type { QuizId } from './progress';

/** A quiz's score for this visit: right on the first try, questions settled, current run. */
export type QuizScore = {
  readonly right: number;
  readonly total: number;
  readonly streak: number;
};

export const NO_SCORE: QuizScore = { right: 0, total: 0, streak: 0 };

/** The score after one more settled question. */
export const nextScore = (s: QuizScore, right: boolean): QuizScore => ({
  right: s.right + (right ? 1 : 0),
  total: s.total + 1,
  streak: right ? s.streak + 1 : 0,
});

/**
 * A quiz scene's score. `settle(right)` counts one question exactly once: it updates the score
 * shown for this visit and records the answer in stored progress (theory.progress) together.
 */
export function useQuizScore(id: QuizId): { readonly score: QuizScore; settle(right: boolean): void } {
  const { recordQuiz } = useTheory();
  const [score, setScore] = useState<QuizScore>(NO_SCORE);
  const settle = useCallback(
    (right: boolean) => {
      setScore((s) => nextScore(s, right));
      recordQuiz(id, right);
    },
    [id, recordQuiz],
  );
  return { score, settle };
}
