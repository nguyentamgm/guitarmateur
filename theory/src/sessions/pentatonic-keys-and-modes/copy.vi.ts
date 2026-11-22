import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Giọng và mode',
  summary: 'Dời box 1 sang mọi giọng và chơi major hoặc minor pentatonic.',
  goal: 'Dùng box 1 cho giọng trưởng và giọng thứ bằng tai, và đổi giọng trên dây 6.',
  needs: 'Một cây đàn đã lên dây và một miếng gảy. Khoảng 15–20 phút.',
  recap: [
    'Box 1 bắt đầu trên dây 6 ở root cho giọng thứ, hoặc lùi 3 phím dưới root cho giọng trưởng.',
    'Relative major và minor dùng chung đúng năm nốt.',
  ],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Nghe hợp âm trưởng rồi nghe câu pentatonic theo sau. Câu minor pentatonic nghe hơi căng (harmonic tension), đậm chất blues, còn câu major pentatonic nghe sáng hơn.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Box 1 là một hình bấm. Trên dây 6, đặt ngón trỏ ở phím 5 (A) để chơi A minor pentatonic. Trượt cả hình lên hai phím, đến phím 7 (B), bạn sẽ chơi được cùng câu đó ở B minor. Mọi nốt đều cao lên hai phím.',
        'Quay lại box ở phím 5. Năm nốt A, C, D, E, G thuộc cả A minor pentatonic và C major pentatonic. Trên nền Am, thử kết câu ở A. Trên nền C trưởng, thử kết ở C. A là root khi chơi trên Am, còn C là root khi chơi trên C trưởng. Lắng nghe cảm giác trọn câu khi kết ở root.',
        'Giờ giữ A làm root. Để chơi A major pentatonic, lùi cả box từ phím 5 về phím 2 (F♯). Box bắt đầu ở F♯, còn A vẫn ở phím 5 trên dây 6. Thử chơi một câu trong box mới rồi kết ở A.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'So sánh 1 · Cùng nốt, khác root: Chơi cùng năm nốt (A, C, D, E, G) trên nền C major và Am. Kết câu ở nốt C khi chơi trên C major, rồi kết ở nốt A khi chơi trên Am. Lắng nghe nốt root mới định hình lại toàn bộ câu.',
        'So sánh 2 · Cùng root, khác mode: Giữ nguyên root là A và so sánh A major pentatonic với A minor pentatonic. Cảm nhận bậc 3 đổi màu câu solo từ sáng ngọt ngào sang tối gai góc kiểu blues.',
        'Solo trên backing rock ở giọng E minor, rồi chuyển sang backing quạt chả ở giọng G major. Trượt đổi giọng trên cần đàn.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Tìm vị trí bắt đầu của box 1 trên dây 6 cho bài giọng thứ, giọng trưởng và blues. Chú ý bước lùi 3 phím ở giọng trưởng.',
      ],
    },
  },
  blocks: {
    mode: {
      intro:
        'Nghe hợp âm rồi nghe câu năm nốt theo sau. Để nhận ra minor pentatonic, hãy lắng nghe bậc ♭3: trên nền hợp âm trưởng, nốt này nghe hơi căng.',
      ask: 'Bạn vừa nghe pentatonic nào?',
      answers: { minorPenta: 'Minor pentatonic', majorPenta: 'Major pentatonic' },
      right: 'Đúng. Bạn vừa nghe {answer} trên {detail}.',
      wrong:
        'Đó là {answer} trên {detail}. Hãy nghe pentatonic còn lại trước, rồi nghe lại câu này.',
    },
    keys: {
      intro: 'Trượt box 1 dọc theo dây 6 để đổi giọng. Hình bấm giữ nguyên ở mọi vị trí.',
    },
    home: {
      intro:
        'A minor và C major dùng chung đúng năm nốt. Đổi nốt coi là root sẽ đổi toàn bộ cảm giác của giai điệu.',
    },
    major: {
      intro:
        'Để chơi ở giọng trưởng, đặt box 1 lùi xuống 3 phím so với root của giọng trưởng, ngay tại relative minor.',
    },
    rockTrack: {
      intro:
        'Backing rock ở giọng E minor. Dùng E minor pentatonic trong box 1 (bắt đầu ở phím 0 hoặc phím 12). Tiếp đất vào nốt của hợp âm khi chuyển hợp âm.',
    },
    strumTrack: {
      intro:
        'Backing quạt chả ở giọng G major. Dùng G major pentatonic với box 1 lùi 3 phím về phím 0 (E minor) hoặc phím 12.',
    },
    choose: {
      intro:
        'Tìm phím bắt đầu trên dây 6 để đặt box 1 cho các bài giọng thứ, giọng trưởng và blues.',
    },
  },
  check: [
    {
      question: 'Scale minor pentatonic nào dùng chung các nốt với C major pentatonic?',
      options: ['E minor pentatonic', 'A minor pentatonic', 'D minor pentatonic'],
      why: 'A là relative minor của C, nằm thấp hơn C đúng 3 phím trên cần đàn.',
    },
    {
      question: 'Khi chơi bài giọng trưởng, bạn đặt box 1 lùi xuống mấy phím so với root của bài?',
      options: ['2 phím', '3 phím', '5 phím'],
      why: 'Box 1 bắt đầu ở root của relative minor, luôn thấp hơn root của giọng trưởng 3 phím.',
    },
    {
      question: 'Vì sao có thể dùng minor pentatonic trên vòng blues ở giọng trưởng?',
      options: [
        'Vì bậc ♭3 nghe hơi căng trên nền hợp âm trưởng, tạo nên chất blues',
        'Vì minor pentatonic không có root',
        'Vì bài blues không bao giờ dùng hợp âm dominant 7',
      ],
      why: 'Sự đối nghịch giữa bậc ♭3 của scale và bậc 3 trưởng của hợp âm tạo nên chất gai góc đặc trưng của blues.',
    },
  ],
  canDo: [
    'Tôi có thể phân biệt câu pentatonic sáng (major) hay đanh nét blues (minor) trên nền hợp âm trưởng.',
    'Tôi có thể dùng box 1 cho cả giọng thứ lẫn giọng trưởng bằng cách tìm root trên dây 6.',
    'Tôi có thể solo đúng nhịp trên backing track rock và backing track quạt chả giọng trưởng.',
  ],
};
