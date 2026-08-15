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

/**
 * Flat key → string catalog. Widened to a typed key union bound to `en.json` in T2
 * (`Messages = Record<TranslationKey, string>`); a generic string-keyed shape for now.
 */
export type Messages = Record<string, string>;

export type ParamValue = string | number;
export type Params = Readonly<Record<string, ParamValue>>;

/** Bound to one locale; never throws, never renders a raw key when the fallback catalog has it. */
export type Translate = (key: string, params?: Params) => string;
