import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Root: nốt nghe như về nhà',
  summary: 'Nghe khi nào bài hát đã về nhà, ngân nga root của nó và tìm nốt đó trên dây 6.',
  goal: 'Sau buổi học này bạn có thể nghe khi nào bài hát đã về nhà, ngân nga root của nó và tìm nốt đó trên dây to nhất.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'Hợp âm trưởng nghe tươi sáng và hợp âm thứ nghe trầm buồn.',
    'Âm nhạc có phách đều đặn, và bạn đếm nó 1 2 3 4.',
    'Bạn có thể quạt một hợp âm một lần trên mỗi phách.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Có những đoạn kết nghe trọn vẹn, như dấu chấm ở cuối câu.',
        'Có những đoạn kết khác nghe như một câu hỏi: âm nhạc còn muốn đi tiếp.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Mỗi bài hát có một nốt mà ở đó nó nghỉ lại và nghe như về nhà. Nốt đó là root.',
        'Tập hợp các nốt và hợp âm quanh root đó là giọng của bài hát. Khi nói "bài này ở giọng G", G là root.',
        'Lên một phím là nốt kế tiếp: cao hơn nửa cung.',
        'Trên dây to nhất, các nốt lần lượt là E (dây buông), F (phím 1), G (phím 3), A (phím 5), B (phím 7), C (phím 8) và D (phím 10). Hình vẽ ghi tên từng nốt.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Ứng dụng quạt hợp âm G. Hãy ngân nga theo và trượt giọng lên xuống cho đến khi một nốt nghe như được nghỉ ngơi. Nốt đó là G.',
        'Bây giờ hãy tìm nó trên dây 6, phím 3, và gảy nó ở mỗi phách 1.',
        'Bạn chưa cần hình hợp âm G: nó sẽ có ở buổi học 5.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Ứng dụng chơi bốn hợp âm ở một giọng nào đó. Hãy ngân nga nốt nghe như về nhà.',
        'Dò tìm nốt đó trên dây 6, từng phím một, rồi xem đáp án.',
      ],
    },
  },
  blocks: {
    finished: {
      intro: 'Nghe bốn hợp âm. Âm nhạc có dừng lại ở nhà không?',
      ask: 'Đã kết thúc, hay chưa?',
      answers: { finished: 'Đã kết thúc', notFinished: 'Chưa kết thúc' },
      right: 'Đúng: {answer}.',
      wrong: 'Đó là {answer}. Một câu nhạc chỉ kết thúc khi hợp âm cuối là hợp âm mà âm nhạc muốn nghỉ lại: {detail}. Hãy nghe lại bốn hợp âm, giờ có thêm {detail} ở cuối.',
    },
    semitones: {
      intro: 'Mỗi phím làm nốt cao thêm nửa cung.',
    },
    home: {
      intro: 'Hãy làm bài trắc nghiệm này cho đến khi bạn tìm được G, A, C và D mà không cần đếm.',
    },
    hum: {
      intro: 'Ngân nga theo hợp âm G cho đến khi một nốt nghe như được nghỉ ngơi. Rồi gảy G ở dây 6, phím 3, trên mỗi phách 1.',
    },
    root: {
      intro: 'Nghe bốn hợp âm, ngân nga nốt nghe như về nhà, rồi dò tìm nó trên dây 6.',
      ask: 'Tìm root trên dây to nhất của bạn.',
      answer: 'Root là {detail}: phím {answer} trên dây 6.',
    },
  },
  check: [
    {
      question: 'Root của một bài hát là…',
      options: ['nốt đầu tiên của bài hát.', 'nốt mà bài hát nghỉ lại.', 'nốt cao nhất của bài hát.'],
      why: 'Root là nốt mà bài hát nghỉ lại: nó nghe như về nhà.',
    },
    {
      question: 'Lên một phím trên cùng một dây là…',
      options: ['cao hơn nửa cung.', 'cao hơn hai nửa cung.', 'vẫn là nốt đó.'],
      why: 'Mỗi phím là nửa cung, nên lên một phím là cao hơn nửa cung.',
    },
    {
      question: 'Một bài ở giọng A có root trên dây 6 ở phím…',
      options: ['0', '3', '5'],
      why: 'Trên dây 6, A ở phím 5: E (dây buông), F (1), G (3), A (5).',
    },
  ],
  canDo: [
    'Tôi có thể nghe một câu nhạc đã kết thúc hay chưa.',
    'Tôi có thể ngân nga root của một chuỗi hợp âm.',
    'Tôi có thể tìm nốt đó trên dây 6.',
  ],
};
