import { copyShape, emptyStrings } from './copyShape';
import { DEFAULT_LANG, LANG_STORAGE_KEY, fill, loadLang, saveLang } from './lang';
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
const broken = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

describe('language choice', () => {
  it('defaults to English, whatever the browser says', () => {
    expect(DEFAULT_LANG).toBe('en');
    expect(loadLang(memory())).toBe('en');
    expect(loadLang(null)).toBe('en');
  });

  it('remembers Vietnamese under its own key', () => {
    const store = memory();
    saveLang('vi', store);
    expect(store.data).toEqual({ [LANG_STORAGE_KEY]: 'vi' });
    expect(loadLang(store)).toBe('vi');
    expect(LANG_STORAGE_KEY).not.toBe('guitarmateur-state');
  });

  it('ignores unknown values and never throws on blocked storage', () => {
    expect(loadLang(memory({ [LANG_STORAGE_KEY]: 'fr' }))).toBe('en');
    expect(loadLang(broken)).toBe('en');
    expect(() => saveLang('vi', broken)).not.toThrow();
  });
});

describe('fill', () => {
  it('replaces placeholders and leaves unknown ones visible', () => {
    expect(fill('Box {n}: frets {min}–{max}', { n: 1, min: 5, max: 8 })).toBe('Box 1: frets 5–8');
    expect(fill('{a} {b}', { a: 'x' })).toBe('x {b}');
  });
});

describe('UI strings', () => {
  it('vi has exactly the keys and placeholders of en', () => {
    expect(copyShape(UI.vi)).toEqual(copyShape(UI.en));
  });

  it('has no empty string in any language', () => {
    expect(emptyStrings(UI.en)).toEqual([]);
    expect(emptyStrings(UI.vi)).toEqual([]);
  });
});
