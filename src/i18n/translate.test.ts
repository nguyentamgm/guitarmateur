import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTranslator } from './translate';

/** Fixture catalog — standalone so `K` is inferred from these exact keys, not from `en.json`. */
const en: Record<string, string> = {
  'app.greeting': 'Hello, {name}!',
  'app.reordered': '{second} then {first}',
  'app.repeated': '{name} and {name} again',
  'app.fallbackOnly': 'From the fallback catalog',
  'progression.bars.one': '{count} bar',
  'progression.bars.other': '{count} bars',
};

/**
 * Active-locale fixture. `vi` has no plural inflection of its own — `pluralCategory('vi', n)` is
 * always `'other'` — so its `.one` entry is unreachable through `t()`. It exists here so a lookup
 * that wrongly uses the fallback catalog's language (English) for the active locale picks it up.
 */
const viCatalog: Record<string, string> = {
  'progression.bars.one': '{count} thanh (dạng số ít)',
  'progression.bars.other': '{count} thanh',
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
    const t = createTranslator('en', {} as Record<string, string>, {} as Record<string, string>);
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

  it("uses the fallback catalog's own plural rule when the active locale has no such key", () => {
    // `vi` has no `progression.bars` key at all: the English fallback catalog answers, and English
    // is the language whose rule must pick the category — `.other` here would render "1 bars".
    const t = createTranslator('vi', {}, en);
    expect(t('progression.bars', { count: 1 })).toBe('1 bar');
    expect(t('progression.bars', { count: 2 })).toBe('2 bars');
  });

  it("uses the active locale's own plural rule for a key its own catalog carries", () => {
    // Guards the opposite over-correction: routing the ACTIVE locale through the fallback's language
    // would pick `vi.one` for count = 1, which Vietnamese never uses.
    const t = createTranslator('vi', viCatalog, en);
    expect(t('progression.bars', { count: 1 })).toBe('1 thanh');
    expect(t('progression.bars', { count: 2 })).toBe('2 thanh');
  });

  it('resolves the active locale\'s own ".other" form when its language has no plural distinction', () => {
    // Only `.other` is translated. Vietnamese routes every count there, so count = 1 must render the
    // Vietnamese `.other` text rather than reaching past it for English's singular.
    const t = createTranslator('vi', { 'progression.bars.other': '{count} thanh' }, en);
    expect(t('progression.bars', { count: 1 })).toBe('1 thanh');
    expect(t('progression.bars', { count: 2 })).toBe('2 thanh');
  });
});

describe('createTranslator — DEV warnings', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns once for a key missing from both catalogs', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const t = createTranslator('en', {} as Record<string, string>, {} as Record<string, string>);
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
