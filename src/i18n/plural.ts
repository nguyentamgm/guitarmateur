const rulesCache = new Map<string, Intl.PluralRules>();

function rulesFor(tag: string): Intl.PluralRules {
  let rules = rulesCache.get(tag);
  if (!rules) {
    rules = new Intl.PluralRules(tag);
    rulesCache.set(tag, rules);
  }
  return rules;
}

/** CLDR plural category ('one', 'other', ...) for `count` under `tag`, memoized per tag. */
export function pluralCategory(tag: string, count: number): Intl.LDMLPluralRule {
  return rulesFor(tag).select(count);
}
