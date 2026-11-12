import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Vui hay buồn: trưởng và thứ',
  summary: 'Nghe hợp âm là trưởng hay thứ, và chơi E thứ cùng E trưởng.',
  goal: 'Sau buổi tập này bạn có thể nghe ra một hợp âm là trưởng hay thứ, và chơi E thứ cùng E trưởng.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Một hợp âm gồm nhiều nốt vang lên cùng lúc.',
        'Một số hợp âm nghe tươi sáng hoặc vui, một số nghe trầm hoặc buồn.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Các hợp âm tươi sáng được gọi là trưởng, các hợp âm trầm buồn là thứ.',
        'Đàn guitar có sáu dây, đánh số từ 1 (dây mỏng nhất) tới 6 (dây dày nhất); phím là từng ô trên cần đàn.',
        'Hợp âm trưởng và thứ trên cùng một root chỉ khác nhau một nốt: trên hình, hãy chuyển qua lại giữa E và Em và để ý một chấm dời một phím.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Nhìn hình hợp âm và bấm ngón ngay sát phía sau phím.',
        'Quạt xuống qua cả sáu dây.',
        'Bấm Em trước bằng hai ngón, rồi thêm một ngón để thành E.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Ứng dụng sẽ chơi E hoặc Em. Hãy chơi lại trên đàn những gì bạn vừa nghe, rồi mở đáp án.',
        'Mục tiêu là đúng 10 lần liên tiếp.',
      ],
    },
  },
  blocks: {
    quality: {
      intro: 'Lắng nghe hợp âm và chú ý cảm giác của nó.',
      ask: 'Vui hay buồn?',
      answers: { major: 'Vui', minor: 'Buồn' },
      right: 'Đúng. Đó là {detail}: một hợp âm {answer}.',
      wrong: 'Đó là {detail}: một hợp âm {answer}. Cả hai sẽ phát lại.',
    },
    strings: {
      intro: 'Khám phá sáu dây từ dây 1 (dây mỏng nhất) tới dây 6 (dây dày nhất).',
    },
    open: {
      intro: 'Chọn E, rồi Em. Chỉ một ngón tay thay đổi.',
    },
    shapes: {
      intro: 'Đặt ngón tay ngay sau phím và quạt qua cả sáu dây.',
    },
    echo: {
      intro: 'Lắng nghe kỹ, chơi lại hợp âm trên đàn guitar của bạn, rồi mở đáp án.',
      ask: 'Chơi lại những gì bạn vừa nghe.',
      answer: 'Đó là {detail}.',
    },
  },
  check: [
    {
      question: 'Điểm khác nhau giữa E và E thứ là gì?',
      options: [
        'Được chơi trên các dây khác nhau.',
        'Một nốt thấp hơn một phím.',
        'Có thêm hai nốt nữa.',
      ],
      why: 'E và E thứ có cùng root; chỉ một nốt dịch chuyển một phím.',
    },
    {
      question: 'Dây nào là dây 6?',
      options: [
        'Dây dày nhất.',
        'Dây mỏng nhất.',
        'Dây ở giữa.',
      ],
      why: 'Dây 6 là dây dày nhất trên đàn guitar.',
    },
    {
      question: 'Một hợp âm nghe trầm và buồn. Đó thường là…',
      options: [
        'Một hợp âm trưởng.',
        'Một dây buông.',
        'Một hợp âm thứ.',
      ],
      why: 'Hợp âm thứ thường mang cảm giác trầm buồn hơn so với hợp âm trưởng tươi sáng.',
    },
  ],
  canDo: [
    'Tôi có thể nghe ra một hợp âm là trưởng hay thứ.',
    'Tôi có thể chơi Em và E rồi chuyển qua lại giữa hai hợp âm.',
  ],
};
