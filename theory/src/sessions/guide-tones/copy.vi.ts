import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Guide tone khi đổi hợp âm',
  summary: 'Dùng bậc 3 và bậc 7 để nghe rõ chỗ đổi hợp âm trong một câu ngắn.',
  goal: 'Đáp vào bậc 3 của hợp âm mới ở phách 1 bằng cách dịch một phím trong vòng blues giọng A.',
  needs: 'Một cây guitar lên dây chuẩn. Khoảng 15–20 phút.',
  recap: [
    'Công thức dominant 7 là 1, 3, 5 và ♭7.',
    'Trong vòng blues cơ bản giọng A, D7 xuất hiện lần đầu ở bar 5.',
  ],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Hợp âm và nốt lead đầu tiên xác định giọng. Khi hợp âm thứ hai vang lên, nghe nốt lead. Nốt đó đi tới bậc 3 của hợp âm mới hay vẫn giữ root của giọng?',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Bậc 3 và bậc 7 là guide tone. Chúng giúp tai nhận ra hợp âm. Lấy root, bậc 3 và ♭7 từ những hợp âm dominant 7 quen thuộc rồi đưa lên ba dây mảnh nhất. Nghe bè giữa của hai shape bên dưới.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Phát shuffle giọng A. Trên dây 2, hát và gảy G ở phím 8 trên A7. Lùi một phím về F♯ đúng phách 1 của D7 ở bar 5. Gọi tên vai trò của từng nốt khi chơi: ♭7 của A7 rồi bậc 3 của D7. Lượt sau, giữ A ở phím 5 dây 1 qua cả hai hợp âm và nghe xem câu nào làm rõ D7 hơn.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Phát lại backing giọng A ở phần Chơi. Kết một lick ngắn bằng E ở phách 3 và G ở phách 4 của bar 4, rồi đáp F♯ đúng phách 1 của bar 5. Giữ trên dây 2 ở các phím 5, 8 và 7. Lặp lại ở vòng sau và hát F♯ trước khi gảy. Khi đã nghe rõ lần đổi hợp âm trong blues giọng A, thử ii–V–I bên dưới.',
      ],
    },
  },
  blocks: {
    third: {
      intro:
        'Cả hai kiểu đều dùng cùng các hợp âm. Tập trung vào nốt lead lúc hợp âm thứ hai bắt đầu.',
      ask: 'Nốt lead thay đổi thế nào khi hợp âm đổi?',
      answers: { third: 'Sang bậc 3 của hợp âm mới', root: 'Giữ root của giọng' },
      right: 'Đúng. Ở {detail}, nốt lead {answer}.',
      wrong: 'Ở {detail}, nốt lead {answer}. Nghe nốt đáp còn lại trước, rồi nghe lại câu ban đầu.',
    },
    guide: {
      intro:
        'Phát đường nốt trong sơ đồ 12-bar blues. Sơ đồ chọn nốt đích trong scale đang dùng. Nghe cách bậc 7 giúp bạn nhận ra lúc đổi hợp âm.',
    },
    one: { intro: 'Quạt thế A7 ba nốt này. Hát G, bậc ♭7 nằm ở phím 8 dây 2.' },
    four: {
      intro:
        'Quạt thế D7 ba nốt này. Hát F♯, bậc 3 ở phím 7 dây 2. Đổi qua lại giữa hai shape và nghe bè giữa đi xuống nửa cung.',
    },
    blues: {
      intro:
        'Nhìn các bậc 3 và 7 được đánh dấu khi backing đổi hợp âm. Bấm vào từng nốt đích để nghe. F♯ nằm ngoài A minor pentatonic và xuất hiện thêm ở phím 7 dây 2 vì đó là bậc 3 của D7.',
    },
    jazz: {
      intro:
        'Bài tập thêm ii–V–I ở giọng C. Khi tới G7 ở bar 2, tìm B ở phím 7 dây 1 và F ở phím 6 dây 2. B là bậc 3, F là bậc ♭7. Thử F ở phách 1 của G7 rồi lùi một phím về E khi C vang lên.',
    },
  },
  check: [
    {
      question: 'Nốt nào là bậc 3 của D7?',
      options: ['G', 'A', 'F♯'],
      why: 'F♯ cao hơn D một quãng 3 trưởng. Nốt đó nằm ở phím 7 dây 2.',
    },
    {
      question: 'G có vai trò gì trên A7?',
      options: ['Bậc 3', 'Bậc ♭7', 'Bậc 5'],
      why: 'Đường guide tone bắt đầu ở ♭7 của A7 rồi đi tới bậc 3 của D7.',
    },
    {
      question: 'Đáp vào F♯ lúc nào thì chỗ đổi hợp âm rõ nhất?',
      options: ['Phách 1 của D7', 'Phách 1 của A7', 'Phách 4 ngay trước D7'],
      why: 'Phách mạnh của hợp âm mới làm bậc 3 nghe rõ và báo hiệu hợp âm đã đổi.',
    },
  ],
  canDo: [
    'Tôi hát được G–F♯ và chơi được hai nốt đó trên dây 2 khi A7 chuyển sang D7.',
    'Tôi chơi được E và G dẫn vào F♯, rồi đáp đúng phách 1 của D7.',
  ],
};
