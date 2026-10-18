import { describe, expect, it } from 'vitest';
import { findLevel } from '../core/levels';
import { degreeQuestion } from '../core/stage3';
import { UI } from '../i18n';
import { answerWords, feedbackHeard } from './levelWords';
import { keyText, noteText } from './labels';

describe('Stage 3 feedback', () => {
  it('names the letter as the key spells it, in both languages', () => {
    const level = findLevel(10)!;
    // Step C mixes keys: find a ♭3 in a flat key, spelled with a flat.
    const q = { level: 10, step: 2, answer: 'b3', seed: 0 };
    let found = degreeQuestion(level, q);
    while (!noteText(found.key, 'b3').includes('♭'))
      found = degreeQuestion(level, { ...q, seed: ++q.seed });
    const note = noteText(found.key, 'b3');
    expect(feedbackHeard(UI.en, level, q)).toBe(
      `that was ♭3: the note ${note}, in the key of ${keyText(UI.en, found.key)}`,
    );
    expect(feedbackHeard(UI.vi, level, q)).toContain(`nốt ${note}, trong giọng`);
    expect(feedbackHeard(UI.en, findLevel(8)!, { level: 8, step: 0, answer: '1', seed: 1 })).toBe(
      'that was the root: A',
    );
  });

  it('a ♭ degree button is also named as said; plain ones are not', () => {
    const level = findLevel(10)!;
    expect(answerWords(UI.en, level, 'b3').name).toBe('♭3 (flat three)');
    expect(answerWords(UI.vi, level, 'b3').name).toBe('♭3 (bậc 3 giáng)');
    expect(answerWords(UI.en, level, '5').name).toBeUndefined();
  });
});
