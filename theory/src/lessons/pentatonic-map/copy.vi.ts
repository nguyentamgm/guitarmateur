import type { PentatonicMapCopy } from './model';

export const vi: PentatonicMapCopy = {
  title: 'Bản đồ Pentatonic',
  summary: 'Năm shape phủ kín cần đàn. Học chúng như những khoảng cách, rồi dời sang giọng nào cũng được.',
  lead:
    'Bạn đã biết đếm phím và đọc quãng. Bài này biến chúng thành năm shape pentatonic mà phần lớn các đoạn solo rock và blues dựa vào, không cần khuông nhạc, key signature hay circle of fifths: năm ý, mỗi ý một hình bạn chơi được. Bấm vào nốt nào cũng nghe được.',
  steps: {
    grid: {
      title: 'Cần đàn là một cái lưới, không phải bảng tên nốt',
      body: [
        'Mỗi phím là nửa cung. Với các shape trong bài này, bạn chỉ cần đếm phím, chưa cần gọi tên nốt.',
        'Bấm phím 5 trên dây nào cũng ra đúng cao độ của dây mỏng hơn kế bên khi để buông. Chỉ có đúng một ngoại lệ: từ dây G sang dây B là phím 4. Ngoại lệ đó, G–B shift, là lý do mọi shape trên cần đàn dịch đi một phím khi sang dây B.',
      ],
      takeaway: 'Phím 5 bằng dây kế bên để buông, trừ cặp G sang B là phím 4.',
      tryIt: 'Bấm phím 5 dây A rồi gảy dây D buông. Sau đó so phím 4 dây G với dây B buông.',
    },
    formula: {
      title: 'Minor pentatonic là một công thức khoảng cách',
      body: [
        'Chọn một root, nốt nghe như về nhà. Từ đó đi lên 3 phím, rồi 2, 2, 3, 2 phím là về lại root, cao hơn một quãng 8. Toàn bộ scale chỉ có vậy.',
        'Các nhãn 1, ♭3, 4, 5, ♭7 dưới mỗi nốt là các bậc, tên của từng khoảng cách so với root. Chưa cần thuộc. Sau này chúng giúp bạn chọn chỗ dừng: 1 và 5 nghe vững, ♭3 nghe buồn.',
      ],
      takeaway: 'Minor pentatonic = root, +3, +2, +2, +3, +2 phím.',
      tryIt: 'Trên dây 6, bắt đầu ở phím 5 và chơi công thức lên tới phím 17, rồi đi ngược xuống.',
    },
    boxes: {
      title: 'Gấp công thức vào bàn tay: 2 nốt mỗi dây',
      body: [
        'Chơi dọc một dây thì tay phải chạy rất xa. Thay vào đó, gấp công thức qua 6 dây, mỗi dây đúng 2 nốt. Kết quả là một box gọn trong khoảng 4 phím.',
        'Đi tiếp công thức thì ra box kế tiếp. Năm box lát kín cần đàn như gạch, mỗi box chung một cạnh với box bên cạnh, và cả chuỗi lặp lại sau phím 12.',
      ],
      takeaway: 'Hai nốt mỗi dây biến công thức thành năm box lát kín cần đàn.',
      tryIt: 'Thuộc box 1 trước. Sau đó chỉ tập riêng cạnh chung giữa box 1 và box 2.',
    },
    keys: {
      title: 'Đổi giọng là trượt nguyên shape',
      body: [
        'Shape không bao giờ đổi. Thứ duy nhất dời đi là chỗ của root trên dây 6. Muốn chơi C thứ? Tìm C trên dây 6 (phím 8) và đặt box 1 vào đó.',
        'Bảng tìm root bên dưới là thứ duy nhất trong bài đáng học thuộc: mỗi root nằm ở phím nào trên dây 6.',
      ],
      takeaway: 'Giọng nào cũng cùng shape: dời box 1 để nó bắt đầu từ root mới.',
      tryIt: 'Chọn một giọng trong bảng, rồi chơi box 1 ở giọng đó mà không nhìn màn hình.',
    },
    home: {
      title: 'Trưởng hay thứ? Cùng 5 nốt, chỉ khác root',
      body: [
        'A minor pentatonic và C major pentatonic dùng đúng cùng một bộ nốt. Khác nhau ở chỗ bạn coi nốt nào là nhà, tức root: nốt bạn bắt đầu, dừng lại và nhấn vào. Root trưởng nằm cao hơn root thứ 3 phím. Hai giọng như vậy gọi là relative: A thứ là relative minor của C trưởng.',
        'Bật qua lại giữa hai giọng và để ý: không một chấm nào di chuyển. Chỉ có root được tô màu đổi chỗ.',
      ],
      takeaway: 'Root thứ + 3 phím = root trưởng, cùng một bộ nốt.',
      tryIt: 'Chơi box 1, kết câu ở nốt A, rồi kết câu ở nốt C. Nghe sắc thái thay đổi.',
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
      example: 'Ví dụ trên dây 6, root ở phím 5 (nốt A)',
      home: 'root',
    },
    boxes: {
      box: 'Box',
      labels: 'Nhãn',
      degrees: 'Bậc',
      notes: 'Tên nốt',
      play: 'Phát box',
      stop: 'Dừng',
      caption: 'Box {n}: phím {min}–{max}',
    },
    keys: {
      finder: 'Root trên dây 6',
      cycle: 'Trượt qua các giọng',
      stop: 'Dừng',
      caption: '{key} thứ: root trên dây 6 ở phím {fret}',
      moved: '{key} thứ: root trên dây 6 ở phím {fret}; shape đã trượt {shift} phím',
    },
    home: {
      switch: 'Root',
      minor: 'A thứ',
      major: 'C trưởng',
      legendMinor: 'root thứ',
      legendMajor: 'root trưởng',
      legendOther: 'các nốt còn lại',
      caption: 'Root là {home}: trên dây 6 ở phím {fret}',
    },
  },
  notYetTitle: 'Chưa cần học lúc này',
  notYetIntro: 'Không phải chúng vô ích. Chỉ là học chúng trước sẽ lấy hết sự tập trung khỏi việc chơi đàn.',
  notYet: [
    { title: 'Đọc khuông nhạc', why: 'Guitar điện sống bằng tab và shape. Khuông nhạc có thể học sau, nếu cần.' },
    { title: 'Thuộc tên mọi nốt', why: 'Chỉ cần biết root trên dây 6. Shape sẽ lo đúng các nốt còn lại.' },
    { title: 'Key signature', why: 'Trên guitar, đổi giọng là trượt tay, không phải đổi ký hiệu.' },
    { title: 'Circle of fifths', why: 'Có ích khi viết hòa âm. Không cần để solo trên một backing track.' },
    { title: '7 mode', why: 'Đến sau pentatonic, khi bạn đã nối được cả 5 box.' },
    { title: 'Cấu tạo hợp âm', why: 'Lúc này chỉ cần biết giọng của bài để đặt root cho đúng.' },
  ],
};
