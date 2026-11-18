import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Các bài hát ở giọng thứ',
  summary: 'Khám phá giọng thứ, hiểu cách mỗi giọng trưởng chia sẻ hợp âm với một relative minor (giọng song song), và chơi sức hút V–i đầy kịch tính.',
  goal: 'Sau buổi học này bạn có thể phân biệt giọng trưởng và giọng thứ bằng tai, chơi các vòng hợp âm ở giọng A minor, và hiểu về relative minor.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'Hợp âm thứ nghe trầm và lắng đọng hơn hợp âm trưởng.',
    'Hợp âm vi trong C major là Am, dùng chung các nốt của scale C major.',
    'Hợp âm đổi ở phách 1.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Một đoạn nhạc có thể mang cảm giác tươi sáng, mở rộng (giọng trưởng) hoặc trầm lắng, kịch tính hơn (giọng thứ).',
        'Màu sắc này do hợp âm nào được bản nhạc chọn làm điểm nghỉ quyết định.',
        'Hãy nghe bốn hợp âm. Bạn có nhận ra vòng hợp âm này đang nghỉ lại ở giọng trưởng hay giọng thứ không?',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'C major và A minor dùng chung đúng bảy nốt: A, B, C, D, E, F, G. A minor được gọi là relative minor (giọng song song) của C major.',
        'Nếu coi C là nhà (I), âm nhạc nghe tươi sáng. Nếu coi A là nhà (i), âm nhạc chuyển sang màu trầm lắng và sâu sắc hơn.',
        'Vì sao hợp âm V lại là hợp âm trưởng thay vì hợp âm thứ? Trong tự nhiên, hợp âm bậc 5 của giọng thứ là hợp âm thứ (v, tức Em trong A minor). Nhưng hợp âm v thứ thiếu nốt dẫn sắc bén để kéo dứt khoát về i. Nâng nốt thứ 7 lên nửa cung (từ G lên G♯) sẽ biến v thành hợp âm trưởng V (E) hoặc dominant 7 (E7). Sức kéo này tạo nên cái kết đầy kịch tính đặc trưng của các giọng thứ.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Làm quen với ba hợp âm cốt lõi của A minor: Am (i), Dm (iv) và E (V).',
        'Trong vòng lặp đầu tiên (i–iv–V–i), hãy cảm nhận sức kéo mạnh mẽ của hợp âm trưởng V (E) khi giải toả về lại Am.',
        'Trong vòng lặp thứ hai (i–VI–VII–i), vòng hợp âm đi qua F và G trước khi về lại Am. Lưu ý: F không có open shape nên được bấm dạng hợp âm chặn ở phím 1.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Bốn bar ở giọng thứ (A minor hoặc E minor), với bar 1 luôn bắt đầu bằng hợp âm i.',
        'Lắng nghe vị trí xuất hiện của các hợp âm iv, V, VI và VII, rồi điền vào các bar còn thiếu.',
        'Hãy nhắm tới mục tiêu làm đúng ba vòng liên tiếp.',
      ],
    },
  },
  blocks: {
    mode: {
      intro: 'Mỗi giọng có một màu sắc riêng: giọng trưởng sáng và mở, còn giọng thứ trầm và lắng đọng. Hãy nghe bốn hợp âm.',
      ask: 'Vòng hợp âm này ở giọng trưởng hay giọng thứ?',
      answers: {
        major: 'Trưởng',
        minor: 'Thứ',
      },
      right: 'Đúng: {answer}. Hợp âm về nhà là {detail}.',
      wrong: 'Đó là {answer}: {detail}. Hãy nghe giọng còn lại trên cùng nốt root, rồi nghe lại câu hỏi.',
    },
    relative: {
      intro: 'C major và A minor dùng chung các nốt và hợp âm. Sự khác biệt nằm ở việc hợp âm nào là nhà.',
    },
    shapes: {
      intro: 'Ba hợp âm cơ bản của giọng A minor: Am (i), Dm (iv) và E (V). Bấm vào hợp âm bất kỳ để nghe thử.',
    },
    loopA: {
      intro: 'Chơi i–iv–V–i ở 80 BPM. Lắng nghe cách hợp âm trưởng V (E) kéo dứt khoát về Am (i).',
    },
    loopB: {
      intro: 'Vòng i–VI–VII–i rất được yêu thích trong nhạc rock và pop. F được bấm dạng hợp âm chặn ở phím 1.',
    },
    fill: {
      intro: 'Bốn bar ở giọng thứ, bar 1 luôn là i. Lắng nghe, chọn hợp âm cho mỗi bar, rồi kiểm tra.',
      ask: 'Chọn hợp âm cho mỗi bar',
      allRight: 'Cả bốn bar đều đúng!',
      someWrong: 'Một số bar chưa đúng. Bấm Nghe lại để so sánh.',
    },
  },
  check: [
    {
      question: 'C major và A minor là relative keys (giọng song song) vì chúng…',
      options: ['dùng chung đúng bảy nốt.', 'có cùng một nốt root.', 'đều là giọng trưởng.'],
      why: 'A minor dùng cùng các nốt với C major, nhưng coi nốt A là nhà (i) thay vì nốt C (I).',
    },
    {
      question: 'Trong giọng thứ, vì sao hợp âm V lại được chơi là hợp âm trưởng (hoặc dominant 7) thay vì hợp âm thứ?',
      options: ['Để tạo sức kéo mạnh hơn về hợp âm i.', 'Giọng thứ bị cấm dùng hợp âm thứ.', 'Vì hợp âm thứ mở quá khó bấm.'],
      why: 'Nâng bậc 7 lên nửa cung tạo ra nốt dẫn kéo căng thẳng trực tiếp vào hợp âm i.',
    },
    {
      question: 'Trong giọng A minor, ba hợp âm i, iv và V lần lượt là…',
      options: ['Am, Dm, E', 'Am, C, D', 'A, D, E'],
      why: 'Bậc 1 là Am (i), bậc 4 là Dm (iv), và bậc 5 có nốt dẫn được nâng lên là E trưởng (V).',
    },
  ],
  canDo: [
    'Tôi có thể phân biệt giọng trưởng và giọng thứ bằng tai.',
    'Tôi có thể chơi i–iv–V–i và i–VI–VII–i ở giọng A minor.',
    'Tôi có thể giải thích vì sao relative minor dùng chung hợp âm với giọng trưởng.',
  ],
};
