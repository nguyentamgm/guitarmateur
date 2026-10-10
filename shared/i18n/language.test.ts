import { describe, expect, it } from 'vitest';
import { LANG_STORAGE_KEY, detectLanguage, loadStoredLanguage, saveStoredLanguage } from './language';

type L = 'en' | 'vi';
const isL = (v: unknown): v is L => v === 'en' || v === 'vi';
const detect = (p: readonly string[]) => detectLanguage<L>(p, ['en', 'vi'], 'en');

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

describe('detectLanguage', () => {
  it('prefers an exact tag anywhere over a regional one', () => {
    expect(detect(['vi-VN', 'en'])).toBe('en');
    expect(detect(['vi-VN', 'fr'])).toBe('vi');
    expect(detect(['EN-gb'])).toBe('en');
    expect(detect(['fr'])).toBe('en');
    expect(detect([])).toBe('en');
  });
});

describe('the shared language key', () => {
  it('is gm.lang, read before any old key', () => {
    expect(LANG_STORAGE_KEY).toBe('gm.lang');
    expect(loadStoredLanguage(memory({ 'gm.lang': 'en', 'theory.lang': 'vi' }), isL)).toBe('en');
  });

  it("carries an old choice over: Theory's first, then the practice state, and saves it", () => {
    const both = memory({ 'theory.lang': 'vi', 'guitarmateur-state': JSON.stringify({ language: 'en' }) });
    expect(loadStoredLanguage(both, isL)).toBe('vi');
    expect(both.data['gm.lang']).toBe('vi');
    const practice = memory({ 'guitarmateur-state': JSON.stringify({ language: 'vi' }) });
    expect(loadStoredLanguage(practice, isL)).toBe('vi');
    expect(loadStoredLanguage(memory({ 'guitarmateur-state': '{oops' }), isL)).toBeNull();
  });

  it('ignores garbage and never throws', () => {
    expect(loadStoredLanguage(memory({ 'gm.lang': 'klingon' }), isL)).toBeNull();
    expect(loadStoredLanguage(null, isL)).toBeNull();
    expect(loadStoredLanguage(broken, isL)).toBeNull();
    expect(() => saveStoredLanguage('vi', broken)).not.toThrow();
  });

  it('writes only on a change', () => {
    let writes = 0;
    const store = { ...memory({ 'gm.lang': 'vi' }), setItem: () => void writes++ };
    saveStoredLanguage('vi', store);
    expect(writes).toBe(0);
    saveStoredLanguage('en', store);
    expect(writes).toBe(1);
  });
});
