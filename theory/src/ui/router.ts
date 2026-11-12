/** Theory's routes, all under /theory. Pure: parsing and links only, no history access. */

export const BASE = '/theory';

export type Route =
  | { readonly page: 'path' }
  | { readonly page: 'library' }
  | { readonly page: 'review' }
  | { readonly page: 'session'; readonly slug: string }
  | { readonly page: 'lesson'; readonly slug: string }
  | { readonly page: 'notFound'; readonly path: string };

/** The library page's path segment. */
export const LIBRARY_SLUG = 'library';

/** The review page's path segment; no lesson may use it as a slug. */
export const REVIEW_SLUG = 'review';

/** Prefix segment for session routes: /theory/s/<slug>. */
export const SESSION_PREFIX = 's';

/**
 * Routes:
 * - `/theory`, `/theory/` → `path`
 * - `/theory/library` → `library`
 * - `/theory/review` → `review`
 * - `/theory/s/<slug>` → `session` when isSession(slug), else `notFound`
 * - `/theory/s` alone → `notFound`
 * - `/theory/<slug>` → `lesson` when isLesson(slug), else `notFound`
 */
export function parseRoute(
  pathname: string,
  isLesson: (slug: string) => boolean,
  isSession: (slug: string) => boolean = () => false,
): Route {
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : null;
  if (rest === null || (rest !== '' && !rest.startsWith('/'))) return { page: 'notFound', path: pathname };
  const slug = rest.replace(/^\/+|\/+$/g, '');
  if (slug === '') return { page: 'path' };
  if (slug === LIBRARY_SLUG) return { page: 'library' };
  if (slug === REVIEW_SLUG) return { page: 'review' };
  if (slug === SESSION_PREFIX) return { page: 'notFound', path: pathname };
  if (slug.startsWith(`${SESSION_PREFIX}/`)) {
    const sessionSlug = slug.slice(SESSION_PREFIX.length + 1);
    return isSession(sessionSlug) ? { page: 'session', slug: sessionSlug } : { page: 'notFound', path: pathname };
  }
  return isLesson(slug) ? { page: 'lesson', slug } : { page: 'notFound', path: pathname };
}

export function hrefFor(route: Route): string {
  switch (route.page) {
    case 'path':
      return BASE;
    case 'library':
      return `${BASE}/${LIBRARY_SLUG}`;
    case 'review':
      return `${BASE}/${REVIEW_SLUG}`;
    case 'session':
      return `${BASE}/${SESSION_PREFIX}/${route.slug}`;
    case 'lesson':
      return `${BASE}/${route.slug}`;
    case 'notFound':
      return route.path;
  }
}
