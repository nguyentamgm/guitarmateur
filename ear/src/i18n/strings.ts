/**
 * The ear trainer's interface strings. English is the source; `vi` must have exactly the same keys
 * and placeholders (i18n.test.ts). Words follow docs/glossary.md (glossary.test.ts).
 */
import type { Lang } from './lang';

const en = {
  /** The tab title. */
  appName: 'Ear training · Guitarmateur',
  /** The site name in the header, the same on every page. */
  brand: 'Guitarmateur',
  langLabel: 'Language',
  langName: { en: 'English', vi: 'Tiếng Việt' },
  navLabel: 'Sections',
  navLessons: 'Lessons',
  navReview: 'Review',
  navPractice: 'Practice',
  navEar: 'Ear training',
  kicker: 'Train your ear',
  title: 'Ear training',
  lead: 'Hear a key, then name each note by its degree: 1, ♭3, 5… Start with three notes and add more as your ear gets sharper.',
  soon: 'The trainer is being built. Check back soon.',
  footer: 'Sound is synthesized in your browser. Nothing is tracked or uploaded.',
};

export type UiStrings = typeof en;

const vi: UiStrings = {
  appName: 'Luyện tai · Guitarmateur',
  brand: 'Guitarmateur',
  langLabel: 'Ngôn ngữ',
  langName: { en: 'English', vi: 'Tiếng Việt' },
  navLabel: 'Các mục',
  navLessons: 'Bài học',
  navReview: 'Ôn tập',
  navPractice: 'Luyện tập',
  navEar: 'Luyện tai',
  kicker: 'Luyện tai nghe',
  title: 'Luyện tai',
  lead: 'Nghe một giọng, rồi gọi tên từng nốt theo bậc của nó: 1, ♭3, 5… Bắt đầu với ba nốt, thêm dần khi tai bạn nghe rõ hơn.',
  soon: 'Phần luyện tập đang được xây dựng. Hãy quay lại sau.',
  footer: 'Âm thanh được tổng hợp ngay trong trình duyệt. Không theo dõi, không tải gì lên.',
};

export const UI: Readonly<Record<Lang, UiStrings>> = { en, vi };
