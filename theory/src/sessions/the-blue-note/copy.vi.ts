import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Blue note',
  summary: 'Nghe ♭5 nằm giữa hai nốt quen thuộc và dùng nó trong một lick ngắn trên vòng blues.',
  goal: 'Nghe ra nốt thêm vào trong minor blues scale và dùng nốt đó để dẫn tới nốt đáp.',
  needs: 'Một cây guitar lên dây chuẩn. Khoảng 15–20 phút.',
  recap: [
    'A minor pentatonic có A, C, D, E và G.',
    'Hợp âm đầu tiên của 12-bar blues giọng A là A7.',
  ],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Trên dây 5, chơi D–E ở phím 5 và 7. Sau đó chơi D–E♭–E ở phím 5, 6 và 7. Giữ phách đều ở cả hai lượt. Nghe nốt chen giữa D và E, rồi để ý cảm giác căng dịu xuống khi đáp vào E.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Thêm ♭5 vào minor pentatonic sẽ được minor blues scale. Ở giọng A, nốt thêm đó là E♭, nằm giữa D (4) và E (5). Hãy dùng E♭ như một passing note, tức là chỉ ghé qua một chút trước khi sang nốt kế tiếp.',
        'Bạn từng nghe một kiểu căng khác của blues khi C, bậc ♭3 của A, nghe chỏi với C♯, bậc 3 trong A7. Quạt open chord A7 trên đàn, rồi gảy C ở phím 3 dây 5 trong khi các dây mảnh còn ngân. Độ chỏi đến từ hai nốt vang cùng lúc. Bạn vẫn nghe được E♭ kéo về E khi đàn một mình.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Phát backing giọng A. Trên bar A7 đầu tiên, chơi D–E. Sang bar kế tiếp, chơi D–E♭–E rồi để E ngân. Chỉ ghé E♭ một chút trước khi đáp.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Nghe lick bốn nốt và hát nốt cuối là E. Sau đó chơi lại lick trên đàn và giữ cho E ngân lên. Chỉ ra phím tạo cảm giác căng thoáng qua trong lick.',
      ],
    },
  },
  blocks: {
    phrase: {
      intro:
        'Nghe ba nốt liền nhau, mỗi nốt cách nốt kế bên một nửa cung. Nốt ở giữa là ♭5. Câu nhạc có thể đi qua nốt này khi lên hoặc khi xuống.',
      ask: 'Câu vừa nghe có đi qua ♭5 không?',
      answers: { withBlue: 'Có ♭5', plain: 'Chỉ có nốt pentatonic' },
      right: 'Đúng. {answer} trong giọng {detail}.',
      wrong:
        'Câu bạn vừa nghe là {answer} trong giọng {detail}. Nghe câu còn lại trong cùng giọng trước, rồi nghe lại câu ban đầu.',
    },
    blue: {
      intro:
        'Chọn A minor blues và box 1. Bật Blue note rồi phát câu nhạc. Tắt Blue note và phát lại. Nhìn sơ đồ khi câu nhạc lên E rồi đi xuống qua D. Lắng nghe E♭ nằm giữa hai nốt đó.',
    },
    backing: {
      intro: 'Nhìn bar sáng để tìm A7 đầu tiên. Giữ tay trong box 1, với D, E♭ và E trên dây 5.',
    },
    echo: {
      intro:
        'Bấm Bắt đầu để nghe lick. Sau khi chơi lại trên đàn, bấm các nốt sau root đã cho trên sơ đồ. A ở phím 5 dây 6. Trên dây 5, D, E♭ và E lần lượt ở phím 5, 6 và 7. Chọn Tiếp theo để nghe câu mới.',
      ask: 'Bạn chơi lại được lick trong box 1 không?',
      right: 'Đúng nốt rồi. Chơi tiếp, hoặc chọn Tiếp theo nếu đã hết câu.',
      higher: 'Nốt tiếp theo cao hơn. Nghe lại và thử một phím khác.',
      lower: 'Nốt tiếp theo thấp hơn. Nghe lại và thử một phím khác.',
      done: 'Bạn đã chơi lại bốn câu. Thử lại lick đầu tiên trên đàn và nghe nốt đáp.',
    },
  },
  check: [
    {
      question: 'Thêm nốt nào vào A minor pentatonic để được A minor blues scale?',
      options: ['E♭ (♭5)', 'C♯ (3)', 'B (2)'],
      why: 'E♭ là blue note được thêm vào giữa D và E.',
    },
    {
      question: 'Khi đi lên từ D qua E♭, bạn có thể đáp vào nốt nào?',
      options: ['Dừng ở E♭', 'Quay về D', 'Lên E'],
      why: 'E cao hơn E♭ một nửa cung. Thử giữ E và nghe độ căng dịu xuống.',
    },
    {
      question: 'Khi bạn gảy C trên nền A7, nốt nào trong hợp âm nghe chỏi với C?',
      options: ['A', 'C♯', 'E'],
      why: 'C♯ là bậc 3 trưởng của A7, cao hơn bậc ♭3 bạn chơi một nửa cung.',
    },
  ],
  canDo: [
    'Tôi nghe ra sự khác biệt giữa D–E và D–E♭–E trên dây 5.',
    'Tôi hát được nốt đáp E, chơi lại lick và tìm được nốt E♭ dẫn vào E.',
  ],
};
