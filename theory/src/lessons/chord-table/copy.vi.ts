import type { ChordTableCopy } from './model';

export const vi: ChordTableCopy = {
  title: 'Bảng công thức hợp âm',
  summary: 'Hợp âm 7, 9, 11, inversion và slash chord: mỗi tên hợp âm là một công thức, và cần đàn chỉ ra các nốt của nó nằm ở đâu.',
  lead:
    'Triad có ba nốt. Phần lớn tên hợp âm bạn gặp thêm một quãng 3 nữa lên trên, hoặc một extension cao hơn nữa, hoặc đặt một nốt khác xuống bass. Bài này biến cả bảng hợp âm thành một bảng công thức, rồi chỉ ra các shape, các inversion, và cách rút gọn một hợp âm lạ thành hợp âm bạn chơi được. Năm bước. Bấm vào nốt nào cũng nghe được.',
  steps: {
    sevenths: {
      title: 'Hợp âm 7: thêm một quãng 3 lên trên',
      body: [
        'Chồng thêm một quãng 3 lên triad là tới bậc 7. Chồng những quãng 3 nào quyết định hợp âm: 3 trưởng, 3 thứ, 3 trưởng cho maj7, êm và sáng; trưởng, thứ, thứ cho hợp âm 7 thường, tức hợp âm dominant căng thẳng; thứ, trưởng, thứ cho m7, mềm.',
        'Hai hợp âm nữa hạ cả bậc 5: m7♭5 (half-diminished) là triad giảm thêm ♭7, còn °7 (diminished đủ) chỉ chồng các quãng 3 thứ, bốn quãng chia đều quãng 8. Tên nốt theo công thức từng chữ cái, nên C°7 có B𝄫, không phải A.',
      ],
      takeaway: 'maj7 = 1 3 5 7, 7 = 1 3 5 ♭7, m7 = 1 ♭3 5 ♭7: bậc 3 và bậc 7 quyết định.',
      tryIt: 'Rải Cmaj7, rồi C7, rồi Cm7, và gọi tên màu âm của từng hợp âm.',
    },
    table: {
      title: 'Bảng công thức',
      body: [
        'Mọi hợp âm trong app này đến từ một bảng: một cái tên, và một công thức gồm các bậc tính từ root. Chọn root và một dòng, cần đàn sẽ sáng lên mọi chỗ các nốt của hợp âm đó vang, tô màu theo vai trò: root, bậc 3, bậc 5, bậc 7, extension.',
        'Bậc 9 là bậc 2 cao hơn một quãng 8, bậc 11 là bậc 4 cao hơn một quãng 8: các extension chồng lên trên bậc 7. Add2 (thường viết add9) thêm bậc 2 mà không có bậc 7. Shape nào gồm đúng các nốt này, ở đâu trên cần, cũng là hợp âm đó.',
      ],
      takeaway: 'Tên hợp âm là một công thức; cần đàn chỉ ra mọi chỗ các nốt của nó nằm.',
      tryIt: 'Chọn Dm7 và tìm ba chỗ khác nhau trên cần để bấm cùng lúc bốn nốt của nó.',
    },
    openSevenths: {
      title: 'Hợp âm 7 và m11 dây buông',
      body: [
        'Hợp âm 7 dây buông là triad của nó thêm hoặc nhấc một ngón. E7 là E với nốt quãng 8 trên dây 4 hạ xuống ♭7; G7 là G với nốt trên cùng hạ xuống F; Cmaj7 là C nhấc ngón bấm root trên dây 2 để dây B buông vang.',
        'Am11 và Em11 phần lớn là dây buông: chúng bỏ bậc 5 hoặc bậc 9, tai gần như không nhận ra. Shape m11 dựa trên shape A di chuyển như mọi hợp âm chặn; Dm11 nằm ở phím 5.',
      ],
      takeaway: 'Hợp âm 7 dây buông là triad của nó với một ngón đổi chỗ: tìm bậc 7 trong shape.',
      tryIt: 'Đổi C ↔ C7 và G ↔ G7, tìm đúng một nốt thay đổi. Rồi dời shape m11 tới Dm11.',
    },
    inversions: {
      title: 'Inversion và slash chord',
      body: [
        'G/B nghĩa là hợp âm G với nốt B thấp nhất. Khi nốt bass thuộc hợp âm, đó là inversion: bậc 3 ở bass là inversion 1, bậc 5 là inversion 2, bậc 7 là inversion 3.',
        'Hợp âm giữ tên và vai trò nhưng nghe nhẹ hơn hoặc kém ổn định hơn, còn đường bass mượt hơn. C, G/B, Am, G cho bass đi xuống từng bậc, C B A G, trong khi tay gần như không di chuyển.',
      ],
      takeaway: 'X/Y = hợp âm X với Y ở bass: cùng tên hợp âm, đường bass khác.',
      tryIt: 'Chơi C → G/B → Am → G và nghe đường bass đi xuống.',
    },
    simplify: {
      title: 'Rút gọn một hợp âm lạ',
      body: [
        'Khi bảng hợp âm ghi G11 hay Cm9 mà bạn chưa biết shape, hãy rút gọn: bỏ extension cao nhất, hợp âm vẫn giữ vai trò, chỉ trơn hơn một chút. G11 → G9 → G7 luôn dùng được; bước cuối về G còn bỏ cả ♭7, nên hãy nghe xem nó còn hợp với bài không.',
        'Đi theo chiều ngược lại là cách người chơi làm hợp âm "đậm" hơn: hợp âm I hay IV thành add2 hay maj7, hợp âm thứ thành m7 hay m11, miễn là không va với giai điệu. Đừng đặt maj7 lên hợp âm V: nó nghe chỏi với ♭7 mà tai chờ đợi ở đó.',
      ],
      takeaway: 'Bỏ dần extension cho tới hợp âm 7 hay triad bạn chơi được.',
      tryIt: 'Chơi từng bậc thang từ trên xuống và nghe nốt nào rời đi ở mỗi bước.',
    },
  },
  scene: {
    root: 'Root',
    chord: 'Hợp âm',
    play: 'Phát',
    stop: 'Dừng',
    together: 'Cùng lúc',
    arpeggio: 'Từng nốt',
    labels: 'Nhãn',
    degrees: 'Bậc',
    notes: 'Tên nốt',
    mutedMark: '×',
    interval: {
      name: '{number} {quality}',
      numbers: ['quãng 1', 'quãng 2', 'quãng 3', 'quãng 4', 'quãng 5', 'quãng 6', 'quãng 7', 'quãng 8'],
      qualities: { perfect: 'đúng', major: 'trưởng', minor: 'thứ', augmented: 'tăng', diminished: 'giảm' },
    },
    sevenths: {
      caption: '{symbol} = {formula} = {notes}. Chồng: {gaps}.',
    },
    table: {
      group: 'Nhóm',
      groups: { triads: 'Triad', sevenths: 'Hợp âm 7', extended: 'Hợp âm mở rộng' },
      roles: { root: 'Root', third: 'Bậc 3', fifth: 'Bậc 5', seventh: 'Bậc 7', colour: 'Extension' },
      caption: '{symbol} = {formula} = {notes}',
    },
    openSevenths: {
      compare: 'So với {symbol}',
      caption: '{symbol}, từ trầm lên cao: {degrees}',
      changed: 'So với {base}: {moved}.',
      movable: 'Di động (shape A)',
      kind: 'Loại',
      movableCaption: '{symbol}, shape A ở phím {fret}: {degrees}',
    },
    inversions: {
      bass: 'Bass',
      bassItem: '{note} ({degree})',
      caption: '{symbol}: {bass} ở bass, bậc {degree}.',
      walk: 'C → G/B → Am → G',
      walkCaption: '{chords}. Bass: {basses}.',
    },
    simplify: {
      simpler: 'Đơn giản hơn một bước',
      reset: 'Về đầu',
      caption: '{symbol} = {formula} = {notes}',
      dropped: '{from} → {to}: bậc {degree} đã rời đi.',
    },
  },
  notYetTitle: 'Chưa cần học lúc này',
  notYetIntro: 'Bảng này bao phủ những hợp âm hầu hết bài hát dùng. Những thứ sau để sau.',
  notYet: [
    { title: 'Hợp âm 13', why: 'Thêm một extension nữa lên trên. Tạm rút gọn về 9 hay 7.' },
    { title: 'Altered note: ♭9, ♯9, ♯11', why: 'Màu âm jazz trên hợp âm dominant. Học cùng hòa âm jazz.' },
    { title: 'Drop-2 và close voicing', why: 'Những cách xếp khác cho cùng các nốt. Shape dây buông và hợp âm chặn đi trước.' },
    { title: 'Chọn inversion trong vòng hợp âm', why: 'Dùng inversion nào ở đâu học cùng giọng và vòng hợp âm.' },
  ],
};
