import { copyShape, emptyStrings } from './copyShape';
import { DEFAULT_LANG, LANG_STORAGE_KEY, detectLang, fill, loadLang, saveLang } from './lang';
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
  it('follows the browser when nothing is stored, else English', () => {
    expect(DEFAULT_LANG).toBe('en');
    expect(loadLang(memory(), ['vi-VN', 'fr'])).toBe('vi');
    expect(loadLang(memory(), ['fr-FR', 'en-GB'])).toBe('en');
    expect(loadLang(memory(), ['fr'])).toBe('en');
    expect(loadLang(null, ['vi'])).toBe('vi');
    expect(detectLang([])).toBe('en');
  });

  it('remembers the choice under the key shared with the practice app', () => {
    const store = memory();
    saveLang('vi', store);
    expect(LANG_STORAGE_KEY).toBe('gm.lang');
    expect(store.data).toEqual({ 'gm.lang': 'vi' });
    expect(loadLang(store, ['en'])).toBe('vi');
  });

  it('reads a language the practice app set', () => {
    expect(loadLang(memory({ 'gm.lang': 'en' }), ['vi'])).toBe('en');
  });

  it('detects like the practice app: an exact tag anywhere wins over a regional one', () => {
    expect(detectLang(['vi-VN', 'en'])).toBe('en');
    expect(detectLang(['vi-VN', 'fr'])).toBe('vi');
    expect(detectLang(['VI'])).toBe('vi');
  });

  it("carries an old choice over to the shared key, Theory's first", () => {
    const theoryOnly = memory({ 'theory.lang': 'vi' });
    expect(loadLang(theoryOnly, ['en'])).toBe('vi');
    expect(theoryOnly.data['gm.lang']).toBe('vi');

    const practiceOnly = memory({ 'guitarmateur-state': JSON.stringify({ language: 'vi' }) });
    expect(loadLang(practiceOnly, ['en'])).toBe('vi');
    expect(practiceOnly.data['gm.lang']).toBe('vi');

    const both = memory({ 'theory.lang': 'vi', 'guitarmateur-state': JSON.stringify({ language: 'en' }) });
    // Theory only ever stored an explicit choice; the practice app also stored its detected default.
    expect(loadLang(both, ['en'])).toBe('vi');
    expect(both.data['gm.lang']).toBe('vi');

    // A broken practice state is skipped.
    expect(loadLang(memory({ 'guitarmateur-state': '{oops' }), ['vi'])).toBe('vi');
  });

  it('ignores unknown values and never throws on blocked storage', () => {
    expect(loadLang(memory({ [LANG_STORAGE_KEY]: 'fr' }), ['en'])).toBe('en');
    expect(loadLang(broken, ['vi'])).toBe('vi');
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
