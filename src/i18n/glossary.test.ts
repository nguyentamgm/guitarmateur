/**
 * Practice's catalogs against docs/glossary.md: no string, in any locale, uses a word the
 * glossary says to avoid.
 */
import { describe, expect, it } from 'vitest';
import glossary from '../../docs/glossary.md?raw';
import { avoidRules, findAvoided } from '@shared/i18n/glossary';
import { MESSAGES } from './locales';

const rules = avoidRules(glossary);

/** Every occurrence of an avoided word in a catalog, as `key: term`. */
function misses(locale: string): string[] {
  const catalog: Readonly<Record<string, unknown>> = MESSAGES[locale as keyof typeof MESSAGES] ?? {};
  return Object.entries(catalog)
    .flatMap(([key, text]) => findAvoided(String(text), rules, locale, key))
    .map((m) => `${m.where}: ${m.term}`);
}

describe('Practice copy follows docs/glossary.md', () => {
  it.each(Object.keys(MESSAGES))('%s: no avoided word', (locale) => {
    expect(misses(locale)).toEqual([]);
  });
});
