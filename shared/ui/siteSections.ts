/** The site's sections, in header order: two Theory pages, Practice, the ear trainer. */
export type SiteSection = 'lessons' | 'review' | 'practice' | 'ear';

/**
 * Where each section lives. The order of this list is the order of the header; a `hidden` section
 * keeps its page but stays out of the header.
 */
export const SITE_SECTIONS: readonly {
  readonly id: SiteSection;
  readonly href: string;
  readonly hidden?: boolean;
}[] = [
  { id: 'lessons', href: '/theory' },
  { id: 'review', href: '/theory/review' },
  { id: 'practice', href: '/' },
  // Hidden for now: too advanced for amateurs. The page still answers at /ear.
  { id: 'ear', href: '/ear', hidden: true },
];
