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
export type TranslationKey = keyof typeof import('./locales/en.json');

/** Flat key → string catalog, keyed by every key `en.json` defines. */
export type Messages = Record<TranslationKey, string>;

export type ParamValue = string | number;
export type Params = Readonly<Record<string, ParamValue>>;

/** Bound to one locale; never throws, never renders a raw key when the fallback catalog has it. */
export type Translate = (key: TranslationKey, params?: Params) => string;
