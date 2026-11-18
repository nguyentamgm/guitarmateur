import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Khi nào hợp âm thay đổi?',
  summary: 'Lắng nghe thời điểm đổi hợp âm, học kiểu quạt có lượt lên và chơi tám bar ở giọng G.',
  goal: 'Sau buổi học này bạn có thể nghe được thời điểm đổi hợp âm, và quạt một kiểu quạt có lượt lên.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'Phách được nhóm thành các bar: đếm 1, 2, 3, 4.',
    'G, C và D là I, IV và V trong giọng G.',
    'Hợp âm đổi ở phách 1.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Trước khi gọi tên hợp âm, tai bạn cần nhận ra khi nào có sự đổi hợp âm.',
        'Bạn chưa cần biết đang là hợp âm nào. Hãy bấm nút mỗi khi bạn nghe thấy đổi hợp âm.',
        'Ở vòng đầu tiên này, mỗi hợp âm kéo dài hai bar.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Hợp âm thường đổi ở phách 1 và kéo dài một hoặc hai bar.',
        'Tay quạt của bạn vung xuống ở mỗi phách và vung lên giữa các phách, như con lắc đồng hồ, ngay cả khi không chạm vào dây đàn.',
        'Một kiểu quạt là việc chọn những lượt vung nào chạm vào dây đàn.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Đây là một kiểu quạt kinh điển: xuống ở các phách 1, 2, 3, rồi xuống-lên ở phách 4 (D-D-D-DU).',
        'Hai bar mỗi hợp âm. Giữ tay luôn chuyển động đều như con lắc đồng hồ trong lúc đổi hợp âm.',
        'Chơi I–I–IV–IV–V–V–I–I ở giọng G ở 70 BPM cùng ứng dụng.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Bây giờ một hợp âm có thể kéo dài một bar hoặc hai bar.',
        'Bắt kịp mọi lần đổi hợp âm; bấm thừa sẽ bị tính điểm trừ.',
      ],
    },
  },
  blocks: {
    slow: {
      intro: 'Bạn chưa cần biết đó là hợp âm nào, chỉ cần nhận ra khi nào đổi hợp âm. Ở đây mỗi hợp âm kéo dài hai bar.',
      ask: 'Bấm khi đổi hợp âm',
      result: 'Bạn đã bắt đúng {caught} / {total} lần đổi hợp âm. Số lần bấm thừa: {extra}.',
    },
    strum: {
      intro: 'Thử các kiểu quạt, sau đó tự tạo kiểu quạt của riêng bạn.',
    },
    pattern: {
      intro: 'Kiểu quạt là xuống ở 1, 2, 3, rồi xuống-lên ở 4. Hai bar mỗi hợp âm. Giữ tay luôn chuyển động khi đổi hợp âm.',
    },
    fast: {
      intro: 'Bây giờ hợp âm có thể kéo dài một bar hoặc hai bar. Bắt kịp mọi lần đổi hợp âm; bấm thừa sẽ bị tính điểm trừ.',
      ask: 'Bấm khi đổi hợp âm',
      result: 'Bạn đã bắt đúng {caught} / {total} lần đổi hợp âm. Số lần bấm thừa: {extra}.',
    },
  },
  check: [
    {
      question: 'Hợp âm thường đổi ở…',
      options: ['phách 1.', 'phách 2.', 'mọi phách như nhau.'],
      why: 'Trong hầu hết bài hát, việc đổi hợp âm diễn ra ở phách 1: phách đầu tiên và mạnh nhất của bar.',
    },
    {
      question: 'Giữa các phách, tay quạt…',
      options: [
        'vung lên, dù có chạm dây hay không.',
        'đứng yên.',
        'tì vào dây để tắt tiếng.',
      ],
      why: 'Tay quạt vung xuống ở mỗi phách và vung lên giữa các phách như con lắc đồng hồ, ngay cả khi không chạm vào dây đàn.',
    },
    {
      question: 'Để tìm các hợp âm của một bài hát, trước tiên hãy lắng nghe…',
      options: ['nốt cao nhất.', 'khi nào đổi hợp âm.', 'đàn bass.'],
      why: 'Trước khi gọi tên hợp âm, tai bạn trước hết phải nhận ra thời điểm đổi hợp âm.',
    },
  ],
  canDo: [
    'Tôi có thể bấm đúng mọi lần đổi hợp âm trong một vòng lặp tám bar.',
    'Tôi có thể quạt xuống, xuống, xuống, xuống-lên trong khi đổi hợp âm.',
  ],
};
