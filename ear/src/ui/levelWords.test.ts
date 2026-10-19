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

  it('on level 14, names the fret from the root for every degree, then the note', () => {
    const level = findLevel(14)!;
    // Step B: the blues scale, in A minor.
    const heard = (answer: string, ui = UI.en) =>
      feedbackHeard(ui, level, { level: 14, step: 1, answer, seed: 5 });
    expect(['1', 'b3', '4', '#4', '5', 'b7'].map((d) => heard(d))).toEqual([
      'fret 0 is the root: the note A, in the key of A minor',
      'fret 3 from the root is ♭3: the note C, in the key of A minor',
      'fret 5 from the root is 4: the note D, in the key of A minor',
      'fret 6 from the root is ♭5: the note E♭, in the key of A minor',
      'fret 7 from the root is 5: the note E, in the key of A minor',
      'fret 10 from the root is ♭7: the note G, in the key of A minor',
    ]);
    expect(heard('5', UI.vi)).toBe('phím 7 tính từ root là bậc 5: nốt E, trong giọng A thứ');
  });

  it('a ♭ degree button is also named as said; plain ones are not', () => {
    const level = findLevel(10)!;
    expect(answerWords(UI.en, level, 'b3').name).toBe('♭3 (flat three)');
    expect(answerWords(UI.vi, level, 'b3').name).toBe('♭3 (bậc 3 giáng)');
    expect(answerWords(UI.en, level, '5').name).toBeUndefined();
  });
});
