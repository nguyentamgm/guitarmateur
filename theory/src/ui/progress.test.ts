import { LESSONS } from '../lessons';
import {
  PROGRESS_STORAGE_KEY,
  QUIZZES,
  RECENT,
  accuracy,
  loadProgress,
  nextReview,
  reasonOf,
  recordAnswer,
  saveProgress,
  type Progress,
} from './progress';
import { REVIEW_SLUG } from './router';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 100 * DAY;

function memory(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
}

const answers = (id: (typeof QUIZZES)[number]['id'], pattern: string, at: number, start: Progress = {}): Progress =>
  [...pattern].reduce((p, c) => recordAnswer(p, id, c === '1', at), start);

describe('quiz registry', () => {
  it('keeps the review path free: no lesson is called "review"', () => {
    expect(LESSONS.some((l) => l.slug === REVIEW_SLUG)).toBe(false);
  });

  it('points every quiz at a real lesson step', () => {
    for (const q of QUIZZES) {
      const lesson = LESSONS.find((l) => l.slug === q.slug);
      expect(lesson?.steps.some((s) => s.id === q.step)).toBe(true);
    }
  });
});

describe('recordAnswer', () => {
  it('counts answers, the running streak and the best streak', () => {
    const p = answers('barre-find', '1110110', NOW);
    expect(p['barre-find']).toMatchObject({ right: 5, total: 7, streak: 0, bestStreak: 3, lastAt: NOW });
  });

  it('keeps only the last RECENT answers for accuracy', () => {
    const p = answers('keys-home', '0'.repeat(10) + '1'.repeat(RECENT), NOW);
    expect(p['keys-home']!.recent).toHaveLength(RECENT);
    expect(accuracy(p['keys-home'])).toBe(1);
    expect(p['keys-home']!.total).toBe(RECENT + 10);
  });

  it('leaves other quizzes alone', () => {
    const p = answers('blues-bend', '1', NOW, answers('chords-build', '10', NOW - DAY));
    expect(p['chords-build']).toMatchObject({ right: 1, total: 2, lastAt: NOW - DAY });
  });
});

describe('nextReview', () => {
  it('puts untried quizzes first, in curriculum order', () => {
    const order = nextReview({}, NOW);
    expect(order.map((i) => i.id)).toEqual(QUIZZES.map((q) => q.id));
    expect(order.every((i) => i.reason === 'new')).toBe(true);
  });

  it('ranks weak before due before fresh, weakest and oldest first', () => {
    let p: Progress = {};
    for (const q of QUIZZES) p = answers(q.id, '1111', NOW, p);
    p = answers('chords-build', '1000', NOW, { ...p, 'chords-build': undefined }); // 25%
    p = answers('blues-bend', '1100', NOW, { ...p, 'blues-bend': undefined }); // 50%
    p = answers('keys-home', '1111', NOW - 9 * DAY, { ...p, 'keys-home': undefined });
    p = answers('fretboard-root', '1111', NOW - 30 * DAY, { ...p, 'fretboard-root': undefined });
    p = answers('pentatonic-shape', '1111', NOW - 2 * DAY, { ...p, 'pentatonic-shape': undefined });
    const order = nextReview(p, NOW);
    expect(order.map((i) => [i.id, i.reason])).toEqual([
      ['chords-build', 'weak'],
      ['blues-bend', 'weak'],
      ['fretboard-root', 'stale'],
      ['keys-home', 'stale'],
      ['pentatonic-shape', 'fresh'],
      ['barre-find', 'fresh'],
    ]);
  });

  it('calls exactly 80% fine and exactly 7 days due', () => {
    const p = answers('barre-find', '11110', NOW - 7 * DAY);
    expect(reasonOf(p['barre-find'], NOW)).toBe('stale');
    expect(reasonOf(p['barre-find'], NOW - DAY)).toBe('fresh');
  });
});

describe('storage', () => {
  it('round-trips', () => {
    const store = memory();
    const p = answers('blues-bend', '101', NOW);
    saveProgress(p, store);
    expect(loadProgress(store)).toEqual(p);
    expect(Object.keys(store.data)).toEqual([PROGRESS_STORAGE_KEY]);
  });

  it('drops unknown quizzes and broken records, and survives garbage', () => {
    const good = answers('blues-bend', '1', NOW)['blues-bend'];
    const store = memory({
      [PROGRESS_STORAGE_KEY]: JSON.stringify({
        'blues-bend': good,
        'keys-home': { ...good, right: 5, total: 2 },
        'barre-find': { ...good, recent: ['yes'] },
        nope: good,
      }),
    });
    expect(loadProgress(store)).toEqual({ 'blues-bend': good });
    expect(loadProgress(memory({ [PROGRESS_STORAGE_KEY]: '{not json' }))).toEqual({});
    expect(loadProgress(memory({ [PROGRESS_STORAGE_KEY]: '42' }))).toEqual({});
    expect(loadProgress(null)).toEqual({});
  });

  it('never throws when storage does', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('full');
      },
    };
    expect(loadProgress(broken)).toEqual({});
    expect(() => saveProgress({}, broken)).not.toThrow();
  });
});
