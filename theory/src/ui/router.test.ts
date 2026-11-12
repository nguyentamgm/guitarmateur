import { SITE_SECTIONS } from '@shared/ui/siteSections';
import { LESSONS } from '../lessons';
import {
  LIBRARY_SLUG,
  REVIEW_SLUG,
  SESSION_PREFIX,
  hrefFor,
  parseRoute,
  type Route,
} from './router';

const isLesson = (slug: string) => slug === 'pentatonic-map';
const isSession = (slug: string) => slug === 'major-or-minor';

describe('parseRoute', () => {
  it('maps /theory and /theory/ to the path', () => {
    expect(parseRoute('/theory', isLesson, isSession)).toEqual({ page: 'path' });
    expect(parseRoute('/theory/', isLesson, isSession)).toEqual({ page: 'path' });
  });

  it('maps /theory/library to the library, with or without a trailing slash', () => {
    expect(parseRoute('/theory/library', isLesson, isSession)).toEqual({ page: 'library' });
    expect(parseRoute('/theory/library/', isLesson, isSession)).toEqual({ page: 'library' });
  });

  it('maps /theory/review to the review page, with or without a trailing slash', () => {
    expect(parseRoute('/theory/review', isLesson, isSession)).toEqual({ page: 'review' });
    expect(parseRoute('/theory/review/', isLesson, isSession)).toEqual({ page: 'review' });
  });

  it('maps /theory/s/<slug> to a session when known, with or without a trailing slash', () => {
    expect(parseRoute('/theory/s/major-or-minor', isLesson, isSession)).toEqual({
      page: 'session',
      slug: 'major-or-minor',
    });
    expect(parseRoute('/theory/s/major-or-minor/', isLesson, isSession)).toEqual({
      page: 'session',
      slug: 'major-or-minor',
    });
    expect(parseRoute('/theory/s/nope', isLesson, isSession)).toEqual({
      page: 'notFound',
      path: '/theory/s/nope',
    });
    expect(parseRoute('/theory/s', isLesson, isSession)).toEqual({
      page: 'notFound',
      path: '/theory/s',
    });
    expect(parseRoute('/theory/s/', isLesson, isSession)).toEqual({
      page: 'notFound',
      path: '/theory/s/',
    });
  });

  it('maps a known slug to its lesson, with or without a trailing slash', () => {
    expect(parseRoute('/theory/pentatonic-map', isLesson, isSession)).toEqual({
      page: 'lesson',
      slug: 'pentatonic-map',
    });
    expect(parseRoute('/theory/pentatonic-map/', isLesson, isSession)).toEqual({
      page: 'lesson',
      slug: 'pentatonic-map',
    });
  });

  it('reports unknown or foreign paths', () => {
    expect(parseRoute('/theory/nope', isLesson, isSession)).toEqual({
      page: 'notFound',
      path: '/theory/nope',
    });
    expect(parseRoute('/theoryx', isLesson, isSession)).toEqual({
      page: 'notFound',
      path: '/theoryx',
    });
    expect(parseRoute('/', isLesson, isSession)).toEqual({ page: 'notFound', path: '/' });
  });
});

describe('hrefFor', () => {
  it('round-trips with parseRoute', () => {
    const routes: readonly Route[] = [
      { page: 'path' },
      { page: 'library' },
      { page: 'review' },
      { page: 'session', slug: 'major-or-minor' },
      { page: 'lesson', slug: 'pentatonic-map' },
      { page: 'notFound', path: '/theory/nope' },
    ];
    for (const route of routes) {
      expect(parseRoute(hrefFor(route), isLesson, isSession)).toEqual(route);
    }
  });
});

describe('reserved slugs', () => {
  it('ensures no lesson slug is review, library or s', () => {
    const reserved = new Set([REVIEW_SLUG, LIBRARY_SLUG, SESSION_PREFIX]);
    for (const lesson of LESSONS) {
      expect(reserved.has(lesson.slug)).toBe(false);
    }
  });
});

describe('the site header', () => {
  it('links Lessons and Review to the routes Theory serves them at', () => {
    const href = (id: string) => SITE_SECTIONS.find((s) => s.id === id)?.href;
    expect(href('lessons')).toBe(hrefFor({ page: 'path' }));
    expect(href('review')).toBe(hrefFor({ page: 'review' }));
  });
});
