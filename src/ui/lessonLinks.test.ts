/**
 * The "Why?" links point at Theory lessons by path and repeat their titles, since Practice never
 * imports Theory. This test checks each link against Theory's own lesson list, so a renamed
 * lesson, step or title fails here instead of leaving a dead link or a stale title.
 *
 * Theory's lessons are loaded when the test runs (`import.meta.glob`), not imported: Practice's
 * type program and its lint rule stay free of Theory, and the shape read here is spelled out below.
 */
import { describe, expect, it } from 'vitest';
import { MESSAGES } from '../i18n';
import { WHY, lessonHref, type LessonLink } from './lessonLinks';

/** What this test reads of a Theory lesson (theory/src/lessons/types.ts). */
interface TheoryLesson {
  readonly slug: string;
  readonly steps: readonly { readonly id: string }[];
  readonly copy: Readonly<Record<string, { readonly title: string } | undefined>>;
}
const theory = import.meta.glob<readonly TheoryLesson[]>('../../theory/src/lessons/index.ts', { import: 'LESSONS', eager: true });
const LESSONS = Object.values(theory)[0]!;
/** What Theory routes `/theory/<slug>` on: a lesson folder left out of LESSONS is a dead link. */
const findLesson = (slug: string) => LESSONS.find((l) => l.slug === slug);

const links: LessonLink[] = Object.values(WHY).flat();

describe('Why? links to Theory lessons', () => {
  it('every step links somewhere', () => {
    for (const list of Object.values(WHY)) expect(list.length).toBeGreaterThan(0);
  });

  it.each(links.map((l) => [lessonHref(l, 'en'), l] as const))('%s: a listed lesson, and its step', (_, { slug, step }) => {
    const lesson = findLesson(slug);
    expect(lesson, `no lesson ${slug} in LESSONS`).toBeDefined();
    if (step) expect(lesson!.steps.map((s) => s.id)).toContain(step);
  });

  it.each(Object.keys(MESSAGES))("%s: each lesson title is Theory's, and no title is left over", (locale) => {
    const catalog = MESSAGES[locale as keyof typeof MESSAGES] as Readonly<Record<string, string>>;
    for (const { slug } of links) {
      const copy = findLesson(slug)!.copy[locale];
      // A language Theory has no lessons in yet has nothing to match.
      if (copy) expect(catalog[`lesson.${slug}`], `${locale} lesson.${slug}`).toBe(copy.title);
    }
    const titled = Object.keys(catalog).filter((k) => k.startsWith('lesson.')).map((k) => k.slice('lesson.'.length));
    expect(titled.sort()).toEqual([...new Set(links.map((l) => l.slug))].sort());
  });

  it("reads Theory's lessons", () => {
    expect(LESSONS.length).toBeGreaterThan(10);
  });
});
