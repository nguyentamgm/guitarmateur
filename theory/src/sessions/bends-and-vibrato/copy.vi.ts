import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Bend và vibrato',
  summary: 'Bend lên đúng cao độ của một nốt bấm, giữ nốt rồi thêm vibrato.',
  goal: 'Bend lên đúng một cung và trở về cao độ đích sau khi thêm một chút vibrato.',
  needs: 'Một cây guitar lên dây chuẩn. Khoảng 15–20 phút.',
  recap: [
    'Hai phím trên cùng một dây cách nhau một cung.',
    'D và E là bậc 4 và 5 của A minor pentatonic.',
  ],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Ngân nga nốt đầu tiên. Nốt thứ hai bắt đầu thấp hơn rồi lên dần. Để ý cao độ lúc nó dừng lại. Nó thấp hơn, khớp, hay cao hơn nốt bạn vừa ngân nga?',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Trên dây 3, gảy E ở phím 9. Sau đó dùng ngón áp út bấm D ở phím 7, gảy rồi đẩy dây sang ngang. Dùng các ngón phía sau để đỡ. Giữ cú bend và so cao độ với E ở phím 9. Dưới E là non, còn vượt quá E là già.',
        'Mỗi cú bend một cung trên sơ đồ đều có nốt đích. Curl trong blues là cú bend nhẹ từ ♭3 hướng về bậc 3. Cao độ có thể nằm giữa hai nốt đó.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Phát backing shuffle giọng A ở 72 BPM. Trong bar A7 đầu tiên, gảy E ở phím 9 vào phách 1. Gảy D ở phím 7 vào phách 2, bend lên E rồi giữ qua phách 3 và 4. Lặp lại ở bar kế tiếp. Khi đã giữ được E, giảm lực đẩy nhẹ rồi trở về E vài lần. Kết thúc ở đúng cao độ E.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Cố gắng trả lời đúng bảy hoặc tám câu trong lượt nghe. Sau đó tự kiểm trên đàn. Gảy E ở phím 9 dây 3, bend D lên cho khớp với E rồi giữ hai phách.',
        'Nghe xem cao độ có thay đổi trong lúc giữ không. Thêm vibrato nhẹ và đều rồi giữ nốt ổn định trở lại. Gảy lại E ở phím 9 để so với cao độ vừa giữ.',
      ],
    },
  },
  blocks: {
    pitch: {
      intro: 'Nốt đầu cho bạn cao độ đích. Hãy tập trung nghe phần ngân ở cuối cú bend.',
      ask: 'Cú bend dừng ở đâu so với nốt đích?',
      answers: { flat: 'Non', inTune: 'Đúng cao độ', sharp: 'Già' },
      right: 'Đúng. Bạn nghe cú bend {detail} ở mức {answer}.',
      wrong:
        'Cú bend {detail} ở mức {answer}. Khi phát lại, bạn sẽ nghe nốt đích và một cú bend khớp với nó.',
    },
    bends: {
      intro:
        'Chọn 4 → 5 rồi phát nốt đích và cú bend. Nhìn đường cao độ đi lên tới vạch đứt nét. Thử hai cú bend một cung còn lại, rồi chọn ♭3 curl để nghe cao độ nhích lên ít hơn. Bài nghe bên dưới cho bạn so chỗ dừng của cú bend với nốt đích.',
    },
    backing: {
      intro:
        'Nhìn bar đang sáng để tìm A7 ở đầu vòng. Dừng backing và gảy lại E ở phím 9 mỗi khi cần nghe rõ nốt đích.',
    },
    match: {
      intro: 'Nhớ cao độ đích trong lúc cú bend đi lên. So cao độ khi nốt bắt đầu ngân đều.',
      ask: 'Cú bend dừng ở đâu so với nốt đích?',
      answers: { flat: 'Non', inTune: 'Đúng cao độ', sharp: 'Già' },
      right: 'Đúng. Bạn nghe cú bend {detail} ở mức {answer}.',
      wrong:
        'Cú bend {detail} ở mức {answer}. Khi phát lại, bạn sẽ nghe nốt đích và một cú bend khớp với nó.',
    },
  },
  check: [
    {
      question: 'Bend một cung từ phím 7 dây 3 thì nốt đích nằm ở phím nào?',
      options: ['Phím 8 dây 3', 'Phím 9 dây 3', 'Phím 7 dây 2'],
      why: 'Phím 9 cao hơn phím 7 hai nửa cung trên cùng một dây.',
    },
    {
      question: 'Cú bend đi lên rồi dừng thấp hơn nốt E đích. Bạn nghe thấy gì?',
      options: ['Non', 'Đúng cao độ', 'Già'],
      why: 'Non nghĩa là thấp hơn cao độ đích.',
    },
    {
      question:
        'Sau khi thêm vibrato vào nốt bend lên E, bạn cần nghe cao độ nào khi nốt ổn định lại?',
      options: ['Nốt D đã bấm', 'Một nốt cao hơn E', 'Đúng nốt E đã dùng để so'],
      why: 'Thay đổi cao độ nhẹ và đều, rồi trở về đúng nốt E.',
    },
  ],
  canDo: [
    'Tôi nghe ra cú bend non, đúng cao độ hay già so với nốt đích.',
    'Tôi bend được D lên E trên dây 3, giữ hai phách, rồi thêm vibrato nhẹ và trở về đúng E.',
  ],
};
