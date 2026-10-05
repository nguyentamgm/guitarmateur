import type { MajorScaleCopy } from './model';

export const vi: MajorScaleCopy = {
  title: 'Âm giai trưởng và quãng là hình trên cần',
  summary: 'Một công thức dựng âm giai trưởng ở mọi giọng; mỗi quãng là một hình mang đi khắp cần được.',
  lead:
    'Âm giai trưởng là cây thước để đo mọi thứ khác trong nhạc lý: pentatonic, hợp âm, giọng đều được mô tả theo nó. Ở đây nó là một mẫu khoảng cách phím, rồi một quy tắc đặt tên, rồi một bộ hình. Năm bước. Bấm vào nốt nào cũng nghe được.',
  steps: {
    formula: {
      title: 'Âm giai trưởng là một công thức: cung, cung, nửa, cung, cung, cung, nửa',
      body: [
        'Chọn một nốt nhà rồi đi lên: một cung, một cung, nửa cung, cung, cung, cung, nửa. Trên một dây, đó là +2 +2 +1 +2 +2 +2 +1 phím, và bạn trở về nốt nhà cao hơn một quãng 8.',
        'Hai chỗ nửa cung, giữa bậc 3 và 4, giữa bậc 7 và 8, tạo ra màu âm của âm giai. Đổi nốt nhà thì cả hình trượt dọc theo dây; khoảng cách không bao giờ đổi.',
      ],
      takeaway: 'Âm giai trưởng = nốt nhà + 2 2 1 2 2 2 1 phím, ở mọi giọng.',
      tryIt: 'Chơi âm giai trên dây 5 từ phím 3 (C), rồi từ phím 5 (D), vừa chơi vừa đếm to khoảng cách.',
    },
    spelling: {
      title: 'Mỗi chữ cái A tới G có mặt đúng một lần',
      body: [
        'Âm giai trưởng có bảy nốt và dùng mỗi chữ cái trong bảy chữ đúng một lần, theo thứ tự. Mẫu phím quyết định cao độ; quy tắc này quyết định tên.',
        'Trong F trưởng, nốt thứ tư nằm trên A một phím. Nó có thể gọi là A♯ hoặc B♭. Chữ A đã thuộc về nốt thứ ba, còn chữ B sẽ bị thiếu, nên tên đúng là B♭. Làm theo quy tắc này ở giọng nào thì âm giai trưởng của giọng đó cũng chỉ có toàn thăng hoặc toàn giáng, không bao giờ lẫn cả hai.',
      ],
      takeaway: 'Mỗi nốt một chữ cái, nên F trưởng có B♭, không bao giờ có A♯.',
      tryIt: 'Chọn F rồi đổi nốt thứ tư thành A♯: xem chữ A bị dùng hai lần và chữ B bị bỏ trống. Sau đó bật tên trên cần và thử vài giọng.',
    },
    intervals: {
      title: 'Tên quãng gồm một con số và một tính chất',
      body: [
        'Con số là số chữ cái, tính cả hai đầu: từ C lên E là C D E, quãng 3. Tính chất lấy từ số nửa cung: C lên E là 4 nửa cung, quãng 3 trưởng; C lên E♭ là 3 nửa cung, quãng 3 thứ.',
        'Tính từ nốt nhà của âm giai trưởng, bậc 2, 3, 6, 7 là quãng trưởng; bậc 1, 4, 5, 8 là quãng đúng. Hạ nửa cung thì trưởng thành thứ, đúng thành giảm; nâng nửa cung thì quãng nào cũng thành tăng. Trên nốt C, F♯ và G♭ nghe như nhau, nhưng một bên là quãng 4 tăng, bên kia là quãng 5 giảm: số chữ cái quyết định tên.',
      ],
      takeaway: 'Con số = đếm chữ cái; tính chất = số nửa cung. 2 3 6 7 là trưởng, 1 4 5 8 là đúng.',
      tryIt: 'Bấm vài nốt phía trên C và hát thử quãng trước khi bấm nghe. Sau đó hạ quãng 3 trưởng thành thứ và nghe sự khác nhau.',
    },
    shapes: {
      title: 'Mỗi quãng là một con dấu dời đi đâu cũng được',
      body: [
        'Trên guitar, quãng là một hình: quãng 3 nằm ở dây kế trên, quãng 8 lên hai dây và sang phải hai phím. Đóng con dấu ở đâu cũng ra đúng quãng đó, ở giọng nào cũng vậy.',
        'Ngoại lệ duy nhất là cặp dây G và B, lên dây gần nhau hơn các cặp khác nửa cung. Khi hình đi từ dây 3 sang dây 2, nốt nằm bên dây B dời thêm một phím sang phải.',
      ],
      takeaway: 'Cùng hình, cùng quãng, ở bất cứ đâu; thêm +1 phím khi đi qua G→B.',
      tryIt: 'Chọn quãng 3 trưởng và đóng dấu trên dây 5, dây 4 rồi dây 3. Cảm nhận chỗ ngón tay phải dời.',
    },
    degrees: {
      title: 'Âm giai là nốt nhà cộng bảy hình quãng',
      body: [
        'Đặt nốt nhà trên dây 6 và nhìn năm phím quanh nó. Mọi nốt của âm giai trưởng trong ô cửa đó đều là một hình bạn vừa học, đo từ nốt nhà: quãng 2 trưởng, quãng 3 trưởng, quãng 4 đúng, và cứ thế.',
        'Biết các hình là biết âm giai theo bậc, không phải theo một cái hộp học thuộc. Số bậc cũng là cách các bài sau ghi hợp âm và pentatonic.',
      ],
      takeaway: 'Mỗi nốt của âm giai là một quãng tính từ nốt nhà: 1 2 3 4 5 6 7.',
      tryIt: 'Chơi nốt nhà rồi lần lượt từng bậc, gọi tên quãng mình nghe thấy trước khi xem đáp án.',
    },
  },
  scene: {
    interval: {
      name: '{number} {quality}',
      numbers: ['quãng 1', 'quãng 2', 'quãng 3', 'quãng 4', 'quãng 5', 'quãng 6', 'quãng 7', 'quãng 8'],
      qualities: {
        perfect: 'đúng',
        major: 'trưởng',
        minor: 'thứ',
        augmented: 'tăng',
        diminished: 'giảm',
      },
      span: '{n} nửa cung',
      spanOne: '1 nửa cung',
    },
    formula: {
      key: 'Nốt nhà',
      play: 'Chơi âm giai',
      stop: 'Dừng',
      whole: 'Một cung: +2',
      half: 'Nửa cung: +1',
      idle: '{note} trưởng trên dây 5, từ phím {fret}.',
      step: 'Bậc {n}: {note}',
    },
    spelling: {
      key: 'Giọng',
      letters: 'Các chữ cái của âm giai',
      fourth: 'Bậc 4',
      names: 'Tên trên cần',
      show: 'Hiện',
      hide: 'Ẩn',
      right: 'Mỗi chữ một lần: {notes}',
      clash: '{wrong} làm chữ {letter} bị dùng hai lần và bỏ trống chữ {missing}. Vì vậy {key} trưởng có {right}.',
      neck: '{key} trưởng, phím 0–12',
    },
    intervals: {
      home: 'Nốt nhà: {note} trên dây 5',
      play: 'Nghe lần lượt, rồi cùng lúc',
      lower: 'Hạ nửa cung',
      raise: 'Nâng nửa cung',
      idle: 'Bấm một nốt phía trên nốt nhà, tới quãng 8 của nó.',
      reading: '{from} → {to}: {name}, {span}',
      or: 'hoặc',
    },
    shapes: {
      interval: 'Quãng',
      play: 'Nghe hình',
      idle: 'Bấm vào nốt bất kỳ để dời con dấu tới đó.',
      up1: 'lên dây kế trên',
      up2: 'lên hai dây',
      caption: '{name}, {from} → {to}: {up}, lệch {offset} phím',
      crossesB: 'Qua G→B: nốt phía trên dời thêm một phím sang phải.',
      offNeck: 'Từ chỗ này hình không nằm gọn trên cần. Bấm một nốt khác.',
    },
    degrees: {
      key: 'Giọng',
      labels: 'Nhãn',
      degrees: 'Bậc',
      notes: 'Tên nốt',
      degree: 'Nghe nốt nhà, rồi',
      idle: '{key} trưởng, năm phím quanh nốt nhà ở phím {fret} dây 6.',
      heard: 'Nốt nhà, rồi bậc {n}: {note}, {name} ({span}).',
    },
  },
  notYetTitle: 'Những gì chưa cần học',
  notYetIntro: 'Âm giai trưởng mở ra nhiều cánh cửa. Những cửa này có thể chờ tới khi một bài cần đến.',
  notYet: [
    { title: 'Âm giai thứ tự nhiên và giọng song song', why: 'Cùng bộ nốt, chỉ đổi nốt nhà. Phần này đến cùng pentatonic đầy đủ và bài giọng.' },
    { title: 'Thuộc lòng hóa biểu', why: 'Quy tắc chữ cái đã đặt tên mọi nốt cho bạn. Đọc giọng qua hóa biểu thuộc về khuông nhạc.' },
    { title: 'Thăng kép và giáng kép', why: 'D♯ trưởng sẽ cần F𝄪, nên cùng giọng đó được gọi là E♭ trưởng. Chúng quay lại trong công thức hợp âm.' },
    { title: 'Quãng 9, 11, 13', why: 'Đó là bậc 2, 4, 6 cao hơn một quãng 8. Chúng cần cho tên hợp âm.' },
    { title: 'Âm giai 3 nốt mỗi dây', why: 'Một cách chơi âm giai khắp cần. Phần này đến sau các hộp pentatonic.' },
    { title: 'Quãng đi xuống, quãng đảo, các mode', why: 'Lúc này các hình đi lên từ nốt nhà đã đủ cho âm giai và hợp âm.' },
  ],
};
