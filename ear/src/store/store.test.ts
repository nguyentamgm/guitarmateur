import { afterEach, describe, expect, it, vi } from 'vitest';
import { MINOR_KEY_TONICS, parseNote } from '@shared/core/music';
import type { KeyValue } from '@shared/platform/storage';
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
    });
    expect(DEFAULT_DATA).toEqual({ version: 1, settings: DEFAULT_SETTINGS, stats: EMPTY_STATS });
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
      memory({ [EAR_STORAGE_KEY]: JSON.stringify({ version: 2, settings: E_MINOR }) }),
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
    const newer = JSON.stringify({ version: 2, settings: { whatever: true } });
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
    expect(reset).toEqual({ version: 1, settings: E_MINOR, stats: EMPTY_STATS });
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
    expect(listener).toHaveBeenLastCalledWith({
      version: 1,
      settings: E_MINOR,
      stats: EMPTY_STATS,
    });
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
