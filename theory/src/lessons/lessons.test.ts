import { copyShape, emptyStrings } from '../i18n/copyShape';
import { LANGS } from '../i18n';
import { LESSONS, findLesson, lessonConcepts } from '.';

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

  it('has unique, English, URL-safe slugs', () => {
    const slugs = LESSONS.map((l) => l.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(findLesson('pentatonic-map')).toBeDefined();
    expect(findLesson('nope')).toBeUndefined();
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
