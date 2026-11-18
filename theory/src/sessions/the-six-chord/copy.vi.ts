import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Hợp âm trầm trong giọng trưởng: vi',
  summary: 'Làm quen với hợp âm vi — hợp âm thứ duy nhất mà phần lớn bài pop sử dụng — và lắng nghe cách nó làm dịu vòng hợp âm.',
  goal: 'Sau buổi học này bạn có thể nhận ra hợp âm vi bằng tai, chơi I–V–vi–IV và I–vi–IV–V, và biết hợp âm vi nằm ở đâu trong giọng.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'I, IV và V là ba hợp âm trưởng của một giọng trưởng (G, C, D trong giọng G).',
    'Hợp âm trưởng nghe sáng và mở; hợp âm thứ nghe trầm và lắng đọng hơn.',
    'Hợp âm đổi ở phách 1.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Một bài hát ở giọng trưởng không nhất thiết lúc nào cũng phải tươi vui.',
        'Nhiều bài hát đan cài một hợp âm thứ để giai điệu thêm chút lắng đọng và chiều sâu cảm xúc.',
        'Hãy nghe bốn bar ở giọng G. Bar đầu tiên luôn là G (I). Đúng một trong ba bar tiếp theo là hợp âm thứ: bạn có nghe ra nó nằm ở bar nào không?',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Dựng một triad trên bậc 6 của scale G major (nốt E) và bạn có hợp âm E minor: Em.',
        'Vì là hợp âm thứ, người chơi đàn viết nó bằng số La Mã chữ thường: vi.',
        'Để ý rằng Em (E–G–B) chia sẻ hai nốt với G (G–B–D). Đó là lý do vi mang lại cảm giác gần như về nhà: êm dịu như hợp âm I, nhưng phảng phất nét buồn.',
        'Cùng với I, IV và V, hợp âm vi hoàn thiện bộ "bốn hợp âm" quen thuộc trong hàng trăm bài hát nổi tiếng.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Hãy chơi bốn hợp âm trong giọng G: G (I), D (V), Em (vi) và C (IV).',
        'Trong vòng lặp đầu tiên (I–V–vi–IV), hợp âm vi xuất hiện ngay sau sức căng của V.',
        'Trong vòng lặp thứ hai (I–vi–IV–V), vi đi liền sau I tạo nên bước chuyển cảm xúc sâu lắng ngay từ đầu.',
        'Khi đổi sang giọng D: I là D, V là A, IV là G và vi là Bm. Vì Bm không có open shape nên được bấm dưới dạng hợp âm chặn ở phím 2.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Lắng nghe một vòng bốn bar sử dụng các hợp âm I, IV, V và vi.',
        'Bar 1 luôn là I. Hãy chú ý lắng nghe màu sắc hợp âm thứ xuất hiện ở đâu: đó chính là hợp âm vi.',
        'Điền đúng cả bốn bar và hướng tới mục tiêu làm đúng ba vòng liên tiếp.',
      ],
    },
  },
  blocks: {
    minor: {
      intro: 'Các bài pop ở giọng trưởng thường dùng một hợp âm thứ để thêm chiều sâu cảm xúc. Hãy nghe bốn bar.',
      ask: 'Bar nào có hợp âm thứ?',
      answers: {
        '2': 'Bar 2',
        '3': 'Bar 3',
        '4': 'Bar 4',
      },
      right: 'Đúng: {answer}. Hợp âm thứ là {detail}.',
      wrong: 'Đó là {answer}: {detail}. Hãy nghe lại bốn bar, với hợp âm thứ được ngân dài hơn.',
    },
    family: {
      intro: 'Quan sát các hợp âm của giọng G major. Các hợp âm 1, 4, 5 là hợp âm trưởng, còn hợp âm 6 là hợp âm thứ: Em, viết là vi.',
    },
    shapes: {
      intro: 'Bốn hợp âm phổ biến nhất trong âm nhạc hiện đại: G, D, Em, C (I, V, vi, IV). Bấm vào hợp âm bất kỳ để nghe thử.',
    },
    loopA: {
      intro: 'Chơi I–V–vi–IV ở 80 BPM. Hãy lắng nghe cách vi (Em) làm dịu vòng hợp âm giữa V (D) và IV (C).',
    },
    loopB: {
      intro: 'Bây giờ hãy thử I–vi–IV–V. Trong giọng D, vi là Bm: vì Bm không có open shape nên được bấm dạng hợp âm chặn ở phím 2.',
    },
    fill: {
      intro: 'Bốn bar, bar 1 luôn là I. Lắng nghe, nhận biết vị trí của hợp âm vi (và IV hoặc V), rồi kiểm tra.',
      ask: 'Chọn hợp âm cho mỗi bar',
      allRight: 'Cả bốn bar đều đúng!',
      someWrong: 'Một số bar chưa đúng. Bấm Nghe lại để so sánh.',
    },
  },
  check: [
    {
      question: 'Trong giọng trưởng, vì sao hợp âm bậc 6 được viết bằng chữ thường là vi?',
      options: ['Vì nó là một hợp âm thứ.', 'Vì nó có sáu nốt.', 'Vì nó được quạt nhỏ hơn.'],
      why: 'Quy ước số La Mã dùng chữ thường (như vi) cho hợp âm thứ và chữ hoa (như I, IV, V) cho hợp âm trưởng.',
    },
    {
      question: 'Trong giọng G, hợp âm vi là…',
      options: ['Em', 'Am', 'Bm'],
      why: 'Đếm sáu bậc của scale G major (G, A, B, C, D, E) cho ra E: hợp âm vi là Em.',
    },
    {
      question: 'Vòng bốn hợp âm I–V–vi–IV nổi tiếng vì hợp âm vi…',
      options: ['thêm nét lắng đọng vào giọng trưởng.', 'đổi hẳn bài hát sang giọng thứ.', 'luôn bắt buộc phải bấm chặn.'],
      why: 'Hợp âm vi mang lại sự tương phản cảm xúc sâu lắng trước khi IV và V nâng âm nhạc quay về nhà.',
    },
  ],
  canDo: [
    'Tôi có thể nghe ra khi nào một vòng hợp âm đi qua hợp âm vi.',
    'Tôi có thể chơi I–V–vi–IV và I–vi–IV–V ở giọng G.',
    'Tôi biết trong giọng G, hợp âm vi là Em.',
  ],
};
