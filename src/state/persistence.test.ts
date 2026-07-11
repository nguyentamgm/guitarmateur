import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TONICS } from '../music';
import { defaultState } from './appState';
import { migrate, saveState, loadState } from './persistence';

const STORAGE_KEY = 'guitarmateur-state';

const A = TONICS.find((t) => t.letter === 'A' && t.alter === 0)!;

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  localStorage.clear();
});

describe('persistence', () => {
  it('save + load round-trips state (minus ui)', () => {
    const state = defaultState(() => 42);
    saveState(state);
    const loaded = loadState()!;
    expect(loaded.schemaVersion).toBe(3);
    expect(loaded.key.tonic).toEqual(state.key.tonic);
    expect(loaded.positions).toEqual(state.positions);
    expect(loaded.level).toBe(state.level);
    expect(loaded.targetRole).toBe(state.targetRole);
    expect(loaded.progression.length).toBe(state.progression.length);
    // UI is not persisted
    expect(loaded.ui.advancedOpen).toBe(false);
  });

  it('corrupt JSON returns defaults', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json');
    // loadState catches the parse error and returns null
    const loaded = loadState();
    expect(loaded).toBeNull();
  });

  it('migrate handles missing fields with defaults', () => {
    const loaded = migrate({});
    const fallback = defaultState();
    expect(loaded.schemaVersion).toBe(3);
    expect(loaded.key.tonic).toEqual(fallback.key.tonic);
    expect(loaded.level).toBe(fallback.level);
    expect(loaded.targetRole).toBe(fallback.targetRole);
  });

  it('migrates a v2 payload to v3 with default tempo and per-entry bars', () => {
    const v2 = {
      schemaVersion: 2,
      tuningId: 'standard',
      key: { tonic: A, scaleId: 'minorPentatonic' },
      positions: [],
      // v2 entries have no `bars` field
      progression: [{ id: 'x', chord: { tonic: A, quality: 'm' }, lickSeed: 7 }],
      level: 3,
      targetRole: '3',
      resolveToNext: true,
    };
    const loaded = migrate(v2);
    expect(loaded.schemaVersion).toBe(3);
    // Existing user choices survive the migration...
    expect(loaded.level).toBe(3);
    expect(loaded.targetRole).toBe('3');
    expect(loaded.resolveToNext).toBe(true);
    expect(loaded.progression[0]!.lickSeed).toBe(7);
    // ...and the new v3 fields are defaulted.
    expect(loaded.tempoBpm).toBe(90);
    expect(loaded.progression[0]!.bars).toBe(1);
  });

  it('clamps an out-of-range persisted tempo', () => {
    const loaded = migrate({ tempoBpm: 5000 });
    expect(loaded.tempoBpm).toBe(200);
  });

  it('migrate validates positions against actual positions for the key', () => {
    const raw = {
      schemaVersion: 2,
      tuningId: 'standard',
      key: { tonic: A, scaleId: 'minorPentatonic' },
      positions: [999], // invalid — no such position
      progression: [],
      level: 2,
      targetRole: 'R',
      resolveToNext: false,
    };
    const loaded = migrate(raw);
    // Should fall back to a valid single position
    expect(loaded.positions.length).toBe(1);
    expect(loaded.positions[0]).not.toBe(999);
  });

  it('migrate validates level in 1-5', () => {
    const raw = {
      schemaVersion: 2,
      tuningId: 'standard',
      key: { tonic: A, scaleId: 'minorPentatonic' },
      positions: [],
      progression: [],
      level: 7,
      targetRole: 'R',
      resolveToNext: false,
    };
    const loaded = migrate(raw);
    expect(loaded.level).toBe(2); // default
  });

  it('migrate validates targetRole', () => {
    const raw = {
      schemaVersion: 2,
      tuningId: 'standard',
      key: { tonic: A, scaleId: 'minorPentatonic' },
      positions: [],
      progression: [],
      level: 2,
      targetRole: 'bogus',
      resolveToNext: false,
    };
    const loaded = migrate(raw);
    expect(loaded.targetRole).toBe('R'); // default
  });

  it('saveState writes schemaVersion in the payload', () => {
    const state = defaultState(() => 0);
    saveState(state);
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(raw.schemaVersion).toBe(3);
    expect(raw.tempoBpm).toBe(90);
  });
});
