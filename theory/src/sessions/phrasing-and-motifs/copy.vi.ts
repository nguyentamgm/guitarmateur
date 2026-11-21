import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Xây câu nhạc với motif',
  summary: 'Lặp một ý ngắn, đổi nốt đáp khi hợp âm đổi và chừa chỗ cho câu nhạc.',
  goal: 'Hát và chơi một motif ba nốt, đổi một nốt kết và giữ nhịp qua một bar nghỉ.',
  needs: 'Một cây guitar lên dây chuẩn. Khoảng 15–20 phút.',
  recap: ['Nốt của hợp âm cho lick một chỗ đáp.', 'Vẫn đếm qua dấu lặng để biết lúc nào vào lại.'],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Mỗi ví dụ dài ba bar. Nghe xem có ý nào bạn hát lại được không. Ý đó có trở lại với cùng tiết tấu rồi đổi nốt kết, hay các nốt móc đơn cứ chạy liên tục?',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Motif là một ý nhạc ngắn mà tai nhận ra khi nó trở lại. Bạn có thể giữ các nốt đầu và tiết tấu, đổi nốt cuối cho hợp với hợp âm mới rồi chừa chỗ sau câu.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Trên Am, chơi A–C–E ở phách 1, 2 và 3 rồi nghỉ. Lặp đúng ý đó với cùng tiết tấu trên G. Khi tới F, giữ A và C rồi đổi E thành F. Để trống bar thứ tư và đếm để vào lại Am.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Nghe ví dụ rồi hát và chơi lại trên đàn. Quay lại backing phía trên và chơi đủ bốn bar. Lượt sau, hát lại ý ban đầu và nghe chỗ đổi đúng một nốt kết. Dùng bài luyện tai để thử thêm một ý ngắn khác.',
      ],
    },
  },
  blocks: {
    idea: {
      intro: 'Gõ chân qua đủ ba bar. Để ý chỗ trống sau hai câu đầu.',
      ask: 'Bạn nghe một motif hay một câu chạy liền?',
      answers: { motif: 'Motif có nốt kết mới', noodling: 'Câu chạy liền' },
      right: 'Đúng. Bạn nghe {answer} ở giọng {detail} thứ.',
      wrong:
        'Bạn nghe {answer} ở giọng {detail} thứ. Khi nghe lại, để ý bar thứ hai và nốt đáp cuối.',
    },
    phrase: {
      intro:
        'Chọn Rock i–VII–VI–VII rồi phát backing. Theo dõi ý đầu, lần lặp và nốt kết mới trên tab. Bar thứ tư để bạn đáp lại.',
    },
    rock: {
      intro:
        'Bấm A và C ở phím 5 và 8 dây 6. E ở phím 7 dây 5. Tiến thêm một phím trên dây 5 để tới F, root của hợp âm thứ ba.',
    },
    model: {
      intro: 'Gõ chân theo A–C–E. Phách 4 để trống. Giữ nguyên tiết tấu khi đổi nốt kết.',
      label: 'Tab của motif A–C–E',
      play: 'Nghe motif',
    },
    ear: {
      intro:
        'Chọn một bar và bật trợ giúp cho sẵn nốt đầu. Nghe ý nhạc rồi tìm trên đàn, sau đó bấm từng nốt theo thứ tự trên sơ đồ.',
    },
  },
  check: [
    {
      question: 'Làm sao để tai vẫn nhận ra motif sau khi đổi nốt kết?',
      options: ['Đổi tiết tấu của từng nốt', 'Giữ các nốt đầu và tiết tấu', 'Kéo dài mọi nốt'],
      why: 'Phần mở đầu lặp lại giúp tai nhận ra ý nhạc trước khi nốt kết thay đổi.',
    },
    {
      question: 'Nốt kết nào đáp vào root khi hợp âm thứ ba là F?',
      options: ['E', 'G', 'F'],
      why: 'F cao hơn E một phím trên dây 5 và là root của hợp âm mới.',
    },
    {
      question: 'Làm sao để giữ đúng chỗ qua bar thứ tư?',
      options: [
        'Đếm đủ bốn phách qua chỗ nghỉ',
        'Vào lại đầu vòng ngay khi nốt cuối tắt',
        'Gảy vào mỗi phách',
      ],
      why: 'Backing vẫn có bốn phách trong bar đó. Đếm đủ để vào lại đúng lúc.',
    },
  ],
  canDo: [
    'Tôi hát và lặp lại được một ý ngắn mà vẫn giữ phách.',
    'Tôi đổi được nốt kết khi F vang lên và đếm qua bar thứ tư để trống.',
  ],
};
