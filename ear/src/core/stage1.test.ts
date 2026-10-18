import { describe, expect, it } from 'vitest';
import {
  MIDDLE_RANGE,
  findLevel,
  stepAnswers,
  type Frets,
  type LevelOf,
  type QuestionKind,
} from './levels';
import { stageOneNotes } from './stage1';

describe('Stage 1 questions (seeded)', () => {
  it('every note in range, gaps as the step says, and the notes go the way the answer says', () => {
    for (const id of [1, 2, 3, 4]) {
      const level = findLevel(id)!;
      level.steps.forEach((step, s) => {
        for (const answer of stepAnswers(level as LevelOf<QuestionKind>, s)) {
          for (let seed = 1; seed <= 200; seed++) {
            const notes = stageOneNotes(level, { level: id, step: s, answer, seed });
            const moves = notes.slice(1).map((n, i) => n - notes[i]!);
            const where = `level ${id} step ${s} ${String(answer)} seed ${seed}: ${notes.join(' ')}`;
            for (const n of notes) {
              expect(n, where).toBeGreaterThanOrEqual(MIDDLE_RANGE.low);
              expect(n, where).toBeLessThanOrEqual(MIDDLE_RANGE.high);
            }
            const st = step as { gap?: Frets; close?: Frets; far?: Frets };
            const gap = st.gap ?? (answer === 'close' ? st.close! : st.far!);
            const sizes = answer === 'same' ? [] : moves.map(Math.abs);
            for (const size of sizes) {
              expect(size, where).toBeGreaterThanOrEqual(gap.min);
              expect(size, where).toBeLessThanOrEqual(gap.max);
            }
            const signs = moves.map(Math.sign).join(' ');
            const expected: Partial<Record<string, string>> = {
              same: '0',
              higher: '1',
              lower: '-1',
              up: '1 1',
              down: '-1 -1',
              upDown: '1 -1',
              downUp: '-1 1',
            };
            if (expected[String(answer)]) expect(signs, where).toBe(expected[String(answer)]);
          }
        }
      });
    }
  });

  it('the same question always gives the same notes', () => {
    const level = findLevel(3)!;
    const q = { level: 3, step: 2, answer: 'upDown' as const, seed: 42 };
    expect(stageOneNotes(level, q)).toEqual(stageOneNotes(level, q));
  });
});
