import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'I, IV hay V?',
  summary: 'Phân biệt IV và V bằng tai, lắng nghe cách V kéo về I, và ghi lại vòng hợp âm bốn bar bằng tai.',
  goal: 'Sau buổi học này bạn có thể nghe được một hợp âm là I, IV hay V, và ghi lại một vòng hợp âm bốn bar bằng tai.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'I, IV, V là các hợp âm trên bậc 1, 4, 5 (G, C, D trong giọng G).',
    'Hợp âm I là nơi âm nhạc nghỉ ngơi (cảm giác "kết bài" của buổi học 3).',
    'Hợp âm đổi ở phách 1.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Mỗi hợp âm trong một giọng đều có một nhiệm vụ riêng.',
        'Hợp âm V kéo về I: nó tạo sức căng và muốn quay về nhà.',
        'Hợp âm IV đi xa khỏi I và có thể ở lại đó.',
        'Lắng nghe ba hợp âm: I, rồi IV hoặc V, rồi I. Bạn có nghe ra hợp âm ở giữa là IV hay V không?',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Hợp âm I là nhà, V kéo về nhà, và IV đi ra xa.',
        'Vì các con số miêu tả những nhiệm vụ này, các con số giống nhau sẽ áp dụng được trong mọi giọng.',
        'Học một vòng hợp âm dưới dạng số La Mã giúp bạn có thể chuyển sang bất kỳ giọng nào: các con số vẫn giữ nguyên.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Hai vòng lặp để chơi. Trong vòng đầu tiên (I–IV–I–V), bar 4 (V) kéo bạn quay trở lại bar 1.',
        'Trong vòng thứ hai (I–V–IV–I), IV đi sau V và sức kéo nhẹ nhàng hơn.',
        'Quạt theo kiểu D-D-D-DU ở 80 BPM. Hãy đọc to từng số khi bạn chuyển hợp âm.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Bốn bar, và bar đầu tiên luôn là I.',
        'Lắng nghe vòng hợp âm, chọn một số bậc cho mỗi bar, bấm vào chip để nghe hợp âm đó, rồi kiểm tra.',
        'Hãy nhắm tới mục tiêu làm đúng ba vòng liên tiếp.',
      ],
    },
  },
  blocks: {
    which: {
      intro: 'Mỗi hợp âm có một nhiệm vụ. V kéo về I, còn IV đi ra xa. Lắng nghe ba hợp âm: I, rồi hợp âm bí ẩn, rồi I.',
      ask: 'Hợp âm ở giữa là IV hay V?',
      answers: {
        IV: 'IV',
        V: 'V',
      },
      right: 'Đúng: {answer}. Các hợp âm là {detail}.',
      wrong: 'Đó là {answer}: {detail}. Hãy nghe cả hai phiên bản để so sánh.',
    },
    numbers: {
      intro: 'Chơi I–V–vi–IV… chọn vòng hợp âm I–IV–V và chuyển sang giọng khác: các con số vẫn giữ nguyên.',
    },
    a: {
      intro: 'Bar 4 (V) kéo bạn quay lại bar 1 (I). Chơi theo kiểu quạt D-D-D-DU ở 80 BPM.',
    },
    b: {
      intro: 'Ở đây IV đi sau V và sức kéo dịu hơn. Hãy đọc to các con số khi bạn chơi đàn.',
    },
    fill: {
      intro: 'Bốn bar, bar đầu tiên luôn là I. Lắng nghe, chọn số bậc cho mỗi bar, bấm vào chip để nghe thử, rồi kiểm tra. Hãy hướng tới ba vòng đúng liên tiếp.',
      ask: 'Chọn hợp âm cho mỗi bar',
      allRight: 'Cả bốn bar đều đúng!',
      someWrong: 'Một số bar chưa đúng. Bấm Nghe lại để so sánh.',
    },
  },
  check: [
    {
      question: 'Hợp âm nào kéo mạnh nhất về I?',
      options: ['V', 'IV', 'ii'],
      why: 'Hợp âm V tạo sức kéo mạnh nhất về nhà I: trong giọng G, D kéo thẳng về G.',
    },
    {
      question: 'Một vòng hợp âm kết thúc ở V: nghe có cảm giác…',
      options: ['đã kết bài.', 'chưa kết bài.', 'bị lệch tông.'],
      why: 'Vì V kéo mạnh về I, kết thúc ở V để lại cảm giác lơ lửng và chờ đợi được giải toả về I.',
    },
    {
      question: 'I–IV–V trong giọng D là…',
      options: ['D, G, A', 'D, E, A', 'G, C, D'],
      why: 'Trong giọng D major, bậc 1 là D (I), bậc 4 là G (IV), và bậc 5 là A (V).',
    },
  ],
  canDo: [
    'Tôi có thể phân biệt IV và V sau hợp âm I bằng tai.',
    'Tôi có thể điền đúng vòng hợp âm bốn bar gồm I, IV, V bằng tai.',
    'Tôi có thể chơi I–IV–I–V và I–V–IV–I ở giọng G.',
  ],
};
