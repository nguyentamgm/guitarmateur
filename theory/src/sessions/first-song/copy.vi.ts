import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Bài hát đầu tiên bằng tai',
  summary:
    'Ghép hợp âm theo giai điệu: thử I, rồi V, rồi IV, dùng nốt của hợp âm ở phách mạnh để tìm hợp âm đúng.',
  goal: 'Sau buổi học này bạn có thể tìm hợp âm cho một giai điệu bằng tai với các hợp âm I, IV và V.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'I, IV, V là các hợp âm chính của một giọng trưởng (G, C, D trong giọng G).',
    'Hợp âm I là nhà, V kéo về nhà, và IV đi ra xa.',
    'Hợp âm thường đổi ở phách 1 hoặc phách 3 của bar.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Một số bài hát chỉ cần một hợp âm duy nhất cho toàn bộ giai điệu.',
        'Lắng nghe Frère Jacques: toàn bộ giai điệu nằm trọn vẹn trên hợp âm I (G).',
        'Bấm Phát để nghe giai điệu trên nền hợp âm I. Hãy để ý cách từng nốt hòa quyện.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Khi một nốt giai điệu rơi vào phách mạnh (phách 1 hoặc 3), nó thường là nốt của hợp âm đang vang: bậc 1, 3 hoặc 5 của hợp âm đó.',
        'Trong giọng G: hợp âm G (I) gồm các nốt G, B, D (bậc 1, 3, 5).',
        'Hợp âm C (IV) gồm các nốt C, E, G (bậc 4, 6, 1).',
        'Hợp âm D (V) gồm các nốt D, F#, A (bậc 5, 7, 2).',
        'Khi tìm hợp âm cho một giai điệu, hãy thử I trước. Nếu nghe bị chọi nốt, hãy thử V (sức căng kéo về), rồi đến IV (đi xa).',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Luyện tập chuyển giữa I và V với vòng hợp âm tám bar này.',
        'Đây là vòng hợp âm của một bài hát thiếu nhi quen thuộc: sáu bar I và hai bar V.',
        'Quạt theo kiểu D-D-D-DU ở 80 BPM cho đến khi các lần chuyển tay trở nên tự nhiên.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Bây giờ hãy tự tìm hợp âm cho hai giai điệu bằng tai.',
        'Lắng nghe từng giai điệu, chọn hợp âm cho mỗi ô nhịp, rồi kiểm tra đáp án.',
        'Hãy thử I trước: nếu bị chọi với giai điệu ở phách 1, hãy thử V hoặc IV.',
      ],
    },
  },
  blocks: {
    listenSong: {
      intro: 'Lắng nghe cách một hợp âm (I) nâng đỡ toàn bộ giai điệu từ đầu đến cuối.',
      ask: 'Bấm Phát để nghe giai điệu cùng hợp âm I, sau đó Kiểm tra.',
      result: '{right} / {total} ô đúng.',
      allRight: 'Mọi ô đều vừa vặn với hợp âm I!',
    },
    chords: {
      intro: 'Xem lại ba hợp âm trong giọng G trưởng và các bậc tạo nên mỗi hợp âm.',
    },
    playMary: {
      intro: 'Chơi theo vòng hợp âm tám bar: I và V. Chú ý những vị trí chuyển hợp âm.',
    },
    challengeMary: {
      intro:
        'Trước tiên hãy nghe riêng giai điệu. Điền hợp âm cho từng ô bằng I, IV và V, sau đó bấm Kiểm tra.',
      ask: 'Chọn hợp âm cho từng ô',
      result: '{right} / {total} ô đúng.',
      allRight: 'Chính xác: Mary Had a Little Lamb chỉ dùng I và V!',
    },
    challengeTwinkle: {
      intro:
        'Giai điệu 12 bar này luân chuyển giữa I, IV và V. Hãy lắng nghe kỹ xem hợp âm đổi ở đâu theo giai điệu.',
      ask: 'Chọn hợp âm cho từng ô',
      result: '{right} / {total} ô đúng.',
      allRight: 'Chính xác: Twinkle Twinkle Little Star với I, IV và V!',
    },
  },
  check: [
    {
      question: 'Khi một nốt giai điệu rơi vào phách 1, nó thường là…',
      options: ['nốt của hợp âm đang vang.', 'bậc 7 của scale.', 'một nốt ngẫu nhiên bất kỳ.'],
      why: 'Các phách mạnh mang các nốt của hợp âm (bậc 1, 3 hoặc 5 của hợp âm bên dưới) giúp giai điệu nghe chắc chắn.',
    },
    {
      question: 'Khi tìm hợp âm bằng tai, bạn nên thử hợp âm nào đầu tiên?',
      options: ['IV', 'I', 'V'],
      why: 'Bắt đầu với I vì đó là hợp âm chủ nhà. Nếu bị chọi nốt, hãy thử V rồi đến IV.',
    },
    {
      question: 'Trong giọng G, các nốt của hợp âm IV (C) là…',
      options: ['G, B, D', 'D, F#, A', 'C, E, G'],
      why: 'Hợp âm IV xây dựng trên bậc 4 (C) là C trưởng, gồm các nốt C (bậc 1 của hợp âm), E (bậc 3), và G (bậc 5).',
    },
  ],
  canDo: [
    'Tôi có thể tìm hợp âm I cho một bài hát và nhận ra cảm giác về nhà.',
    'Tôi có thể nhận ra khi một nốt giai điệu ở phách 1 là nốt của hợp âm.',
    'Tôi có thể tự tìm hợp âm cho một bài hát đơn giản bằng tai dùng I, IV và V.',
  ],
};
