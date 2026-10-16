import { afterEach, describe, expect, it, vi } from 'vitest';
import { MINOR_KEY_TONICS, parseNote } from '@shared/core/music';
import type { KeyValue } from '@shared/platform/storage';
import { isUnlocked } from '../core/progress';
import { EMPTY_STATS, recordAnswer, type Answer } from '../core/stats';
import { DEFAULT_SETTINGS, readSettings, type EarSettings } from './settings';
import {
  DEFAULT_DATA,
  EAR_STORAGE_KEY,
  EAR_STORAGE_VERSION,
  loadEar,
  migrate,
  onStoredChange,
  resetStats,
  saveSettings,
  storeAnswer,
  storeRoundEffect,
  storeWelcomed,
} from './store';

/** A Map behind the KeyValue interface. */
function memory(initial: Record<string, string> = {}): KeyValue & { map: Map<string, string> } {
  const map = new Map(Object.entries(initial));
  return { map, getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v) };
}

const stored = (s: ReturnType<typeof memory>) => JSON.parse(s.map.get(EAR_STORAGE_KEY)!) as unknown;
const NOW = new Date(2026, 9, 14, 12).getTime();
const B3_AS_3: Answer = { mode: 'major', degree: 'b3', answer: '3' };

const E_MINOR: EarSettings = {
  ...DEFAULT_SETTINGS,
  key: { tonic: parseNote('E'), mode: 'minor' },
  degrees: ['1', 'b3', '4', '#4', '5', 'b7'],
  register: 'twoOctaves',
  keyChange: 25,
  context: 'droneOnly',
  resolution: false,
  drone: 'continuous',
  autoNext: true,
  bpm: 120,
  sound: 'clean',
};

describe('defaults', () => {
  it('are A major, root 3rd 5th, the cadence before every question, 90 BPM, guitar, all extras off but resolution', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      key: { tonic: parseNote('A'), mode: 'major' },
      degrees: ['1', '3', '5'],
      register: 'above',
      keyChange: 'fixed',
      context: 'everyQuestion',
      resolution: true,
      drone: 'off',
      autoNext: false,
      bpm: 90,
      sound: 'guitar',
      cadenceForm: 'full',
      droneLevel: 1,
      weakNotes: false,
      showNeck: true,
    });
    expect(DEFAULT_DATA).toEqual({
      version: 2,
      welcomed: false,
      levels: {},
      settings: DEFAULT_SETTINGS,
      stats: EMPTY_STATS,
    });
  });
});

describe('loadEar', () => {
  it.each([
    ['nothing stored', memory()],
    ['corrupt JSON', memory({ [EAR_STORAGE_KEY]: '{"version":1,' })],
    ['not an object', memory({ [EAR_STORAGE_KEY]: '[1,2]' })],
    ['no version', memory({ [EAR_STORAGE_KEY]: JSON.stringify({ settings: E_MINOR }) })],
    [
      'a newer version',
      memory({ [EAR_STORAGE_KEY]: JSON.stringify({ version: 3, settings: E_MINOR }) }),
    ],
    ['version 0', memory({ [EAR_STORAGE_KEY]: JSON.stringify({ version: 0, settings: E_MINOR }) })],
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
    expect(saveSettings(DEFAULT_DATA, E_MINOR, throwing).settings).toEqual(E_MINOR);
  });

  it('round-trips settings and stats', () => {
    const s = memory();
    let data = saveSettings(DEFAULT_DATA, E_MINOR, s);
    data = storeAnswer(data, B3_AS_3, NOW, s);
    data = storeAnswer(data, { mode: 'minor', degree: 'b5', answer: '#4' }, NOW, s);
    expect(stored(s)).toMatchObject({ version: EAR_STORAGE_VERSION });
    expect(loadEar(s)).toEqual(data);
    expect(data.settings).toEqual(E_MINOR);
    expect(data.stats.major.mixups).toEqual({ b3: { '3': 1 } });
    expect(data.stats.minor.degrees).toEqual({ '#4': { asked: 1, right: 1 } });
    expect(data.stats.major.days).toEqual([{ day: '2026-10-14', asked: 1, right: 0 }]);
  });

  it('only ever writes its own key', () => {
    const s = memory({ 'gm.lang': 'vi', 'theory.progress': '{}' });
    storeAnswer(saveSettings(DEFAULT_DATA, E_MINOR, s), B3_AS_3, NOW, s);
    expect([...s.map.keys()].sort()).toEqual(['gm.ear', 'gm.lang', 'theory.progress']);
    expect(s.map.get('gm.lang')).toBe('vi');
  });
});

describe('readSettings: each field on its own', () => {
  it('keeps the good fields and defaults the broken ones', () => {
    const r = readSettings({
      ...E_MINOR,
      register: 'sideways',
      keyChange: 7,
      bpm: 'fast',
      sound: 42,
      drone: 'yes',
    });
    expect(r).toEqual({
      ...E_MINOR,
      register: DEFAULT_SETTINGS.register,
      keyChange: DEFAULT_SETTINGS.keyChange,
      bpm: DEFAULT_SETTINGS.bpm,
      sound: DEFAULT_SETTINGS.sound,
      drone: DEFAULT_SETTINGS.drone,
    });
  });

  it("takes a key only as one of its mode's 12 tonics", () => {
    expect(readSettings({ key: { tonic: parseNote('Eb'), mode: 'minor' } }).key.tonic).toBe(
      MINOR_KEY_TONICS.find((t) => t.letter === 'E' && t.alter === -1),
    );
    for (const key of [
      { tonic: parseNote('D#'), mode: 'major' }, // E♭ major is spelled E♭
      { tonic: parseNote('Gb'), mode: 'minor' }, // F♯ minor
      { tonic: { letter: 'H', alter: 0 }, mode: 'major' },
      { tonic: parseNote('C'), mode: 'dorian' },
      { mode: 'major' },
      'C major',
    ]) {
      expect(readSettings({ key }).key, JSON.stringify(key)).toEqual(DEFAULT_SETTINGS.key);
    }
  });

  it('keeps degree ids once each, in chromatic order; fewer than two valid → the default', () => {
    expect(readSettings({ degrees: ['5', '1', 'b3', '5', 'x', 7] }).degrees).toEqual([
      '1',
      'b3',
      '5',
    ]);
    expect(readSettings({ degrees: ['1', 'nope'] }).degrees).toEqual(DEFAULT_SETTINGS.degrees);
    expect(readSettings({ degrees: 'all' }).degrees).toEqual(DEFAULT_SETTINGS.degrees);
  });

  it('clamps the tempo to the shared limits, 40–200', () => {
    expect(readSettings({ bpm: 10 }).bpm).toBe(40);
    expect(readSettings({ bpm: 999 }).bpm).toBe(200);
    expect(readSettings({ bpm: Infinity }).bpm).toBe(90);
  });

  it('never stores question weights', () => {
    expect(readSettings({ ...E_MINOR, weights: { '3': 4 } })).not.toHaveProperty('weights');
  });
});

describe('migrate: stats', () => {
  it('drops broken stats entries and keeps the rest', () => {
    const data = migrate({
      version: 1,
      settings: E_MINOR,
      stats: {
        major: {
          degrees: {
            '1': { asked: 4, right: 3 },
            '3': { asked: 1, right: 2 },
            b5: { asked: 1, right: 1 },
            '5': 'x',
          },
          mixups: { b3: { '3': 2, b3: 1, '9': 1, '2': -1 }, nope: { '1': 1 } },
          days: [
            { day: '2026-10-12', asked: 2, right: 1 },
            { day: '2026-10-11', asked: 1, right: 1 },
            { day: 'today', asked: 1, right: 1 },
            { day: '2026-10-14', asked: 3, right: 3 },
          ],
          streak: 5,
          bestStreak: 4,
        },
        minor: 'garbage',
      },
    });
    expect(data.settings).toEqual(E_MINOR);
    expect(data.stats.major).toEqual({
      degrees: { '1': { asked: 4, right: 3 } },
      mixups: { b3: { '3': 2 } },
      days: [
        { day: '2026-10-12', asked: 2, right: 1 },
        { day: '2026-10-14', asked: 3, right: 3 },
      ],
      streak: 0,
      bestStreak: 4,
    });
    expect(data.stats.minor).toEqual(EMPTY_STATS.minor);
  });

  it('a missing settings or stats part takes its defaults', () => {
    expect(migrate({ version: 1 })).toEqual(DEFAULT_DATA);
    expect(migrate({ version: 1, settings: E_MINOR }).stats).toEqual(EMPTY_STATS);
  });
});

describe('writes keep what another tab stored', () => {
  it("an answer adds to the stored stats, not to this tab's older copy", () => {
    const s = memory();
    const tabA = saveSettings(DEFAULT_DATA, DEFAULT_SETTINGS, s);
    // Tab B answers twice meanwhile.
    storeAnswer(storeAnswer(loadEar(s), B3_AS_3, NOW, s), B3_AS_3, NOW, s);
    const next = storeAnswer(tabA, B3_AS_3, NOW, s);
    expect(next.stats.major.mixups).toEqual({ b3: { '3': 3 } });
    expect(loadEar(s)).toEqual(next);
  });

  it('new settings keep the stored stats', () => {
    const s = memory();
    const stale = DEFAULT_DATA;
    storeAnswer(DEFAULT_DATA, B3_AS_3, NOW, s);
    expect(saveSettings(stale, E_MINOR, s).stats.major.degrees).toEqual({
      b3: { asked: 1, right: 0 },
    });
  });

  it("with nothing readable stored, builds on this tab's data and saves it", () => {
    const s = memory();
    const mine = { ...DEFAULT_DATA, stats: recordAnswer(EMPTY_STATS, B3_AS_3, '2026-10-13') };
    const next = storeAnswer(mine, B3_AS_3, NOW, s);
    expect(next.stats.major.degrees.b3).toEqual({ asked: 2, right: 0 });
    expect(loadEar(s)).toEqual(next);
  });

  it('never overwrites data a newer version stored', () => {
    const newer = JSON.stringify({ version: 3, settings: { whatever: true } });
    const s = memory({ [EAR_STORAGE_KEY]: newer });
    const next = storeAnswer(DEFAULT_DATA, B3_AS_3, NOW, s);
    expect(next.stats.major.degrees.b3).toEqual({ asked: 1, right: 0 });
    expect(s.map.get(EAR_STORAGE_KEY)).toBe(newer);
  });
});

describe('resetStats', () => {
  it('clears both modes and keeps the settings', () => {
    const s = memory();
    let data = saveSettings(DEFAULT_DATA, E_MINOR, s);
    data = storeAnswer(data, B3_AS_3, NOW, s);
    data = storeAnswer(data, { mode: 'minor', degree: '1', answer: '1' }, NOW, s);
    const reset = resetStats(data, s);
    expect(reset).toEqual({ ...DEFAULT_DATA, settings: E_MINOR });
    expect(loadEar(s)).toEqual(reset);
  });
});

describe('onStoredChange', () => {
  afterEach(() => localStorage.clear());

  it('hands over the stored data when gm.ear changes in another tab, or storage is cleared', () => {
    const s = memory();
    const listener = vi.fn();
    const off = onStoredChange(listener, s);
    saveSettings(DEFAULT_DATA, E_MINOR, s);
    window.dispatchEvent(new StorageEvent('storage', { key: 'gm.lang' }));
    expect(listener).not.toHaveBeenCalled();
    window.dispatchEvent(new StorageEvent('storage', { key: EAR_STORAGE_KEY }));
    expect(listener).toHaveBeenLastCalledWith({ ...DEFAULT_DATA, settings: E_MINOR });
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    expect(listener).toHaveBeenCalledTimes(2);
    off();
    window.dispatchEvent(new StorageEvent('storage', { key: EAR_STORAGE_KEY }));
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("reads the browser's localStorage by default", () => {
    const listener = vi.fn();
    const off = onStoredChange(listener);
    saveSettings(DEFAULT_DATA, E_MINOR);
    window.dispatchEvent(new StorageEvent('storage', { key: EAR_STORAGE_KEY }));
    expect(listener.mock.calls[0]![0].settings).toEqual(E_MINOR);
    off();
  });
});

describe('the beginner levels (version 2)', () => {
  const V1 = { version: 1, settings: E_MINOR, stats: { major: { degrees: { '1': { asked: 2, right: 1 } } } } };

  it('migrates a version 1 payload to a clean version 2: not welcomed, no level played', () => {
    const data = migrate(V1);
    expect(data).toMatchObject({ version: 2, welcomed: false, levels: {} });
    expect(isUnlocked(data.levels, 1)).toBe(true);
    expect(isUnlocked(data.levels, 2)).toBe(false);
    // The old trainer screen keeps its settings and stats until it goes (#257).
    expect(data.settings).toEqual(E_MINOR);
    expect(data.stats.major.degrees['1']).toEqual({ asked: 2, right: 1 });
  });

  it('migrates a stored version 1 payload on the next write, keeping the language out of it', () => {
    const s = memory({ [EAR_STORAGE_KEY]: JSON.stringify(V1), 'gm.lang': 'vi' });
    storeWelcomed(DEFAULT_DATA, s);
    expect(stored(s)).toMatchObject({ version: 2, welcomed: true, levels: {}, settings: { bpm: 120 } });
    expect(stored(s)).not.toHaveProperty('lang');
    expect(s.map.get('gm.lang')).toBe('vi');
  });

  it('reads each level and each field on its own, dropping what is broken', () => {
    const data = migrate({
      version: 2,
      welcomed: 'yes',
      levels: {
        '1': { step: 2, best: 9, done: true, counts: { same: { asked: 4, right: 3 }, maybe: { asked: 1, right: 1 } } },
        '2': { step: 3, best: 11, done: 'true', counts: { higher: { asked: 1, right: 2 }, lower: 'x' } },
        '7': { step: 1.5, best: -1, counts: { notRoot: { asked: 2, right: 2 } } },
        '15': { counts: { '0': { asked: 1, right: 0 }, '13': { asked: 1, right: 1 } } },
        '16': { step: 0 },
        '3': 'garbage',
        nope: {},
      },
    });
    expect(data.welcomed).toBe(false);
    expect(data.levels).toEqual({
      1: { step: 2, best: 9, done: true, counts: { same: { asked: 4, right: 3 } } },
      2: { step: 0, best: 0, done: false, counts: {} },
      7: { step: 0, best: 0, done: false, counts: { notRoot: { asked: 2, right: 2 } } },
      15: { step: 0, best: 0, done: false, counts: { '0': { asked: 1, right: 0 } } },
    });
  });

  it('falls back without throwing on broken payloads', () => {
    for (const levels of [null, 'x', 42, [], [{ step: 1 }], { '1': null }]) {
      expect(migrate({ version: 2, welcomed: true, levels }).levels).toEqual({});
    }
    expect(loadEar(memory({ [EAR_STORAGE_KEY]: '{"version":2,"levels":' }))).toEqual(DEFAULT_DATA);
  });

  it('round-trips the stored data', () => {
    const s = memory();
    let data = storeWelcomed(DEFAULT_DATA, s);
    data = storeRoundEffect(data, 2, { type: 'step', step: 1 }, s);
    data = storeRoundEffect(
      data,
      2,
      { type: 'score', question: { level: 2, step: 1, answer: 'lower', seed: 3 }, answer: 'higher', right: false },
      s,
    );
    data = storeRoundEffect(data, 2, { type: 'end', right: 8, passed: false }, s);
    expect(data).toMatchObject({
      welcomed: true,
      levels: { 2: { step: 1, best: 8, done: false, counts: { lower: { asked: 1, right: 0 } } } },
    });
    expect(loadEar(s)).toEqual(data);
    expect(migrate(JSON.parse(JSON.stringify(data)))).toEqual(data);
  });

  it('writes nothing for effects that are not progress', () => {
    const s = memory();
    expect(storeRoundEffect(DEFAULT_DATA, 1, { type: 'offerEasier' }, s)).toBe(DEFAULT_DATA);
    expect(s.map.size).toBe(0);
  });

  it("builds on another tab's progress", () => {
    const s = memory();
    storeRoundEffect(DEFAULT_DATA, 1, { type: 'end', right: 9, passed: true }, s);
    const next = storeRoundEffect(DEFAULT_DATA, 2, { type: 'step', step: 1 }, s);
    expect(next.levels[1]).toMatchObject({ done: true });
    expect(isUnlocked(loadEar(s).levels, 2)).toBe(true);
  });
});
