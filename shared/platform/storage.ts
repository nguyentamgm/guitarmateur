/**
 * The browser's localStorage, reached safely — the one accessor both apps use. Code that stores
 * something takes a `KeyValue` parameter (defaulting to `browserStorage()`), so tests pass a map.
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
