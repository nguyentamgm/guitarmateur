/**
 * Where a solo take lives outside the page: the last one in this browser (`theory.take`), and a
 * link that carries one (`/theory/solo?take=…#record`). The code itself is `encodeTake()`.
 */
import { decodeTake, encodeTake, type SavedTake } from '../lessons/solo';
import { browserStorage, type KeyValue } from '../platform/storage';

export const TAKE_STORAGE_KEY = 'theory.take';
export const TAKE_PARAM = 'take';

/** The take to open with: a shared link first, then the last one saved here. Never throws. */
export function initialTake(search: string = window.location.search, storage: KeyValue | null = browserStorage()): { saved: SavedTake; from: 'link' | 'stored' } | null {
  try {
    const shared = new URLSearchParams(search).get(TAKE_PARAM);
    const fromLink = shared ? decodeTake(shared) : null;
    if (fromLink) return { saved: fromLink, from: 'link' };
    const stored = storage?.getItem(TAKE_STORAGE_KEY);
    const fromStore = stored ? decodeTake(stored) : null;
    return fromStore && fromStore.take.length > 0 ? { saved: fromStore, from: 'stored' } : null;
  } catch {
    return null;
  }
}

/** Remember a take (or forget it with null). A storage failure only means it is not remembered. */
export function storeTake(saved: SavedTake | null, storage: KeyValue | null = browserStorage()): void {
  try {
    storage?.setItem(TAKE_STORAGE_KEY, saved && saved.take.length > 0 ? encodeTake(saved) : '');
  } catch {
    // Private mode, full or blocked storage: the take lasts for this visit only.
  }
}

/** A link that opens step 6 of the solo lesson on this take. */
export const takeLink = (saved: SavedTake, origin: string = window.location.origin): string =>
  `${origin}/theory/solo?${TAKE_PARAM}=${encodeURIComponent(encodeTake(saved))}#record`;
