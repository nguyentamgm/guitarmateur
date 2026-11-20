import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Hợp âm ngoài giọng',
  summary: 'Nhận biết các hợp âm mượn ngoài giọng: nghe ba hợp âm khách phổ biến nhất (♭VII, iv, III7) và chơi các vòng lặp của chúng.',
  goal: 'Sau buổi học này bạn có thể nghe ra khi một bài hát dùng hợp âm ngoài giọng, và gọi tên ba hợp âm phổ biến nhất.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'Một giọng có các hợp âm riêng của nó (I, IV, V trưởng; vi thứ).',
    'V7 dẫn về I.',
    'Chữ viết thường = hợp âm thứ.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Hầu hết các bài hát chỉ dùng các hợp âm trong giọng, nhưng đôi khi có những điều bất ngờ.',
        'Lắng nghe bốn bar ở một giọng trưởng.',
        'Nghe xem bar nào chứa hợp âm không thuộc về giọng.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Bài hát mượn các hợp âm ngoài giọng để tạo thêm màu sắc và sự bất ngờ.',
        'Ba hợp âm khách xuất hiện nhiều nhất, đặt cạnh hợp âm mà chúng thay thế:',
        '♭VII (hợp âm trưởng thấp hơn I một cung: ở giọng G là F) mang âm hưởng rock; iv (hợp âm IV đổi thành thứ: Cm) nghe hoài niệm, thường đứng ngay sau IV; III7 (B7) là hợp âm dominant 7 hút về vi, tương tự như V7 hút về I.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Mỗi vòng hợp âm cho một hợp âm khách ở giọng G.',
        'Quạt theo mẫu D-D-D-DU và cảm nhận sắc thái riêng của từng hợp âm khách mang lại.',
        'Chú ý cách iv thường đi liền sau IV, và III7 resolve về vi.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Bốn bar; một bar có thể là hợp âm khách.',
        'Nếu một bar nghe như không thuộc về giọng này, hãy thử ba hợp âm khách.',
        'Điền số La Mã cho mỗi bar.',
      ],
    },
  },
  blocks: {
    odd: {
      intro: 'Bar nào chứa hợp âm không thuộc về giọng?',
      ask: 'Bar nào chứa hợp âm không thuộc về giọng?',
      answers: {
        '2': 'Bar 2',
        '3': 'Bar 3',
        '4': 'Bar 4',
      },
      right: 'Đúng: bar {answer}. Hợp âm khách là {detail}.',
      wrong: 'Đó là bar {answer}: {detail}. Hãy nghe lại vòng này, rồi nghe với hợp âm chuẩn của giọng.',
    },
    guests: {
      intro: 'Ba hợp âm khách được xếp cạnh hợp âm trong giọng mà chúng thay thế: V cạnh ♭VII, IV cạnh iv, vi cạnh III7.',
    },
    flat7: {
      intro: '♭VII: hợp âm trưởng thấp hơn I một cung: ở giọng G là F. Mang âm hưởng rock.',
    },
    minor4: {
      intro: 'iv: hợp âm IV chuyển thành thứ: Cm. Nghe hoài niệm, thường xuất hiện ngay sau IV.',
    },
    three7: {
      intro: 'III7: B7 là hợp âm dominant 7 hút về vi, tương tự như V7 hút về I.',
    },
    fill: {
      intro: 'Bốn bar; một bar có thể là hợp âm khách. Nếu nghe lạ, hãy thử ba hợp âm khách: ♭VII, iv hoặc III7.',
      ask: 'Chọn một số La Mã cho mỗi bar',
      allRight: 'Hoàn toàn chính xác: mọi hợp âm đều khớp!',
      someWrong: 'Hãy kiểm tra lại những bar có hợp âm ngoài giọng.',
    },
  },
  check: [
    {
      question: 'Ở giọng G trưởng, hợp âm ♭VII là hợp âm nào?',
      options: ['F', 'F♯', 'Em'],
      why: 'Thấp hơn G một cung là nốt F, vì vậy ♭VII ở giọng G trưởng là F trưởng.',
    },
    {
      question: 'Hợp âm iv khác với IV ở điểm nào?',
      options: ['Nó là hợp âm thứ thay vì trưởng.', 'Nó có thêm bậc 7.', 'Nó được bấm cao hơn một phím.'],
      why: 'iv lấy hợp âm IV trưởng của giọng và chuyển thành hợp âm thứ.',
    },
    {
      question: 'Hợp âm III7 thường tự nhiên dẫn về hợp âm nào?',
      options: ['vi', 'I', 'IV'],
      why: 'III7 là hợp âm dominant 7 hút lên một quãng 4 để dẫn vào vi, giống như V7 dẫn về I.',
    },
  ],
  canDo: [
    'Nghe ra bar nào chứa hợp âm ngoài giọng.',
    'Chơi ba vòng lặp.',
    'Gọi tên ♭VII, iv và III7 ở giọng G.',
  ],
};
