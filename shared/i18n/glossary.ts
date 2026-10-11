/**
 * The words docs/glossary.md says not to use, and where copy uses them. Pure: the caller reads the
 * glossary and the copy (each app's test does, with Vite's `?raw`).
 */

export type GlossaryLang = 'en' | 'vi';

/** A word to avoid, with the row's preferred term in that language. */
export interface AvoidRule {
  readonly lang: GlossaryLang;
  readonly term: string;
  readonly use: string;
}

/** One place copy uses an avoided word. */
export interface GlossaryMiss {
  readonly where: string;
  readonly term: string;
  readonly use: string;
}

const cells = (line: string): string[] => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

/**
 * Every backticked term in the glossary's "Avoid (en)" / "Avoid (vi)" table columns, with the
 * preferred term from the row's "English" / "Tiếng Việt" column.
 */
export function avoidRules(markdown: string): AvoidRule[] {
  const rules: AvoidRule[] = [];
  let header: string[] | null = null;
  for (const line of markdown.split('\n')) {
    if (!line.trim().startsWith('|')) {
      header = null;
      continue;
    }
    const row = cells(line);
    if (!header) {
      header = row;
      continue;
    }
    if (row.every((c) => /^:?-+:?$/.test(c))) continue;
    for (const lang of ['en', 'vi'] as const) {
      const avoidAt = header.indexOf(`Avoid (${lang})`);
      const useAt = header.indexOf(lang === 'en' ? 'English' : 'Tiếng Việt');
      if (avoidAt < 0) continue;
      for (const m of (row[avoidAt] ?? '').matchAll(/`([^`]+)`/g)) {
        rules.push({ lang, term: m[1]!, use: row[useAt] ?? '' });
      }
    }
  }
  return rules;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whole-word, case-insensitive: "gốc" matches "Gốc" and "nốt gốc", not "gốcx". */
const wordPattern = (term: string) => new RegExp(`(?<![\\p{L}\\p{N}])${escape(term.normalize('NFC'))}(?![\\p{L}\\p{N}])`, 'iu');

/** The rules of `lang` that `text` breaks, reported at `where` (a file, or a string key). */
export function findAvoided(text: string, rules: readonly AvoidRule[], lang: GlossaryLang, where: string): GlossaryMiss[] {
  const norm = text.normalize('NFC');
  return rules.filter((r) => r.lang === lang && wordPattern(r.term).test(norm)).map((r) => ({ where, term: r.term, use: r.use }));
}
