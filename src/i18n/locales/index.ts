import type { LocaleId, LocaleMeta, Messages } from '../types';
import en from './en.json';

/** The `en` catalog is the schema every other locale must satisfy (`TranslationKey`). */
export const MESSAGES: Readonly<Record<LocaleId, Partial<Messages>>> = { en };

export const LOCALES: Readonly<Record<LocaleId, LocaleMeta>> = {
  en: { id: 'en', endonym: 'English', tag: 'en' },
};

/** Type guard for a shipped locale id, e.g. validating a persisted or user-supplied value. */
export function isLocaleId(x: unknown): x is LocaleId {
  return typeof x === 'string' && x in LOCALES;
}
