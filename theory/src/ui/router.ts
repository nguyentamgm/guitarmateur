/** Theory's routes, all under /theory. Pure: parsing and links only, no history access. */

export const BASE = '/theory';

export type Route =
  | { readonly page: 'contents' }
  | { readonly page: 'review' }
  | { readonly page: 'lesson'; readonly slug: string }
  | { readonly page: 'notFound'; readonly path: string };

/** The review page's path segment; no lesson may use it as a slug. */
export const REVIEW_SLUG = 'review';

/** `/theory` and `/theory/` are the contents, `/theory/review` the review page, `/theory/<slug>` a lesson if it exists. */
export function parseRoute(pathname: string, isLesson: (slug: string) => boolean): Route {
  const rest = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : null;
  if (rest === null || (rest !== '' && !rest.startsWith('/'))) return { page: 'notFound', path: pathname };
  const slug = rest.replace(/^\/+|\/+$/g, '');
  if (slug === '') return { page: 'contents' };
  if (slug === REVIEW_SLUG) return { page: 'review' };
  return isLesson(slug) ? { page: 'lesson', slug } : { page: 'notFound', path: pathname };
}

export function hrefFor(route: Route): string {
  switch (route.page) {
    case 'contents':
      return BASE;
    case 'review':
      return `${BASE}/${REVIEW_SLUG}`;
    case 'lesson':
      return `${BASE}/${route.slug}`;
    case 'notFound':
      return route.path;
  }
}
