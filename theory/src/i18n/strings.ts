/**
 * App-wide interface strings (header, contents page, lesson chrome). Lesson text lives with each
 * lesson in theory/src/lessons. English is the source; `vi` must have exactly the same keys.
 */
import type { Lang } from './lang';

const en = {
  appName: 'Guitarmateur Theory',
  langLabel: 'Language',
  langName: { en: 'English', vi: 'Tiếng Việt' },
  soundOn: 'Sound: on',
  soundOff: 'Sound: off',
  tocEyebrow: 'Music theory for electric guitar',
  tocTitle: 'Learn the neck by its shapes',
  tocLead:
    'Short visual lessons where every idea is a picture you can play. Click any note to hear it. Shapes come first; names come later, when you need them.',
  tocLessons: 'Lessons',
  tocConcepts: 'Covers {ids}',
  notFound: 'There is no lesson at “{path}”. Here is everything that exists so far.',
  backToContents: '← All lessons',
  stepLabel: 'Step {n}',
  takeaway: 'Takeaway',
  tryIt: 'Try it',
  notYetEyebrow: 'Not yet',
  lessonFooter: 'Sound is synthesized in your browser. Nothing is tracked or uploaded.',
};

export type UiStrings = typeof en;

const vi: UiStrings = {
  appName: 'Guitarmateur Theory',
  langLabel: 'Ngôn ngữ',
  langName: { en: 'English', vi: 'Tiếng Việt' },
  soundOn: 'Âm thanh: bật',
  soundOff: 'Âm thanh: tắt',
  tocEyebrow: 'Nhạc lý cho guitar điện',
  tocTitle: 'Học cần đàn qua hình',
  tocLead:
    'Những bài ngắn, mỗi ý là một hình bạn chơi được. Bấm vào nốt nào cũng nghe được. Hình đi trước, tên gọi đến sau, khi bạn thật sự cần.',
  tocLessons: 'Các bài',
  tocConcepts: 'Khái niệm {ids}',
  notFound: 'Không có bài nào ở “{path}”. Dưới đây là tất cả các bài hiện có.',
  backToContents: '← Tất cả các bài',
  stepLabel: 'Bước {n}',
  takeaway: 'Ghi nhớ',
  tryIt: 'Tự thử',
  notYetEyebrow: 'Tạm gác lại',
  lessonFooter: 'Âm thanh được tổng hợp ngay trong trình duyệt. Không theo dõi, không tải gì lên.',
};

export const UI: Readonly<Record<Lang, UiStrings>> = { en, vi };
