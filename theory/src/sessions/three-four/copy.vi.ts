import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Ba phách trong một bar',
  summary: 'Làm quen với nhịp 3/4: phân biệt nhịp 3 và nhịp 4 bằng tai, quạt điệu waltz và tìm hợp âm cho hai bài hát.',
  goal: 'Sau buổi học này bạn có thể nghe ra một bài hát đếm theo nhịp 3 hay nhịp 4, quạt nhịp 3 và tìm hợp âm cho hai bài hát nhịp 3.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'Phách, bar, phách 1 là phách mạnh.',
    'Hợp âm đổi ở phách 1.',
    'Thử hợp âm I, rồi đến V, rồi đến IV.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Gõ nhịp theo tiếng click và đếm bắt đầu từ mỗi phách mạnh: bạn đếm đến 3 hay 4?',
        'Nhịp 4/4 đếm 1 2 3 4; nhịp 3/4 đếm 1 2 3.',
        'Hãy lắng nghe từng câu nhạc và cảm nhận có bao nhiêu phách giữa các xung nhịp mạnh.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Số lượng phách trong một bar được gọi là time signature.',
        '4/4 có bốn phách; nhịp 3/4 có ba phách: MẠNH nhẹ nhẹ.',
        'Hình minh hoạ là tiếng click 4/4 quen thuộc: hãy đếm thử một lần, rồi quay lại bài tập drill và đếm 3.',
        'Một bài hát nhịp 3 không bao giờ khớp với cách đếm 4: phách mạnh sẽ bị lệch đi.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Đánh xuống ở mỗi phách, nhấn vào phách 1.',
        'Sau đó thử mẫu quạt: xuống, xuống-lên, xuống-lên.',
        'Giữ nhịp 3 phách thật đều đặn khi chuyển hợp âm.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Hai bài hát ở nhịp 3. Cả hai đều bắt đầu trước phách 1 (pickup): ô đầu tiên không có hợp âm.',
        'Lắng nghe giai điệu và tìm hợp âm phù hợp cho mỗi ô.',
        'Thử hợp âm I trước, sau đó đến V và IV.',
      ],
    },
  },
  blocks: {
    count: {
      intro: 'Gõ nhịp theo tiếng click và đếm từ mỗi phách mạnh: bạn đếm được 3 hay 4 phách?',
      ask: 'Ba hay bốn phách trong một bar?',
      answers: {
        three: '3 phách',
        four: '4 phách',
      },
      right: 'Đúng: {answer} trong một bar.',
      wrong: 'Đó là {answer} trong một bar. Hãy nghe nhịp còn lại để so sánh.',
    },
    beat: {
      intro: 'Số phách trong một bar là time signature. 4/4 có bốn phách; nhịp 3/4 có ba phách: MẠNH nhẹ nhẹ. Hãy đếm nhịp 4/4 ở đây rồi đối chiếu với nhịp 3/4.',
    },
    waltz: {
      intro: 'Đánh xuống ở mỗi phách, nhấn vào phách 1. Chơi I–I–IV–I ở giọng G tại 90 BPM với ba phách trong một bar.',
    },
    waltz2: {
      intro: 'Bây giờ hãy thử đánh xuống, xuống-lên, xuống-lên (D-DUDU). Chơi I–V–V–I ở giọng G.',
    },
    first: {
      intro: 'Một giai điệu quen thuộc ở nhịp 3. Bài hát bắt đầu trước phách 1 (pickup), vì vậy ô đầu tiên không có hợp âm.',
      ask: 'Chọn hợp âm cho mỗi ô',
      result: 'Đúng {right} trên {total} ô.',
      allRight: 'Hoàn toàn chính xác: mọi hợp âm đều khớp!',
    },
    second: {
      intro: 'Một bài thánh ca bất hủ ở nhịp 3. Tương tự bài trước, bài hát bắt đầu bằng pickup trước phách 1.',
      ask: 'Chọn hợp âm cho mỗi ô',
      result: 'Đúng {right} trên {total} ô.',
      allRight: 'Hoàn toàn chính xác: mọi hợp âm đều khớp!',
    },
  },
  check: [
    {
      question: 'Nhịp 3/4 có nghĩa là gì?',
      options: ['Ba phách trong một bar.', 'Ba bar trong một bài hát.', 'Chơi ba hợp âm cùng một lúc.'],
      why: 'Trong nhịp 3/4, con số phía trên chỉ ra rằng có ba phách trong mỗi bar.',
    },
    {
      question: 'Để tìm time signature của bài hát bằng tai, hãy đếm từ…',
      options: ['mỗi phách mạnh.', 'cuối bài hát.', 'nốt giai điệu nhanh nhất.'],
      why: 'Phách 1 của mỗi bar là phách mạnh. Đếm các phách từ phách mạnh này sang phách mạnh tiếp theo sẽ cho biết time signature.',
    },
    {
      question: 'Trong nhịp 3/4, các hợp âm thường đổi ở…',
      options: ['phách 1.', 'phách 2.', 'phách 3.'],
      why: 'Hợp âm hầu như luôn chuyển đổi ở phách mạnh (phách 1) của bar.',
    },
  ],
  canDo: [
    'Tôi có thể nghe ra bài hát đếm nhịp 3 hay nhịp 4.',
    'Tôi có thể quạt đều nhịp 3/4.',
    'Tôi đã tìm được hợp âm của cả hai bài hát ở nhịp 3/4.',
  ],
};
