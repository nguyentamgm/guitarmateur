/**
 * The one language setting both apps share (Practice in src/, Theory in theory/): where it is
 * stored, how an old per-app choice is carried over, and how the browser's languages are matched.
 * Pure TypeScript: storage is passed in (shared/platform/storage.ts has the safe accessor).
 */
import type { KeyValue } from '../platform/storage';

/** The localStorage key both apps read and write. */
export const LANG_STORAGE_KEY = 'gm.lang';
/** Where Theory kept its language before it was shared. */
export const LEGACY_THEORY_LANG_KEY = 'theory.lang';
/**
 * The practice app's saved state. It still holds a `language` (its schema has one), read here only
 * to carry over a choice made before `gm.lang` existed.
 */
export const PRACTICE_STATE_KEY = 'guitarmateur-state';

/**
 * Pick a supported language from the browser's, most preferred first: an exact tag anywhere in the
 * list wins over a regional one (`vi-VN` → `vi`); otherwise `fallback`.
 */
export function detectLanguage<L extends string>(
  preferred: readonly string[],
  supported: readonly L[],
  fallback: L,
): L {
  const isSupported = (tag: string): tag is L => (supported as readonly string[]).includes(tag);
  const tags = preferred.map((t) => String(t).toLowerCase());
  const exact = tags.find(isSupported);
  if (exact) return exact;
  return tags.map((t) => t.split('-')[0]!).find(isSupported) ?? fallback;
}

/** The language inside the practice app's saved state, if readable and valid. */
function practiceStateLanguage<L extends string>(storage: KeyValue, isValid: (v: unknown) => v is L): L | null {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(PRACTICE_STATE_KEY) ?? 'null');
    const v = (parsed as Record<string, unknown> | null)?.language;
    return isValid(v) ? v : null;
  } catch {
    return null;
  }
}

/**
 * The stored language, or null. The shared key first; before it existed, Theory's old key (only
 * ever an explicit choice), then the practice app's saved state (which also held its detected
 * default). An old choice found this way is copied to the shared key. Never throws.
 */
export function loadStoredLanguage<L extends string>(
  storage: KeyValue | null,
  isValid: (v: unknown) => v is L,
): L | null {
  if (!storage) return null;
  try {
    const shared = storage.getItem(LANG_STORAGE_KEY);
    if (isValid(shared)) return shared;
    const theory = storage.getItem(LEGACY_THEORY_LANG_KEY);
    const old = (isValid(theory) ? theory : null) ?? practiceStateLanguage(storage, isValid);
    if (old) saveStoredLanguage(old, storage);
    return old;
  } catch {
    return null;
  }
}

/** Remember the language for both apps. A storage failure only means it is not remembered. */
export function saveStoredLanguage(lang: string, storage: KeyValue | null): void {
  if (!storage) return;
  let current: string | null = null;
  try {
    current = storage.getItem(LANG_STORAGE_KEY);
  } catch {
    // unreadable: write anyway
  }
  if (current === lang) return;
  try {
    storage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Private mode or blocked storage: the choice lasts for this visit only.
  }
}
