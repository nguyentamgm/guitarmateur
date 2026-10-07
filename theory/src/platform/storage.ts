/**
 * The browser's localStorage, reached safely. The one place Theory touches it: i18n (the language)
 * and ui (progress, tempos, the practice-app link) both go through here.
 */

export type KeyValue = Pick<Storage, 'getItem' | 'setItem'>;

/** The browser's localStorage, or null when there is none or site data is blocked. Never throws. */
export function browserStorage(): KeyValue | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null; // Accessing localStorage itself throws when site data is blocked.
  }
}
