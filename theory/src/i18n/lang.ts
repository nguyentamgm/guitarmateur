/**
 * Theory's languages. One language setting is shared with the practice app (`gm.lang`); where it is
 * stored, how an old per-app choice is carried over and how the browser's languages are matched
 * live in shared/i18n/language.ts. With nothing stored, the browser's languages decide; English is
 * the fallback.
 */
import { LANG_STORAGE_KEY, detectLanguage, loadStoredLanguage, saveStoredLanguage } from '@shared/i18n/language';
import { browserLanguages } from '../platform/languages';
import { browserStorage, type KeyValue } from '../platform/storage';

export type Lang = 'en' | 'vi';
export const LANGS: readonly Lang[] = ['en', 'vi'];
export const DEFAULT_LANG: Lang = 'en';
/** The language key both apps share. */
export { LANG_STORAGE_KEY };

export const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);

/** Pick a language from the browser's, the same way the practice app does. */
export function detectLang(preferred: readonly string[] = browserLanguages()): Lang {
  return detectLanguage(preferred, LANGS, DEFAULT_LANG);
}

/** The shared language (or an old per-app one, carried over); else the browser's. Never throws. */
export function loadLang(
  storage: KeyValue | null = browserStorage(),
  preferred: readonly string[] = browserLanguages(),
): Lang {
  return loadStoredLanguage(storage, isLang) ?? detectLang(preferred);
}

/** Remember a language for both apps. A storage failure only means it is not remembered. */
export function saveLang(lang: Lang, storage: KeyValue | null = browserStorage()): void {
  saveStoredLanguage(lang, storage);
}

/** Fill `{name}` placeholders. A missing value is left visible so a test can catch it. */
export function fill(template: string, vars: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}
