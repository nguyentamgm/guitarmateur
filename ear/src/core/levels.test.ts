import { describe, expect, it } from 'vitest';
import { format, type Key } from '@shared/core/music';
import { degreeId } from './degrees';
import {
  FIND_ROOT_FRETS,
  LEVELS,
  askedAnswers,
  findLevel,
  sameAnswer,
  stepAnswers,
  type Level,
  type LevelOf,
} from './levels';

const keyName = (k: Key) => `${format(k.tonic)} ${k.mode}`;
const degreeLevels = LEVELS.filter((l): l is LevelOf<'degree'> => l.kind === 'degree');
/** Every level but 15, whose answers are the frets of a string. */
const choiceLevels = LEVELS.filter((l) => l.kind !== 'findRoot');
/** Every step's answers, as plain ids. */
const answersOf = (level: Level): (string | number)[][] =>
  level.steps.map((_, i) => [...stepAnswers(level as LevelOf<typeof level.kind>, i)]);

describe('LEVELS', () => {
  it('numbers the 15 levels 1–15 in order, in stages 1–5', () => {
    expect(LEVELS.map((l) => l.id)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    expect(LEVELS.map((l) => l.stage)).toEqual([1, 1, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5]);
    expect(findLevel(7)?.kind).toBe('degree');
    expect(findLevel(16)).toBeUndefined();
  });

  it('asks each kind in the levels of docs/ear-levels.md', () => {
    expect(LEVELS.map((l) => l.kind)).toEqual([
      'sameDifferent',
      'higherLower',
      'contour',
      'distance',
      'chordQuality',
      'finished',
      ...Array<'degree'>(8).fill('degree'),
      'findRoot',
    ]);
  });

  it('gives every level 2 or 3 difficulty steps', () => {
    for (const level of LEVELS) expect([2, 3], `level ${level.id}`).toContain(level.steps.length);
  });

  it('shows 2–6 different answers on every step (levels 1–14)', () => {
    for (const level of choiceLevels) {
      for (const answers of answersOf(level)) {
        expect(answers.length, `level ${level.id}`).toBeGreaterThanOrEqual(2);
        expect(answers.length, `level ${level.id}`).toBeLessThanOrEqual(6);
        expect(new Set(answers).size, `level ${level.id}`).toBe(answers.length);
      }
    }
  });

  it('only adds answers from one step to the next', () => {
    for (const level of LEVELS) {
      const steps = answersOf(level);
      steps.slice(1).forEach((answers, i) => expect(answers, `level ${level.id}`).toEqual(expect.arrayContaining(steps[i]!)));
    }
  });

  it('answers the frets of the thickest string, open to 12, on level 15', () => {
    const level = findLevel(15)!;
    expect(level.answerOn).toBe('string');
    expect(answersOf(level)).toEqual([FIND_ROOT_FRETS, FIND_ROOT_FRETS, FIND_ROOT_FRETS]);
    expect(FIND_ROOT_FRETS).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('adds the buttons docs/ear-levels.md adds: two shapes on level 3, 3 on level 10, the blue note on level 14', () => {
    expect(answersOf(findLevel(3)!)).toEqual([
      ['up', 'down'],
      ['up', 'down'],
      ['up', 'down', 'upDown', 'downUp'],
    ]);
    expect(answersOf(findLevel(10)!).at(-1)).toEqual(['1', 'b3', '3', '5']);
    expect(answersOf(findLevel(14)!)).toEqual([
      ['1', 'b3', '4', '5', 'b7'],
      ['1', 'b3', '4', '#4', '5', 'b7'],
      ['1', 'b3', '4', '#4', '5', 'b7'],
    ]);
  });
});

describe('degree levels', () => {
  it('are levels 7–14, the last answered on the string', () => {
    expect(degreeLevels.map((l) => l.id)).toEqual([7, 8, 9, 10, 11, 12, 13, 14]);
    expect(degreeLevels.filter((l) => l.answerOn === 'string').map((l) => l.id)).toEqual([14]);
  });

  it('use only degree ids as answers (and "not the root" on level 7)', () => {
    for (const level of degreeLevels) {
      for (const answers of answersOf(level)) {
        for (const a of answers) {
          if (a === 'notRoot') expect(level.id).toBe(7);
          else expect(degreeId(String(a)), `level ${level.id}`).toBe(a);
        }
      }
    }
  });

  it('name the degrees of docs/ear-levels.md', () => {
    expect(degreeLevels.map((l) => l.answers)).toEqual([
      ['1', 'notRoot'],
      ['1', '5'],
      ['1', '3', '5'],
      ['1', 'b3', '5'],
      ['1', 'b3', '5', 'b7'],
      ['1', 'b3', '4', '5', 'b7'],
      ['1', 'b3', '4', '#4', '5', 'b7'],
      ['1', 'b3', '4', '5', 'b7'],
    ]);
  });

  it("keep the previous level's answers from level 10 to level 13", () => {
    for (let id = 11; id <= 13; id++) {
      expect(findLevel(id)!.answers, `level ${id}`).toEqual(expect.arrayContaining([...findLevel(id - 1)!.answers]));
    }
  });

  it('ask, in every key of a step, only degrees with an answer button', () => {
    for (const level of degreeLevels) {
      level.steps.forEach((step, i) => {
        const answers = new Set(stepAnswers(level, i));
        expect(step.keys.length).toBeGreaterThan(0);
        for (const key of step.keys) {
          const asks = step.asks[key.mode];
          expect(asks, `level ${level.id} step ${i} in ${keyName(key)}`).toBeDefined();
          expect(asks!.length).toBeGreaterThanOrEqual(2);
          for (const d of asks!) {
            expect(degreeId(d)).toBe(d);
            expect(answers.has(d) || (answers.has('notRoot') && d !== '1'), `level ${level.id}: ${d}`).toBe(true);
          }
        }
      });
    }
  });

  it('ask every answer button in some step, and the root on level 7 against other notes', () => {
    for (const level of degreeLevels) {
      const asked = new Set(level.steps.flatMap((s) => Object.values(s.asks).flat()));
      for (const a of stepAnswers(level, level.steps.length - 1)) {
        if (a !== 'notRoot') expect(asked.has(a), `level ${level.id}: ${a}`).toBe(true);
      }
    }
    const seven = findLevel(7) as LevelOf<'degree'>;
    for (const step of seven.steps) expect(step.asks.major!.filter((d) => d !== '1').length).toBeGreaterThan(0);
  });

  it('start in A and move to other keys only on the last step', () => {
    for (const level of degreeLevels) {
      const [first, ...rest] = level.steps;
      expect(first!.keys.map(keyName), `level ${level.id}`).toEqual([level.id <= 9 ? 'A major' : 'A minor']);
      for (const step of rest.slice(0, -1)) expect(step.keys.map(keyName)).toEqual(first!.keys.map(keyName));
    }
    expect((findLevel(15) as LevelOf<'findRoot'>).steps[0]!.keys.map(keyName)).toEqual(['A major', 'G major', 'E major', 'C major']);
  });
});

describe('askedAnswers', () => {
  it('asks every button of a two-way level', () => {
    expect(askedAnswers(findLevel(2)!, 0)).toEqual(['higher', 'lower']);
    expect(askedAnswers(findLevel(3)!, 2)).toEqual(['up', 'down', 'upDown', 'downUp']);
  });

  it("asks the step's degrees, level 7's other degrees as 'notRoot'", () => {
    expect(askedAnswers(findLevel(7)!, 0)).toEqual(['1', 'notRoot']);
    expect(askedAnswers(findLevel(10)!, 0)).toEqual(['1', 'b3', '5']);
    expect(askedAnswers(findLevel(10)!, 2)).toEqual(['1', 'b3', '3', '5']);
    expect(askedAnswers(findLevel(14)!, 0)).toEqual(['1', 'b3', '4', '5', 'b7']);
    expect(askedAnswers(findLevel(14)!, 1)).toEqual(['1', 'b3', '4', '#4', '5', 'b7']);
  });

  it("asks level 15's root frets on the thickest string: A G E C at 5 3 0/12 8", () => {
    expect(askedAnswers(findLevel(15)!, 0)).toEqual([0, 3, 5, 8, 12]);
    expect(askedAnswers(findLevel(15)!, 1)).toEqual(FIND_ROOT_FRETS);
  });
});

describe('sameAnswer', () => {
  it('compares ids, and on level 15 frets of the same note', () => {
    expect(sameAnswer(findLevel(2)!, 'higher', 'higher')).toBe(true);
    expect(sameAnswer(findLevel(2)!, 'higher', 'lower')).toBe(false);
    expect(sameAnswer(findLevel(15)!, 0, 12)).toBe(true);
    expect(sameAnswer(findLevel(15)!, 5, 7)).toBe(false);
    expect(sameAnswer(findLevel(8)!, '1', '5')).toBe(false);
  });
});
