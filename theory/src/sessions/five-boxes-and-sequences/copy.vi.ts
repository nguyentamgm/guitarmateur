import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Nối các box pentatonic',
  summary: 'Dùng một nốt chung để chuyển giữa box 1 và box 2, rồi tập chơi các nốt theo nhóm.',
  goal: 'Chuyển từ box 1 sang box 2 rồi quay lại đúng nhịp, và nghe câu chạy thay đổi khi đổi thứ tự các nốt.',
  needs: 'Một cây guitar lên dây chuẩn. Khoảng 15–20 phút.',
  recap: [
    'Box 1 của A minor pentatonic bắt đầu ở phím 5 trên dây 6.',
    'Nốt A ở cùng phím trên dây 1 cao hơn hai quãng 8.',
  ],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Nghe vài nốt đầu rồi để ý câu chạy đi tiếp thế nào. Khi chạy thẳng, cao độ cứ đi lên từng nốt trong scale. Với bộ ba, bạn nghe ba nốt liền nhau rồi nhóm sau bắt đầu thấp hơn một chút. Khi chơi cách một, mỗi cặp bỏ qua một nốt trong scale.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Trên dây 1, chơi A–C–D ở phím 5–8–10, rồi qua C về lại A. Phím 5 thuộc box 1, còn phím 10 thuộc box 2. C ở phím 8 nằm trong cả hai box, nên bạn có thể dời tay ở nốt C cả lúc đi lẫn lúc về.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Trong một sequence, mỗi nhóm theo cùng một mẫu và bắt đầu ở nốt kế tiếp trong scale. Chơi A–C–D, rồi C–D–E với tốc độ đều. Nhóm thứ hai bắt đầu ở C, ngay sau A trong scale. Hát nốt C trước khi chơi nhóm thứ hai, rồi thử hát nốt đầu của nhóm thứ ba.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Đếm bốn phách chậm và đều. Trên dây 1, chơi A–C–D ở phách 1, 2, 3 và nghỉ ở phách 4. Giữ nguyên nhịp, chơi D–C–A ở ba phách tiếp theo rồi nghỉ. Nghe xem các nốt có cách đều nhau khi bạn đổi vị trí tay qua nốt C ở cả hai lượt không.',
      ],
    },
  },
  blocks: {
    phrase: {
      intro:
        'Thử ngân nga ba nốt đầu khi nghe. Khi nghe lại, để ý chỗ câu chạy nhảy qua một nốt hoặc quay xuống lần đầu.',
      ask: 'Bạn vừa nghe kiểu chạy nào?',
      answers: { straight: 'Chạy thẳng', threes: 'Bộ ba', skips: 'Cách một' },
      right: 'Đúng. {answer} trong {detail} minor pentatonic.',
      wrong:
        'Kiểu vừa nghe là {answer} trong {detail} minor pentatonic. Nghe lại đúng các nốt đó ở tempo chậm hơn.',
    },
    join: {
      intro:
        'Chọn 1→2 rồi bấm lần lượt phím 5, 8 và 10 trên dây 1. Vòng tròn ở phím 8 đánh dấu nốt C chung. Năm dây còn lại cũng có một nốt được khoanh trên mỗi dây.',
    },
    map: {
      intro:
        'Khi đã chuyển được giữa hai box, chọn lần lượt từ box 1 đến box 5. Mỗi box bắt đầu ở nốt kế tiếp của scale trên dây 6 và có hai nốt trên mỗi dây. Năm box phủ kín cần đàn và lặp lại ở quãng 8 cao hơn.',
    },
    patterns: {
      intro:
        'Chọn box 1, Bộ 3 và Lên. Bấm Bắt đầu và nhìn sáu nốt đầu trên tab. Trên đàn, bắt đầu ở phím 5 rồi phím 8 dây 6, sau đó sang phím 5 dây 5. Phát lại với Bộ 4 rồi với Cách một. Nghe A–C–D–E ở bộ 4, còn với Cách một, nghe A–D rồi C–E.',
    },
    cross: {
      intro:
        'Thử chơi lick trên đàn trước. Sau đó chọn 1→2 và bấm các phím trên dây 1 theo cả hai chiều để so lại cao độ. Nốt C được khoanh là chỗ dời tay ở cả hai lượt.',
    },
  },
  check: [
    {
      question: 'Trên dây 1, nốt nào nằm trong cả box 1 và box 2?',
      options: ['A ở phím 5', 'C ở phím 8', 'D ở phím 10'],
      why: 'Cùng một nốt C ở phím 8 nằm trong cả hai box. Dùng nốt đó để dời tay theo cả hai chiều.',
    },
    {
      question: 'Khi chơi sequence bộ ba, sau A–C–D là nhóm nào?',
      options: ['Lặp lại A–C–D', 'D–E–G', 'C–D–E'],
      why: 'Nhóm tiếp theo bắt đầu ở C, nốt liền sau A trong scale.',
    },
    {
      question: 'Hai box pentatonic kề nhau có bao nhiêu nốt chung?',
      options: ['Sáu', 'Hai', 'Mười hai'],
      why: 'Mỗi dây có một nốt ở cùng phím trong cả hai box. Đàn có sáu dây.',
    },
  ],
  canDo: [
    'Tôi chơi được A–C–D từ box 1 sang box 2 rồi chơi D–C–A từ box 2 về box 1, giữ đều phách qua cả hai lần dời tay.',
    'Tôi chơi được hai nhóm đầu của sequence bộ ba trong box 1 và hát được nốt mở đầu nhóm thứ hai.',
  ],
};
