import { describe, expect, it } from 'vitest';
import { pluralCategory } from './plural';

describe('pluralCategory', () => {
  it('resolves English cardinal categories: 1 -> one, 2/0 -> other', () => {
    expect(pluralCategory('en', 1)).toBe('one');
    expect(pluralCategory('en', 2)).toBe('other');
    expect(pluralCategory('en', 0)).toBe('other');
  });

  it('resolves Vietnamese cardinal categories: everything -> other (no plural inflection)', () => {
    expect(pluralCategory('vi', 1)).toBe('other');
    expect(pluralCategory('vi', 2)).toBe('other');
    expect(pluralCategory('vi', 0)).toBe('other');
  });

  it('memoizes Intl.PluralRules per tag but still resolves correctly on repeat calls', () => {
    expect(pluralCategory('en', 1)).toBe('one');
    expect(pluralCategory('en', 5)).toBe('other');
    expect(pluralCategory('en', 1)).toBe('one');
  });
});
