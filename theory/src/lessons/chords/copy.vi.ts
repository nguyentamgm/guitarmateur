import type { ChordsCopy } from './model';

export const vi: ChordsCopy = {
  title: 'Hợp âm là các quãng xếp chồng',
  summary: 'Hợp âm ba là một nốt gốc với hai quãng chồng lên trên. Hiểu công thức thì mọi thế bấm hợp âm trên cần đàn đều tự giải thích được.',
  lead:
    'Bạn có thể học thuộc từng thế bấm hợp âm, hoặc hiểu chúng được làm từ gì. Hợp âm là một nốt gốc cộng vài quãng xếp chồng lên nó; đổi một quãng là đổi hợp âm. Năm bước, từ ba nốt trên ba dây tới tự dựng bất kỳ hợp âm ba nào. Bấm vào nốt nào cũng nghe được.',
  steps: {
    stack: {
      title: 'Hợp âm ba là ba nốt chồng theo quãng 3',
      body: [
        'Lấy một nốt gốc, thêm nốt cao hơn nó một quãng 3, rồi thêm nốt cao hơn nốt đó một quãng 3 nữa. Ba nốt, hai quãng 3 chồng lên nhau: một hợp âm ba. Trên guitar, chồng quãng này nằm vừa trên ba dây kề nhau, mỗi dây một nốt.',
        'Hợp âm ba trưởng là quãng 3 trưởng với quãng 3 thứ ở trên. Đảo thứ tự, quãng 3 thứ trước, là được hợp âm ba thứ. Dù thế nào, nốt gốc và nốt trên cùng luôn cách nhau một quãng 5 đúng.',
      ],
      takeaway: 'Trưởng = quãng 3 trưởng + quãng 3 thứ; thứ = quãng 3 thứ + quãng 3 trưởng.',
      tryIt: 'Phát chồng quãng từng nốt một, rồi cùng lúc. Dời nó tới D ở phím 5 và G ở phím 10 trên dây 5.',
    },
    qualities: {
      title: 'Bốn tính chất từ một công thức',
      body: [
        'Công thức trưởng là 1 3 5. Hạ bậc 3 là được thứ, 1 ♭3 5. Nâng bậc 5 là tăng, 1 3 ♯5; hạ cả bậc 3 lẫn bậc 5 là giảm, 1 ♭3 ♭5. Mỗi thay đổi chỉ một phím.',
        'Tên nốt theo công thức, không theo phím đàn piano: C thứ có E♭, không có D♯, vì bậc 3 của C luôn là một loại E. Vì thế F♯ thứ là F♯ A C♯, còn B♭ giảm có F♭.',
      ],
      takeaway: 'Bậc 3 quyết định trưởng hay thứ; bậc 5 quyết định tăng hay giảm.',
      tryIt: 'Trên A, đổi trưởng ↔ thứ và nghe đúng một nốt di chuyển. Rồi thử tăng và giảm.',
    },
    sus: {
      title: 'Hợp âm sus: bậc 3 bị treo',
      body: [
        'Hợp âm sus đổi bậc 3 lấy nốt hàng xóm của nó: bậc 2 (sus2) hoặc bậc 4 (sus4). Không có bậc 3 nên nó không trưởng cũng không thứ; nghe mở và lơ lửng.',
        'Chính sự lơ lửng đó là điểm hay. Chơi sus4 rồi chơi hợp âm trưởng, bậc 4 rơi xuống bậc 3 như cánh cửa khép lại. Các bài hát dùng điều này liên tục.',
      ],
      takeaway: 'Sus thay bậc 3 bằng bậc 2 hoặc 4: còn lơ lửng cho tới khi bậc 3 quay lại.',
      tryIt: 'Chơi Dsus4 → D, rồi Dsus2 → D. Cái nào muốn về hơn?',
    },
    open: {
      title: 'Hợp âm dây buông dùng cùng công thức',
      body: [
        'Những hợp âm đầu tiên người chơi học, C, A, G, E và D, trông như năm hình chẳng liên quan. Ghi bậc lên từng nốt thì chúng là một: 1, 3 và 5, lặp lại trên các dây, dây buông lấp vào chỗ trống.',
        'E và Em, A và Am, D và Dm khác nhau đúng một ngón: bậc 3 lùi một phím. Nốt gốc luôn là nốt thấp nhất được chơi; các dây thấp hơn nó thì bỏ.',
      ],
      takeaway: 'Mọi hợp âm dây buông đều là 1, 3, 5 rải trên sáu dây: hình đổi, công thức không đổi.',
      tryIt: 'Tìm mọi bậc 3 trong C, G và D. Rồi đổi E sang Em và xem chấm nào di chuyển.',
    },
    build: {
      title: 'Tự dựng bất kỳ hợp âm ba nào',
      body: [
        'Có tên hợp âm là dựng được từ đầu: đặt nốt gốc trên dây 5, rồi đếm theo công thức. Lên một dây là cao hơn 5 phím, nên quãng 3 trưởng nằm lệch trái nốt gốc một phím ở dây kế trên, quãng 3 thứ lệch trái hai phím; bậc 5 lệch trái ba phím, lên hai dây.',
        'Quãng 8 nào cũng tính. Tìm đúng nốt ở chỗ khác trên cần thì vẫn là đúng nốt.',
      ],
      takeaway: 'Tên → công thức → phím: không cần bảng hợp âm.',
      tryIt: 'Trả lời đúng mười câu liên tiếp. Rồi chuyển sang đủ sáu loại và làm lại.',
    },
  },
  scene: {
    root: 'Nốt gốc',
    arpeggio: 'Từng nốt',
    together: 'Cùng lúc',
    labels: 'Nhãn',
    degrees: 'Bậc',
    notes: 'Tên nốt',
    interval: {
      name: '{number} {quality}',
      numbers: ['quãng 1', 'quãng 2', 'quãng 3', 'quãng 4', 'quãng 5', 'quãng 6', 'quãng 7', 'quãng 8'],
      qualities: { perfect: 'đúng', major: 'trưởng', minor: 'thứ', augmented: 'tăng', diminished: 'giảm' },
    },
    kinds: { major: 'Trưởng', minor: 'Thứ', aug: 'Tăng', dim: 'Giảm', sus2: 'Sus2', sus4: 'Sus4' },
    stack: {
      caption: '{symbol}: {lower} + {upper}, từ gốc tới nốt trên cùng là {outer}.',
    },
    qualities: {
      quality: 'Tính chất',
      caption: '{symbol} = {formula} = {notes}',
    },
    sus: {
      kind: 'Hợp âm',
      resolve: 'Sus, rồi trưởng',
      caption: '{symbol} = {formula} = {notes}: {lower} + {upper}.',
    },
    open: {
      chord: 'Hợp âm',
      switchTo: 'Đổi sang {symbol}',
      strum: 'Quạt',
      mutedMark: '×',
      caption: '{symbol}, từ trầm lên cao: {degrees}',
    },
    build: {
      pool: 'Hợp âm',
      basic: 'Trưởng và thứ',
      all: 'Đủ sáu loại',
      question: 'Dựng {symbol}: nốt gốc ở dây 5, phím {fret}. Bấm các nốt còn lại.',
      found: 'Đúng: đó là bậc {degree} của {symbol}.',
      root: 'Đó chính là nốt gốc. Tìm các nốt còn lại.',
      miss: 'Nốt này cao hơn gốc {semitones} nửa cung: không có trong {symbol}, công thức là {formula}.',
      solved: 'Xong: {symbol} = {notes}.',
      next: 'Hợp âm khác',
      score: 'Đúng {right}/{total} · {streak} câu liên tiếp',
    },
  },
  notYetTitle: 'Những thứ chưa cần lúc này',
  notYetIntro: 'Hợp âm ba là lõi của mọi hợp âm. Những thứ này dựng tiếp trên nó sau.',
  notYet: [
    { title: 'Hợp âm 7 và bảng công thức', why: 'Chúng thêm một quãng 3 nữa lên trên. Học cùng bảng hợp âm.' },
    { title: 'Hợp âm chặn', why: 'Hình đầy đủ di động, dựng từ cùng công thức trên nốt gốc dây 6 và dây 5. Bài sau.' },
    { title: 'Thế đảo và hợp âm có bass riêng', why: 'Cùng các nốt nhưng một nốt khác nằm dưới cùng. Học cùng bảng hợp âm.' },
    { title: 'Tiến trình hợp âm', why: 'Hợp âm nào đi với nhau trong một giọng thuộc bài giọng và số La Mã.' },
    { title: 'C7, F dây buông và các hình khác', why: 'Vài hợp âm dây buông cần chặn hoặc giãn ngón; quy tắc đơn giản ở đây chưa với tới.' },
  ],
};
