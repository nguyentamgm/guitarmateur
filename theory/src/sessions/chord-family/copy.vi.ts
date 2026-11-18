import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Ba hợp âm thuộc về nhau',
  summary: 'Làm quen với ba hợp âm chính của một giọng, gọi chúng là I, IV, V và chơi vòng hợp âm đầu tiên ở giọng G.',
  goal: 'Sau buổi học này bạn có thể bấm G, C và D, và biết chúng là I, IV và V của giọng G.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'Một bài hát ở giọng G nghỉ lại ở nốt G: nốt đó là root của nó.',
    'Một major scale có bảy nốt được đánh số từ 1 đến 7.',
    'Quạt trên mỗi phách và chuyển hợp âm ở phách 1.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Một bài hát hiếm khi dùng nhiều hợp âm. Phần lớn bài hát đơn giản chỉ được dựng từ hai hoặc ba hợp âm.',
        'Hãy nghe bốn bar. Bạn có nhận ra có bao nhiêu hợp âm khác nhau được chơi không?',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Xây dựng một hợp âm trên mỗi nốt của scale và bạn có các hợp âm của giọng.',
        'Ba hợp âm trên bậc 1, 4 và 5 là hợp âm trưởng, và đó là những hợp âm bài hát dùng nhiều nhất.',
        'Người chơi đàn viết chúng bằng số La Mã: I, IV, V. Trong giọng G: I = G, IV = C, V = D.',
        'Một hàng các hợp âm là một vòng hợp âm.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Đây là ba shape cần học: G, C và D.',
        'Học G và C trước, sau đó đến D. Mẹo: tập chuyển từ G sang C thật chậm mà không cần quạt trước khi bật vòng lặp.',
        'Sau đó chơi vòng hợp âm I–IV–V–I ở 70 BPM cùng ứng dụng.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Vẫn vòng lặp đó, nhưng bảng chỉ hiện số La Mã.',
        'Hãy nói to số bậc thành tiếng khi bạn chuyển hợp âm: một, bốn, năm, một.',
      ],
    },
  },
  blocks: {
    count: {
      intro: 'Một bài hát hiếm khi dùng nhiều hợp âm. Hãy nghe bốn bar.',
      ask: 'Bạn nghe thấy bao nhiêu hợp âm khác nhau?',
      answers: { two: 'Hai', three: 'Ba' },
      right: 'Đúng: {answer}. Các hợp âm là {detail}.',
      wrong: 'Đó là {answer}: {detail}. Hãy nghe lại bốn bar, được chơi chậm hơn.',
    },
    family: {
      intro: 'Bấm các hợp âm 1, 4 và 5 của G. Tạm bỏ qua các hợp âm còn lại: buổi học 10 sẽ quay lại với chúng.',
    },
    shapes: {
      intro: 'Học G và C trước, sau đó đến D. Bấm vào hợp âm bất kỳ để nghe thử.',
    },
    loop: {
      intro: 'Chơi I–IV–V–I ở 70 BPM cùng ứng dụng. Chuyển hợp âm ở phách 1 của mỗi bar.',
    },
    numbers: {
      intro: 'Vẫn vòng lặp đó ở 80 BPM, nhưng bảng chỉ hiện số bậc. Hãy đọc to từng số khi bạn chuyển hợp âm.',
    },
  },
  check: [
    {
      question: 'Trong giọng G, hợp âm IV là…',
      options: ['D', 'C', 'Am'],
      why: 'Đếm lên bốn bậc của scale G major (G, A, B, C) cho ra C: hợp âm IV của giọng G.',
    },
    {
      question: 'Số La Mã gọi tên một hợp âm theo…',
      options: ['vị trí của nó trong giọng.', 'số dây đàn mà nó sử dụng.', 'tempo tính theo BPM.'],
      why: 'Số La Mã cho biết hợp âm được dựng trên bậc mấy của giọng: I là bậc 1, IV là bậc 4, và V là bậc 5.',
    },
    {
      question: 'Trong một giọng trưởng, ba hợp âm nào là hợp âm trưởng?',
      options: ['ii, iii, vi', 'I, ii, iii', 'I, IV, V'],
      why: 'Trong mọi giọng trưởng, các hợp âm trên bậc 1, 4 và 5 (I, IV và V) luôn là hợp âm trưởng.',
    },
  ],
  canDo: [
    'Tôi có thể bấm G, C và D.',
    'Tôi có thể chơi I–IV–V–I ở giọng G mà không bị ngắt quãng.',
    'Tôi có thể gọi tên G, C, D là I, IV, V.',
  ],
};
