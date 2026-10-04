import type { PentatonicMapCopy } from './model';

export const vi: PentatonicMapCopy = {
  title: 'Bản đồ Pentatonic',
  summary: 'Năm hình phủ kín cần đàn. Học chúng như những khoảng cách, rồi dời sang giọng nào cũng được.',
  lead:
    'Nhiều giáo trình mở đầu bằng khuông nhạc, hóa biểu và vòng quãng năm. Bài này bỏ qua tất cả và đi thẳng tới cần đàn: năm ý, mỗi ý một hình bạn chơi được. Bấm vào nốt nào cũng nghe được.',
  steps: {
    grid: {
      title: 'Cần đàn là một cái lưới, không phải bảng tên nốt',
      body: [
        'Mỗi phím là một bước, bước nhỏ nhất có thể. Ở đây bạn không cần tên nốt, chỉ cần đếm.',
        'Bấm phím 5 trên dây nào cũng ra đúng cao độ của dây mỏng hơn kế bên khi để buông. Chỉ có đúng một ngoại lệ: từ dây G sang dây B là phím 4. Chỗ lệch duy nhất đó là lý do mọi hình trên cần đàn dịch đi một phím khi sang dây B.',
      ],
      takeaway: 'Phím 5 bằng dây kế bên để buông, trừ cặp G sang B là phím 4.',
      tryIt: 'Bấm phím 5 dây A rồi gảy dây D buông. Sau đó so phím 4 dây G với dây B buông.',
    },
    formula: {
      title: 'Pentatonic thứ là một công thức khoảng cách',
      body: [
        'Chọn một nốt và gọi nó là nhà. Từ đó đi lên 3 phím, rồi 2, 2, 3, 2 phím là về lại nhà, cao hơn một quãng 8. Toàn bộ âm giai chỉ có vậy.',
        'Các nhãn 1, b3, 4, 5, b7 dưới mỗi nốt chỉ là tên của khoảng cách so với nhà. Chưa cần thuộc. Sau này chúng giúp bạn chọn chỗ dừng: 1 và 5 nghe vững, b3 nghe buồn.',
      ],
      takeaway: 'Pentatonic thứ = nhà, +3, +2, +2, +3, +2 phím.',
      tryIt: 'Trên dây 6, bắt đầu ở phím 5 và chơi công thức lên tới phím 17, rồi đi ngược xuống.',
    },
    boxes: {
      title: 'Gấp công thức vào bàn tay: 2 nốt mỗi dây',
      body: [
        'Chơi dọc một dây thì tay phải chạy rất xa. Thay vào đó, gấp công thức qua 6 dây, mỗi dây đúng 2 nốt. Kết quả là một hộp gọn trong khoảng 4 phím.',
        'Đi tiếp công thức thì ra hộp kế tiếp. Năm hộp lát kín cần đàn như gạch, mỗi hộp chung một cạnh với hộp bên cạnh, và cả chuỗi lặp lại sau phím 12.',
      ],
      takeaway: 'Hai nốt mỗi dây biến công thức thành năm hộp lát kín cần đàn.',
      tryIt: 'Thuộc hộp 1 trước. Sau đó chỉ tập riêng cạnh chung giữa hộp 1 và hộp 2.',
    },
    keys: {
      title: 'Đổi giọng là trượt nguyên hình',
      body: [
        'Hình không bao giờ đổi. Thứ duy nhất dời đi là chỗ của nốt nhà trên dây 6. Muốn chơi C thứ? Tìm C trên dây 6 (phím 8) và đặt hộp 1 vào đó.',
        'Bảng tìm nhà bên dưới là thứ duy nhất trong bài đáng học thuộc: mỗi nốt nhà nằm ở phím nào trên dây 6.',
      ],
      takeaway: 'Giọng nào cũng cùng hình: dời hộp 1 sao cho nhà của nó nằm đúng nốt nhà mới.',
      tryIt: 'Chọn một giọng trong bảng, rồi chơi hộp 1 ở giọng đó mà không nhìn màn hình.',
    },
    home: {
      title: 'Trưởng hay thứ? Cùng 5 nốt, chỉ khác nhà',
      body: [
        'A thứ pentatonic và C trưởng pentatonic dùng đúng cùng một bộ nốt. Khác nhau ở chỗ bạn coi nốt nào là nhà: nốt bạn bắt đầu, dừng lại và nhấn vào. Nhà trưởng nằm cao hơn nhà thứ 3 phím.',
        'Bật qua lại giữa hai giọng và để ý: không một chấm nào di chuyển. Chỉ có màu của nhà đổi chỗ.',
      ],
      takeaway: 'Nhà thứ + 3 phím = nhà trưởng, cùng một bộ nốt.',
      tryIt: 'Chơi hộp 1, kết câu ở nốt A, rồi kết câu ở nốt C. Nghe sắc thái thay đổi.',
    },
  },
  scene: {
    grid: {
      run: 'Phát từng cặp',
      stop: 'Dừng',
      idle: 'Mỗi đường nét đứt nối hai chỗ cùng cao độ. Bấm phát để nghe từng cặp.',
      pair: 'Dây {low}, phím {fret} = dây {high} buông',
      oddPair: 'Dây {low}, phím {fret} = dây {high} buông: cặp G→B, chỗ duy nhất cách 4 phím',
    },
    formula: {
      run: 'Phát công thức',
      stop: 'Dừng',
      example: 'Ví dụ trên dây 6, nhà ở phím 5 (nốt A)',
      home: 'nhà',
    },
    boxes: {
      box: 'Hộp',
      labels: 'Nhãn',
      degrees: 'Bậc',
      notes: 'Tên nốt',
      play: 'Phát hộp',
      stop: 'Dừng',
      caption: 'Hộp {n}: phím {min}–{max}',
    },
    keys: {
      finder: 'Nhà trên dây 6',
      cycle: 'Trượt qua các giọng',
      stop: 'Dừng',
      caption: '{key} thứ: nhà trên dây 6 ở phím {fret}',
      moved: '{key} thứ: nhà trên dây 6 ở phím {fret}; hình đã trượt {shift} phím',
    },
    home: {
      switch: 'Nhà',
      minor: 'A thứ',
      major: 'C trưởng',
      legendMinor: 'nhà thứ',
      legendMajor: 'nhà trưởng',
      legendOther: 'các nốt còn lại',
      caption: 'Nhà là {home}: trên dây 6 ở phím {fret}',
    },
  },
  notYetTitle: 'Những thứ chưa cần lúc này',
  notYetIntro: 'Không phải chúng vô ích. Chỉ là học chúng trước sẽ lấy hết sự tập trung khỏi việc chơi đàn.',
  notYet: [
    { title: 'Đọc khuông nhạc', why: 'Guitar điện sống bằng tab và hình. Khuông nhạc có thể học sau, nếu cần.' },
    { title: 'Thuộc tên mọi nốt', why: 'Chỉ cần biết nốt nhà trên dây 6. Hình sẽ lo đúng các nốt còn lại.' },
    { title: 'Hóa biểu', why: 'Trên guitar, đổi giọng là trượt tay, không phải đổi ký hiệu.' },
    { title: 'Vòng quãng năm', why: 'Có ích khi viết hòa âm. Không cần để solo trên một backing track.' },
    { title: 'Bảy điệu thức (modes)', why: 'Đến sau pentatonic, khi bạn đã nối được cả 5 hộp.' },
    { title: 'Cấu tạo hợp âm', why: 'Lúc này chỉ cần biết giọng của bài để đặt nhà cho đúng.' },
  ],
};
