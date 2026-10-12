/**
 * The "Why?" links point at Theory lessons by path and repeat their titles, since the two apps never
 * import each other. This test reads Theory's lesson files as text (as the glossary test reads
 * docs/glossary.md) so a renamed lesson, step or title fails here instead of leaving a dead link.
 */
import { describe, expect, it } from 'vitest';
import { MESSAGES } from '../i18n';
import { WHY, lessonHref, type LessonLink } from './lessonLinks';

const files = import.meta.glob<string>('../../theory/src/lessons/*/{index,copy.en,copy.vi}.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const lessonFile = (slug: string, name: string) => files[`../../theory/src/lessons/${slug}/${name}.ts`];
const links: LessonLink[] = Object.values(WHY).flat();

describe('Why? links to Theory lessons', () => {
  it('every step links somewhere', () => {
    for (const list of Object.values(WHY)) expect(list.length).toBeGreaterThan(0);
  });

  it.each(links.map((l) => [lessonHref(l), l] as const))('%s: the lesson and step exist', (_, { slug, step }) => {
    const index = lessonFile(slug, 'index');
    expect(index, `no lesson folder ${slug}`).toBeDefined();
    expect(index).toContain(`slug: '${slug}'`);
    if (step) expect(index).toContain(`{ id: '${step}'`);
  });

  it.each(Object.keys(MESSAGES))("%s: each lesson title is Theory's", (locale) => {
    const catalog = MESSAGES[locale as keyof typeof MESSAGES] as Readonly<Record<string, string>>;
    for (const { slug } of links) {
      const copy = lessonFile(slug, `copy.${locale}`);
      // A language Theory has no lessons in yet has nothing to match.
      if (copy === undefined) continue;
      const title = /^ {2}title: '((?:[^'\\]|\\.)*)',$/m.exec(copy)?.[1];
      expect(catalog[`lesson.${slug}`], `${locale} lesson.${slug}`).toBe(title);
    }
  });
});
