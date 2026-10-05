import type { ElectricCopy } from './model';

export const vi: ElectricCopy = {
  title: 'Guitar điện: power chord, chặn tiếng, double stop, quãng 8',
  summary: 'Hợp âm hai nốt của rock, tiếng "chặt" khi chặn tiếng, câu solo hai dây, giai điệu quãng 8, và tiếng boogie blues như một hình di động.',
  lead:
    'Nốt đơn và nhéo dây mới là một nửa guitar điện. Nửa còn lại là vài hình nhỏ chơi thật có lửa: power chord, tiếng chặn, double stop và quãng 8. Năm bước, mỗi bước là một hình mang đi khắp cần được. Bấm vào nốt nào cũng nghe được.',
  steps: {
    power: {
      title: 'Power chord chỉ là bậc 1 và 5',
      body: [
        'Đặt nốt gốc trên dây 6 hoặc dây 5, thêm nốt cao hơn hai phím ở dây kế trên (quãng 5 đúng), và nếu muốn thì thêm nốt gốc cao hơn một quãng 8, ở dây kế nữa, cũng cao hơn hai phím. Đó là power chord, ký hiệu A5, C5 và cứ thế.',
        'Nó không có bậc 3, nên không trưởng cũng không thứ. Vì vậy cùng một hình hợp với cả bài giọng trưởng lẫn giọng thứ, và vẫn rõ ràng khi có tiếng méo, trong khi hợp âm đầy đủ sẽ bị nhòe.',
      ],
      takeaway: 'Power chord = nốt gốc + quãng 5 (+ quãng 8): một hình cho mọi giọng, trưởng hay thứ.',
      tryIt: 'Dùng bảng nốt nhà, chơi E5, G5, A5 trên dây 6, rồi C5 và D5 trên dây 5.',
    },
    mute: {
      title: 'Chặn tiếng: tiếng "chặt" giữa các nhát',
      body: [
        'Đặt nhẹ cạnh bàn tay phải lên dây, ngay chỗ dây chạm ngựa đàn. Nốt trở nên ngắn, trầm và dày: một tiếng "chặt" thay vì tiếng ngân.',
        'Phần lớn riff rock đổi qua lại giữa hai thứ: chặt nốt gốc bằng những móc đơn đều tay, rồi nhấc tay cho một hợp âm ngân ra. Riff này đi theo các nốt gốc của pentatonic thứ, I, ♭III và IV, tất cả là power chord.',
      ],
      takeaway: 'Chặn tiếng khi chặt nốt gốc, nhấc tay để các nhát nhấn được ngân.',
      tryIt: 'Chặt E5 đều từng móc đơn theo tiếng click, rồi chơi riff và chỉ nhấc tay ở các hợp âm dài.',
    },
    doubleStops: {
      title: 'Double stop: hai dây, cùng phím',
      body: [
        'Chơi hai dây kề nhau ở cùng một phím trong hộp pentatonic là được hai nốt của âm giai cùng lúc. Ở hầu hết các cặp dây, đó là quãng 4 đúng; ở cặp G và B, vốn lên dây gần nhau hơn một phím, đó là quãng 3 trưởng.',
        'Chúng có mặt khắp các đoạn solo rock và country, thường được trượt vào từ hai phím bên dưới. Không cần học hình mới: mọi cặp đã có sẵn trong các hộp bạn biết.',
      ],
      takeaway: 'Cùng phím trên hai dây: quãng 4, hoặc quãng 3 trưởng ở cặp G–B. Trượt vào từ dưới.',
      tryIt: 'Trong hộp 1, trượt cặp B–e ở phím 5 vào từ phím 3, rồi gảy hai lần và để ngân.',
    },
    octaves: {
      title: 'Quãng 8: một giai điệu, dày gấp đôi',
      body: [
        'Hình quãng 8 nhảy qua một dây: lên hai dây và sang phải hai phím, hoặc ba phím khi đi qua cặp G→B. Bấm cả hai nốt và để mặt dưới ngón trỏ chạm nhẹ vào dây ở giữa, cho dây đó câm.',
        'Quạt qua cả ba dây mà chỉ quãng 8 vang lên. Dời hình dọc theo dây, giai điệu nào cũng nghe to và tròn hơn nốt đơn.',
      ],
      takeaway: 'Quãng 8 = lên hai dây, +2 phím (+3 khi qua G→B), dây giữa để câm.',
      tryIt: 'Chơi câu nhạc bằng quãng 8 trên dây 5 và 3, quạt qua dây 4 đang câm.',
    },
    boogie: {
      title: 'Boogie blues là một power chord di động',
      body: [
        'Nền shuffle của bài blues là một power chord hai nốt có ngón trên đung đưa: 5, 5, 6, 6, ♭7, ♭7, 6, 6. Nốt gốc đứng yên; bậc 6 cao hơn bậc 5 hai phím, ♭7 ba phím.',
        'Chơi hợp âm I trên dây 6 và chuyển sang dây 5 cho IV và V, để tay gần như không phải di chuyển. Chặn tiếng nhẹ, chơi swing, và bạn chính là cả ban nhạc.',
      ],
      takeaway: 'Boogie = nốt gốc + 5–6–♭7–6 trên dây kế, I trên dây 6, IV và V trên dây 5.',
      tryIt: 'Chơi đủ 12 ô ở giọng A, có chặn tiếng, rồi bật đổi sớm.',
    },
  },
  scene: {
    play: 'Phát',
    stop: 'Dừng',
    tempo: 'Tempo',
    bpm: '{bpm} BPM',
    palmMute: 'Chặn tiếng',
    on: 'Bật',
    off: 'Tắt',
    power: {
      notes: 'Số nốt',
      two: '2: 1 5',
      three: '3: 1 5 8',
      overMajor: 'Dưới quãng 3 trưởng',
      overMinor: 'Dưới quãng 3 thứ',
      caption: '{symbol}: nốt gốc trên dây {string}, phím {fret}.',
      idle: 'Bấm một phím bất kỳ trên dây 6 hoặc dây 5 để dời hình tới đó.',
    },
    mute: {
      grid: 'Hai ô nhịp của riff, theo móc đơn',
      chug: 'PM',
      legendRing: 'Để ngân',
      legendMute: 'Chặt có chặn tiếng',
      playing: '{symbol}',
      idle: 'Riff giọng E: E5, G5, A5. Bấm phát, rồi thử tắt chặn tiếng.',
    },
    doubleStops: {
      box: 'Hộp',
      pair: 'Cặp',
      slide: 'Trượt vào',
      fourth: 'quãng 4 đúng',
      third: 'quãng 3 trưởng',
      caption: 'Dây {low}–{high}, phím {fret}: {a} + {b}, {interval}.',
    },
    octaves: {
      strings: 'Cặp dây',
      pairItem: '{low}/{high}',
      mutedMark: '×',
      caption: '{key} thứ từ phím 5 dây {low}: nốt quãng 8 trên dây {high} nằm lệch sang phải {shift} phím.',
    },
    boogie: {
      key: 'Giọng',
      quickChange: 'Đổi sớm',
      turnaround: 'Quay vòng',
      form: '12 ô nhịp',
      idle: 'Boogie giọng {key}, chơi swing. Bấm phát và xem hình đổi dây.',
      playing: 'Ô {n}: {chord}, nốt gốc trên dây {string}',
    },
  },
  notYetTitle: 'Những thứ chưa cần lúc này',
  notYetIntro: 'Chừng này hình đủ để đệm phần lớn nhạc rock. Những thứ sau để sau.',
  notYet: [
    { title: 'Tiếng méo và âm sắc amp', why: 'Các hình phải nghe đúng khi chơi sạch trước. Âm sắc là chuyện thiết bị và gu.' },
    { title: 'Hợp âm chặn', why: 'Hình trưởng và thứ đầy đủ đến cùng bài hợp âm, dựng trên chính các dây nốt gốc này.' },
    { title: 'Nhéo double stop và chicken pickin\'', why: 'Kỹ thuật country, dựng trên những gì bạn vừa học.' },
    { title: 'Tự viết riff', why: 'Trước hết hãy thay các nốt gốc của riff này bằng các bậc pentatonic khác.' },
    { title: 'Lưu tiến độ', why: 'Chế độ ôn tập chung đến ở cuối lộ trình.' },
  ],
};
