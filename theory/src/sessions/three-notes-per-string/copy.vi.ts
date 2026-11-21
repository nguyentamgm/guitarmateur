import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Ba nốt mỗi dây',
  summary:
    'Thêm passing note vào một lick quen thuộc rồi chuyển dây đúng nhịp trong scale đủ bảy nốt.',
  goal: 'Chơi một lick có thêm nốt mới và chuyển dây đúng phách trong thế 1.',
  needs: 'Một cây guitar lên dây chuẩn. Khoảng 15–20 phút.',
  recap: [
    'A minor pentatonic có A, C, D, E và G.',
    'Passing note giúp câu nhạc đi từ nốt này sang nốt khác.',
  ],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Gõ chân theo click. Cả hai câu chạy bắt đầu bằng cùng các nốt. Nghe xem có bao nhiêu nốt giữa hai tiếng click. Trên đàn, chơi lick A–C–E quen thuộc rồi thêm B vào giữa A và C. Nghe B dẫn vào C.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'A natural minor scale thêm B (2) và F (♭6) vào A minor pentatonic. Scale bảy nốt tạo ra bảy thế khi mỗi dây nhận ba nốt liên tiếp. Ba nốt mỗi dây cho tay bấm biết vị trí. Triplet cho hai tay biết khi nào chơi ba nốt cách đều trong một phách.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Đếm “1 trip-let, 2 trip-let”. Với câu chạy G trưởng, chơi ba nốt trên dây 6 rồi sang dây 5 vào tiếng click kế tiếp. Lặp ở tốc độ bạn giữ đều được. Sau đó tìm thế 1 của A natural minor scale và chơi A–B–C–E trong thế đó.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Giữ backing giọng A thứ chạy. Trong thế 1, chơi A–C–E trên Am rồi thử A–B–C–E khi Am quay lại. Dùng phím 5, 7, 8 dây 6 và phím 7 dây 5. Sau đó thử E–F–G. Chơi E và F ở phím 7 và 8 dây 5 rồi đáp vào G ở phím 5 dây 4.',
      ],
    },
  },
  blocks: {
    pulse: {
      intro: 'Nghe tiếng click nhấn ở phách 1. Hai kiểu chạy giữ cùng tempo và bắt đầu cùng nốt.',
      ask: 'Mỗi phách có bao nhiêu nốt cách đều nhau?',
      answers: { eighths: 'Hai nốt móc đơn', triplets: 'Ba nốt triplet' },
      right: 'Đúng. {answer} mỗi phách.',
      wrong:
        'Bạn nghe {answer} mỗi phách. Nghe cách chia phách kia ở cùng tempo, rồi nghe lại câu ban đầu.',
    },
    passing: {
      intro:
        'Phát backing Am. Ví dụ chơi A–C–E ở bar 1 và A–B–C–E ở bar 2 trên cùng hợp âm. Thử cả hai trên đàn ở hai bar kế tiếp.',
    },
    spelling: {
      intro:
        'Chọn F trưởng và tìm B♭. Key signature cho B một dấu giáng và mỗi chữ cái chỉ xuất hiện một lần trong scale.',
    },
    strings: {
      intro:
        'Trong thế 1 của G trưởng, tìm G–A–B trên dây 6 rồi C–D–E trên dây 5. Bấm sáu nốt và để ý chỗ chuyển dây.',
    },
    tile: {
      intro:
        'Chọn các thế kề nhau và xem những nốt chung. Theo các số thế dọc cần đàn cho tới khi hình lặp lại.',
    },
    triplets: {
      intro:
        'Chọn thế 1, Thẳng và Lên. Bắt đầu chậm. Mỗi click mở đầu một nhóm ba nốt. Tập chuyển dây đúng tiếng click kế tiếp trước khi tăng tempo.',
    },
    keys: {
      intro:
        'Chọn C trưởng, chuyển sang A thứ rồi chọn thế 1. C major scale và A natural minor scale dùng cùng các nốt với root khác nhau. Tìm A–B–C trên dây 6 và E trên dây 5.',
    },
    rock: {
      intro:
        'Dùng sơ đồ để so lại chỗ chuyển dây. Ghé qua B hoặc F thật ngắn trước khi sang nốt tiếp theo và nghe xem nốt thêm vào làm lick đổi thế nào.',
    },
  },
  check: [
    {
      question: 'Nốt nào dẫn từ A tới C trong A natural minor scale?',
      options: ['B', 'B♭', 'C♯'],
      why: 'B là bậc 2, nằm giữa A và C.',
    },
    {
      question: 'Triplet mô tả điều gì?',
      options: [
        'Số phím trong một shape',
        'Số dây cần chuyển qua',
        'Ba nốt cách đều trong một phách',
      ],
      why: 'Triplet nói về thời điểm gảy. Ba nốt mỗi dây nói về cách đặt ngón.',
    },
    {
      question: 'Bắt đầu từ mỗi bậc của scale đủ nốt sẽ được mấy thế?',
      options: ['Năm', 'Bảy', 'Mười hai'],
      why: 'Mỗi bậc trong bảy bậc có thể làm nốt đầu của một thế trên dây 6.',
    },
  ],
  canDo: [
    'Tôi thêm được B hoặc F làm passing note và nghe ra câu nhạc thay đổi.',
    'Tôi chơi được ba nốt đều nhau rồi sang dây kế tiếp đúng tiếng click.',
  ],
};
