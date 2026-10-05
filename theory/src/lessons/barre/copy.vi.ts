import type { BarreCopy } from './model';

export const vi: BarreCopy = {
  title: 'Hợp âm chặn: hai shape, mọi hợp âm',
  summary: 'Đặt ngón trỏ chặn ngang các dây, hai shape dây buông trở thành mọi hợp âm trưởng, thứ và hợp âm 7 trên cần đàn.',
  lead:
    'Hợp âm dây buông chỉ có ở vài giọng. Hợp âm chặn giải quyết điều đó: ngón trỏ thay cho nut, và shape E hay shape A dây buông trượt tới đâu cũng được. Hai shape, mỗi shape sáu biến thể, và tên hợp âm luôn là nốt nằm dưới ngón chặn. Năm bước. Bấm vào nốt nào cũng nghe được.',
  steps: {
    slide: {
      title: 'Ngón trỏ là một cái nut di động',
      body: [
        'Bấm hợp âm E dây buông bằng ngón 2, 3 và 4, để ngón trỏ rảnh. Giờ đặt ngón trỏ nằm ngang cả sáu dây ở phím cao hơn một phím và dời cả shape theo: bạn đang chơi F. Mọi dây buông của shape E giờ nằm dưới ngón chặn.',
        'Trượt cả shape lên, hợp âm giữ nguyên loại nhưng đổi tên. Tên chính là nốt dưới ngón chặn trên dây 6, thứ bạn đã biết qua bảng nốt trên dây 6 và 5.',
      ],
      takeaway: 'Shape E + ngón chặn = mọi hợp âm trưởng; tên là nốt trên dây 6.',
      tryIt: 'Chơi F ở phím 1, G ở phím 3 và A ở phím 5. Gọi tên từng hợp âm trước khi xem đáp án.',
    },
    eShape: {
      title: 'Shape E: root trên dây 6',
      body: [
        'Hợp âm chặn shape E có cùng các biến thể như hợp âm dây buông: trưởng, thứ, 7, m7, maj7 và sus4. Đó không phải sáu shape để học thuộc. Mỗi biến thể là shape trưởng với một hai nốt dời đi, đúng như công thức.',
        'Thứ hạ bậc 3 một phím. Hợp âm 7 hạ nốt quãng 8 trên dây 4 xuống ♭7. Maj7 đặt bậc 7 ở đó, cao hơn một phím. Sus4 nâng bậc 3 lên bậc 4.',
      ],
      takeaway: 'Học các bậc trong shape: biến thể chỉ là bậc 3 và bậc 7 di chuyển.',
      tryIt: 'Chơi G, rồi Gm, rồi Gm7 ở phím 3, để ý ngón nào nhấc lên mỗi lần.',
    },
    aShape: {
      title: 'Shape A: root trên dây 5',
      body: [
        'Hợp âm A dây buông dời đi theo cùng cách, ngón chặn nằm ngang từ dây 5 tới dây 1 và root trên dây 5. Các biến thể theo cùng quy tắc: bậc 3 và bậc 7 di chuyển, còn lại đứng yên.',
        'Với hai shape, hợp âm nào cũng chơi được ở hai chỗ: root trên dây 6, hoặc trên dây 5. Chính lựa chọn đó giúp tay bạn đứng yên ở các bước sau.',
      ],
      takeaway: 'Shape A = root trên dây 5, cùng các biến thể, cùng các bậc.',
      tryIt: 'Chơi C ở phím 3, rồi Cm, C7 và Cmaj7 mà không dời ngón chặn.',
    },
    find: {
      title: 'Tìm bất kỳ hợp âm chặn nào',
      body: [
        'Muốn chơi một hợp âm chưa từng chơi, tìm root của nó trên dây 6 hoặc dây 5 bằng bảng nốt trên dây 6 và 5. Đặt ngón chặn ở đó, chọn shape theo dây, và chọn biến thể theo ký hiệu: m là thứ, 7, maj7, m7.',
        'Cả hai đáp án đều đúng. Phần lớn hợp âm dễ chơi hơn ở một trong hai chỗ, tùy tay bạn đang ở đâu.',
      ],
      takeaway: 'Root trên dây 6 → shape E; root trên dây 5 → shape A; ký hiệu chọn biến thể.',
      tryIt: 'Trả lời đúng mười câu liên tiếp, và dùng dây 5 ít nhất một nửa số lần.',
    },
    changes: {
      title: 'Đổi hợp âm không cần nhảy',
      body: [
        'Một bài ở giọng G có thể đi G, Em, C, D. Chơi tất cả bằng shape E thì tay nhảy từ phím 3 xuống 0, lên 8 rồi tới 10. Trộn hai shape thì cùng các hợp âm đó nằm cách nhau vài phím.',
        'Nhìn hợp âm kế tiếp, tìm root của nó trên cả dây 6 và dây 5, rồi chọn chỗ gần tay hơn. Tay đứng yên một vùng, và đổi hợp âm nhanh hơn.',
      ],
      takeaway: 'Trộn shape E và shape A để ngón chặn ở yên một vùng cần đàn.',
      tryIt: 'Chơi vòng hợp âm theo cả hai cách ở giọng G và một giọng khác, cảm nhận sự khác biệt ở cánh tay.',
    },
  },
  scene: {
    strum: 'Quạt',
    stop: 'Dừng',
    root: 'Root',
    labels: 'Nhãn',
    degrees: 'Bậc',
    notes: 'Tên nốt',
    kinds: { major: 'Trưởng', minor: 'm', dom7: '7', m7: 'm7', maj7: 'maj7', sus4: 'sus4' },
    slide: {
      fret: 'Chặn ở phím',
      caption: '{symbol}: chặn ở phím {fret}; root trên dây 6 đặt tên cho hợp âm.',
      open: '{symbol}: phím 0, chính là hợp âm dây buông. Dời ngón chặn lên.',
    },
    shape: {
      variant: 'Biến thể',
      caption: '{symbol}, shape {shape}, chặn ở phím {fret}: {degrees}',
      moved: 'So với {base}: {moved} đã dời.',
    },
    find: {
      question: 'Tìm {symbol}: bấm root của nó trên dây 6 hoặc dây 5.',
      right: 'Đúng: {symbol}, shape {shape} ở phím {fret}. Nó còn ở phím {otherFret} với shape {otherShape}.',
      wrongString: 'Hợp âm chặn có root trên dây 6 hoặc dây 5.',
      wrongNote: 'Đó là {heard}. Tìm {root}.',
      next: 'Hợp âm khác',
      score: 'Đúng {right}/{total} · {streak} câu liên tiếp',
    },
    changes: {
      key: 'Giọng',
      path: 'Cách bấm',
      near: 'Trộn shape E và A',
      string6: 'Toàn shape E',
      play: 'Phát vòng hợp âm',
      chordItem: '{symbol}: {shape} {fret}',
      caption: '{chords}. Ngón chặn di chuyển tổng cộng {travel} phím qua một vòng.',
    },
  },
  notYetTitle: 'Chưa cần học lúc này',
  notYetIntro: 'Hai shape đủ cho mọi hợp âm bạn sẽ gặp trong thời gian dài. Những thứ này để sau.',
  notYet: [
    { title: 'Shape m11', why: 'Cần bảng hợp âm và một quy tắc bấm khác. Học cùng hợp âm 7.' },
    { title: 'Shape C, G và D (CAGED)', why: 'Thêm ba shape di động. Shape E và shape A làm được việc trước đã.' },
    { title: 'Chặn một phần và triad nhỏ', why: 'Shape ba dây ở cao trên cần đến cùng bài solo theo hợp âm.' },
    { title: 'Inversion', why: 'Một nốt khác nằm dưới cùng. Học cùng bảng hợp âm.' },
    { title: 'Vì sao là I, vi, IV, V', why: 'Số La Mã và hợp âm nào thuộc một giọng đến cùng bài giọng và vòng hợp âm.' },
  ],
};
