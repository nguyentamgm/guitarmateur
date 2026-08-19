/** Supported UI locales. Widened by each community locale PR (e.g. adding 'vi' in T10). */
export type LocaleId = 'en';

export interface LocaleMeta {
  id: LocaleId;
  /** Endonym — the language's own name. Never translated: 'English', 'Tiếng Việt'. */
  endonym: string;
  /** BCP-47 tag handed to Intl.PluralRules and <html lang>. */
  tag: string;
  /** Credit line shown in docs/about; free-form. */
  contributors?: string[];
}

/** The `en` catalog is the schema: every other locale must supply exactly these keys. */
export type CatalogKey = keyof typeof import('./locales/en.json');

/** `'progression.bars.one'` → `'progression.bars'`; keys without a plural suffix drop out. */
type PluralBase<K extends string> = K extends `${infer Base}.${Intl.LDMLPluralRule}` ? Base : never;

/**
 * What a call site may pass to `t()`: a key the catalog stores, or the base of a plural set. A
 * plural set lives in the catalog as `<base>.<category>` but is addressed by its base plus
 * `params.count` — `t('progression.bars', { count })` — so the base is never a stored key.
 */
export type TranslationKey = CatalogKey | PluralBase<CatalogKey>;

/** Flat key → string catalog, keyed by every key `en.json` defines. */
export type Messages = Record<CatalogKey, string>;

export type ParamValue = string | number;
export type Params = Readonly<Record<string, ParamValue>>;

/** Bound to one locale; never throws, never renders a raw key when the fallback catalog has it. */
export type Translate = (key: TranslationKey, params?: Params) => string;
