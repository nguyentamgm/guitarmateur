import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Đổi giọng',
  summary:
    'Chuyển bài hát sang các giọng khác: giữ nguyên số La Mã và bắt đầu từ root mới, hoặc dùng capo để nâng cao độ các thế bấm mở.',
  goal: 'Sau buổi học này bạn có thể chuyển một bài hát I–IV–V sang giọng G, D và A, và dùng capo để chơi ở các giọng khác.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'I, IV và V cùng vai trò của từng hợp âm: I là nhà, V kéo về nhà, IV đi xa.',
    'Trong giọng G, các hợp âm đó là G, C và D.',
    'Bạn đã tự tìm được hợp âm cho hai bài hát bằng các hợp âm này.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Bấm Phát ở cả hai hàng. Đó là cùng một vòng hợp âm: một hàng chỉ vang cao hơn hàng kia.',
        'Điều gì đã được giữ nguyên? Chính là các con số La Mã.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Để đổi giọng (transpose), hãy giữ nguyên các số La Mã và bắt đầu từ một nốt root mới.',
        'Bảng dưới đây cho bạn các hợp âm I, IV, V trong bốn giọng. Giọng C cần hợp âm F là hợp âm chặn: buổi 14.',
        'Capo là một chiếc kẹp ngang qua một phím đàn; nó nâng mọi hợp âm thế bấm mở lên bấy nhiêu nửa cung. Bấm các shape của giọng G với capo ở ngăn 2 thì bài hát sẽ vang ra giọng A.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Hai thế bấm mới: A và E (bạn đã gặp E ở buổi 1); D bạn đã biết.',
        'Sau đó chơi cùng một vòng hợp âm ở cả giọng G, D và A: chuyển giọng bằng các nút chọn giọng.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Giai điệu từ buổi học trước, bây giờ ở giọng D, rồi chuyển sang giọng A.',
        'Điền vào các ô từ những con số bạn nhớ trong đầu, không cần phải bấm thử từng hợp âm.',
      ],
    },
  },
  blocks: {
    same: {
      intro:
        'Lắng nghe cùng một vòng hợp âm ở hai giọng khác nhau. So sánh cách vang lên của cả hai hàng.',
      caption:
        'Bấm Phát ở cả hai hàng. Đó là cùng một vòng hợp âm: một hàng chỉ vang cao hơn. Điều gì giữ nguyên? Các con số.',
    },
    table: {
      intro:
        'Để đổi giọng, giữ nguyên các số La Mã và bắt đầu từ root mới. Bảng dưới đây cho I, IV, V trong bốn giọng.',
      caption: 'Bấm các shape của giọng G với capo ở ngăn 2 thì bài hát sẽ vang ra giọng A.',
    },
    shapes: {
      intro:
        'Hai thế bấm mới: A và E. Cùng với D, chúng tạo thành bộ ba I, IV và V của giọng A trưởng.',
    },
    keys: {
      intro:
        'Chơi cùng một vòng hợp âm ở giọng G, D và A. Chuyển giọng bằng các nút chọn giọng và giữ đều nhịp.',
    },
    moved: {
      intro:
        'Twinkle Twinkle Little Star ở giọng D, rồi giọng A. Điền các ô từ những con số bạn nhớ, không thử mò.',
      ask: 'Chọn hợp âm cho từng ô',
      result: '{right} / {total} ô đúng.',
      allRight: 'Chính xác: giai điệu chuyển sang giọng D và A với cùng các con số!',
    },
  },
  check: [
    {
      question: 'Khi một bài hát đổi giọng, điều gì giữ nguyên không đổi?',
      options: ['Các số La Mã', 'Tên các hợp âm', 'Vị trí bấm trên cần đàn'],
      why: 'Quan hệ giữa các hợp âm (I, IV, V) không đổi; chỉ có nốt root và tên hợp âm thay đổi.',
    },
    {
      question: 'Bộ ba I–IV–V trong giọng A là…',
      options: ['A, D, E', 'G, C, D', 'D, G, A'],
      why: 'Trong giọng A trưởng, bậc 1 là A, bậc 4 là D, và bậc 5 là E.',
    },
    {
      question: 'Bấm các shape của giọng G với capo ở ngăn 2 sẽ vang ra giọng…',
      options: ['A', 'B', 'A♭'],
      why: 'Capo ở ngăn 2 nâng cao độ lên hai nửa cung: G nâng lên hai nửa cung là A.',
    },
  ],
  canDo: [
    'Tôi có thể chơi I–IV–V–I ở các giọng G, D và A.',
    'Tôi đã chuyển giai điệu sang giọng D và A mà không cần tra cứu.',
    'Tôi có thể giải thích kẹp capo ở ngăn 2 có tác dụng gì.',
  ],
};
