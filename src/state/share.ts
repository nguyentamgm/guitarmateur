import type { AppState } from './appState';
import { migrate } from './persistence';

const VERSION_PREFIX = 'v1:';

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
