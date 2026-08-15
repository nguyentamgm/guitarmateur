import type { LocaleId, LocaleMeta, Messages } from '../types';
import en from './en.json';

/** The `en` catalog is the schema every other locale must satisfy (`TranslationKey`). */
export const MESSAGES: Readonly<Record<LocaleId, Partial<Messages>>> = { en };

export const LOCALES: Readonly<Record<LocaleId, LocaleMeta>> = {
  en: { id: 'en', endonym: 'English', tag: 'en' },
};
