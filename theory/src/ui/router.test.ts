import { hrefFor, parseRoute } from './router';

const isLesson = (slug: string) => slug === 'pentatonic-map';

describe('parseRoute', () => {
  it('maps /theory and /theory/ to the contents', () => {
    expect(parseRoute('/theory', isLesson)).toEqual({ page: 'contents' });
    expect(parseRoute('/theory/', isLesson)).toEqual({ page: 'contents' });
  });

  it('maps a known slug to its lesson, with or without a trailing slash', () => {
    expect(parseRoute('/theory/pentatonic-map', isLesson)).toEqual({ page: 'lesson', slug: 'pentatonic-map' });
    expect(parseRoute('/theory/pentatonic-map/', isLesson)).toEqual({ page: 'lesson', slug: 'pentatonic-map' });
  });

  it('maps /theory/review to the review page', () => {
    expect(parseRoute('/theory/review', isLesson)).toEqual({ page: 'review' });
    expect(parseRoute('/theory/review/', isLesson)).toEqual({ page: 'review' });
  });

  it('reports unknown or foreign paths', () => {
    expect(parseRoute('/theory/nope', isLesson)).toEqual({ page: 'notFound', path: '/theory/nope' });
    expect(parseRoute('/theoryx', isLesson)).toEqual({ page: 'notFound', path: '/theoryx' });
    expect(parseRoute('/', isLesson)).toEqual({ page: 'notFound', path: '/' });
  });
});

describe('hrefFor', () => {
  it('round-trips with parseRoute', () => {
    for (const route of [{ page: 'contents' }, { page: 'review' }, { page: 'lesson', slug: 'pentatonic-map' }] as const) {
      expect(parseRoute(hrefFor(route), isLesson)).toEqual(route);
    }
  });
});
