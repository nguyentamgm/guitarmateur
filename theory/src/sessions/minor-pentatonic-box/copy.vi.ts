import type { MelodyEchoCopy, SessionCopy } from '../types';

const echo: MelodyEchoCopy = {
  intro: 'Nghe một lượt. Ngân nga ba nốt, tìm trên đàn rồi bấm lại trên hình. Nốt đầu đã sáng.',
  ask: 'Bạn tìm được nốt tiếp theo chưa?',
  right: 'Đúng cao độ.',
  higher: 'Thử một nốt cao hơn.',
  lower: 'Thử một nốt thấp hơn.',
  done: 'Bạn đã tìm được bốn câu bằng tai.',
};

export const vi: SessionCopy = {
  title: 'Năm nốt trong box 1',
  summary: 'Nghe và tìm một câu ba nốt trong A minor pentatonic.',
  goal: 'Chơi một câu ngắn qua hai dây, giữ đều phách và ngắt tiếng đúng lúc.',
  needs: 'Một cây đàn đã lên dây và một miếng gảy. Khoảng 15–20 phút.',
  recap: ['Nốt A nằm ở phím 5 trên dây 6.', 'Ngân nga root để nghe chỗ câu nhạc có thể dừng.'],
  parts: {
    listen: {
      title: 'Nghe',
      body: ['Lấy nốt đầu làm mốc. Nghe lại câu nhạc bao nhiêu lần tùy bạn.'],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'A minor pentatonic gồm năm nốt A, C, D, E và G. Một box gom các nốt ấy vào vùng phím nằm trong tầm tay.',
      ],
    },
    play: {
      title: 'Chơi',
      body: ['Bắt đầu chậm. Chơi ba nốt qua hai dây, mỗi phách một nốt. Nghỉ ở phách bốn.'],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Nghe và tìm một câu mới trên đàn. Sau đó chơi câu qua hai dây hai lần theo nhạc đệm.',
      ],
    },
  },
  blocks: {
    call: echo,
    tab: { intro: 'Đọc tab từ trái sang phải. Mỗi dòng là một dây và mỗi con số là một phím.' },
    formula: {
      intro: 'Hát các bậc từ root đi lên: 1 ♭3 4 5 ♭7. Sau đó hát root ở quãng 8 phía trên.',
    },
    box: {
      intro: 'Tìm A trên dây 6 rồi lần theo các nốt của box 1. Chơi từ thấp lên cao rồi quay về.',
    },
    fingers: {
      intro: 'Giữ tay bấm ở một vị trí. Khi chuyển dây, luân phiên gảy xuống và gảy lên.',
    },
    backing: {
      intro:
        'Ở giọng A, chơi A và C trên dây 6 rồi D trên dây 5. Gảy xuống, lên, xuống. Chạm nhẹ vào dây thừa. Ngắt nốt cuối ở phách bốn rồi lặp lại. Bậc trên các nốt được tô nổi tính từ root của hợp âm đang vang. Các bậc còn lại tính từ root của scale.',
    },
    scales: {
      intro:
        'Hai câu đều đi từ cùng một root lên quãng 8. Hãy nghe khoảng cách giữa các nốt ở giữa câu.',
      ask: 'Bạn vừa nghe scale nào?',
      answers: { pentatonic: 'Minor pentatonic', majorScale: 'Major scale' },
      right: 'Đúng. Bạn vừa nghe {answer} từ {detail}.',
      wrong: 'Đó là {answer} từ {detail}. Hãy nghe scale kia rồi nghe lại câu ban đầu.',
    },
    echo: {
      ...echo,
      intro:
        'Ngân nga câu mới rồi tìm các nốt trong box 1. Thử bốn câu, sau đó chơi lại câu qua hai dây.',
    },
  },
  check: [
    {
      question: 'Trong A minor pentatonic, A là bậc mấy?',
      options: ['♭3', '1', '5'],
      why: 'A là root, tức bậc 1.',
    },
    {
      question: 'Con số trên một dòng tab cho biết điều gì?',
      options: ['Phách', 'Ngón tay', 'Phím đàn'],
      why: 'Dòng cho biết dây, số cho biết phím.',
    },
    {
      question: 'Khi đến dấu lặng, bạn cần nghe gì từ đàn của mình?',
      options: ['Đàn im tiếng', 'Nốt cuối còn ngân', 'Một dây buông'],
      why: 'Chạm nhẹ vào dây để ngắt tiếng trong khi nhạc đệm vẫn chạy.',
    },
  ],
  canDo: [
    'Tôi có thể ngân nga một câu ba nốt rồi tìm lại trong box 1.',
    'Tôi có thể chơi câu ba nốt qua hai dây hai lần đúng nhịp, các nốt đều tiếng và đàn im ở dấu lặng.',
  ],
};
