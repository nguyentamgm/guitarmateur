import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Tìm giai điệu bằng tai',
  summary: 'Phân biệt liền bậc với nhảy quãng, và tìm giai điệu ngắn trên một dây.',
  goal: 'Sau buổi học này bạn có thể nghe giai điệu đi liền bậc hay nhảy quãng, và tự tìm một giai điệu ngắn bằng tai trên một dây.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'Root là nốt mà bài hát nghỉ lại và nghe như về nhà.',
    'Lên hoặc xuống một phím là một nửa cung.',
    'Dây buông số 3 là nốt G.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Giai điệu di chuyển lên hoặc xuống từ nốt này sang nốt khác.',
        'Có lúc nó sang ngay nốt kế bên (liền bậc). Có lúc nó nhảy qua nhiều nốt (nhảy quãng).',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Hầu hết các giai điệu chỉ dùng bảy nốt xung quanh root: đó là major scale.',
        'Ta đánh số chúng từ 1 đến 7 tính từ root; bậc 8 là root lặp lại ở cao độ cao hơn. Các con số này là bậc.',
        'Trên một dây đàn, major scale đi theo một chuỗi khoảng cách phím cố định từ root: hai phím, hai phím, một phím, rồi hai, hai, hai, một.',
        'Ở giọng G trên dây 3, năm nốt đầu nằm ở phím 0 (G), 2 (A), 4 (B), 5 (C) và 7 (D).',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Bây giờ hãy bắt chước các câu ba nốt ở giọng G trên dây 3 (bậc 1 đến 5, từ phím 0 đến phím 7).',
        'Hãy ngân nga câu nhạc trước khi bấm trên màn hình. Khi đã tìm ra, hãy gảy lại đúng các phím đó trên cây đàn của bạn.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Tự tìm ba câu của một giai điệu quen thuộc ở giọng G trên dây 3 mà không tra cứu.',
        'Ở đây không phải câu nào cũng bắt đầu từ dây buông, nên hãy nhìn chấm đang sáng sẵn trước khi dò các nốt tiếp theo.',
      ],
    },
  },
  blocks: {
    moves: {
      intro:
        'Bấm Bắt đầu để nghe hai nốt, rồi chọn xem nốt thứ hai đi lên hay đi xuống, liền bậc hay nhảy quãng.',
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
        'Chọn giọng G bên dưới rồi nghe chuỗi nốt chạy dọc dây 5 để thấy các khoảng cách +2 và +1, sau đó đổi sang giọng khác để thấy cùng quy luật đó dịch chuyển.',
    },
    echo: {
      intro:
        'Bấm Bắt đầu. Nốt đầu tiên đã được tô sáng sẵn ở phím 0 (dây 3 buông). Bấm hai chấm tiếp theo trên màn hình; nếu sai, gợi ý sẽ báo nốt cần tìm cao hơn hay thấp hơn. Hãy thử khoảng ba hoặc bốn câu.',
      ask: 'Nghe câu nhạc, rồi bấm lại trên dây 3.',
      right: 'Đúng.',
      higher: 'Nốt bạn cần tìm cao hơn.',
      lower: 'Nốt bạn cần tìm thấp hơn.',
      done: 'Bạn đã bắt chước các câu nhạc bằng tai.',
    },
    tune: {
      intro:
        'Tìm từng câu bằng tai rồi bấm Tiếp theo. Sau câu thứ ba, hãy chơi cả ba câu liền nhau trên cây đàn của bạn và bấm Nghe lại để tự đối chiếu.',
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
      why: 'Một major scale có 7 nốt khác nhau. Bậc 8 là root lặp lại, ở cao độ cao hơn.',
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
    'Tôi có thể bắt chước một câu ba nốt bằng tai trên dây 3.',
    'Tôi có thể chơi cả ba câu của giai điệu thử thách trên một dây.',
  ],
};
