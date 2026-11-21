import type { Session } from '../sessions';
import {
  SESSIONS_STORAGE_KEY,
  createSessionProgress,
  isDone,
  nextSession,
  toggleTick,
  type SessionTicks,
} from './sessionProgress';

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

function fakeSession(slug: string, canDoCount: number): Session {
  return {
    slug,
    path: 'accompany',
    stage: 'A',
    concepts: [],
    parts: { listen: [], understand: [], play: [], challenge: [] },
    checkAnswers: [],
    copy: {
      en: {
        title: slug,
        summary: '',
        goal: '',
        needs: '',
        recap: [],
        parts: {
          listen: { title: '', body: [] },
          understand: { title: '', body: [] },
          play: { title: '', body: [] },
          challenge: { title: '', body: [] },
        },
        blocks: {},
        check: [],
        canDo: Array.from({ length: canDoCount }, (_, i) => `can do ${i}`),
      },
      vi: {
        title: slug,
        summary: '',
        goal: '',
        needs: '',
        recap: [],
        parts: {
          listen: { title: '', body: [] },
          understand: { title: '', body: [] },
          play: { title: '', body: [] },
          challenge: { title: '', body: [] },
        },
        blocks: {},
        check: [],
        canDo: Array.from({ length: canDoCount }, (_, i) => `có thể làm ${i}`),
      },
    },
  };
}

describe('sessionProgress', () => {
  describe('toggleTick', () => {
    it('toggles an index on and off, keeping indexes sorted and deduplicated', () => {
      let t: SessionTicks = {};
      t = toggleTick(t, 'session-1', 2);
      expect(t['session-1']).toEqual([2]);

      t = toggleTick(t, 'session-1', 0);
      expect(t['session-1']).toEqual([0, 2]);

      t = toggleTick(t, 'session-1', 1);
      expect(t['session-1']).toEqual([0, 1, 2]);

      // Toggling 1 off
      t = toggleTick(t, 'session-1', 1);
      expect(t['session-1']).toEqual([0, 2]);

      // Leaves other slugs alone
      t = toggleTick(t, 'session-2', 0);
      expect(t['session-1']).toEqual([0, 2]);
      expect(t['session-2']).toEqual([0]);
    });
  });

  describe('isDone', () => {
    it('is true only when every index 0..boxes-1 is ticked and boxes > 0', () => {
      expect(isDone({}, 's', 0)).toBe(false);
      expect(isDone({ s: [0, 1] }, 's', 0)).toBe(false);

      expect(isDone({}, 's', 2)).toBe(false);
      expect(isDone({ s: [0] }, 's', 2)).toBe(false);
      expect(isDone({ s: [1] }, 's', 2)).toBe(false);
      expect(isDone({ s: [0, 1] }, 's', 2)).toBe(true);
      expect(isDone({ s: [0, 1, 2] }, 's', 2)).toBe(true);
    });
  });

  describe('nextSession', () => {
    it('skips done sessions and returns undefined when all sessions are done', () => {
      const s1 = fakeSession('s1', 2);
      const s2 = fakeSession('s2', 1);
      const s3 = fakeSession('s3', 2);
      const sessions = [s1, s2, s3];

      expect(nextSession({}, sessions)).toBe(s1);

      const t1 = { s1: [0, 1] };
      expect(nextSession(t1, sessions)).toBe(s2);

      const t2 = { s1: [0, 1], s2: [0] };
      expect(nextSession(t2, sessions)).toBe(s3);

      const t3 = { s1: [0, 1], s2: [0], s3: [0, 1] };
      expect(nextSession(t3, sessions)).toBeUndefined();
    });
  });

  describe('loading ticks', () => {
    it('returns empty object on missing, null, corrupt JSON, or wrong version', () => {
      expect(createSessionProgress(null).load()).toEqual({});
      expect(createSessionProgress(memory()).load()).toEqual({});
      for (const raw of ['not json{', '[1, 2]', '{"v":2,"ticks":{"s":[0]}}', '{"v":1,"ticks":null}']) {
        expect(createSessionProgress(memory({ [SESSIONS_STORAGE_KEY]: raw })).load()).toEqual({});
      }
    });

    it('keeps good entries and drops broken ones', () => {
      const store = memory({
        [SESSIONS_STORAGE_KEY]: JSON.stringify({
          v: 1,
          ticks: {
            valid: [1, 0], // sorted to [0, 1]
            badString: ['0'],
            badNegative: [-1],
            badFloat: [1.2],
            badObject: { a: 1 },
            badNull: null,
          },
        }),
      });
      expect(createSessionProgress(store).load()).toEqual({ valid: [0, 1] });
    });
  });

  describe('saving ticks', () => {
    it('stores the tick and keeps unknown slugs from storage', () => {
      const store = memory({
        [SESSIONS_STORAGE_KEY]: JSON.stringify({
          v: 1,
          ticks: { 'future-session': [0, 1] },
        }),
      });

      const next = createSessionProgress(store).toggle('current-session', 0);
      expect(next).toEqual({
        'future-session': [0, 1],
        'current-session': [0],
      });

      const written = JSON.parse(store.data[SESSIONS_STORAGE_KEY]!);
      expect(written).toEqual({
        v: 1,
        ticks: {
          'future-session': [0, 1],
          'current-session': [0],
        },
      });
    });

    it('keeps unsaved checks and merges them with another tab when writes recover', () => {
      const store = memory({ [SESSIONS_STORAGE_KEY]: '{"v":1,"ticks":{"s1":[3]}}' });
      let canSave = false;
      const progress = createSessionProgress({
        getItem: store.getItem,
        setItem(key, value) {
          if (!canSave) throw new Error('QuotaExceededError');
          store.setItem(key, value);
        },
      });

      progress.toggle('s1', 3);
      progress.toggle('s1', 0);
      expect(progress.toggle('s1', 1)).toEqual({ s1: [0, 1] });

      store.setItem(SESSIONS_STORAGE_KEY, '{"v":1,"ticks":{"s1":[3,4],"s2":[0]}}');
      expect(progress.load()).toEqual({ s1: [0, 1, 4], s2: [0] });
      canSave = true;
      expect(progress.toggle('s1', 2)).toEqual({ s1: [0, 1, 2, 4], s2: [0] });
      expect(createSessionProgress(store).load()).toEqual({ s1: [0, 1, 2, 4], s2: [0] });
    });
  });
});
