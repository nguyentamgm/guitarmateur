import type { MajorScaleCopy } from './model';

export const vi: MajorScaleCopy = {
  title: 'Major scale và quãng là shape trên cần',
  summary: 'Một công thức dựng major scale ở mọi giọng; mỗi quãng là một shape mang đi khắp cần được.',
  lead:
    'Major scale là cây thước để đo mọi thứ khác trong nhạc lý: pentatonic, hợp âm, giọng đều được mô tả theo nó. Ở đây nó là một mẫu khoảng cách phím, rồi một quy tắc đặt tên, rồi một bộ shape. Năm bước. Bấm vào nốt nào cũng nghe được.',
  steps: {
    formula: {
      title: 'Major scale là một công thức: cung, cung, nửa, cung, cung, cung, nửa',
      body: [
        'Chọn một root, nốt mà scale bắt đầu và nghe như về nhà, rồi đi lên: một cung, một cung, nửa cung, cung, cung, cung, nửa. Trên một dây, đó là +2 +2 +1 +2 +2 +2 +1 phím, và bạn trở về root cao hơn một quãng 8.',
        'Hai chỗ nửa cung, giữa bậc 3 và 4, giữa bậc 7 và 8, tạo ra màu âm của scale. Đổi root thì cả mẫu trượt dọc theo dây; khoảng cách không bao giờ đổi.',
      ],
      takeaway: 'Major scale = root + 2 2 1 2 2 2 1 phím, ở mọi giọng.',
      tryIt: 'Chơi scale trên dây 5 từ phím 3 (C), rồi từ phím 5 (D), vừa chơi vừa đếm to khoảng cách.',
    },
    spelling: {
      title: 'Mỗi chữ cái A tới G có mặt đúng một lần',
      body: [
        'Major scale có bảy nốt và dùng mỗi chữ cái trong bảy chữ đúng một lần, theo thứ tự. Mẫu phím quyết định cao độ; quy tắc này quyết định tên.',
        'Trong F trưởng, nốt thứ tư nằm trên A một phím. Nó có thể gọi là A♯ hoặc B♭. Chữ A đã thuộc về nốt thứ ba, còn chữ B sẽ bị thiếu, nên tên đúng là B♭. Làm theo quy tắc này ở giọng nào thì major scale của giọng đó cũng chỉ có toàn thăng hoặc toàn giáng, không bao giờ lẫn cả hai.',
      ],
      takeaway: 'Mỗi nốt một chữ cái, nên F trưởng có B♭, không bao giờ có A♯.',
      tryIt: 'Chọn F rồi đổi nốt thứ tư thành A♯: xem chữ A bị dùng hai lần và chữ B bị bỏ trống. Sau đó bật tên trên cần và thử vài giọng.',
    },
    intervals: {
      title: 'Tên quãng gồm một con số và một loại',
      body: [
        'Con số là số chữ cái, tính cả hai đầu: từ C lên E là C D E, quãng 3. Loại quãng lấy từ số nửa cung: C lên E là 4 nửa cung, quãng 3 trưởng; C lên E♭ là 3 nửa cung, quãng 3 thứ.',
        'Tính từ root của major scale, bậc 2, 3, 6, 7 là quãng trưởng; bậc 1, 4, 5, 8 là quãng đúng. Hạ nửa cung thì trưởng thành thứ, đúng thành giảm; nâng nửa cung thì quãng nào cũng thành tăng. Trên nốt C, F♯ và G♭ nghe như nhau, nhưng một bên là quãng 4 tăng, bên kia là quãng 5 giảm: số chữ cái quyết định tên.',
      ],
      takeaway: 'Con số = đếm chữ cái; loại = số nửa cung. 2 3 6 7 là trưởng, 1 4 5 8 là đúng.',
      tryIt: 'Bấm vài nốt phía trên C và hát thử quãng trước khi bấm nghe. Sau đó hạ quãng 3 trưởng thành thứ và nghe sự khác nhau.',
    },
    shapes: {
      title: 'Mỗi quãng là một con dấu dời đi đâu cũng được',
      body: [
        'Trên guitar, quãng là một shape: quãng 3 nằm ở dây kế trên, quãng 8 lên hai dây và sang phải hai phím. Đóng con dấu ở đâu cũng ra đúng quãng đó, ở giọng nào cũng vậy.',
        'Ngoại lệ duy nhất là cặp dây G và B, lên dây gần nhau hơn các cặp khác nửa cung. Khi shape đi từ dây 3 sang dây 2, nốt nằm bên dây B dời thêm một phím sang phải.',
      ],
      takeaway: 'Cùng shape, cùng quãng, ở bất cứ đâu; thêm +1 phím khi đi qua G→B.',
      tryIt: 'Chọn quãng 3 trưởng và đóng dấu trên dây 5, dây 4 rồi dây 3. Cảm nhận chỗ ngón tay phải dời.',
    },
    degrees: {
      title: 'Scale là root cộng sáu shape quãng',
      body: [
        'Đặt root trên dây 6 và nhìn năm phím quanh nó. Mọi nốt của major scale trong vùng đó đều là một shape bạn vừa học, đo từ root: quãng 2 trưởng, quãng 3 trưởng, quãng 4 đúng, và cứ thế.',
        'Biết các shape là biết scale theo bậc, không phải theo một box học thuộc. Số bậc cũng là cách các bài sau ghi hợp âm và pentatonic.',
      ],
      takeaway: 'Mỗi nốt của scale là một quãng tính từ root: 1 2 3 4 5 6 7.',
      tryIt: 'Chơi root rồi lần lượt từng bậc, gọi tên quãng mình nghe thấy trước khi xem đáp án.',
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
      key: 'Root',
      play: 'Chơi scale',
      stop: 'Dừng',
      whole: 'Một cung: +2',
      half: 'Nửa cung: +1',
      idle: '{note} trưởng trên dây 5, từ phím {fret}.',
      step: 'Bậc {n}: {note}',
    },
    spelling: {
      key: 'Giọng',
      letters: 'Các chữ cái của scale',
      fourth: 'Bậc 4',
      names: 'Tên trên cần',
      show: 'Hiện',
      hide: 'Ẩn',
      right: 'Mỗi chữ một lần: {notes}',
      clash: '{wrong} làm chữ {letter} bị dùng hai lần và bỏ trống chữ {missing}. Vì vậy {key} trưởng có {right}.',
      neck: '{key} trưởng, phím 0–12',
    },
    intervals: {
      home: 'Root: {note} trên dây 5',
      play: 'Nghe lần lượt, rồi cùng lúc',
      lower: 'Hạ nửa cung',
      raise: 'Nâng nửa cung',
      idle: 'Bấm một nốt phía trên root, tới quãng 8 của nó.',
      reading: '{from} → {to}: {name}, {span}',
      or: 'hoặc',
    },
    shapes: {
      interval: 'Quãng',
      play: 'Nghe shape',
      idle: 'Bấm vào nốt bất kỳ để dời con dấu tới đó.',
      up1: 'lên dây kế trên',
      up2: 'lên hai dây',
      caption: '{name}, {from} → {to}: {up}, lệch {offset} phím',
      crossesB: 'Qua G→B: nốt phía trên dời thêm một phím sang phải.',
      offNeck: 'Từ chỗ này shape không nằm gọn trên cần. Bấm một nốt khác.',
    },
    degrees: {
      key: 'Giọng',
      labels: 'Nhãn',
      degrees: 'Bậc',
      notes: 'Tên nốt',
      degree: 'Nghe root, rồi',
      idle: '{key} trưởng, năm phím quanh root ở phím {fret} dây 6.',
      heard: 'Root, rồi bậc {n}: {note}, {name} ({span}).',
    },
  },
  notYetTitle: 'Chưa cần học lúc này',
  notYetIntro: 'Major scale mở ra nhiều cánh cửa. Những cửa này có thể chờ tới khi một bài cần đến.',
  notYet: [
    { title: 'Natural minor scale và relative key', why: 'Cùng bộ nốt, chỉ đổi root. Phần này đến cùng pentatonic đầy đủ và bài giọng.' },
    { title: 'Thuộc lòng key signature', why: 'Quy tắc chữ cái đã đặt tên mọi nốt cho bạn. Đọc giọng qua key signature thuộc về khuông nhạc.' },
    { title: 'Thăng kép và giáng kép', why: 'D♯ trưởng sẽ cần F𝄪, nên cùng giọng đó được gọi là E♭ trưởng. Chúng quay lại trong công thức hợp âm.' },
    { title: 'Quãng 9, 11, 13', why: 'Đó là bậc 2, 4, 6 cao hơn một quãng 8. Chúng cần cho tên hợp âm.' },
    { title: 'Scale 3 nốt mỗi dây', why: 'Một cách chơi scale khắp cần. Phần này đến sau các box pentatonic.' },
    { title: 'Quãng đi xuống, quãng đảo, các mode', why: 'Lúc này các shape đi lên từ root đã đủ cho scale và hợp âm.' },
  ],
};
