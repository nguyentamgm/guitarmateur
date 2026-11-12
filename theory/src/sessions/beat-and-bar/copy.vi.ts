import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Phách và bar',
  summary: 'Đếm 1 2 3 4, quạt trên mỗi phách, và chuyển giữa Em cùng Am đúng phách 1.',
  goal: 'Sau buổi tập này bạn có thể đếm 1 2 3 4, quạt trên mỗi phách, và chuyển giữa Em cùng Am đúng phách 1.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'Một hợp âm gồm nhiều nốt vang lên cùng lúc: hợp âm trưởng nghe tươi sáng và hợp âm thứ nghe trầm buồn.',
    'Bạn đã có thể chơi Em bằng hai ngón tay: ngón giữa và ngón áp út ở phím 2 của dây 5 và dây 4.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Âm nhạc có một nhịp đập đều đặn mà bạn có thể gõ chân theo.',
        'Hãy nghe tiếng click và tiếng đàn guitar: tiếng đàn rơi đúng tiếng click, hay rơi vào giữa các tiếng click?',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Nhịp đập đều đặn đó gọi là phách. Các phách đi theo từng nhóm, thường là bốn: một nhóm như vậy là một bar.',
        'Hãy đếm "1 2 3 4"; phách 1 nhấn mạnh hơn một chút. Tempo là tốc độ đi của các phách.',
        'Hợp âm hầu như luôn đổi ở phách 1.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Am là một hợp âm mới (hình hợp âm sẽ chỉ cách bấm). Quạt xuống một lần trên mỗi phách.',
        'Hai bar đầu chơi Em, rồi hai bar tiếp theo chơi Am. Hãy bắt đầu di chuyển các ngón tay từ phách 4, để ngón chạm dây đúng phách 1.',
        'Nếu bạn bị trễ, hãy giảm tempo xuống.',
        'Các chữ số La Mã nhỏ i và iv phía trên hợp âm sẽ được giải thích trong một buổi học sau.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Mỗi hợp âm một bar, tám bar liên tục không bị trễ nhịp ở tempo 80.',
        'Chậm hơn cũng được; đều nhịp quan trọng hơn nhanh.',
      ],
    },
  },
  blocks: {
    onBeat: {
      intro: 'Lắng nghe tiếng đàn guitar và tiếng click.',
      ask: 'Tiếng đàn rơi đúng tiếng click hay ở giữa các tiếng click?',
      answers: { on: 'Đúng tiếng click', off: 'Ở giữa các tiếng click' },
      right: 'Đúng: {answer}.',
      wrong: 'Đó là {answer}. Cả hai sẽ phát lại.',
    },
    beat: {
      intro: 'Gõ chân theo tiếng click: phách 1 có tiếng click cao hơn.',
    },
    counting: {
      intro: 'Đếm to theo các con số: 1 2 3 4.',
    },
    shapes: {
      intro: 'Đặt ngón tay cho Em và Am. Quạt qua các dây để nghe từng hợp âm.',
    },
    slow: {
      intro: 'Quạt xuống một lần trên mỗi phách. Hai bar Em, rồi hai bar Am.',
    },
    changes: {
      intro: 'Đổi hợp âm ở phách 1 của mỗi bar: Em, Am, Em, Am ở tempo 80.',
    },
  },
  check: [
    {
      question: 'Có bao nhiêu phách trong mỗi bar của buổi học này?',
      options: ['3', '4', '6'],
      why: 'Các bar trong buổi học này có 4 phách: đếm 1 2 3 4.',
    },
    {
      question: 'Hợp âm hầu như luôn thay đổi khi nào?',
      options: ['Ở phách 1.', 'Ở phách 4.', 'Ở giữa các phách.'],
      why: 'Hợp âm hầu như luôn thay đổi ở phách 1, phách đầu tiên của một bar mới.',
    },
    {
      question: 'Bạn nên làm gì nếu chuyển hợp âm bị trễ?',
      options: ['Bỏ qua hợp âm đó và chờ.', 'Quạt nhanh hơn ở phách tiếp theo.', 'Giảm tempo xuống và giữ đều phách.'],
      why: 'Giảm tempo giúp các ngón tay có đủ thời gian tiếp dây sạch sẽ ở phách 1 trong khi vẫn giữ phách đều.',
    },
  ],
  canDo: [
    'Tôi có thể đếm 1 2 3 4 theo tiếng click.',
    'Tôi có thể quạt Em và Am trên mỗi phách.',
    'Tôi có thể đổi hợp âm ở phách 1 mà không bị ngắt quãng.',
  ],
};
