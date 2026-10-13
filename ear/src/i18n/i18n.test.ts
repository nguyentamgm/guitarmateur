import { describe, expect, it } from 'vitest';
import glossary from '../../../docs/glossary.md?raw';
import { avoidRules, findAvoided } from '@shared/i18n/glossary';
import { LANG_STORAGE_KEY, fill, linkLang, loadLang, saveLang } from './lang';
import { UI } from './strings';

const memory = (init: Record<string, string> = {}) => {
  const data = { ...init };
  return {
    data,
    getItem: (k: string) => data[k] ?? null,
    setItem: (k: string, v: string) => {
      data[k] = v;
    },
  };
};

/** Every string with its path, and the placeholders it uses: 'langName.en' → []. */
function shape(value: unknown, path = ''): Record<string, string[]> {
  if (typeof value === 'string') return { [path]: [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!).sort() };
  if (value && typeof value === 'object') {
    return Object.assign({}, ...Object.entries(value).map(([k, v]) => shape(v, path ? `${path}.${k}` : k))) as Record<string, string[]>;
  }
  return { [path]: [`<${typeof value}>`] };
}

const strings = (value: unknown): [string, string][] =>
  Object.keys(shape(value)).map((path) => [path, path.split('.').reduce<unknown>((v, k) => (v as Record<string, unknown>)[k], value) as string]);

describe('ear trainer languages', () => {
  it('shares the language setting with the other pages', () => {
    const store = memory();
    saveLang('vi', store);
    expect(LANG_STORAGE_KEY).toBe('gm.lang');
    expect(store.data).toEqual({ 'gm.lang': 'vi' });
    expect(loadLang(store, ['en'])).toBe('vi');
  });

  it('follows the browser when nothing is stored, else English', () => {
    expect(loadLang(memory(), ['vi-VN'])).toBe('vi');
    expect(loadLang(memory(), ['fr'])).toBe('en');
    expect(loadLang(null, [])).toBe('en');
  });

  it('reads ?lang= from a link', () => {
    expect(linkLang('?lang=vi')).toBe('vi');
    expect(linkLang('?lang=fr')).toBeNull();
    expect(linkLang('')).toBeNull();
  });

  it('fills placeholders and leaves a missing one visible', () => {
    expect(fill('{a} of {b}', { a: 3 })).toBe('3 of {b}');
  });
});

describe('ear trainer copy', () => {
  it('vi has the same keys and placeholders as en, and no empty string', () => {
    expect(shape(UI.vi)).toEqual(shape(UI.en));
    for (const lang of ['en', 'vi'] as const) {
      for (const [path, text] of strings(UI[lang])) expect(text.trim(), `${lang}: ${path}`).not.toBe('');
    }
  });

  it.each(['en', 'vi'] as const)('%s: follows docs/glossary.md', (lang) => {
    const rules = avoidRules(glossary);
    expect(strings(UI[lang]).flatMap(([where, text]) => findAvoided(text, rules, lang, where))).toEqual([]);
  });
});
