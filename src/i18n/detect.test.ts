import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, detectLocale } from './detect';

describe('detectLocale', () => {
  it('matches the primary subtag when only a regional tag is offered', () => {
    expect(detectLocale(['en-GB'])).toBe('en');
  });

  it('prefers an exact tag match over an unsupported earlier preference', () => {
    expect(detectLocale(['vi-VN', 'en'])).toBe('en');
  });

  it('falls back to the default locale when nothing is supported', () => {
    expect(detectLocale(['fr'])).toBe(DEFAULT_LOCALE);
  });

  it('falls back to the default locale for an empty preference list', () => {
    expect(detectLocale([])).toBe(DEFAULT_LOCALE);
  });

  it('matches an exact supported tag directly', () => {
    expect(detectLocale(['en'])).toBe('en');
  });
});
