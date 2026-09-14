import type { LocaleId, Messages, Params, Translate } from './types';
import { DEFAULT_LOCALE } from './detect';
import { pluralCategory } from './plural';

const PLACEHOLDER_RE = /\{(\w+)\}/g;

/** `key.<category>` first, falling back to `key.other` — the category every locale must supply. */
function pluralLookup(
  source: Readonly<Record<string, string>>,
  key: string,
  tag: string,
  count: number,
): string | undefined {
  const category = pluralCategory(tag, count);
  return source[`${key}.${category}`] ?? source[`${key}.other`];
}

function resolveTemplate(
  source: Readonly<Record<string, string>>,
  key: string,
  tag: string,
  params: Params | undefined,
): string | undefined {
  const count = params?.count;
  if (typeof count === 'number') {
    return pluralLookup(source, key, tag, count);
  }
  return source[key];
}

function interpolate(template: string, key: string, params: Params | undefined): string {
  return template.replace(PLACEHOLDER_RE, (raw, name: string) => {
    const value = params?.[name];
    if (value === undefined) {
      if (import.meta.env.DEV) {
        console.warn(`i18n: unresolved placeholder "{${name}}" in "${key}"`);
      }
      return raw;
    }
    return String(value);
  });
}

/**
 * Bind a translator to `locale`. Resolution order per key: `messages` → `fallback` → the raw key
 * (the last resort should never trigger once `en` — the fallback — has every key, per T2).
 * `params.count` routes lookup through `pluralCategory` before the plain key is tried, using
 * `locale`'s own rule for `messages` and `fallbackLocale`'s rule for `fallback` — the fallback
 * catalog is a different language (normally `en`) with its own plural rules, so a locale with no
 * plural distinction of its own (e.g. `vi`, always `'other'`) must not force the English fallback
 * into the wrong category when a key hasn't been translated yet.
 *
 * Production call sites instantiate `K` as `TranslationKey`, so every key is checked against the
 * schema; tests can pass a fixture catalog and let `K` be inferred. Both catalogs are `Partial`
 * because `K` includes plural base keys, which are addressable but never stored — that `en`
 * carries every *stored* key is enforced by the locale parity test, not by this signature.
 */
export function createTranslator<K extends string>(
  locale: LocaleId,
  messages: Readonly<Partial<Record<K, string>>>,
  fallback: Readonly<Partial<Record<K, string>>>,
  fallbackLocale: LocaleId = DEFAULT_LOCALE,
): (key: K, params?: Params) => string {
  return (key, params) => {
    const template =
      resolveTemplate(messages as Readonly<Record<string, string>>, key, locale, params) ??
      resolveTemplate(fallback as Readonly<Record<string, string>>, key, fallbackLocale, params);
    if (template === undefined) {
      if (import.meta.env.DEV) {
        console.warn(`i18n: missing key "${key}"`);
      }
      return key;
    }
    return interpolate(template, key, params);
  };
}

/** The production-bound translator type used by `useT()`: every key is a `TranslationKey`. */
export type { Messages, Translate };
