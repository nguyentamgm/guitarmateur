/**
 * Theory's copy against docs/glossary.md: no UI string, lesson text or concept name uses a word the
 * glossary says to avoid, in either language.
 */
import { describe, expect, it } from 'vitest';
import glossary from '../../../docs/glossary.md?raw';
import { avoidRules, findAvoided, type GlossaryMiss } from '@shared/i18n/glossary';
import { UI, type Lang } from '../i18n';
import { CONCEPT_NAMES, LESSONS } from '.';

const rules = avoidRules(glossary);

/** Every string in a value, with its path: 'blues.steps.blueNote.body.0'. */
function strings(value: unknown, path: string): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}.${i}`));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => strings(v, `${path}.${k}`));
  return [];
}

function misses(lang: Lang): GlossaryMiss[] {
  const all = [
    ...strings(UI[lang], 'ui'),
    ...strings(CONCEPT_NAMES[lang], 'concepts'),
    ...LESSONS.flatMap((l) => strings(l.copy[lang], l.slug)),
  ];
  return all.flatMap(([where, text]) => findAvoided(text, rules, lang, where));
}

describe('Theory copy follows docs/glossary.md', () => {
  it('every term table of the glossary has rules to check', () => {
    // A table whose rules stopped being read would leave its words unchecked.
    const tables = glossary.split(/^### /m).slice(1).filter((t) => t.includes('| Avoid (vi) |'));
    expect(tables.length).toBeGreaterThanOrEqual(5);
    for (const table of tables) expect(avoidRules(table).length, table.split('\n')[0]).toBeGreaterThan(0);
    expect(rules.some((r) => r.lang === 'en')).toBe(true);
  });

  it.each(['en', 'vi'] as const)('%s: no avoided word', (lang) => {
    expect(misses(lang)).toEqual([]);
  });
});
