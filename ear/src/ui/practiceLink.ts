/**
 * Level 12's link to Practice, open on the A minor pentatonic (#261). It writes Practice's share
 * format (`/?s=v1:` + base64 JSON) by hand, as Theory's trainerLink.ts does: the apps share no
 * code. Starting from Practice's own saved state (same origin, its own key), it replaces only the
 * key, so the learner's tuning, left-handed view and volumes survive; positions are dropped so
 * Practice recommends a box for the key. The language rides along as `&lang=`.
 */
import { PRACTICE_STATE_KEY } from '@shared/i18n/language';
import { browserStorage, type KeyValue } from '@shared/platform/storage';
import type { Lang } from '../i18n';

/** Practice's saved state, or undefined. Never throws. */
function readPracticeState(storage: KeyValue | null): unknown {
  try {
    const raw = storage?.getItem(PRACTICE_STATE_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function minorPentatonicLink(
  lang: Lang,
  storage: KeyValue | null = browserStorage(),
): string {
  const saved = readPracticeState(storage);
  const kept =
    saved && typeof saved === 'object' && !Array.isArray(saved)
      ? Object.fromEntries(
          Object.entries(saved).filter(([k]) => k !== 'positions' && k !== 'language'),
        )
      : {};
  const state = { ...kept, key: { tonic: { letter: 'A', alter: 0 }, scaleId: 'minorPentatonic' } };
  return `/?s=${encodeURIComponent(`v1:${btoa(encodeURIComponent(JSON.stringify(state)))}`)}&lang=${lang}`;
}
