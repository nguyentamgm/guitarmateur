import { NO_SCORE, nextScore } from './useQuizScore';

describe('nextScore', () => {
  it('counts every settled question once, right ones in `right`, and runs in `streak`', () => {
    const answers = [true, true, false, true];
    const s = answers.reduce(nextScore, NO_SCORE);
    expect(s).toEqual({ right: 3, total: 4, streak: 1 });
    expect(nextScore(nextScore(s, true), true)).toEqual({ right: 5, total: 6, streak: 3 });
  });
});
