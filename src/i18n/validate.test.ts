import { describe, expect, it } from 'vitest';
import { validateLocale } from './validate';

const en: Record<string, string> = {
  'common.share': 'Share',
  'app.greeting': 'Hello, {name}!',
  'progression.bars.one': '{count} bar',
  'progression.bars.other': '{count} bars',
};

describe('validateLocale', () => {
  it('reports a clean locale as defect-free', () => {
    expect(validateLocale('en', en, en)).toEqual({
      missing: [],
      unknown: [],
      placeholderMismatch: [],
      missingPluralForms: [],
    });
  });

  it('reports keys present in the reference but absent from the candidate', () => {
    const candidate = Object.fromEntries(Object.entries(en).filter(([key]) => key !== 'common.share'));
    const report = validateLocale('en', candidate, en);
    expect(report.missing).toEqual(['common.share']);
    expect(report.unknown).toEqual([]);
  });

  it('reports keys present in the candidate but absent from the reference', () => {
    const candidate = { ...en, 'common.extra': 'Not in en' };
    const report = validateLocale('en', candidate, en);
    expect(report.unknown).toEqual(['common.extra']);
    expect(report.missing).toEqual([]);
  });

  it('reports a placeholder set mismatch for a shared key', () => {
    const candidate = { ...en, 'app.greeting': 'Xin chào {person}!' };
    const report = validateLocale('en', candidate, en);
    expect(report.placeholderMismatch).toEqual([{ key: 'app.greeting', expected: ['name'], actual: ['person'] }]);
  });

  it('reports plural categories the tag requires that the reference never even had', () => {
    // Polish needs one/few/many/other; `en` (and this fully-parity candidate) only defines one/other.
    const report = validateLocale('pl', { ...en }, en);
    expect(report.missing).toEqual([]);
    expect(report.unknown).toEqual([]);
    expect(report.placeholderMismatch).toEqual([]);
    expect(report.missingPluralForms.sort()).toEqual(['progression.bars.few', 'progression.bars.many']);
  });

  it('does not flag a plural form the candidate already supplies', () => {
    const report = validateLocale('en', en, en);
    expect(report.missingPluralForms).toEqual([]);
  });
});
