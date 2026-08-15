import type { LocaleId, Messages, Params, Translate } from './types';
import { pluralCategory } from './plural';

const PLACEHOLDER_RE = /\{(\w+)\}/g;

/** `key.<category>` first, falling back to `key.other` — the category every locale must supply. */
function pluralLookup(source: Partial<Messages>, key: string, tag: string, count: number): string | undefined {
  const category = pluralCategory(tag, count);
  return source[`${key}.${category}`] ?? source[`${key}.other`];
}

function resolveTemplate(
  source: Partial<Messages>,
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
 */
export function createTranslator(locale: LocaleId, messages: Partial<Messages>, fallback: Messages): Translate {
  return (key, params) => {
    const template =
      resolveTemplate(messages, key, locale, params) ?? resolveTemplate(fallback, key, locale, params);
    if (template === undefined) {
      if (import.meta.env.DEV) {
        console.warn(`i18n: missing key "${key}"`);
      }
      return key;
    }
    return interpolate(template, key, params);
  };
}
