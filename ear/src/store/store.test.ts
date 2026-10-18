import { afterEach, describe, expect, it, vi } from 'vitest';
import type { KeyValue } from '@shared/platform/storage';
import { isUnlocked } from '../core/progress';
import {
  DEFAULT_DATA,
  EAR_STORAGE_KEY,
  loadEar,
  migrate,
  onStoredChange,
  storeRoundEffect,
  storeWelcomed,
} from './store';

/** A Map behind the KeyValue interface. */
function memory(initial: Record<string, string> = {}): KeyValue & { map: Map<string, string> } {
  const map = new Map(Object.entries(initial));
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) };
}

const stored = (s: ReturnType<typeof memory>) => JSON.parse(s.map.get(EAR_STORAGE_KEY)!) as unknown;

describe('loadEar', () => {
  it.each([
    ['nothing stored', memory()],
    ['corrupt JSON', memory({ [EAR_STORAGE_KEY]: '{"version":1,' })],
    ['not an object', memory({ [EAR_STORAGE_KEY]: '[1,2]' })],
    ['a newer version', memory({ [EAR_STORAGE_KEY]: JSON.stringify({ version: 3 }) })],
  ])('gives the defaults for %s', (_, storage) => {
    expect(loadEar(storage)).toEqual(DEFAULT_DATA);
  });

  it('gives the defaults with no storage, or one that throws', () => {
    expect(loadEar(null)).toEqual(DEFAULT_DATA);
    const throwing: KeyValue = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(loadEar(throwing)).toEqual(DEFAULT_DATA);
    expect(storeWelcomed(DEFAULT_DATA, throwing).welcomed).toBe(true);
  });

  it('only ever writes its own key, and never over a newer version', () => {
    const s = memory({ 'gm.lang': 'vi', 'theory.progress': '{}' });
    storeWelcomed(DEFAULT_DATA, s);
    expect([...s.map.keys()].sort()).toEqual(['gm.ear', 'gm.lang', 'theory.progress']);
    const newer = JSON.stringify({ version: 3, levels: { whatever: true } });
    const n = memory({ [EAR_STORAGE_KEY]: newer });
    storeWelcomed(DEFAULT_DATA, n);
    expect(n.map.get(EAR_STORAGE_KEY)).toBe(newer);
  });
});

describe('the beginner levels (version 2)', () => {
  const V1 = { version: 1, settings: { bpm: 120 }, stats: { major: {} } };

  it("migrates a version 1 payload to a clean version 2, dropping the old trainer's data", () => {
    const data = migrate(V1);
    expect(data).toEqual({ version: 2, welcomed: false, levels: {} });
    expect(isUnlocked(data.levels, 1)).toBe(true);
    expect(isUnlocked(data.levels, 2)).toBe(false);
    const s = memory({ [EAR_STORAGE_KEY]: JSON.stringify(V1) });
    storeWelcomed(DEFAULT_DATA, s);
    expect(stored(s)).toEqual({ version: 2, welcomed: true, levels: {} });
  });

  it('reads each level and each field on its own, dropping what is broken', () => {
    const data = migrate({
      version: 2,
      welcomed: 'yes',
      levels: {
        '1': {
          step: 2,
          best: 9,
          done: true,
          counts: { same: { asked: 4, right: 3 }, maybe: { asked: 1, right: 1 } },
        },
        '2': { step: 3, best: 11, done: 'true', counts: { higher: { asked: 1, right: 2 } } },
        '16': { step: 0 },
        '3': 'garbage',
      },
    });
    expect(data.welcomed).toBe(false);
    expect(data.levels).toEqual({
      1: { step: 2, best: 9, done: true, counts: { same: { asked: 4, right: 3 } } },
      2: { step: 0, best: 0, done: false, counts: {} },
    });
  });

  it('round-trips the stored data, building on what another tab stored', () => {
    const s = memory();
    storeRoundEffect(DEFAULT_DATA, 1, { type: 'end', right: 9, passed: true }, s);
    let data = storeRoundEffect(DEFAULT_DATA, 2, { type: 'step', step: 1 }, s);
    data = storeRoundEffect(
      data,
      2,
      {
        type: 'score',
        question: { level: 2, step: 1, answer: 'lower', seed: 3 },
        answer: 'higher',
        right: false,
      },
      s,
    );
    expect(data.levels[1]).toMatchObject({ done: true });
    expect(data.levels[2]).toEqual({
      step: 1,
      best: 0,
      done: false,
      counts: { lower: { asked: 1, right: 0 } },
    });
    expect(loadEar(s)).toEqual(data);
    expect(storeRoundEffect(data, 1, { type: 'offerEasier' }, s)).toBe(data);
  });
});

describe('onStoredChange', () => {
  afterEach(() => localStorage.clear());

  it('hands over the stored data when gm.ear changes in another tab, or storage is cleared', () => {
    const s = memory();
    const listener = vi.fn();
    const off = onStoredChange(listener, s);
    storeWelcomed(DEFAULT_DATA, s);
    window.dispatchEvent(new StorageEvent('storage', { key: 'gm.lang' }));
    expect(listener).not.toHaveBeenCalled();
    window.dispatchEvent(new StorageEvent('storage', { key: EAR_STORAGE_KEY }));
    expect(listener).toHaveBeenLastCalledWith({ ...DEFAULT_DATA, welcomed: true });
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    expect(listener).toHaveBeenCalledTimes(2);
    off();
    window.dispatchEvent(new StorageEvent('storage', { key: EAR_STORAGE_KEY }));
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
