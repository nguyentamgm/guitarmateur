/**
 * Session progress: "I can do this" ticks by session slug, kept in `theory.sessions`
 * in localStorage. Pure functions plus a storage boundary that never throws.
 * "Done" is derived from ticks and the number of boxes; it is never stored.
 */
import { browserStorage, type KeyValue } from '../platform/storage';
import type { Session } from '../sessions';

export const SESSIONS_STORAGE_KEY = 'theory.sessions';

/** Indexes of the "I can do this" boxes ticked, by session slug. */
export type SessionTicks = Readonly<Record<string, readonly number[]>>;

const isNonNegativeInteger = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0;

/** Pure; indexes sorted, no repeats. */
export function toggleTick(ticks: SessionTicks, slug: string, index: number): SessionTicks {
  const current = ticks[slug] ?? [];
  const exists = current.includes(index);
  const nextList = exists ? current.filter((i) => i !== index) : [...current, index];
  const sorted = [...new Set(nextList)].sort((a, b) => a - b);
  return { ...ticks, [slug]: sorted };
}

/** Every index 0..boxes-1 ticked, boxes > 0. */
export function isDone(ticks: SessionTicks, slug: string, boxes: number): boolean {
  if (boxes <= 0) return false;
  const current = ticks[slug];
  if (!current || current.length < boxes) return false;
  for (let i = 0; i < boxes; i++) {
    if (!current.includes(i)) return false;
  }
  return true;
}

/** First session not done, in order. */
export function nextSession(ticks: SessionTicks, sessions: readonly Session[]): Session | undefined {
  return sessions.find((s) => !isDone(ticks, s.slug, s.copy.en.canDo.length));
}

/** Validates ticks object, dropping entries that are not arrays of non-negative integers. */
function parseTicks(rawTicks: unknown): Record<string, readonly number[]> {
  if (!rawTicks || typeof rawTicks !== 'object' || Array.isArray(rawTicks)) return {};
  const out: Record<string, readonly number[]> = {};
  for (const [slug, val] of Object.entries(rawTicks)) {
    if (Array.isArray(val) && val.every(isNonNegativeInteger)) {
      out[slug] = [...new Set(val)].sort((a, b) => a - b);
    }
  }
  return out;
}

/** Reads the raw stored envelope as is, or null if missing/corrupt/wrong version. */
function readEnvelope(storage: KeyValue | null): { v: number; ticks: Record<string, unknown> } | null {
  try {
    const raw = storage?.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const env = parsed as Record<string, unknown>;
    if (env.v !== 1) return null;
    if (!env.ticks || typeof env.ticks !== 'object' || Array.isArray(env.ticks)) return null;
    return { v: 1, ticks: env.ticks as Record<string, unknown> };
  } catch {
    return null;
  }
}

/** Stored ticks; corrupt, missing, wrong version, or broken entries dropped. Never throws. */
export function loadTicks(storage: KeyValue | null = browserStorage()): SessionTicks {
  const env = readEnvelope(storage);
  if (!env) return {};
  return parseTicks(env.ticks);
}

/**
 * Toggle one tick in storage and return the new ticks.
 * Reads storage first (so another tab's ticks are kept), toggles, writes back
 * keeping slugs it does not know, returns the new ticks. A storage failure is swallowed.
 */
export function storeToggle(
  slug: string,
  index: number,
  storage: KeyValue | null = browserStorage(),
): SessionTicks {
  const currentTicks = loadTicks(storage);
  const nextTicks = toggleTick(currentTicks, slug, index);
  try {
    const env = readEnvelope(storage);
    const rawTicks = env?.ticks ?? {};
    const updatedRawTicks = { ...rawTicks, [slug]: nextTicks[slug] };
    storage?.setItem(SESSIONS_STORAGE_KEY, JSON.stringify({ v: 1, ticks: updatedRawTicks }));
  } catch {
    // Private mode, full or blocked storage: ticks last for this visit only.
  }
  return nextTicks;
}
