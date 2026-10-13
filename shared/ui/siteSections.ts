/** The site's sections, in header order: two Theory pages, Practice, the ear trainer. */
export type SiteSection = 'lessons' | 'review' | 'practice' | 'ear';

/** Where each section lives. The order of this list is the order of the header. */
export const SITE_SECTIONS: readonly { readonly id: SiteSection; readonly href: string }[] = [
  { id: 'lessons', href: '/theory' },
  { id: 'review', href: '/theory/review' },
  { id: 'practice', href: '/' },
  { id: 'ear', href: '/ear' },
];
