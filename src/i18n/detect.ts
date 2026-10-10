import { detectLanguage } from '@shared/i18n/language';
import type { LocaleId } from './types';

export const DEFAULT_LOCALE: LocaleId = 'en';

/** Locales this build ships. Widened alongside the `LocaleId` union as community locales land. */
const SUPPORTED: readonly LocaleId[] = ['en', 'vi'];

/**
 * Pick a shipped locale from a preference-ordered tag list (`navigator.languages`). Exact tag
 * matches (any position) win over primary-subtag matches (`vi-VN` → `vi`); `en` is the last resort.
 * The rule is shared with the Theory app (shared/i18n/language.ts) so both pick the same language.
 */
export function detectLocale(preferred: readonly string[]): LocaleId {
  return detectLanguage(preferred, SUPPORTED, DEFAULT_LOCALE);
}
