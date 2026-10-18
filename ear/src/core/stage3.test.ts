import { describe, expect, it } from 'vitest';
import { mod, pc, parseNote } from '@shared/core/music';
import { degreeId, noteOf } from './degrees';
import { askedAnswers, findLevel } from './levels';
import { degreeQuestion } from './stage3';

describe('Stage 3 questions (seeded)', () => {
  it('the note is the asked degree of the asked key; keys leave A only on the last step', () => {
    for (const id of [7, 8, 9, 10, 11, 12, 13]) {
      const level = findLevel(id)!;
      level.steps.forEach((_, step) => {
        const last = step === level.steps.length - 1;
        for (const answer of askedAnswers(level, step)) {
          for (let seed = 1; seed <= 100; seed++) {
            const q = degreeQuestion(level, { level: id, step, answer, seed });
            const where = `level ${id} step ${step} ${String(answer)} seed ${seed}`;
            expect(mod(q.midi, 12), where).toBe(pc(noteOf(q.key, q.degree)));
            expect(mod(q.tonic, 12), where).toBe(pc(q.key.tonic));
            if (answer === 'notRoot') expect(q.degree, where).not.toBe('1');
            else expect(q.degree, where).toBe(answer);
            if (!last) expect(q.key.tonic, where).toEqual(parseNote('A'));
          }
        }
      });
    }
  });

  it('level 7 step A asks only 1, 2 and 7: the notes that clearly want to move', () => {
    const level = findLevel(7)!;
    const degrees = new Set<string>();
    for (let seed = 1; seed <= 200; seed++) {
      for (const answer of ['1', 'notRoot'] as const) {
        degrees.add(degreeQuestion(level, { level: 7, step: 0, answer, seed }).degree);
      }
    }
    expect([...degrees].sort()).toEqual(['1', '2', '7']);
  });

  it('level 13 always spells the blue note ♭5, a flat or a natural letter, never a sharp', () => {
    const level = findLevel(13)!;
    for (let seed = 1; seed <= 200; seed++) {
      const q = degreeQuestion(level, { level: 13, step: 2, answer: '#4', seed });
      expect(degreeId(q.degree)).toBe('#4');
      expect(q.key.mode).toBe('minor');
      expect(noteOf(q.key, 'b5').alter).toBeLessThanOrEqual(0);
    }
  });
});
