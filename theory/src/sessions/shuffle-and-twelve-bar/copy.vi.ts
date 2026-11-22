import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Shuffle và 12-bar blues',
  summary: 'Nghe nhịp dài–ngắn của shuffle và đếm trọn một vòng blues giọng A.',
  goal: 'Giữ phách đều khi chơi shuffle và đoán trước chỗ đổi hợp âm trong 12-bar blues.',
  needs: 'Một cây guitar lên dây chuẩn. Khoảng 15–20 phút.',
  recap: ['Một bar nhịp 4/4 có bốn phách.', 'Ở giọng A, I, IV và V có root lần lượt là A, D và E.'],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Gõ chân bốn phách đều khi nghe. Cả hai kiểu đều có hai nốt mỗi phách. Để ý xem nốt thứ hai rơi đúng giữa hai lần gõ chân hay đến muộn hơn.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Chia mỗi phách thành ba phần bằng nhau và đếm “1 trip-let, 2 trip-let”. Đó là một triplet mỗi phách. Khi chơi shuffle, gảy vào số đếm và tiếng “let”. Nốt thứ hai rơi vào vị trí hai phần ba của phách. Chân vẫn gõ vào các số đếm.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Phát backing giọng A và đếm ba nhóm, mỗi nhóm bốn bar. Cuối bar 4, nói “tới D7”, rồi quạt D7 vào phách 1 của bar 5. Làm tương tự với E7 ở bar 9 và D7 ở bar 10. Chỉ cần quạt một lần ở phách 1. Dùng phần còn lại của bar để đếm nhịp.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Nghe hết một vòng và đếm theo trước khi điền chỗ trống. Sau khi kiểm tra, quay lại sơ đồ 12 bar ở phần Hiểu. Bật Quick change để nghe D7 ở bar 2, hoặc bật Turnaround để nghe E7 ở bar 12 dẫn về A7.',
      ],
    },
  },
  blocks: {
    feel: {
      intro:
        'Click giữ phách đều, còn riff gảy luân phiên hai cao độ. Khi nghe phát lại theo kiểu còn lại, thử giữ chân gõ đều như lúc đầu.',
      ask: 'Các nốt móc đơn vừa rồi là straight hay shuffle?',
      answers: { straight: 'Straight', shuffle: 'Shuffle' },
      right: 'Đúng. Bạn vừa nghe {answer}.',
      wrong: 'Bạn vừa nghe {answer}. Nghe cùng riff theo kiểu còn lại rồi nghe lại kiểu ban đầu.',
    },
    shuffle: {
      intro:
        'Phát ví dụ một nốt rồi chuyển qua lại giữa Thẳng và Shuffle. Nhìn nốt thứ hai đổi chỗ trên lưới trong khi phách kế tiếp vẫn đứng yên. Thử gảy cả hai kiểu trên dây A buông.',
    },
    form: {
      intro:
        'Giữ giọng A và tắt cả hai công tắc. Khi backing chạy, nhìn ba hàng, mỗi hàng bốn bar. A7 (I7) chạy suốt hàng đầu, D7 (IV7) mở đầu hàng hai và E7 (V7) mở đầu hàng ba.',
    },
    open: {
      intro:
        'Hợp âm dominant 7 thêm ♭7 vào triad trưởng. Chọn A7, D7 và E7 để nghe và xem các thế open chord dùng cho vòng blues này. Chọn một hợp âm rồi chuyển về triad của nó để nghe tác dụng của ♭7.',
    },
    backing: {
      intro:
        'Bấm Phát và nhìn bar đang sáng để so lại mình đếm tới đâu. Tập các chỗ đổi hợp âm ở giọng A trước khi thử giọng khác.',
    },
    chorus: {
      intro: 'Bấm Bắt đầu. Lưới chạy theo đủ 12 bar. Lắng nghe hợp âm còn thiếu ở bar 5, 9 và 10.',
      ask: 'Bạn điền hợp âm nào vào mỗi bar còn trống?',
      allRight:
        'Bạn tìm đúng cả ba chỗ đổi hợp âm. Phát lại cả vòng và gọi tên hợp âm mới trước một phách.',
      someWrong: 'Lưới đã hiện đủ hợp âm. Phát lại và nghe những chỗ khác với lựa chọn của bạn.',
    },
  },
  check: [
    {
      question: 'Nốt móc đơn thứ hai rơi vào đâu khi chơi triplet shuffle?',
      options: ['Giữa phách', 'Hai phần ba của phách', 'Đúng phách kế tiếp'],
      why: 'Khi chơi shuffle, bạn gảy ở phần thứ nhất và thứ ba của triplet.',
    },
    {
      question: 'Trong vòng blues cơ bản giọng A, hợp âm nào mở đầu bar 5 và bar 9?',
      options: ['D7 rồi E7', 'E7 rồi D7', 'A7 rồi D7'],
      why: 'Bar 5 chuyển sang IV7 (D7). Bar 9 chuyển sang V7 (E7).',
    },
    {
      question: 'Hợp âm dominant 7 thêm bậc nào vào triad trưởng?',
      options: ['3', '7', '♭7'],
      why: 'Công thức dominant 7 gồm 1, 3, 5 và ♭7.',
    },
  ],
  canDo: [
    'Tôi chơi được nốt móc đơn kiểu shuffle trong khi chân vẫn gõ bốn phách đều.',
    'Tôi đếm đủ 12 bar ở giọng A và vào đúng D7, E7, D7 trên phách 1 của bar 5, 9, 10.',
  ],
};
