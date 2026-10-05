import type { FretboardCopy } from './model';

export const vi: FretboardCopy = {
  title: 'Cần đàn là một cái lưới',
  summary: 'Đọc tab, đếm phím, và tìm ra mọi nốt chỉ từ một nốt nhà và hai hình quãng 8.',
  lead:
    'Bạn không cần thuộc tên mọi nốt trên cần đàn. Bạn cần biết đếm phím, đọc tab, nhớ hai hình quãng 8 và chỗ của nốt nhà trên hai dây dày nhất. Năm bước, mỗi bước là một hình bạn chơi được. Bấm vào nốt nào cũng nghe được.',
  steps: {
    strings: {
      title: 'Dây 1 là dây mỏng nhất, và nằm trên cùng',
      body: [
        'Sáu dây được đánh số từ dây mỏng nhất (1) tới dây dày nhất (6). Lên dây chuẩn, từ dây 6 tới dây 1, tên dây là E A D G B E.',
        'Tab và mọi hình trong app này vẽ dây 1 ở đường trên cùng. Khi cầm đàn thì ngược lại: dây 6 mới là dây gần mặt bạn nhất. Nhớ chỗ đảo này thì tab không bao giờ làm bạn nhầm.',
      ],
      takeaway: 'Dây 1 là dây mỏng nhất và là đường trên cùng của tab.',
      tryIt: 'Gảy các dây buông từ dây 6 tới dây 1, vừa gảy vừa đọc to số dây, rồi đọc tên dây.',
    },
    semitones: {
      title: 'Mỗi phím là một nửa cung',
      body: [
        'Đi lên một phím là cao độ tăng nửa cung, bước nhỏ nhất trong nhạc phương Tây. Hai phím là một cung.',
        'Mười hai phím là một quãng 8: phím 12 cùng tên với dây buông, chỉ cao hơn. Vì vậy cần đàn lặp lại sau phím 12, và phím 12 có chấm đôi.',
      ],
      takeaway: '1 phím = nửa cung; 12 phím = một quãng 8, cùng tên, cao hơn.',
      tryIt: 'Chọn một dây bất kỳ. Gảy buông, rồi bấm phím 12, để nghe cùng một nốt ở tầng cao hơn.',
    },
    tab: {
      title: 'Tab: đường là dây, số là phím',
      body: [
        'Tab có sáu đường, mỗi đường một dây, dây 1 ở trên cùng. Con số trên một đường là phím cần bấm trên dây đó; số 0 là gảy dây buông.',
        'Đọc từ trái sang phải. Các số xếp thẳng hàng dọc thì chơi cùng lúc. Tab không ghi mỗi nốt dài bao lâu: các bài sau sẽ đặt tab lên lưới phách.',
      ],
      takeaway: 'Số trên đường = phím trên dây đó; 0 = dây buông; xếp dọc = chơi cùng lúc.',
      tryIt: 'Chơi chậm đoạn tab bên dưới. Sau đó bấm vào một số bất kỳ để xem ngón tay phải đặt ở đâu.',
    },
    octaves: {
      title: 'Hai hình quãng 8 tìm ra mọi chỗ của một nốt',
      body: [
        'Cùng một nốt có mặt ở nhiều chỗ trên cần. Đi lên hai dây và sang phải hai phím là bạn gặp lại đúng nốt đó, cao hơn một quãng 8.',
        'Khi bước nhảy rơi vào dây B hoặc dây E mỏng, đi ba phím thay vì hai. Phím thêm đó lại chính là chỗ lệch giữa dây G và dây B: cặp dây duy nhất cách nhau 4 phím thay vì 5. Còn dây 6 và dây 1 thì cùng tên ở mọi phím, cách nhau hai quãng 8.',
      ],
      takeaway: 'Lên hai dây: +2 phím, hoặc +3 khi rơi vào dây 2 hay dây 1.',
      tryIt: 'Tìm A ở phím 5 dây 6. Dùng hai hình để tới mọi nốt A khác đến phím 15 mà không nhìn màn hình.',
    },
    home: {
      title: 'Chỉ học thuộc nốt nhà trên dây 6 và dây 5',
      body: [
        'Đây là bảng duy nhất đáng học thuộc. Mọi hộp âm giai và hợp âm chặn sau này đều neo vào một nốt trên dây 6 hoặc dây 5.',
        'Có bảy chữ cái, từ A tới G. Hai chữ cái liền nhau cách nhau một cung, trừ E–F và B–C chỉ cách nửa cung. Dấu thăng (♯) nâng nốt lên một phím, dấu giáng (♭) hạ xuống một phím, nên phím nằm giữa hai chữ cái có hai tên, ví dụ C♯ và D♭.',
      ],
      takeaway: 'Nhớ chỗ của A tới G trên dây 6 và dây 5; hình quãng 8 lo phần còn lại.',
      tryIt: 'Ẩn tên nốt rồi làm bài đố cho tới khi trả lời đúng mười câu liên tiếp. Sau đó bật cả 12 nốt: nốt ♯ nằm trên chữ cái của nó một phím, nốt ♭ nằm dưới một phím.',
    },
  },
  scene: {
    strings: {
      note: 'Dây 1 là đường trên cùng, giống tab. Khi cầm đàn, đó là dây gần sàn nhà nhất.',
      play: 'Gảy dây 6 → 1',
      stop: 'Dừng',
      idle: 'Bấm vào một chấm ở đầu cần để nghe dây buông.',
      caption: 'Dây {n}: {name}',
    },
    semitones: {
      string: 'Dây',
      run: 'Đi lên 12 phím',
      stop: 'Dừng',
      idle: 'Mỗi chấm cao hơn chấm bên trái nó nửa cung.',
      step: 'Phím {fret}: dây buông + {fret} nửa cung',
      octave: 'Phím 12: cùng tên với dây buông, cao hơn một quãng 8',
    },
    tab: {
      label: 'Tab',
      play: 'Chơi đoạn tab',
      stop: 'Dừng',
      idle: 'Bấm vào một số trên tab hoặc một chấm trên cần: chỗ tương ứng bên kia sẽ sáng lên.',
      single: 'Dây {string}, phím {fret}',
      together: 'Chơi cùng lúc: {notes}',
      open: 'Dây {string}, buông (0)',
    },
    octaves: {
      picker: 'Nốt trên dây 6',
      play: 'Chơi tất cả',
      stop: 'Dừng',
      caption: '{note}: {count} chỗ trong 15 phím đầu',
      twoOctaves: '2 quãng 8',
    },
    home: {
      mapTitle: 'Nốt tự nhiên',
      onString: 'Dây {n}',
      names: 'Tên nốt',
      show: 'Hiện',
      hide: 'Ẩn',
      pool: 'Nốt',
      naturals: 'A–G',
      all: 'Cả ♯/♭ (12 nốt)',
      question: 'Tìm {note} trên dây {n}',
      next: 'Nốt khác',
      right: 'Đúng: {note} trên dây {n} ở phím {fret}.',
      wrongString: 'Đúng hướng nhưng sai dây: tìm trên dây {n}.',
      wrongFret: 'Phím {fret} là {heard}. Thử lại.',
      between: 'Phím {fret} là một nốt thăng hoặc giáng, nằm giữa hai chữ cái. Thử lại.',
      score: 'Đúng ngay lần đầu: {right}/{total}',
    },
  },
  notYetTitle: 'Những gì chưa cần học',
  notYetIntro:
    'Những thứ này đều có lúc cần. Gác chúng lại bây giờ để bạn tập trung vào chính cần đàn.',
  notYet: [
    { title: 'Tên mọi nốt trên mọi dây', why: 'Nốt nhà trên dây 6, dây 5 và hai hình quãng 8 đủ để tìm bất kỳ nốt nào bạn cần.' },
    { title: 'Đọc khuông nhạc', why: 'Tab và hình đã đủ cho guitar điện. Khuông nhạc để sau, khi nào cần hãy học.' },
    { title: 'Biểu đồ hợp âm', why: 'Đọc giống tab xoay đứng. Chúng đến cùng các bài hợp âm.' },
    { title: 'Mỗi nốt dài bao lâu', why: 'Tab bỏ qua tiết tấu. Bài nhịp sẽ đặt tab lên lưới phách.' },
    { title: 'Bài luyện ngón và tư thế tay', why: 'Tập với metronome mới hiệu quả, nên chuyển sang bài nhịp.' },
    { title: 'Chọn tên thăng hay giáng', why: 'Tên nào đúng tùy âm giai đang dùng. Phần này đến cùng âm giai trưởng.' },
    { title: 'Lên dây bằng tai', why: 'Dùng đúng quy tắc phím 5 của bài này. Tạm thời dùng app lên dây là đủ.' },
  ],
};
