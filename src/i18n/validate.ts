export interface LocaleReport {
  /** Keys present in `reference`, absent from `candidate`. */
  missing: string[];
  /** Keys present in `candidate`, absent from `reference`. */
  unknown: string[];
  /** Keys present in both whose `{placeholder}` sets differ. */
  placeholderMismatch: { key: string; expected: string[]; actual: string[] }[];
  /** `<base>.<category>` keys the locale's plural rules require but `candidate` lacks. */
  missingPluralForms: string[];
}

const PLACEHOLDER_RE = /\{(\w+)\}/g;
const PLURAL_SUFFIXES = new Set(['zero', 'one', 'two', 'few', 'many', 'other']);

function placeholdersIn(template: string): string[] {
  const names = new Set<string>();
  for (const match of template.matchAll(PLACEHOLDER_RE)) names.add(match[1]!);
  return [...names].sort();
}

function sameNames(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((name, i) => name === b[i]);
}

/** `'progression.bars.one'` → `'progression.bars'`; keys without a plural suffix → `undefined`. */
function pluralBaseKey(key: string): string | undefined {
  const dot = key.lastIndexOf('.');
  if (dot === -1) return undefined;
  const suffix = key.slice(dot + 1);
  return PLURAL_SUFFIXES.has(suffix) ? key.slice(0, dot) : undefined;
}

/**
 * Diff `candidate` (a community locale) against `reference` (always `en`). `tag` is the BCP-47
 * tag whose `Intl.PluralRules` categories `candidate` is expected to supply for every plural key.
 * Both sides are plain string maps so a fixture catalog (tests) or a community JSON (runtime)
 * validates identically; the key union is only enforced by `Messages` at the `t()` call site.
 */
export function validateLocale(
  tag: string,
  candidate: Record<string, string>,
  reference: Record<string, string>,
): LocaleReport {
  const missing: string[] = [];
  const unknown: string[] = [];
  const placeholderMismatch: LocaleReport['placeholderMismatch'] = [];
  const pluralBases = new Set<string>();

  for (const key of Object.keys(reference)) {
    const base = pluralBaseKey(key);
    if (base) pluralBases.add(base);

    const candidateValue = candidate[key];
    if (candidateValue === undefined) {
      missing.push(key);
      continue;
    }
    const expected = placeholdersIn(reference[key]!);
    const actual = placeholdersIn(candidateValue);
    if (!sameNames(expected, actual)) {
      placeholderMismatch.push({ key, expected, actual });
    }
  }

  for (const key of Object.keys(candidate)) {
    if (!(key in reference)) unknown.push(key);
  }

  const requiredCategories = new Intl.PluralRules(tag).resolvedOptions().pluralCategories;
  const missingPluralForms: string[] = [];
  for (const base of pluralBases) {
    for (const category of requiredCategories) {
      const key = `${base}.${category}`;
      if (!(key in candidate)) missingPluralForms.push(key);
    }
  }

  return { missing, unknown, placeholderMismatch, missingPluralForms };
}
