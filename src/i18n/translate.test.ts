import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Messages } from './types';
import { createTranslator } from './translate';

const en: Messages = {
  'app.greeting': 'Hello, {name}!',
  'app.reordered': '{second} then {first}',
  'app.repeated': '{name} and {name} again',
  'app.fallbackOnly': 'From the fallback catalog',
  'progression.bars.one': '{count} bar',
  'progression.bars.other': '{count} bars',
};

describe('createTranslator — interpolation', () => {
  const t = createTranslator('en', en, en);

  it('substitutes a named placeholder', () => {
    expect(t('app.greeting', { name: 'Ana' })).toBe('Hello, Ana!');
  });

  it('substitutes placeholders regardless of declaration order', () => {
    expect(t('app.reordered', { first: 'A', second: 'B' })).toBe('B then A');
  });

  it('substitutes a placeholder repeated multiple times in one template', () => {
    expect(t('app.repeated', { name: 'Ana' })).toBe('Ana and Ana again');
  });
});

describe('createTranslator — fallback chain', () => {
  it('falls back to the fallback catalog when the active locale lacks the key', () => {
    const t = createTranslator('en', {}, en);
    expect(t('app.fallbackOnly')).toBe('From the fallback catalog');
  });

  it('returns the raw key when neither catalog has it', () => {
    const t = createTranslator('en', {}, {});
    expect(t('does.not.exist')).toBe('does.not.exist');
  });
});

describe('createTranslator — plural routing', () => {
  const t = createTranslator('en', en, en);

  it('resolves the singular category for count = 1', () => {
    expect(t('progression.bars', { count: 1 })).toBe('1 bar');
  });

  it('resolves the plural category for count = 2', () => {
    expect(t('progression.bars', { count: 2 })).toBe('2 bars');
  });

  it('resolves the plural category for count = 0', () => {
    expect(t('progression.bars', { count: 0 })).toBe('0 bars');
  });
});

describe('createTranslator — DEV warnings', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns once for a key missing from both catalogs', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const t = createTranslator('en', {}, {});
    t('does.not.exist');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('does.not.exist'));
  });

  it('warns and leaves the placeholder literal when a param is not supplied', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const t = createTranslator('en', en, en);
    expect(t('app.greeting')).toBe('Hello, {name}!');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('name'));
  });
});
