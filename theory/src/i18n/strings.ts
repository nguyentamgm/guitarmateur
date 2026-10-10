/**
 * App-wide interface strings (header, contents page, lesson chrome). Lesson text lives with each
 * lesson in theory/src/lessons. English is the source; `vi` must have exactly the same keys.
 */
import type { Lang } from './lang';

const en = {
  appName: 'Guitarmateur Theory',
  /** The site name in the header, the same on every page of both apps. */
  brand: 'Guitarmateur',
  langLabel: 'Language',
  langName: { en: 'English', vi: 'Tiếng Việt' },
  soundOn: 'Sound: on',
  soundOff: 'Sound: off',
  tocEyebrow: 'Music theory for electric guitar',
  tocTitle: 'Learn the neck by its shapes',
  tocLead:
    'Short visual lessons where every idea is a picture you can play. Click any note to hear it. Shapes come first; names come later, when you need them.',
  tocLessons: 'Lessons',
  tocConcepts: 'Covers {names}',
  notFound: 'There is no lesson at “{path}”. Here is everything that exists so far.',
  backToContents: '← All lessons',
  stepLabel: 'Step {n}',
  takeaway: 'Takeaway',
  tryIt: 'Try it',
  notYetEyebrow: 'Not yet',
  lessonFooter: 'Sound is synthesized in your browser. Nothing is tracked or uploaded.',
  navLabel: 'Sections',
  navLessons: 'Lessons',
  navReview: 'Review',
  navPractice: 'Practice',
  tocReview: 'Review: which quiz to do next →',
  reviewTitle: 'Review',
  reviewLead:
    'Each quiz in the lessons keeps its score on this device. The list puts the quiz that needs you most at the top: ones you have not tried, then ones you often miss, then ones you have not practised for a week.',
  reviewNext: 'Do this next',
  reviewReason: { new: 'Not tried yet', weak: 'Needs work', stale: 'Due again', fresh: 'Up to date' },
  reviewStats: '{acc}% right in the last {n} · best streak {best}',
  reviewLastToday: 'Last practised today',
  reviewLastYesterday: 'Last practised yesterday',
  reviewLastDays: 'Last practised {days} days ago',
  reviewOpen: 'Go to the quiz',
  reviewFooter: 'Scores stay in this browser. Nothing is tracked or uploaded.',
  tempoBest: 'Best: {bpm} BPM',
  trainerLink: 'Practise licks over this in the Guitarmateur trainer →',
};

export type UiStrings = typeof en;

const vi: UiStrings = {
  appName: 'Guitarmateur Theory',
  brand: 'Guitarmateur',
  langLabel: 'Ngôn ngữ',
  langName: { en: 'English', vi: 'Tiếng Việt' },
  soundOn: 'Âm thanh: bật',
  soundOff: 'Âm thanh: tắt',
  tocEyebrow: 'Nhạc lý cho guitar điện',
  tocTitle: 'Học cần đàn qua hình',
  tocLead:
    'Những bài ngắn, mỗi ý là một hình bạn chơi được. Bấm vào nốt nào cũng nghe được. Shape đi trước, tên gọi đến sau, khi bạn thật sự cần.',
  tocLessons: 'Các bài',
  tocConcepts: 'Khái niệm: {names}',
  notFound: 'Không có bài nào ở “{path}”. Dưới đây là tất cả các bài hiện có.',
  backToContents: '← Tất cả các bài',
  stepLabel: 'Bước {n}',
  takeaway: 'Ghi nhớ',
  tryIt: 'Tự thử',
  notYetEyebrow: 'Tạm gác lại',
  lessonFooter: 'Âm thanh được tổng hợp ngay trong trình duyệt. Không theo dõi, không tải gì lên.',
  navLabel: 'Các mục',
  navLessons: 'Bài học',
  navReview: 'Ôn tập',
  navPractice: 'Luyện tập',
  tocReview: 'Ôn tập: nên làm bài đố nào tiếp →',
  reviewTitle: 'Ôn tập',
  reviewLead:
    'Mỗi bài đố trong các bài học lưu điểm ngay trên máy này. Danh sách đặt bài đố cần bạn nhất lên đầu: bài chưa thử, rồi bài hay sai, rồi bài đã một tuần chưa tập.',
  reviewNext: 'Làm bài này trước',
  reviewReason: { new: 'Chưa thử', weak: 'Cần tập thêm', stale: 'Đến lúc ôn lại', fresh: 'Đang ổn' },
  reviewStats: 'Đúng {acc}% trong {n} câu gần nhất · chuỗi đúng dài nhất {best}',
  reviewLastToday: 'Tập lần cuối hôm nay',
  reviewLastYesterday: 'Tập lần cuối hôm qua',
  reviewLastDays: 'Tập lần cuối {days} ngày trước',
  reviewOpen: 'Tới bài đố',
  reviewFooter: 'Điểm chỉ nằm trong trình duyệt này. Không theo dõi, không tải gì lên.',
  tempoBest: 'Tốt nhất: {bpm} BPM',
  trainerLink: 'Tập lick trên vòng này trong app Luyện tập của Guitarmateur →',
};

export const UI: Readonly<Record<Lang, UiStrings>> = { en, vi };
