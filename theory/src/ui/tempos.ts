/**
 * Drill tempos remembered across visits: the last tempo set and the best, the fastest tempo at
 * which a whole round was played. Kept under Theory's own key, like quiz progress.
 */
import { clampBpm } from '../core/rhythm';
import { browserStorage, type KeyValue } from './storage';

export const DRILLS = ['rhythm-fingers', 'pentatonic-sequences', 'three-per-string-triplets'] as const;
export type DrillId = (typeof DRILLS)[number];

export interface DrillTempo {
  readonly last: number;
  /** Fastest tempo of a finished round; 0 before the first. */
  readonly best: number;
}

export const TEMPO_STORAGE_KEY = 'theory.tempo';

function readAll(storage: KeyValue | null): Record<string, unknown> {
  try {
    const raw = storage?.getItem(TEMPO_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

const isBpm = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && clampBpm(v) === v;

/** The stored tempo of a drill, or `fallback` with no best. Never throws. */
export function loadTempo(id: DrillId, fallback: number, storage: KeyValue | null = browserStorage()): DrillTempo {
  const r = readAll(storage)[id] as Record<string, unknown> | undefined;
  return {
    last: isBpm(r?.last) ? r.last : fallback,
    best: isBpm(r?.best) ? r.best : 0,
  };
}

/** Change a drill's stored tempo, keeping every other entry (other drills, other tabs, newer builds). */
export function saveTempo(id: DrillId, change: (t: DrillTempo) => DrillTempo, fallback: number, storage: KeyValue | null = browserStorage()): DrillTempo {
  const next = change(loadTempo(id, fallback, storage));
  try {
    storage?.setItem(TEMPO_STORAGE_KEY, JSON.stringify({ ...readAll(storage), [id]: next }));
  } catch {
    // Private mode, full or blocked storage: the tempo lasts for this visit only.
  }
  return next;
}

/** Step 0 right after the loop's last step: a whole round was just played. */
export const isRoundEnd = (previous: number | null, i: number, steps: number): boolean => i === 0 && previous === steps - 1;

/** A finished round at `bpm` raises the best, never lowers it. */
export const finishRound = (t: DrillTempo, bpm: number): DrillTempo => ({ ...t, best: Math.max(t.best, bpm) });
