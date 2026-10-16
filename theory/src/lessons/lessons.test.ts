import { copyShape, emptyStrings } from '../i18n/copyShape';
import { LANGS } from '../i18n';
import { CONCEPT_NAMES, LESSONS, conceptName, findLesson, lessonConcepts, lessonNeighbours } from '.';
import sitemap from '../../../public/sitemap.xml?raw';

/** Concept IDs defined as headings (`## K3.4 …`) in docs/theory-knowledge. */
const knowledge = import.meta.glob('../../../docs/theory-knowledge/m*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const KNOWN_IDS = new Set(
  Object.values(knowledge).flatMap((md) => [...md.matchAll(/^##\s+(K\d+\.\d+)\b/gm)].map((m) => m[1]!)),
);

describe('lesson registry', () => {
  it('reads the knowledge base', () => {
    expect(KNOWN_IDS.size).toBe(57);
  });

  it('names every concept of the knowledge base, in every language', () => {
    for (const lang of LANGS) {
      expect(Object.keys(CONCEPT_NAMES[lang]).sort()).toEqual([...KNOWN_IDS].sort());
      expect(emptyStrings(CONCEPT_NAMES[lang])).toEqual([]);
    }
    expect(conceptName('K3.4', 'en')).toBe('The five pentatonic boxes');
    expect(conceptName('K3.4', 'vi')).toBe('Năm box pentatonic');
  });

  it('has unique, English, URL-safe slugs', () => {
    const slugs = LESSONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(findLesson('pentatonic-map')).toBeDefined();
    expect(findLesson('nope')).toBeUndefined();
  });

  it('links each lesson to the ones before and after it in LESSONS', () => {
    const slugs = LESSONS.map((l) => l.slug);
    expect(lessonNeighbours(slugs[0]!).prev).toBeUndefined();
    expect(lessonNeighbours(slugs[0]!).next?.slug).toBe(slugs[1]);
    expect(lessonNeighbours(slugs[1]!)).toEqual({ prev: LESSONS[0], next: LESSONS[2] });
    expect(lessonNeighbours(slugs.at(-1)!).next).toBeUndefined();
    expect(lessonNeighbours(slugs.at(-1)!).prev?.slug).toBe(slugs.at(-2));
    slugs.forEach((slug, i) => {
      expect(lessonNeighbours(slug).prev?.slug).toBe(slugs[i - 1]);
      expect(lessonNeighbours(slug).next?.slug).toBe(slugs[i + 1]);
    });
    expect(lessonNeighbours('nope')).toEqual({});
  });

  it('lists every lesson in public/sitemap.xml, in contents order', () => {
    const lessonUrls = [...sitemap.matchAll(/<loc>https:\/\/guitarmateur\.com\/theory\/([^<]+)<\/loc>/g)]
      .map((m) => m[1])
      .filter((slug) => slug !== 'review');
    expect(lessonUrls).toEqual(LESSONS.map((l) => l.slug));
  });

  it('links to Practice from the lessons that practise a key there', () => {
    expect(LESSONS.filter((l) => l.practice).map((l) => l.slug)).toEqual(['pentatonic-map', 'pentatonic', 'blues', 'keys', 'solo']);
  });

  describe.each(LESSONS.map((l) => [l.slug, l] as const))('%s', (_slug, lesson) => {
    it('teaches only concepts that exist in docs/theory-knowledge', () => {
      const ids = lessonConcepts(lesson);
      expect(ids.length).toBeGreaterThan(0);
      expect(ids.filter((id) => !KNOWN_IDS.has(id))).toEqual([]);
    });

    it('has copy for every step, in every language', () => {
      const stepIds = lesson.steps.map((s) => s.id).sort();
      for (const lang of LANGS) expect(Object.keys(lesson.copy[lang].steps).sort()).toEqual(stepIds);
    });

    it('vi has the same keys, list lengths and placeholders as en', () => {
      expect(copyShape(lesson.copy.vi)).toEqual(copyShape(lesson.copy.en));
    });

    it('has no empty string', () => {
      for (const lang of LANGS) expect(emptyStrings(lesson.copy[lang])).toEqual([]);
    });
  });
});
