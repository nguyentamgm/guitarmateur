import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Bản solo đầu tiên của bạn',
  summary: 'Nghe để tìm giọng, xây câu theo vòng hợp âm và nghe lại một bản thu trọn vòng.',
  goal: 'Sau buổi này, bạn có thể dùng quy trình bốn bước để solo trên một bài mới và tự nghe để sửa một nốt đáp.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 20 phút.',
  recap: [
    'Giọng giúp bạn chọn scale. Hợp âm đang vang cho bạn nốt để đáp.',
    'Lặp lại tiết tấu của một motif ngắn để vẫn nhận ra motif khi các nốt thay đổi.',
  ],
  parts: {
    listen: {
      title: 'Nghe để tìm giọng',
      body: ['Bắt đầu với một backing giấu tên giọng. Lắng nghe nốt mà backing quay về ở cuối đoạn.'],
    },
    understand: {
      title: 'Bốn bước để solo',
      body: [
        '1. Tìm root. Ngân nốt mà bài hát về nghỉ rồi dò đúng nốt đó trên dây 6.',
        '2. Chọn scale. Thử hợp âm trưởng và hợp âm thứ trên root đó. Bắt đầu với pentatonic hợp tai. Với blues, thử minor pentatonic thêm blue note.',
        '3. Lên ý cho câu. Đếm qua cả vòng, chọn hai chỗ đổi hợp âm và nhắm một nốt của mỗi hợp âm sắp tới. Chừa khoảng lặng cho motif ngắn.',
        '4. Chơi trọn vòng rồi nghe lại. Tiếp tục đếm qua dấu lặng. So sánh một nốt đáp với nốt của hợp âm ở gần đó rồi giữ nốt bạn thích.',
        'Thử vòng G–D–Em–C. Ngân G, kiểm tra ở phím 3 dây 6 và chọn G major pentatonic. Nhắm A, bậc 5 của D, rồi G, bậc ♭3 của Em.',
        'Ở bar 1, chơi G–B vào phách 1 và 2. Đếm thầm phách 3 và 4. Lặp lại tiết tấu đó với A–B trên D, rồi G–B trên Em. Chơi E–G trên C và đếm hết vòng. G ở dây 3 buông, A ở phím 2 dây 3, B ở dây 2 buông và E ở dây 1 buông.',
      ],
    },
    play: {
      title: 'Chơi qua các lần đổi hợp âm',
      body: ['Nghe một đường nốt đi theo hợp âm rồi chơi ví dụ bốn bar trên đàn của bạn.'],
    },
    challenge: {
      title: 'Thu, so sánh và chơi trọn vòng',
      body: [
        'Trước tiên, thu các nốt bạn bấm trên sơ đồ cần đàn rồi so sánh hai bản. Số nốt thuộc hợp âm chỉ để tham khảo cho bản thu đó.',
        'Sau đó, quay lại backing pop giọng G ở phần Chơi và solo trọn một vòng trên đàn của bạn. Trước khi chơi, gọi tên hai chỗ đổi hợp âm bạn đã chọn. Tiếp tục đếm qua các phách lặng, nhắc lại motif và lắng nghe cả hai nốt đáp.',
      ],
    },
  },
  blocks: {
    key: {
      intro:
        'Bật backing. Trước khi mở đáp án, ngân root, tìm nốt đó trên đàn rồi chọn giọng trưởng hay thứ và pentatonic phù hợp.',
      ask: 'Nốt nào nghe như root? Hợp âm trưởng hay thứ trên nốt đó nghe hợp hơn?',
      answer:
        'Root {detail} ở phím {fret} dây 6. Bắt đầu với {detail} {answer} pentatonic. Nghe lại root rồi phát lại backing và thử scale đó.',
      replayAnswer: 'Nghe root',
    },
    scale: {
      intro:
        'Chọn Pop ở giọng G rồi thử hai lựa chọn scale trên cùng vòng hợp âm. Thử cả 12-bar blues, Rock và Jazz ii–V–I. Nghe màu sáng hơn của major pentatonic trong blues và các nốt bổ sung của major scale trong jazz. Dừng backing trước khi sang phần tiếp theo.',
    },
    guide: {
      intro:
        'Chọn Pop ở giọng G, mở backing với Phát đường nốt ở chế độ Bật. Nghe nốt đầu mỗi bar. Sau đó thử một vòng với mỗi phong cách còn lại.',
    },
    pop: {
      intro:
        'Bắt đầu ở giọng G. Chơi motif bốn bar ở trên và đếm hai phách lặng ở mỗi bar. Nghe A khi sang D và G khi sang Em. Nếu đổi giọng, chọn nốt đích mới từ các hợp âm đang hiện. Dừng backing trước khi thu.',
    },
    record: {
      intro:
        'Chọn Pop ở giọng G, bấm Thu rồi bấm các nốt của ví dụ bốn bar. Lần đầu, thử đáp vào E thay cho A khi sang D để có chỗ so sánh. Hết vòng, dùng Nghe lại cho cả Bản của bạn và Đã sửa chỗ đáp. Nghe bar D trong hai bản, chọn nốt đáp bạn thích rồi thu lại với nốt đó.',
    },
  },
  check: [
    {
      question: 'Điều gì giúp bạn chọn pentatonic cho một bài chưa biết?',
      options: [
        'Tìm root rồi thử trưởng và thứ.',
        'Bắt đầu ở phím cao nhất.',
        'Giữ tempo của bài vừa chơi.',
      ],
      why: 'Root cho biết vị trí đặt box. Giọng và phong cách giúp bạn chọn scale.',
    },
    {
      question: 'Vì sao A nghe hợp khi sang D trong vòng pop giọng G?',
      options: ['Đó là root của giọng.', 'Đó là bậc 3 của Em.', 'Đó là bậc 5 của D.'],
      why: 'Bạn chọn A từ hợp âm sắp tới. Đó là bậc 5 của D.',
    },
    {
      question: 'Bạn nghe được gì khi so bản thu của mình với Đã sửa chỗ đáp?',
      options: [
        'Tốc độ chơi từng nốt.',
        'Một nốt gần đó của hợp âm làm thay đổi tiếng đáp ra sao.',
        'Số dấu lặng cần lấp đầy.',
      ],
      why: 'Nếu nốt đầu bar nằm ngoài hợp âm và có nốt của hợp âm ở gần, app sẽ dời nốt đầu đến đó. Hãy nghe để chọn nốt đáp.',
    },
  ],
  canDo: [
    'Trên đàn của mình, tôi giữ được vị trí qua cả vòng, kể cả các phách lặng.',
    'Tôi nhắc lại một motif mà mình vẫn nhận ra.',
    'Tôi xác định trước hai chỗ đổi hợp âm và nghe được nốt đáp mình đã chọn ở cả hai chỗ.',
  ],
  practiceLabel: 'Tập 12-bar blues giọng A trong app Luyện tập →',
};
