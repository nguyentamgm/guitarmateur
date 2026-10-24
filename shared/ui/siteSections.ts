/** The site's sections, in header order: Practice, the ear trainer, then Theory's two pages. */
export type SiteSection = 'practice' | 'ear' | 'lessons' | 'review';

/**
 * Where each section lives. The order of this list is the order of the header; the header draws a
 * separator where `group` changes (playing first, then Theory). A `hidden` section keeps its page
 * but stays out of the header.
 */
export const SITE_SECTIONS: readonly {
  readonly id: SiteSection;
  readonly href: string;
  readonly group: 'play' | 'theory';
  readonly hidden?: boolean;
}[] = [
  { id: 'practice', href: '/', group: 'play' },
  { id: 'ear', href: '/ear-training', group: 'play' },
  { id: 'lessons', href: '/theory', group: 'theory' },
  { id: 'review', href: '/theory/review', group: 'theory' },
];
