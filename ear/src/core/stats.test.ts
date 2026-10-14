import { describe, expect, it } from 'vitest';
import {
  DAYS_KEPT,
  EMPTY_STATS,
  accuracy,
  daysBetween,
  localDay,
  recordAnswer,
  topMixups,
  totals,
  trimDays,
  weakWeights,
  lastDays,
  type Answer,
  type DayCount,
  type Stats,
} from './stats';

const DAY = '2026-10-14';
const major = (degree: string, answer: string): Answer => ({ mode: 'major', degree, answer });

/** Each answer in turn, all on `day`. */
const record = (answers: Answer[], day = DAY, from: Stats = EMPTY_STATS) =>
  answers.reduce((s, a) => recordAnswer(s, a, day), from);

describe('localDay / daysBetween', () => {
  it('gives the local date', () => {
    expect(localDay(new Date(2026, 0, 5, 23, 59).getTime())).toBe('2026-01-05');
    expect(localDay(new Date(2026, 11, 31, 0, 1).getTime())).toBe('2026-12-31');
  });

  it('counts whole days between dates, across months, years and a DST change', () => {
    expect(daysBetween('2026-10-14', '2026-10-14')).toBe(0);
    expect(daysBetween('2026-10-13', '2026-10-14')).toBe(1);
    expect(daysBetween('2026-02-27', '2026-03-02')).toBe(3);
    expect(daysBetween('2025-12-31', '2026-01-01')).toBe(1);
    expect(daysBetween('2026-03-01', '2026-04-01')).toBe(31);
    expect(daysBetween('2026-10-14', '2026-10-13')).toBe(-1);
  });
});

describe('recordAnswer', () => {
  it('counts a right answer for the degree, the day and the streak', () => {
    const s = record([major('3', '3')]);
    expect(s.major).toEqual({
      degrees: { '3': { asked: 1, right: 1 } },
      mixups: {},
      days: [{ day: DAY, asked: 1, right: 1 }],
      streak: 1,
      bestStreak: 1,
    });
    expect(s.minor).toBe(EMPTY_STATS.minor);
  });

  it('counts a wrong answer as a mix-up of the degree asked with the one heard', () => {
    const s = record([major('b3', '3'), major('b3', '3'), major('b3', '2')]);
    expect(s.major.degrees).toEqual({ b3: { asked: 3, right: 0 } });
    expect(s.major.mixups).toEqual({ b3: { '3': 2, '2': 1 } });
    expect(s.major.streak).toBe(0);
  });

  it('files labels under their degree id: b5 is #4', () => {
    const s = record([
      { mode: 'minor', degree: 'b5', answer: '#4' },
      { mode: 'minor', degree: '4', answer: 'b5' },
    ]);
    expect(s.minor.degrees).toEqual({ '#4': { asked: 1, right: 1 }, '4': { asked: 1, right: 0 } });
    expect(s.minor.mixups).toEqual({ '4': { '#4': 1 } });
  });

  it('keeps major and minor apart', () => {
    const s = record([major('b3', 'b3'), { mode: 'minor', degree: 'b3', answer: '3' }]);
    expect(s.major.degrees.b3).toEqual({ asked: 1, right: 1 });
    expect(s.minor.degrees.b3).toEqual({ asked: 1, right: 0 });
    expect(s.major.mixups).toEqual({});
    expect(s.minor.mixups).toEqual({ b3: { '3': 1 } });
  });

  it('keeps the best streak when the streak breaks', () => {
    const s = record([
      major('1', '1'),
      major('5', '5'),
      major('3', '3'),
      major('3', '5'),
      major('1', '1'),
    ]);
    expect(s.major.streak).toBe(1);
    expect(s.major.bestStreak).toBe(3);
  });

  it('adds up one entry per day, oldest first', () => {
    let s = record([major('1', '1'), major('5', '3')], '2026-10-12');
    s = record([major('1', '1')], '2026-10-14', s);
    s = record([major('3', '3'), major('3', '5')], '2026-10-14', s);
    expect(s.major.days).toEqual([
      { day: '2026-10-12', asked: 2, right: 1 },
      { day: '2026-10-14', asked: 3, right: 2 },
    ]);
  });

  it(`keeps only the last ${DAYS_KEPT} days`, () => {
    let s = EMPTY_STATS;
    for (let i = 0; i < 40; i++)
      s = recordAnswer(s, major('1', '1'), localDay(new Date(2026, 8, 1 + i).getTime()));
    expect(s.major.days).toHaveLength(DAYS_KEPT);
    expect(s.major.days[0]!.day).toBe('2026-09-11');
    expect(s.major.days[DAYS_KEPT - 1]!.day).toBe('2026-10-10');
    // The degree counts are all-time: only the per-day history is trimmed.
    expect(s.major.degrees['1']).toEqual({ asked: 40, right: 40 });
  });

  it('does not change the stats it is given', () => {
    const before = record([major('b3', '3')]);
    const copy = structuredClone(before);
    record([major('b3', '3'), major('1', '1')], DAY, before);
    expect(before).toEqual(copy);
  });
});

describe('trimDays', () => {
  const days = (...list: string[]): DayCount[] => list.map((day) => ({ day, asked: 1, right: 1 }));

  it('keeps today and the 29 days before, drops older ones, keeps a later day (a clock set back)', () => {
    const kept = trimDays(
      days('2026-09-14', '2026-09-15', '2026-10-01', '2026-10-14', '2026-10-15'),
      '2026-10-14',
    );
    expect(kept.map((d) => d.day)).toEqual([
      '2026-09-15',
      '2026-10-01',
      '2026-10-14',
      '2026-10-15',
    ]);
  });

  it('an answer dated before the last day goes in its place: no day is lost', () => {
    let s = recordAnswer(EMPTY_STATS, major('1', '1'), '2026-10-14');
    s = recordAnswer(s, major('3', '5'), '2026-10-12');
    s = recordAnswer(s, major('5', '5'), '2026-10-14');
    s = recordAnswer(s, major('5', '5'), '2026-10-12');
    expect(s.major.days).toEqual([
      { day: '2026-10-12', asked: 2, right: 1 },
      { day: '2026-10-14', asked: 2, right: 2 },
    ]);
  });
});

describe('accuracy, totals, topMixups', () => {
  it('accuracy is right / asked, null before the first question', () => {
    expect(accuracy(undefined)).toBeNull();
    expect(accuracy({ asked: 0, right: 0 })).toBeNull();
    expect(accuracy({ asked: 8, right: 6 })).toBe(0.75);
  });

  it('totals add up every degree of a mode', () => {
    const s = record([major('1', '1'), major('3', '5'), major('5', '5'), major('3', '3')]);
    expect(totals(s.major)).toEqual({ asked: 4, right: 3 });
    expect(totals(EMPTY_STATS.minor)).toEqual({ asked: 0, right: 0 });
  });

  it('topMixups: most frequent first, ties in chromatic order, at most n', () => {
    const s = record([
      ...Array<Answer>(3).fill(major('b3', '3')),
      ...Array<Answer>(2).fill(major('6', '5')),
      ...Array<Answer>(2).fill(major('2', 'b3')),
      major('7', '1'),
      major('4', '3'),
    ]);
    expect(topMixups(s.major)).toEqual([
      { degree: 'b3', heardAs: '3', count: 3 },
      { degree: '2', heardAs: 'b3', count: 2 },
      { degree: '6', heardAs: '5', count: 2 },
    ]);
    expect(topMixups(s.major, 5).map((m) => `${m.degree}>${m.heardAs}`)).toEqual([
      'b3>3',
      '2>b3',
      '6>5',
      '4>3',
      '7>1',
    ]);
    expect(topMixups(EMPTY_STATS.major)).toEqual([]);
  });
});

describe('weakWeights', () => {
  it('weighs a missed degree up to 4 and a known one down to 1; unasked is in between', () => {
    let s = EMPTY_STATS;
    for (let i = 0; i < 48; i++) s = recordAnswer(s, major('b3', '3'), DAY);
    for (let i = 0; i < 48; i++) s = recordAnswer(s, major('5', '5'), DAY);
    const w = weakWeights(s.major, ['1', 'b3', '5']);
    expect(w['b3']).toBeCloseTo(1 + 3 * (49 / 50));
    expect(w['5']).toBeCloseTo(1 + 3 * (1 / 50));
    expect(w['1']).toBe(2.5);
  });

  it('smooths a single answer: one miss is not the worst, one hit not the best', () => {
    const s = record([major('3', '5'), major('5', '5')]);
    const w = weakWeights(s.major, ['3', '5']);
    expect(w['3']).toBe(1 + 3 * (2 / 3));
    expect(w['5']).toBe(1 + 3 * (1 / 3));
  });

  it('keys by degree id, once each', () => {
    expect(Object.keys(weakWeights(EMPTY_STATS.minor, ['1', 'b5', '#4']))).toEqual(['1', '#4']);
  });
});

describe('lastDays', () => {
  it('gives n days up to today, oldest first, zeros where nothing was asked', () => {
    const s = record([major('1', '1'), major('3', '5')], '2026-10-12');
    const days = lastDays(recordAnswer(s, major('1', '1'), '2026-10-14').major, '2026-10-14', 4);
    expect(days).toEqual([
      { day: '2026-10-11', asked: 0, right: 0 },
      { day: '2026-10-12', asked: 2, right: 1 },
      { day: '2026-10-13', asked: 0, right: 0 },
      { day: '2026-10-14', asked: 1, right: 1 },
    ]);
  });

  it('crosses a month and a year', () => {
    expect(lastDays(EMPTY_STATS.major, '2026-01-02', 3).map((d) => d.day)).toEqual([
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
    ]);
  });
});
