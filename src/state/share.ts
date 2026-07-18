import type { AppState } from './appState';
import { migrate } from './persistence';

const VERSION_PREFIX = 'v1:';
const CURRENT_SCHEMA = 3;

export function encodeState(state: AppState): string {
  const { schemaVersion, tuningId, key, positions, progression, level, targetRole, resolveToNext, tempoBpm } = state;
  const persisted = { schemaVersion, tuningId, key, positions, progression, level, targetRole, resolveToNext, tempoBpm };
  return VERSION_PREFIX + btoa(encodeURIComponent(JSON.stringify(persisted)));
}

export function decodeState(raw: string): AppState | null {
  try {
    if (!raw.startsWith(VERSION_PREFIX)) return null;
    const encoded = raw.slice(VERSION_PREFIX.length);
    const json = decodeURIComponent(atob(encoded));
    const parsed: unknown = JSON.parse(json);
    return migrate(parsed);
  } catch {
    return null;
  }
}

export function exportStateToJson(state: AppState): string {
  const { schemaVersion, tuningId, key, positions, progression, level, targetRole, resolveToNext, tempoBpm } = state;
  const persisted = { schemaVersion, tuningId, key, positions, progression, level, targetRole, resolveToNext, tempoBpm };
  return JSON.stringify({ v: CURRENT_SCHEMA, state: persisted }, null, 2);
}

export function importStateFromJson(json: string): AppState | null {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.v !== 'number' || obj.v < 1 || obj.v > CURRENT_SCHEMA) return null;
    return migrate(obj.state);
  } catch {
    return null;
  }
}
