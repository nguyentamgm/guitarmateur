/**
 * Settings and stats in localStorage: one key, `gm.ear`, holding `{ version, settings, stats }`
 * (docs/ear.md "Storage"). Never the other pages' keys, and never the language (`gm.lang`).
 * Missing, corrupt or unknown data falls back to the defaults; nothing here throws.
 */
import type { DegreeLabel } from '@shared/core/music';
import { browserStorage, type KeyValue } from '@shared/platform/storage';
import { DEGREES } from '../core/degrees';
import {
  DAYS_KEPT,
  EMPTY_STATS,
  recordAnswer,
  type Answer,
  type Count,
  type DayCount,
  type ModeStats,
  type Stats,
  localDay,
} from '../core/stats';
import { DEFAULT_SETTINGS, readSettings, type EarSettings } from './settings';

export const EAR_STORAGE_KEY = 'gm.ear';
export const EAR_STORAGE_VERSION = 1;

export interface EarData {
  readonly version: typeof EAR_STORAGE_VERSION;
  readonly settings: EarSettings;
  readonly stats: Stats;
}

export const DEFAULT_DATA: EarData = {
  version: EAR_STORAGE_VERSION,
  settings: DEFAULT_SETTINGS,
  stats: EMPTY_STATS,
};

/**
 * Each stored version's step to the next, by the version it reads: MIGRATIONS[1] would turn a
 * version 1 payload into a version 2 one. None yet; add one with each version bump.
 */
const MIGRATIONS: Readonly<
  Record<number, (raw: Record<string, unknown>) => Record<string, unknown>>
> = {};

const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;
const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const DEGREE_IDS: readonly DegreeLabel[] = DEGREES.map((d) => d.label);
const DAY = /^\d{4}-\d{2}-\d{2}$/;

function readCount(v: unknown): Count | null {
  if (!isObject(v) || !isCount(v.asked) || !isCount(v.right) || v.right > v.asked) return null;
  return { asked: v.asked, right: v.right };
}

/** A mode's stored stats; a broken entry is left out, a broken streak is 0. */
function readModeStats(v: unknown): ModeStats {
  if (!isObject(v)) return EMPTY_STATS.major;
  const degrees: Partial<Record<DegreeLabel, Count>> = {};
  const mixups: Partial<Record<DegreeLabel, Partial<Record<DegreeLabel, number>>>> = {};
  const storedDegrees = isObject(v.degrees) ? v.degrees : {};
  const storedMixups = isObject(v.mixups) ? v.mixups : {};
  for (const d of DEGREE_IDS) {
    const c = readCount(storedDegrees[d]);
    if (c) degrees[d] = c;
    const heard = storedMixups[d];
    if (!isObject(heard)) continue;
    for (const h of DEGREE_IDS) {
      const n = heard[h];
      if (h !== d && isCount(n) && n > 0) mixups[d] = { ...mixups[d], [h]: n };
    }
  }
  const days: DayCount[] = [];
  for (const x of Array.isArray(v.days) ? v.days : []) {
    const c = readCount(x);
    const day = isObject(x) ? x.day : null;
    // Oldest first, one entry a day: anything out of order is dropped.
    if (
      c &&
      typeof day === 'string' &&
      DAY.test(day) &&
      (days.length === 0 || day > days[days.length - 1]!.day)
    ) {
      days.push({ day, ...c });
    }
  }
  const bestStreak = isCount(v.bestStreak) ? v.bestStreak : 0;
  const streak = isCount(v.streak) && v.streak <= bestStreak ? v.streak : 0;
  return { degrees, mixups, days: days.slice(-DAYS_KEPT), streak, bestStreak };
}

export function readStats(v: unknown): Stats {
  const r = isObject(v) ? v : {};
  return { major: readModeStats(r.major), minor: readModeStats(r.minor) };
}

/**
 * A stored payload as this version's data. A payload from an older version runs through
 * MIGRATIONS first; one with no version, a newer one or one that is not an object gives the
 * defaults. Then each field is read on its own, falling back to its default.
 */
export function migrate(raw: unknown): EarData {
  if (!isObject(raw)) return DEFAULT_DATA;
  let data = raw;
  let version = raw.version;
  if (!isCount(version) || version < 1 || version > EAR_STORAGE_VERSION) return DEFAULT_DATA;
  while (version < EAR_STORAGE_VERSION) {
    data = MIGRATIONS[version]!(data);
    version++;
  }
  return {
    version: EAR_STORAGE_VERSION,
    settings: readSettings(data.settings),
    stats: readStats(data.stats),
  };
}

/** The stored payload parsed, or null when there is none or it is not JSON. */
function readRaw(storage: KeyValue | null): unknown {
  try {
    const raw = storage?.getItem(EAR_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

/** True when a newer build wrote the stored data: this one must not overwrite it. */
const storedByNewer = (raw: unknown): boolean =>
  isObject(raw) && typeof raw.version === 'number' && raw.version > EAR_STORAGE_VERSION;

/** The stored settings and stats, or the defaults. Never throws. */
export function loadEar(storage: KeyValue | null = browserStorage()): EarData {
  return migrate(readRaw(storage));
}

/**
 * Write `change` over what is stored now (so another tab's latest stats or settings are the base),
 * or over `current` when nothing readable is stored. Returns the new data, even when it could not
 * be saved: it then lasts for this visit only.
 */
function update(
  current: EarData,
  change: (base: EarData) => EarData,
  storage: KeyValue | null,
): EarData {
  const raw = readRaw(storage);
  const next = change(raw === null ? current : migrate(raw));
  if (storedByNewer(raw)) return next;
  try {
    storage?.setItem(EAR_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private mode, full or blocked storage: nothing the player can act on.
  }
  return next;
}

/** Save new settings, keeping the stored stats. */
export function saveSettings(
  current: EarData,
  settings: EarSettings,
  storage: KeyValue | null = browserStorage(),
): EarData {
  return update(current, (base) => ({ ...base, settings }), storage);
}

/** Count one question's first answer (the session's `score` effect), on the local date of `now`. */
export function storeAnswer(
  current: EarData,
  answer: Answer,
  now: number,
  storage: KeyValue | null = browserStorage(),
): EarData {
  return update(
    current,
    (base) => ({ ...base, stats: recordAnswer(base.stats, answer, localDay(now)) }),
    storage,
  );
}

/** Clear the stats of both modes, keeping the settings. */
export function resetStats(current: EarData, storage: KeyValue | null = browserStorage()): EarData {
  return update(current, (base) => ({ ...base, stats: EMPTY_STATS }), storage);
}

/**
 * Follow changes made in another tab (the `storage` event, as `gm.lang` does): `listener` gets the
 * stored data whenever `gm.ear` changes or storage is cleared. Returns the unsubscribe.
 */
export function onStoredChange(
  listener: (data: EarData) => void,
  storage: KeyValue | null = browserStorage(),
): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === EAR_STORAGE_KEY || e.key === null) listener(loadEar(storage));
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
