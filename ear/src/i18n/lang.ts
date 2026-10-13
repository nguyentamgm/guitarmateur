/**
 * The ear trainer's languages. The setting is the one the other pages use (`gm.lang`, see
 * shared/i18n/language.ts): with nothing stored, the browser's languages decide; English is the
 * fallback.
 */
import { LANG_STORAGE_KEY, detectLanguage, loadStoredLanguage, saveStoredLanguage } from '@shared/i18n/language';
import { browserLanguages } from '@shared/platform/languages';
import { browserStorage, type KeyValue } from '@shared/platform/storage';

export type Lang = 'en' | 'vi';
export const LANGS: readonly Lang[] = ['en', 'vi'];
export const DEFAULT_LANG: Lang = 'en';
export { LANG_STORAGE_KEY };

export const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);

/** The stored language (shared with the other pages), else the browser's. Never throws. */
export function loadLang(
  storage: KeyValue | null = browserStorage(),
  preferred: readonly string[] = browserLanguages(),
): Lang {
  return loadStoredLanguage(storage, isLang) ?? detectLanguage(preferred, LANGS, DEFAULT_LANG);
}

/** The language a link asks for (`?lang=vi`), or null: for that visit only, not remembered. */
export function linkLang(search: string): Lang | null {
  const v = new URLSearchParams(search).get('lang');
  return isLang(v) ? v : null;
}

/** Remember a language for every page. A storage failure only means it is not remembered. */
export function saveLang(lang: Lang, storage: KeyValue | null = browserStorage()): void {
  saveStoredLanguage(lang, storage);
}

/** Fill `{name}` placeholders. A missing value is left visible so a test can catch it. */
export function fill(template: string, vars: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => (name in vars ? String(vars[name]) : whole));
}
