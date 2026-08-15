import type { LocaleId, Messages, Params, Translate } from './types';
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
 * `params.count` routes lookup through `pluralCategory` before the plain key is tried.
 *
 * `K` is inferred from the catalogs: production call sites pass the typed `en` catalog (so
 * `K` = `TranslationKey` and every key is checked), while tests can pass a fixture catalog.
 */
export function createTranslator<K extends string>(
  locale: LocaleId,
  messages: Readonly<Partial<Record<K, string>>>,
  fallback: Readonly<Record<K, string>>,
): (key: K, params?: Params) => string {
  return (key, params) => {
    const template =
      resolveTemplate(messages as Readonly<Record<string, string>>, key, locale, params) ??
      resolveTemplate(fallback as Readonly<Record<string, string>>, key, locale, params);
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
