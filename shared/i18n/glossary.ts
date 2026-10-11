/**
 * The words docs/glossary.md says not to use, and where copy uses them. Pure: the caller reads the
 * glossary and the copy (each app's test does, with Vite's `?raw`).
 */

/** A word to avoid in one language (`Avoid (vi)` → 'vi'), with that row's preferred term. */
export interface AvoidRule {
  readonly lang: string;
  readonly term: string;
  readonly use: string;
  /** Whole word, case-insensitive; an English term also matches its plural ('home notes'). */
  readonly pattern: RegExp;
}

/** One place copy uses an avoided word. */
export interface GlossaryMiss {
  readonly where: string;
  readonly term: string;
  readonly use: string;
}

/** The column holding each language's preferred term. */
const TERM_COLUMN: Readonly<Record<string, string>> = { en: 'English', vi: 'Tiếng Việt' };

const cells = (line: string): string[] => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function compile(term: string, lang: string): RegExp {
  const plural = lang === 'en' ? '(?:e?s)?' : '';
  return new RegExp(`(?<![\\p{L}\\p{N}])${escape(term.normalize('NFC'))}${plural}(?![\\p{L}\\p{N}])`, 'giu');
}

/**
 * Every backticked term in the glossary's "Avoid (xx)" table columns, with the preferred term from
 * the row's "English" / "Tiếng Việt" column. Throws on a table it cannot read (an "Avoid" column
 * not named "Avoid (xx)", a row with the wrong number of cells) rather than dropping its rules.
 */
export function avoidRules(markdown: string): AvoidRule[] {
  const rules: AvoidRule[] = [];
  let header: string[] | null = null;
  for (const [n, line] of markdown.split('\n').entries()) {
    if (!line.trim().startsWith('|')) {
      header = null;
      continue;
    }
    const row = cells(line);
    if (!header) {
      header = row;
      const bad = header.find((h) => /^\W*avoid/i.test(h) && !/^Avoid \([a-z]{2,3}\)$/.test(h));
      if (bad) throw new Error(`glossary line ${n + 1}: column "${bad}" must be named "Avoid (xx)"`);
      continue;
    }
    if (row.every((c) => /^:?-+:?$/.test(c))) continue;
    if (row.length !== header.length) throw new Error(`glossary line ${n + 1}: ${row.length} cells, the header has ${header.length}`);
    header.forEach((h, col) => {
      const lang = /^Avoid \(([a-z]{2,3})\)$/.exec(h)?.[1];
      if (!lang) return;
      const use = row[header!.indexOf(TERM_COLUMN[lang] ?? '')] ?? '';
      for (const m of row[col]!.matchAll(/`([^`]+)`/g)) rules.push({ lang, term: m[1]!, use, pattern: compile(m[1]!, lang) });
    });
  }
  return rules;
}

/** Each use of a word `lang`'s rules avoid in `text`, one miss per occurrence, at `where`. */
export function findAvoided(text: string, rules: readonly AvoidRule[], lang: string, where: string): GlossaryMiss[] {
  const norm = text.normalize('NFC');
  return rules
    .filter((r) => r.lang === lang)
    .flatMap((r) => [...norm.matchAll(r.pattern)].map(() => ({ where, term: r.term, use: r.use })));
}
