import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Double stop và boogie',
  summary:
    'Nghe tiếng của hai dây vang cùng lúc rồi chen một double stop ngắn vào vòng shuffle 12 bar.',
  goal: 'Giữ nhịp suốt vòng boogie 12 bar và đáp một câu double stop ngắn trước khi vòng bắt đầu lại.',
  needs: 'Một cây guitar lên dây chuẩn. Khoảng 15–20 phút.',
  recap: [
    '12-bar blues giọng A dùng ba hợp âm A7, D7 và E7.',
    'Hai nốt cách một quãng 8 có cùng tên và khác cao độ.',
  ],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Ngân nga bè thấp. Để ý xem bạn nghe một nốt, thêm một nốt cao hơn quãng 4, hay cùng tên nốt vang thêm ở quãng 8 trên. Bè thấp dùng cùng bốn bậc trong cả ba kiểu.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Double stop là hai nốt vang cùng lúc. Thử phím 5 trên dây 2 và dây 1 trong box 1. Gảy riêng từng dây rồi cho E và A vang cùng nhau. Giữ hai ngón hoặc chặn nhẹ hai dây khi đưa cả cặp từ phím 3 lên phím 5.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Trên đàn, giữ dây 5 buông (A) và chơi phím 2–4–5–4 trên dây 4. Gảy cả hai dây cùng lúc. Hát bè trên E–F♯–G–F♯ trong khi A trầm giữ nguyên. Bè trên đi theo 5–6–♭7–6.',
        'Mỗi phách gảy cặp nốt hai lần theo shuffle. Dùng cùng dãy phím với dây D buông cho D7 và dây E trầm buông cho E7. Các nốt di chuyển nằm trên dây mảnh hơn liền kề. Nhìn lưới bar để biết khi nào đổi root.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Chơi boogie theo đủ vòng ở giọng A, đếm từng nhóm bốn bar. Ở bar 11, chơi boogie hết phách 3. Vào phách 4, gảy dây 2 và dây 1 cùng lúc ở phím 3. Slide cả cặp lên phím 5, tới nơi vào phách 1 của bar 12.',
        'Để cả cặp ngân qua phách 2 rồi chừa chỗ trống. Vào lại boogie ở phách 1 khi vòng bắt đầu lại. Nhìn hàng cuối của lưới để kiểm tra lúc bắt đầu câu đáp và lúc vào lại.',
      ],
    },
  },
  blocks: {
    texture: {
      intro:
        'Nghe xem mỗi lần gảy có thêm cao độ nào không. Nếu trả lời sai, bạn sẽ được nghe lại cùng câu ở tốc độ chậm hơn.',
      ask: 'Có mấy nốt vang cùng lúc và chúng cách nhau bao xa?',
      answers: { single: 'Nốt đơn', doubleStop: 'Double stop quãng 4', octave: 'Quãng 8' },
      right: 'Đúng. {answer}.',
      wrong: 'Bạn vừa nghe {answer}. Nghe lại cùng câu ở tốc độ chậm hơn.',
    },
    shapes: {
      intro:
        'Chọn 4 rồi dời shape đến phím 5 dây 2. Nốt còn lại cũng ở phím 5 trên dây 1. Dời root sang dây 3 để thấy G–B shift làm nốt cao tiến thêm một phím.',
    },
    pair: {
      intro:
        'Trong box 1, chọn 2–1 · 5. Bấm Phát để nghe E và A cùng vang. Bấm Slide vào để nghe cặp dây đó đi từ phím 3 lên phím 5.',
    },
    boogie: {
      intro:
        'Giữ giọng A và tắt Quick change cùng Turnaround. Bấm Phát. Ở bar đầu, sơ đồ đặt A tại phím 5 trên dây 6. Nghe lại cao độ A trầm mà bạn vừa chơi trên dây buông và nhìn nốt phía trên đổi phím.',
    },
    backing: {
      intro:
        'Phát shuffle giọng A và nhìn bar đang sáng để tìm bar 11 và 12. Chuẩn bị cặp double stop trước khi tới hai bar cuối.',
    },
    octaves: {
      intro:
        'Phần tập thêm sau thử thách boogie. Chọn 6/4 rồi phát giai điệu quãng 8. Trên đàn, bấm A ở phím 5 dây 6 và nốt quãng 8 ở phím 7 dây 4. Dùng mặt dưới của ngón đang bấm dây 6 để chạm nhẹ dây 5. Quét qua ba dây và nghe hai nốt có cao độ.',
    },
  },
  check: [
    {
      question: 'Thế nào là một double stop?',
      options: ['Hai lần gảy trên một nốt', 'Hai nốt nối tiếp nhau', 'Hai nốt vang cùng lúc'],
      why: 'Ở phím 5 trên dây 2 và dây 1, E và A vang cùng nhau.',
    },
    {
      question: 'Bè trên đi theo các bậc nào trong boogie?',
      options: ['5–6–♭7–6', '1–♭3–4–5', '1–5–1–5'],
      why: 'Bè trầm giữ root của hợp âm trong khi ngón chơi bè trên đổi phím.',
    },
    {
      question: 'Sau câu đáp double stop, bạn vào lại boogie lúc nào?',
      options: ['Phách 2 của bar 12', 'Phách 1 của vòng kế tiếp', 'Bar 5 của vòng kế tiếp'],
      why: 'Chừa chỗ sau cú slide rồi bắt đầu vòng mới cùng backing.',
    },
  ],
  canDo: [
    'Tôi giữ được bè trầm và hát được bè trên đang di chuyển trong boogie.',
    'Tôi chen được double stop qua bar 11–12 rồi vào lại đúng phách 1 của vòng sau.',
  ],
};
