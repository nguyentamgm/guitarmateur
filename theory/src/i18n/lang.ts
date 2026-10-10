/**
 * Theory's languages. One language setting is shared with the practice app: both read and write
 * `gm.lang` (each with its own code — the apps share none). Before that key existed each app kept its
 * own, so a first load copies the old choice over: Theory's first (it was only ever stored on an
 * explicit choice), then the practice app's (which also stored its detected default).
 * With nothing stored, the browser's languages decide; English is the fallback.
 */
import { browserLanguages } from '../platform/languages';
import { browserStorage, type KeyValue } from '../platform/storage';

export type Lang = 'en' | 'vi';
export const LANGS: readonly Lang[] = ['en', 'vi'];
export const DEFAULT_LANG: Lang = 'en';
/** The language key both apps share. */
export const LANG_STORAGE_KEY = 'gm.lang';
/** Where the language lived before it was shared: Theory's own key and the practice app's state. */
export const LEGACY_THEORY_LANG_KEY = 'theory.lang';
export const LEGACY_PRACTICE_STATE_KEY = 'guitarmateur-state';

export const isLang = (v: unknown): v is Lang => LANGS.includes(v as Lang);

/**
 * Pick a language from the browser's, most preferred first, the way the practice app does so both
 * agree: an exact tag anywhere in the list wins over a regional one (`vi-VN` → `vi`); else English.
 */
export function detectLang(preferred: readonly string[] = browserLanguages()): Lang {
  const tags = preferred.map((t) => String(t).toLowerCase());
  const exact = tags.find(isLang);
  if (exact) return exact;
  const regional = tags.map((t) => t.split('-')[0]).find(isLang);
  return regional ?? DEFAULT_LANG;
}

/** The language the practice app kept inside its saved state, if any. */
function practiceLang(storage: KeyValue): Lang | null {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(LEGACY_PRACTICE_STATE_KEY) ?? 'null');
    const v = (parsed as Record<string, unknown> | null)?.language;
    return isLang(v) ? v : null;
  } catch {
    return null;
  }
}

/**
 * The shared language; else one remembered under an old key (then copied to the shared key);
 * else the browser's. Never throws.
 */
export function loadLang(
  storage: KeyValue | null = browserStorage(),
  preferred: readonly string[] = browserLanguages(),
): Lang {
  try {
    if (!storage) return detectLang(preferred);
    const shared = storage.getItem(LANG_STORAGE_KEY);
    if (isLang(shared)) return shared;
    const theory = storage.getItem(LEGACY_THEORY_LANG_KEY);
    const old = (isLang(theory) ? theory : null) ?? practiceLang(storage);
    if (old) {
      saveLang(old, storage);
      return old;
    }
  } catch {
    // Blocked storage: fall through to the browser's languages.
  }
  return detectLang(preferred);
}

/** Remember a language for both apps. A storage failure only means it is not remembered. */
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
