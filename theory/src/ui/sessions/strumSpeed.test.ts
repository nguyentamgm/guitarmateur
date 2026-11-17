import { describe, expect, it } from 'vitest';
import {
  loadStrumSpeed,
  saveStrumSpeed,
  STRUM_SPEEDS,
  STRUM_SPEED_STORAGE_KEY,
  STRUM_SPREADS,
  type StrumSpeed,
} from './strumSpeed';

const memory = (init: Record<string, string> = {}) => {
  const data = { ...init };
  return {
    data,
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
};

const broken = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

describe('strumSpeed', () => {
  it('defines speeds slow, medium, fast with rising spread rates', () => {
    expect(STRUM_SPEEDS).toEqual(['slow', 'medium', 'fast']);
    expect(STRUM_SPREADS.slow).toBeGreaterThan(STRUM_SPREADS.medium);
    expect(STRUM_SPREADS.medium).toBeGreaterThan(STRUM_SPREADS.fast);
  });

  it('defaults to medium when storage is empty or null', () => {
    expect(loadStrumSpeed(null)).toBe('medium');
    expect(loadStrumSpeed(memory())).toBe('medium');
  });

  it('loads valid saved speeds from storage', () => {
    expect(loadStrumSpeed(memory({ [STRUM_SPEED_STORAGE_KEY]: 'slow' }))).toBe('slow');
    expect(loadStrumSpeed(memory({ [STRUM_SPEED_STORAGE_KEY]: 'fast' }))).toBe('fast');
  });

  it('falls back to medium on invalid storage values', () => {
    expect(loadStrumSpeed(memory({ [STRUM_SPEED_STORAGE_KEY]: 'turbo' }))).toBe('medium');
  });

  it('saves strum speed to storage', () => {
    const store = memory();
    saveStrumSpeed('slow' as StrumSpeed, store);
    expect(store.data[STRUM_SPEED_STORAGE_KEY]).toBe('slow');
    expect(loadStrumSpeed(store)).toBe('slow');
  });

  it('never throws on blocked or throwing storage', () => {
    expect(loadStrumSpeed(broken)).toBe('medium');
    expect(() => saveStrumSpeed('fast', broken)).not.toThrow();
  });
});
