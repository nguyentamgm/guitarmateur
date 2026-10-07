/**
 * Theory's languages. English is the primary language and always the default; Vietnamese is
 * chosen explicitly and remembered under Theory's own storage key (never the practice app's).
 */
import { browserStorage, type KeyValue } from '../platform/storage';

export type Lang = 'en' | 'vi';
export const LANGS: readonly Lang[] = ['en', 'vi'];
export const DEFAULT_LANG: Lang = 'en';
export const LANG_STORAGE_KEY = 'theory.lang';


export const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);

/** The remembered language, or English. Never throws. */
export function loadLang(storage: KeyValue | null = browserStorage()): Lang {
  try {
    const v = storage?.getItem(LANG_STORAGE_KEY);
    return isLang(v) ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

/** Remember a language. A storage failure only means it is not remembered. */
export function saveLang(lang: Lang, storage: KeyValue | null = browserStorage()): void {
  try {
    storage?.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Private mode or blocked storage: the choice lasts for this visit only.
  }
}

/** Fill `{name}` placeholders. A missing value is left visible so a test can catch it. */
export function fill(template: string, vars: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}
