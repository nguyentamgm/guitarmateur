import { CHORD_QUALITIES, SCALE_IDS, TONICS, type Chord, type Key, type NoteName, type QualityId, type ScaleId } from '../music';
import { TUNINGS, areAdjacent, positions, recommendedPosition, type TuningId } from '../fretboard';
import { clampBpm, defaultState, type AppState, type Bars, type ProgressionEntry } from './appState';

const STORAGE_KEY = 'guitarmateur-state';

function isNoteName(x: unknown): x is NoteName {
  if (!x || typeof x !== 'object') return false;
  const n = x as Record<string, unknown>;
  return typeof n.letter === 'string' && typeof n.alter === 'number';
}

function isValidTonic(x: unknown): x is NoteName {
  return isNoteName(x) && TONICS.some((t) => t.letter === x.letter && t.alter === x.alter);
}

function isValidScaleId(x: unknown): x is ScaleId {
  return typeof x === 'string' && (SCALE_IDS as readonly string[]).includes(x);
}

function isValidQuality(x: unknown): x is QualityId {
  return typeof x === 'string' && x in CHORD_QUALITIES;
}

function isValidTuningId(x: unknown): x is TuningId {
  return typeof x === 'string' && x in TUNINGS;
}

function isValidChord(x: unknown): x is Chord {
  if (!x || typeof x !== 'object') return false;
  const c = x as Record<string, unknown>;
  return isNoteName(c.tonic) && isValidQuality(c.quality);
}

function isValidLevel(x: unknown): x is 1 | 2 | 3 | 4 | 5 {
  return typeof x === 'number' && [1, 2, 3, 4, 5].includes(x);
}

function isValidTargetRole(x: unknown): x is 'R' | '3' | '5' {
  return x === 'R' || x === '3' || x === '5';
}

/** `bars` was added in schema v3; older (v2) entries lack it and default to 1. */
function readBars(x: unknown): Bars {
  return x === 2 ? 2 : 1;
}

function readValidProgression(x: unknown): ProgressionEntry[] | null {
  if (!Array.isArray(x)) return null;
  const out: ProgressionEntry[] = [];
  for (const e of x) {
    if (!e || typeof e !== 'object') continue;
    const entry = e as Record<string, unknown>;
    if (typeof entry.id !== 'string' || typeof entry.lickSeed !== 'number' || !isValidChord(entry.chord)) continue;
    out.push({ id: entry.id, chord: entry.chord, lickSeed: entry.lickSeed, bars: readBars(entry.bars) });
  }
  return out;
}

/** Parse a raw persisted payload into a full `AppState`, falling back to per-field defaults for
 *  anything missing, malformed, or referencing a registry entry that no longer exists. */
export function migrate(raw: unknown): AppState {
  const fallback = defaultState();
  if (!raw || typeof raw !== 'object') return fallback;
  const r = raw as Record<string, unknown>;

  const tuningId: TuningId = isValidTuningId(r.tuningId) ? r.tuningId : fallback.tuningId;

  const rawKey = (r.key ?? {}) as Record<string, unknown>;
  const tonic: NoteName = isValidTonic(rawKey.tonic) ? rawKey.tonic : fallback.key.tonic;
  const scaleId: ScaleId = isValidScaleId(rawKey.scaleId) ? rawKey.scaleId : fallback.key.scaleId;
  const key: Key = { tonic, scaleId };

  const pos = positions(TUNINGS[tuningId], key);
  const validIndices = new Set(pos.map((p) => p.index));
  let positionsField: number[] = Array.isArray(r.positions)
    ? (r.positions as unknown[]).filter((i): i is number => typeof i === 'number' && validIndices.has(i))
    : [];
  if (positionsField.length === 0) {
    positionsField = [recommendedPosition(pos)];
  } else if (positionsField.length > 2) {
    positionsField = [positionsField[0]!];
  } else if (positionsField.length === 2 && !areAdjacent(pos, positionsField[0]!, positionsField[1]!)) {
    positionsField = [positionsField[0]!];
  }

  const progression = readValidProgression(r.progression) ?? fallback.progression;
  const level = isValidLevel(r.level) ? r.level : fallback.level;
  const targetRole = isValidTargetRole(r.targetRole) ? r.targetRole : fallback.targetRole;
  const resolveToNext = typeof r.resolveToNext === 'boolean' ? r.resolveToNext : fallback.resolveToNext;
  // Added in schema v3; absent in v2 payloads → falls back to the default tempo.
  const tempoBpm = typeof r.tempoBpm === 'number' ? clampBpm(r.tempoBpm) : fallback.tempoBpm;

  return {
    schemaVersion: 3,
    tuningId,
    key,
    positions: positionsField,
    progression,
    level,
    targetRole,
    resolveToNext,
    tempoBpm,
    ui: fallback.ui,
  };
}

/** Persists everything but `ui`. Quota errors / private-mode `setItem` failures are a silent no-op. */
export function saveState(state: AppState): void {
  const { schemaVersion, tuningId, key, positions, progression, level, targetRole, resolveToNext, tempoBpm } = state;
  const persisted = { schemaVersion, tuningId, key, positions, progression, level, targetRole, resolveToNext, tempoBpm };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // ignore — nothing the user can act on
  }
}

export function loadState(): AppState | null {
  let raw: unknown;
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return null;
    raw = JSON.parse(item);
  } catch {
    return null;
  }
  return migrate(raw);
}
