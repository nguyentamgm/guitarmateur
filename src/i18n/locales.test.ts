import { describe, expect, it } from 'vitest';
import { CHORD_QUALITIES } from '../music/chord';
import { SCALES } from '../music/scales';
import { TUNINGS } from '../fretboard/tuning';
import { LOCALES, MESSAGES, isLocaleId } from './index';
import { validateLocale } from './validate';
import type { LocaleId } from './types';

const reference = MESSAGES.en;

describe('locale catalogs', () => {
  it('every shipped locale is a clean translation of en', () => {
    for (const [id, meta] of Object.entries(LOCALES) as [LocaleId, { tag: string }][]) {
      const report = validateLocale(meta.tag, MESSAGES[id] as Record<string, string>, reference);
      expect(
        report,
        `${id}: missing=${report.missing.join(',')} unknown=${report.unknown.join(',')} placeholder=${report.placeholderMismatch
          .map((m) => m.key)
          .join(',')} pluralForms=${report.missingPluralForms.join(',')}`,
      ).toEqual({ missing: [], unknown: [], placeholderMismatch: [], missingPluralForms: [] });
    }
  });

  it('engine registry display names match the en catalog (drift guard)', () => {
    for (const id of Object.keys(SCALES)) {
      expect(reference[`scale.${id}` as keyof typeof reference]).toBe(SCALES[id as keyof typeof SCALES]!.name);
    }
    for (const id of Object.keys(CHORD_QUALITIES)) {
      expect(reference[`quality.${id}` as keyof typeof reference]).toBe(
        CHORD_QUALITIES[id as keyof typeof CHORD_QUALITIES]!.name,
      );
    }
    for (const id of Object.keys(TUNINGS)) {
      expect(reference[`tuning.${id}` as keyof typeof reference]).toBe(TUNINGS[id as keyof typeof TUNINGS]!.name);
    }
  });

  it('isLocaleId accepts every shipped locale and rejects garbage', () => {
    for (const id of Object.keys(LOCALES)) {
      expect(isLocaleId(id)).toBe(true);
    }
    expect(isLocaleId('fr')).toBe(false);
    expect(isLocaleId('')).toBe(false);
    expect(isLocaleId(undefined)).toBe(false);
    expect(isLocaleId(42)).toBe(false);
  });
});
