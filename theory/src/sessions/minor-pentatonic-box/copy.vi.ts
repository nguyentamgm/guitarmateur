import type { MelodyEchoCopy, SessionCopy } from '../types';

const echo: MelodyEchoCopy = {
  intro:
    'Nốt đầu đã được tô sáng. Tìm nốt thứ hai trên đàn rồi bấm vào chấm tương ứng trên hình. Làm tương tự với nốt cuối. Bạn có thể nghe lại cả câu bất cứ lúc nào.',
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
      body: [
        'Hãy nghe ba nốt như một câu hát ngắn, rồi ngân nga lại bằng một tiếng “la” cho mỗi nốt. Khi nghe lại, để ý giai điệu đi lên hay đi xuống sau nốt đầu.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Pentatonic là một scale gồm năm nốt. Với A minor pentatonic, đó là A, C, D, E và G. Thử hát A–C–D, rồi hát trở về A. Trong giọng A thứ, kết ở A cho ta cảm giác câu nhạc đã về đến nơi. Ta gọi A là root và lấy nó làm bậc 1.',
        'Trên một dây, bạn phải đi dọc cần đàn để chơi hết năm nốt. Bạn cũng có thể chơi chúng trên các dây kế nhau trong khoảng phím 5–8. Cách sắp xếp đó là box 1 của A minor pentatonic. Trong box có nhiều hơn năm chấm vì cùng một tên nốt lặp lại ở những quãng 8 khác nhau.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Trước khi bật nhạc đệm, đếm đều “một, hai, ba, bốn”. Gảy A ở phách một, C ở phách hai và D ở phách ba. Đến phách bốn, chạm nhẹ vào dây đang ngân để ngắt tiếng. Vẫn đếm phách bốn thành tiếng để vào lại nốt A đúng lúc.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Với mỗi câu mới, hãy ngân nga cả câu trước khi dò đàn. Sau bốn câu, quay lại phần Chơi, bật nhạc đệm ở giọng A và chơi A–C–D hai lượt. Sau khoảng lặng ở phách bốn, nốt A của lượt sau có rơi đúng phách một không?',
      ],
    },
  },
  blocks: {
    call: echo,
    tab: {
      intro:
        'Tab ghi vị trí bấm bằng sáu dòng. Dòng dưới cùng là dây 6 (dây dày nhất), dòng trên cùng là dây 1 (dây mảnh nhất). Đọc từ trái sang phải. Ví dụ, số 5 trên dòng dưới cùng nghĩa là bấm phím 5 dây 6 rồi gảy dây đó. Bấm thử một số trên tab để thấy vị trí tương ứng trên cần đàn.',
    },
    formula: {
      intro:
        'Nghe từ A ở phím 5 trên dây 6. Từ A đến C cách ba phím, từ C đến D cách hai phím. Các số có dấu + trên hình cho biết đi thêm bao nhiêu phím. Các nhãn 1, ♭3, 4, 5, ♭7 lần lượt là bậc của A, C, D, E, G. Cuối lượt bạn lại nghe A, cao hơn A ban đầu một quãng 8.',
    },
    box: {
      intro:
        'Chọn box 1 và bật nhãn tên nốt. Tìm A rồi C trên dây 6 ở phím 5 và 8. Để chơi D, chuyển sang dây 5 ở phím 5. Bấm ba chấm theo thứ tự đó, rồi chơi lại trên đàn. Tay bấm vẫn ở cùng một vị trí.',
    },
    fingers: {
      intro:
        'Tập chuyển dây theo tiếng click, luân phiên gảy xuống và gảy lên (alternate picking). Mỗi ngón phụ trách một phím. Khi trở lại câu A–C–D, dùng ngón trỏ cho phím 5, ngón út cho phím 8, rồi chuyển ngón trỏ sang dây 5.',
    },
    backing: {
      intro:
        'Ở giọng A, chơi A và C trên dây 6 rồi D trên dây 5. Gảy xuống, lên, xuống. Chạm nhẹ vào dây thừa. Ngắt nốt cuối ở phách bốn rồi lặp lại. Bậc trên các nốt được tô nổi tính từ root của hợp âm đang vang. Các bậc còn lại tính từ root của scale.',
    },
    scales: {
      intro:
        'Hai câu bắt đầu cùng một nốt và kết ở quãng 8 phía trên. Hãy nghe bước từ nốt đầu sang nốt thứ hai. Ở câu minor pentatonic, bước này rộng ba phím, giống A lên C bạn vừa chơi. Ở câu major scale, bước đầu chỉ rộng hai phím.',
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
