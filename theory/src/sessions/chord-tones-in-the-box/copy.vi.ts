import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Nốt của hợp âm trong box',
  summary: 'Giữ nguyên một box và tìm những nốt thuộc hợp âm đang vang.',
  goal: 'Đáp vào một nốt của hợp âm mới ngay phách 1 và nghe nốt đó hòa với hợp âm.',
  needs: 'Một cây guitar lên dây chuẩn. Khoảng 15–20 phút.',
  recap: [
    'Bạn có thể dùng cùng một box pentatonic suốt vòng hợp âm trong một giọng.',
    'Bậc của một nốt trong hợp âm được tính từ root của hợp âm đang vang.',
  ],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Nghe hợp âm được quạt rồi để ý nốt ngân ở cuối câu. Ngân nga nốt đó trên nền hợp âm. Câu nhạc nghe đã tới chỗ dừng hay vẫn muốn đi tiếp?',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Scale cho bạn nhóm nốt của giọng. Hợp âm đang vang cho bạn chỗ đáp. Triad gồm root, bậc 3 và bậc 5. Hợp âm 7 thêm một bậc 7. Nốt trong scale nằm ngoài hợp âm có thể tạo độ căng rồi dẫn vào một nốt của hợp âm.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Giữ tay trong box 1 của A minor pentatonic. Khi Am vào phách 1, chơi E ở phím 5 dây 2. E là bậc 5 của Am. Khi sang G, chơi G ở phím 8 cùng dây vào phách 1. G là root của hợp âm mới. Nghe hai bar còn lại rồi lặp lại.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Trong giọng G trưởng, đáp vào B trên dây 2 buông đúng phách 1 của G. B là bậc 3 của G. Khi tới D, chơi D ở phím 3 trên dây đó. Ở bar cuối, thử kết ở G tại phím 3 dây 1. Trên hợp âm C, G là bậc 5.',
      ],
    },
  },
  blocks: {
    landing: {
      intro: 'Chỉ xét nốt ngân ở cuối câu. Khi nghe lại, hai nốt đầu và hợp âm vẫn giữ nguyên.',
      ask: 'Nốt cuối có thuộc hợp âm đang vang không?',
      answers: { chordTone: 'Nốt của hợp âm', outside: 'Nốt ngoài hợp âm' },
      right: 'Đúng. Nốt đáp là {detail}.',
      wrong:
        'Bạn vừa nghe {answer}. Nốt đáp là {detail}. Nghe nốt kết còn lại trước, rồi nghe lại câu ban đầu.',
    },
    intervals: {
      intro:
        'Bấm phím 7 dây 5 để tìm E cao hơn C. Phát cặp nốt để nghe quãng 3 trưởng. Hạ E nửa cung để nghe quãng 3 thứ.',
    },
    scale: {
      intro: 'Chọn Rock i–VII–VI–VII. Nhìn box A minor pentatonic và nghe các root thay đổi. Backing ở phần Chơi thêm các nốt bậc 3 để bạn nghe rõ từng hợp âm.',
    },
    tones: {
      intro:
        'Chọn cùng backing rock ở đây. Khi đang dừng, chọn Am rồi G. Nhìn các nốt sáng lên trong khi tay vẫn giữ nguyên box.',
    },
    rock: {
      intro:
        'Phát ở giọng A. Khi bar sáng lên, gọi tên hợp âm đang vang rồi mới đọc bậc trên cần đàn.',
    },
    pop: {
      intro:
        'Bắt đầu ở giọng G và thử một nốt vào mỗi phách 1 mới. Dùng các chấm sáng để tìm nốt đáp rồi nghe xem vai trò của nó đổi thế nào khi hợp âm đổi.',
    },
  },
  check: [
    {
      question: 'E là bậc nào trên Am?',
      options: ['Root', 'Bậc 5', 'Bậc ♭3'],
      why: 'Am gồm A, C và E. E cao hơn A bảy nửa cung.',
    },
    {
      question: 'Điều gì đổi khi sang G từ Am mà bạn vẫn giữ nguyên box?',
      options: ['Những nốt thuộc hợp âm đang vang', 'Các phím trong box', 'Cách lên dây'],
      why: 'Hợp âm đổi bên dưới cùng các nốt của scale, nên vai trò của các nốt cũng đổi.',
    },
    {
      question: 'Nốt ngoài hợp âm có thể làm gì trong câu nhạc?',
      options: [
        'Tự đổi giọng của bài',
        'Dời phách 1',
        'Tạo độ căng trước khi đáp vào nốt của hợp âm',
      ],
      why: 'Thử chơi nốt ngoài hợp âm thật ngắn rồi nghe cảm giác lúc đáp vào một nốt thuộc hợp âm.',
    },
  ],
  canDo: [
    'Tôi chơi được E trên Am và G trên G vào phách 1 trong cùng một box.',
    'Tôi chọn được một nốt khác của hợp âm để đáp vào phách 1 trên backing giọng G trưởng.',
  ],
};
