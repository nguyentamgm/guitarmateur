import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Tìm giai điệu bằng tai',
  summary:
    'Nghe giai điệu đi liền bậc hay nhảy quãng, và bắt chước các câu nhạc ngắn trên một dây.',
  goal: 'Sau buổi học này bạn có thể nghe giai điệu đi liền bậc hay nhảy quãng, và bắt chước một giai điệu ngắn trên một dây.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'Root là nốt mà bài hát nghỉ lại và nghe như về nhà.',
    'Lên hoặc xuống một phím là một nửa cung.',
    'G là dây buông số 3 và cũng là phím 3 trên dây 6.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Giai điệu đi lên hoặc đi xuống, bằng các bước liền bậc hoặc nhảy quãng.',
        'Đi liền bậc là chuyển sang ngay nốt kế tiếp của scale. Nhảy quãng là nhảy qua nhiều nốt.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Hầu hết các giai điệu chỉ dùng bảy nốt xung quanh root: đó là major scale.',
        'Chúng ta đánh số các nốt từ 1 đến 7 từ root; 8 là root lặp lại, ở cao hơn. Các con số này là bậc.',
        'Trên một dây đàn, scale là một chuỗi khoảng cách phím mà bạn có thể nhìn thấy: hai phím, hai phím, một phím, hai, hai, hai, một.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Hãy hát câu nhạc trước, rồi bấm nốt trên đàn.',
        'Nốt đầu tiên luôn là root (dây buông).',
        'Nếu bạn bấm sai, ứng dụng sẽ cho biết nốt bạn cần tìm là cao hơn hay thấp hơn.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Ba câu nhạc của một giai điệu quen thuộc. Đừng tra cứu: hãy tự tìm ra nó.',
        'Sau đó hãy chơi cả ba câu liền nhau trên cây đàn của bạn.',
      ],
    },
  },
  blocks: {
    moves: {
      intro:
        'Giai điệu đi lên hoặc đi xuống, bằng các bước liền bậc hoặc nhảy quãng. Hãy nghe hai nốt.',
      ask: 'Liền bậc, hay nhảy quãng?',
      answers: {
        stepUp: 'Lên liền bậc',
        stepDown: 'Xuống liền bậc',
        leapUp: 'Nhảy lên',
        leapDown: 'Nhảy xuống',
      },
      right: 'Đúng: {answer}.',
      wrong: 'Đó là {answer}. Hãy nghe lại hai nốt, chậm hơn.',
    },
    formula: {
      intro:
        'Major scale là một quy luật gồm các bước: hai phím, hai phím, một phím, hai, hai, hai, một.',
    },
    echo: {
      intro:
        'Hãy hát câu nhạc trước, rồi bấm nốt. Nốt đầu tiên luôn là root (dây buông). Nếu bạn bấm sai, ứng dụng sẽ cho biết nốt bạn cần tìm là cao hơn hay thấp hơn.',
      ask: 'Nghe câu nhạc, rồi bấm lại theo tai.',
      right: 'Đúng.',
      higher: 'Nốt bạn cần tìm cao hơn.',
      lower: 'Nốt bạn cần tìm thấp hơn.',
      done: 'Bạn đã bắt chước các câu nhạc bằng tai.',
    },
    tune: {
      intro:
        'Ba câu nhạc của một giai điệu quen thuộc. Đừng tra cứu: hãy tự tìm ra nó. Sau đó hãy chơi cả ba câu liền nhau trên cây đàn của bạn.',
      ask: 'Tìm từng câu nhạc trên dây 3.',
      right: 'Đúng.',
      higher: 'Nốt bạn cần tìm cao hơn.',
      lower: 'Nốt bạn cần tìm thấp hơn.',
      done: 'Đó là bài Frère Jacques.',
    },
  },
  check: [
    {
      question: 'Có bao nhiêu nốt khác nhau trong một major scale?',
      options: ['5', '7', '12'],
      why: 'Một major scale có 7 nốt khác nhau. Bậc 8 là root lặp lại ở quãng tám cao hơn.',
    },
    {
      question: 'Bậc 1 của một scale là…',
      options: ['root.', 'nốt cao nhất.', 'bất kỳ nốt nào bạn chọn.'],
      why: 'Bậc 1 luôn là root của scale.',
    },
    {
      question: 'Trước khi thử chơi một câu nhạc trên đàn guitar…',
      options: ['đếm số phím đàn.', 'đoán nốt cao nhất.', 'hát hoặc ngân nga câu đó.'],
      why: 'Nếu bạn có thể hát hoặc ngân nga câu nhạc trước, đôi tai sẽ dẫn lối cho ngón tay tìm ra nó.',
    },
  ],
  canDo: [
    'Tôi có thể phân biệt đi liền bậc và nhảy quãng.',
    'Tôi có thể bắt chước một câu nhạc ba nốt.',
    'Tôi có thể chơi giai điệu của phần thử thách trên một dây.',
  ],
};
