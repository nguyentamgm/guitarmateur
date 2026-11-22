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

/** Reads the raw ticks, including entries this version cannot interpret. */
function readEnvelope(raw: string | null): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(raw ?? 'null');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const env = parsed as Record<string, unknown>;
    if (env.v !== 1) return {};
    if (!env.ticks || typeof env.ticks !== 'object' || Array.isArray(env.ticks)) return {};
    return env.ticks as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** Keep edits by checkbox until they can be written alongside the latest saved ticks. */
export function createSessionProgress(storage: KeyValue | null = browserStorage()) {
  let stored: Record<string, unknown> = {};
  let canWrite = false;
  const pending = new Map<string, Map<number, boolean>>();

  function load(): SessionTicks {
    try {
      if (storage) {
        stored = readEnvelope(storage.getItem(SESSIONS_STORAGE_KEY));
        canWrite = true;
      }
    } catch {
      // Keep the last readable copy if storage is temporarily blocked.
      canWrite = false;
    }
    const ticks = parseTicks(stored);
    for (const [slug, edits] of pending) {
      const checked = new Set(ticks[slug]);
      for (const [index, value] of edits) {
        if (value) checked.add(index);
        else checked.delete(index);
      }
      ticks[slug] = [...checked].sort((a, b) => a - b);
    }
    return ticks;
  }

  function toggle(slug: string, index: number): SessionTicks {
    const nextTicks = toggleTick(load(), slug, index);
    const edits = pending.get(slug) ?? new Map<number, boolean>();
    edits.set(index, nextTicks[slug]!.includes(index));
    pending.set(slug, edits);
    if (storage && canWrite) {
      const nextStored = { ...stored };
      for (const changed of pending.keys()) nextStored[changed] = nextTicks[changed];
      try {
        storage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify({ v: 1, ticks: nextStored }));
        stored = nextStored;
        pending.clear();
      } catch {
        // Subsequent ticks and reads still include the pending edits.
      }
    }
    return nextTicks;
  }

  return { load, toggle };
}
