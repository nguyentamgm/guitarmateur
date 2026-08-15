import type { AppState } from './appState';
import { migrate } from './persistence';
import type { LocaleId } from '../i18n';

const VERSION_PREFIX = 'v1:';
const CURRENT_SCHEMA = 7;

// `language` is deliberately absent from the payloads below: a shared link or an exported file is
// *practice state*, not a device preference — opening a friend's link must not switch your UI
// language. `decodeState`/`importStateFromJson` therefore take the language as a caller-supplied
// parameter and thread it into `migrate`.

export function encodeState(state: AppState): string {
  const { schemaVersion, tuningId, key, positions, progression, level, targetRole, resolveToNext, tempoBpm, swingEnabled, clickGain, noteGain, leftHanded } = state;
  const persisted = { schemaVersion, tuningId, key, positions, progression, level, targetRole, resolveToNext, tempoBpm, swingEnabled, clickGain, noteGain, leftHanded };
  return VERSION_PREFIX + btoa(encodeURIComponent(JSON.stringify(persisted)));
}

export function decodeState(raw: string, language?: LocaleId): AppState | null {
  try {
    if (!raw.startsWith(VERSION_PREFIX)) return null;
    const encoded = raw.slice(VERSION_PREFIX.length);
    const json = decodeURIComponent(atob(encoded));
    const parsed: unknown = JSON.parse(json);
    return migrate(parsed, language);
  } catch {
    return null;
  }
}

export function exportStateToJson(state: AppState): string {
  const { schemaVersion, tuningId, key, positions, progression, level, targetRole, resolveToNext, tempoBpm, swingEnabled, clickGain, noteGain, leftHanded } = state;
  const persisted = { schemaVersion, tuningId, key, positions, progression, level, targetRole, resolveToNext, tempoBpm, swingEnabled, clickGain, noteGain, leftHanded };
  return JSON.stringify({ v: CURRENT_SCHEMA, state: persisted }, null, 2);
}

export function importStateFromJson(json: string, language?: LocaleId): AppState | null {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.v !== 'number' || obj.v < 1 || obj.v > CURRENT_SCHEMA) return null;
    return migrate(obj.state, language);
  } catch {
    return null;
  }
}
