import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Tìm root bằng hình quãng 8',
  summary: 'Từ một root trên dây 6, tìm hai nốt cùng tên cao hơn trên dây 4 và dây 2.',
  goal: 'Nghe ra quãng 8 và dùng hình bấm để tìm lại root ở phần cao của cần đàn.',
  needs: 'Một cây guitar lên dây chuẩn. Khoảng 15–20 phút.',
  recap: ['A ở phím 5 dây 6 là root của A minor pentatonic.', 'Mỗi phím là một nửa cung.'],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Gảy A ở phím 5 dây 6 rồi ngân nga A cao hơn một quãng 8. Gảy lại A rồi gảy phím 7 dây 5 (E). Lặp lại từ A, lần này gảy phím 7 dây 4 (A). Nốt trên của cặp nào khớp với A bạn vừa hát?',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Từ A ở phím 5 dây 6, chuyển sang dây 4 và tiến hai phím về phía thân đàn. Gảy phím 7: bạn gặp lại A, cao hơn 12 nửa cung. Quãng 5 chỉ cách nốt đầu 7 nửa cung, nên từ A bạn sẽ tới E.',
        'Từ phím 7 dây 4, thử đoán A kế tiếp nằm ở đâu trên dây 2. Lần này bạn đi qua cặp dây G–B. Hai dây này cách nhau 4 nửa cung, còn các cặp dây kề khác cách nhau 5. Vì vậy cần tiến thêm một phím: A nằm ở phím 10 dây 2. Quy tắc này gọi là G–B shift.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Gảy lần lượt ba nốt A ở dây 6, 4 và 2, rồi quay về theo đường cũ. Sau đó chọn G ở phím 3 dây 6 và thử lại cùng hình bấm. Hát nốt kế tiếp trước khi gảy để tự kiểm tra.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Bạn sẽ được nghe một root và thấy phím xuất phát trên dây 6. Chơi hai quãng 8 tiếp theo trên đàn trước khi mở đáp án. Khi nghe lại, so từng nốt của mình với ba nốt mẫu.',
      ],
    },
  },
  blocks: {
    pair: {
      intro:
        'Mỗi cặp nốt được gảy lần lượt rồi vang cùng lúc. Hãy ngân nga nốt thấp cao lên một quãng 8 rồi so với nốt thứ hai.',
      ask: 'Bạn nghe quãng nào?',
      answers: { octave: 'Quãng 8', fifth: 'Quãng 5' },
      right: 'Đúng. Từ {detail}, bạn vừa nghe {answer}.',
      wrong:
        'Đó là {answer} tính từ {detail}. Nghe quãng còn lại từ cùng nốt thấp, rồi nghe lại cặp vừa hỏi.',
    },
    grid: {
      intro:
        'Phát từng cặp dây. Khi nốt bấm cùng cao độ với dây buông kế bên, hãy nhìn số phím. Riêng từ dây G sang dây B, chỉ cần bấm phím 4.',
    },
    octaves: {
      intro:
        'Chọn A trên sơ đồ và bấm lần lượt ba nốt A ở phím 5, 7 và 10 trên dây 6, 4 và 2. Thử thêm A ở phím 5 dây 1: nó cao hơn A ở cùng phím dây 6 đúng hai quãng 8.',
    },
    homes: {
      intro:
        'Dùng bảng nốt trên dây 6 và 5 để tìm nốt xuất phát. Thử với các nốt tự nhiên trước, rồi chọn đủ 12 nốt. Ví dụ, từ G ở phím 3 dây 6, tiến một phím là G♯.',
    },
    roots: {
      intro:
        'Tìm nốt cùng tên trên dây 4, rồi trên dây 2. Nhớ tính G–B shift ở lần chuyển thứ hai.',
      ask: 'Bắt đầu ở {detail}, dây 6 phím {start}. Bạn tìm được hai nốt cùng tên ở đâu?',
      answer: '{detail} ở dây 6 phím {start}, dây 4 phím {middle}, rồi dây 2 phím {high}.',
    },
  },
  check: [
    {
      question: 'Quãng nào đưa A lên nốt A kế tiếp?',
      options: ['Quãng 5', 'Quãng 8', 'Quãng 4'],
      why: 'Sau 12 nửa cung, ta gặp lại nốt cùng tên ở quãng 8 cao hơn.',
    },
    {
      question: 'Từ dây 4 sang dây 2, vì sao hình quãng 8 phải tiến ba phím?',
      options: [
        'Dây 2 dày hơn dây 4',
        'Mỗi phím cao lên một cung',
        'Cặp dây G–B cách nhau 4 nửa cung',
      ],
      why: 'Khoảng cách giữa G và B nhỏ hơn các cặp dây kề khác một nửa cung. Tiến thêm một phím bù lại khoảng đó.',
    },
    {
      question: 'Hai nốt ở cùng phím trên dây 6 và dây 1 cách nhau bao xa?',
      options: ['Hai quãng 8', 'Một quãng 8', 'Một quãng 5'],
      why: 'Dây 6 và dây 1 đều lên dây E, cách nhau hai quãng 8. Bấm cùng phím giữ nguyên khoảng cách đó.',
    },
  ],
  canDo: [
    'Tôi có thể nghe và phân biệt quãng 8 với quãng 5 từ cùng một nốt thấp.',
    'Từ một root trên dây 6, tôi tìm được hai quãng 8 trên dây 4 và 2 trước khi xem đáp án.',
  ],
};
