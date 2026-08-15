import type { LocaleId } from './types';

export const DEFAULT_LOCALE: LocaleId = 'en';

/** Locales this build ships. Widened alongside the `LocaleId` union as community locales land. */
const SUPPORTED: readonly LocaleId[] = ['en'];

const primarySubtag = (tag: string): string => tag.toLowerCase().split('-')[0]!;

/**
 * Pick a shipped locale from a preference-ordered tag list (`navigator.languages`). Exact tag
 * matches (any position) win over primary-subtag matches (`vi-VN` → `vi`); `en` is the last resort.
 */
export function detectLocale(preferred: readonly string[]): LocaleId {
  const exact = preferred.find((tag) => SUPPORTED.some((id) => id === tag.toLowerCase()));
  if (exact) return exact.toLowerCase() as LocaleId;

  const bySubtag = preferred.find((tag) => SUPPORTED.some((id) => id === primarySubtag(tag)));
  if (bySubtag) return primarySubtag(bySubtag) as LocaleId;

  return DEFAULT_LOCALE;
}
