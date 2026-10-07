/**
 * Tempos remembered across visits. A drill keeps the last tempo set and the best, the fastest tempo
 * at which a whole round was played; any other scene that plays in time keeps only the last tempo.
 * Kept under Theory's own key, like quiz progress.
 */
import { clampBpm } from '../core/rhythm';
import { browserStorage, type KeyValue } from '../platform/storage';

export const DRILLS = ['rhythm-fingers', 'pentatonic-sequences', 'three-per-string-triplets'] as const;
export type DrillId = (typeof DRILLS)[number];

/** Scenes that play in time but are not drills: lesson slug and step, or the solo backing. */
export const PLAYERS = [
  'rhythm-beat',
  'rhythm-lengths',
  'rhythm-counting',
  'rhythm-strum',
  'blues-shuffle',
  'blues-twelve-bar',
  'blues-legato',
  'electric-mute',
  'electric-boogie',
  'barre-changes',
  'keys-numbers',
  'keys-two-five',
  'keys-relative',
  'solo-blues',
  'solo-pop',
  'solo-rock',
  'solo-jazz',
] as const;
export type PlayerId = (typeof PLAYERS)[number];
export type TempoId = DrillId | PlayerId;

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

/** The stored tempo of a drill or scene, or `fallback` with no best. Never throws. */
export function loadTempo(id: TempoId, fallback: number, storage: KeyValue | null = browserStorage()): DrillTempo {
  const r = readAll(storage)[id] as Record<string, unknown> | undefined;
  return {
    last: isBpm(r?.last) ? r.last : fallback,
    best: isBpm(r?.best) ? r.best : 0,
  };
}

/** Change a stored tempo, keeping every other entry (other scenes, other tabs, newer builds). */
export function saveTempo(id: TempoId, change: (t: DrillTempo) => DrillTempo, fallback: number, storage: KeyValue | null = browserStorage()): DrillTempo {
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
