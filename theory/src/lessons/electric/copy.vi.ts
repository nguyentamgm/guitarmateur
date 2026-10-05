import type { ElectricCopy } from './model';

export const vi: ElectricCopy = {
  title: 'Guitar điện: power chord, palm mute, double stop, quãng 8',
  summary: 'Hợp âm hai nốt của rock, tiếng chug khi palm mute, lick hai dây, giai điệu quãng 8, và tiếng boogie blues như một shape di động.',
  lead:
    'Nốt đơn và bend mới là một nửa guitar điện. Nửa còn lại là vài shape nhỏ chơi thật có lửa: power chord, palm mute, double stop và quãng 8. Năm bước, mỗi bước là một shape mang đi khắp cần được. Bấm vào nốt nào cũng nghe được.',
  steps: {
    power: {
      title: 'Power chord chỉ là bậc 1 và 5',
      body: [
        'Đặt root trên dây 6 hoặc dây 5, thêm nốt cao hơn hai phím ở dây kế trên (quãng 5 đúng), và nếu muốn thì thêm root cao hơn một quãng 8, ở dây kế nữa, cũng cao hơn hai phím. Đó là power chord, ký hiệu A5, C5 và cứ thế.',
        'Nó không có bậc 3, nên không trưởng cũng không thứ. Vì vậy cùng một shape hợp với cả bài giọng trưởng lẫn giọng thứ, và vẫn rõ ràng khi có distortion, trong khi hợp âm đầy đủ sẽ bị nhòe.',
      ],
      takeaway: 'Power chord = root + quãng 5 (+ quãng 8): một shape cho mọi giọng, trưởng hay thứ.',
      tryIt: 'Dùng bảng nốt trên dây 6 và 5, chơi E5, G5, A5 trên dây 6, rồi C5 và D5 trên dây 5.',
    },
    mute: {
      title: 'Palm mute: tiếng chug giữa các nhát',
      body: [
        'Đặt nhẹ cạnh bàn tay phải lên dây, ngay chỗ dây chạm bridge. Nốt trở nên ngắn, trầm và dày: một tiếng chug thay vì tiếng ngân.',
        'Phần lớn riff rock đổi qua lại giữa hai thứ: chug trên root bằng những móc đơn đều tay, rồi nhấc tay cho một hợp âm ngân ra. Riff này đi theo các root lấy từ minor pentatonic, I, ♭III và IV, tất cả là power chord.',
      ],
      takeaway: 'Palm mute khi chug trên root, nhấc tay để các nhát nhấn được ngân.',
      tryIt: 'Chug E5 đều từng móc đơn theo tiếng click, rồi chơi riff và chỉ nhấc tay ở các hợp âm dài.',
    },
    doubleStops: {
      title: 'Double stop: hai dây, cùng phím',
      body: [
        'Chơi hai dây kề nhau ở cùng một phím trong box pentatonic là được hai nốt của scale cùng lúc. Ở hầu hết các cặp dây, đó là quãng 4 đúng; ở cặp G và B, vốn lên dây gần nhau hơn một phím, đó là quãng 3 trưởng.',
        'Chúng có mặt khắp các đoạn solo rock và country, thường được slide vào từ hai phím bên dưới. Không cần học shape mới: mọi cặp đã có sẵn trong các box bạn biết.',
      ],
      takeaway: 'Cùng phím trên hai dây: quãng 4, hoặc quãng 3 trưởng ở cặp G–B. Slide vào từ dưới.',
      tryIt: 'Trong box 1, slide cặp B–e ở phím 5 vào từ phím 3, rồi gảy hai lần và để ngân.',
    },
    octaves: {
      title: 'Quãng 8: một giai điệu, dày gấp đôi',
      body: [
        'Shape quãng 8 nhảy qua một dây: lên hai dây và sang phải hai phím, hoặc ba phím khi đi qua G–B shift. Bấm cả hai nốt và để mặt dưới ngón trỏ chạm nhẹ vào dây ở giữa, cho dây đó câm.',
        'Quạt qua cả ba dây mà chỉ quãng 8 vang lên. Dời shape dọc theo dây, giai điệu nào cũng nghe to và tròn hơn nốt đơn.',
      ],
      takeaway: 'Quãng 8 = lên hai dây, +2 phím (+3 khi qua G→B), dây giữa để câm.',
      tryIt: 'Chơi câu nhạc bằng quãng 8 trên dây 5 và 3, quạt qua dây 4 đang câm.',
    },
    boogie: {
      title: 'Boogie blues là một power chord di động',
      body: [
        'Nền shuffle của bài blues là một power chord hai nốt có ngón trên đung đưa: 5, 5, 6, 6, ♭7, ♭7, 6, 6. Root đứng yên; bậc 6 cao hơn bậc 5 hai phím, ♭7 ba phím.',
        'Chơi hợp âm I trên dây 6 và chuyển sang dây 5 cho IV và V, để tay gần như không phải di chuyển. Palm mute nhẹ, chơi swing, và bạn chính là cả ban nhạc.',
      ],
      takeaway: 'Boogie = root + 5–6–♭7–6 trên dây kế, I trên dây 6, IV và V trên dây 5.',
      tryIt: 'Chơi đủ 12 bar ở giọng A, có palm mute, rồi bật quick change.',
    },
  },
  scene: {
    play: 'Phát',
    stop: 'Dừng',
    tempo: 'Tempo',
    bpm: '{bpm} BPM',
    palmMute: 'Palm mute',
    on: 'Bật',
    off: 'Tắt',
    power: {
      notes: 'Số nốt',
      two: '2: 1 5',
      three: '3: 1 5 8',
      overMajor: 'Dưới quãng 3 trưởng',
      overMinor: 'Dưới quãng 3 thứ',
      caption: '{symbol}: root trên dây {string}, phím {fret}.',
      idle: 'Bấm một phím bất kỳ trên dây 6 hoặc dây 5 để dời shape tới đó.',
    },
    mute: {
      grid: 'Hai bar của riff, theo móc đơn',
      chug: 'PM',
      legendRing: 'Để ngân',
      legendMute: 'Chug có palm mute',
      playing: '{symbol}',
      idle: 'Riff giọng E: E5, G5, A5. Bấm phát, rồi thử tắt palm mute.',
    },
    doubleStops: {
      box: 'Box',
      pair: 'Cặp',
      slide: 'Slide vào',
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
      quickChange: 'Quick change',
      turnaround: 'Turnaround',
      form: '12 bar',
      idle: 'Boogie giọng {key}, chơi swing. Bấm phát và xem shape đổi dây.',
      playing: 'Bar {n}: {chord}, root trên dây {string}',
    },
  },
  notYetTitle: 'Chưa cần học lúc này',
  notYetIntro: 'Chừng này shape đủ để đệm phần lớn nhạc rock. Những thứ sau để sau.',
  notYet: [
    { title: 'Distortion và âm sắc amp', why: 'Các shape phải nghe đúng khi chơi sạch trước. Âm sắc là chuyện thiết bị và gu.' },
    { title: 'Hợp âm chặn', why: 'Shape trưởng và thứ đầy đủ đến cùng bài hợp âm, dựng trên chính các dây root này.' },
    { title: 'Bend double stop và chicken pickin\'', why: 'Kỹ thuật country, dựng trên những gì bạn vừa học.' },
    { title: 'Tự viết riff', why: 'Trước hết hãy thay các root của riff này bằng các bậc pentatonic khác.' },
    { title: 'Lưu tiến độ', why: 'Chế độ ôn tập chung đến ở cuối lộ trình.' },
  ],
};
