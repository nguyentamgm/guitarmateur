import type { SessionCopy } from '../types';

const listening = {
  ask: 'Các power chord vừa rồi được chơi kiểu nào?',
  answers: { muted: 'Palm mute', open: 'Để ngân' },
  right: 'Đúng. {answer}.',
  wrong:
    'Bạn vừa nghe kiểu {answer}. Lượt phát lại cho bạn nghe kiểu còn lại trước, rồi tới kiểu ban đầu.',
};

export const vi: SessionCopy = {
  title: 'Power chord và palm mute',
  summary: 'Chơi riff ba hợp âm với tiếng chug ngắn, rõ cao độ, rồi nghỉ ở phách 4.',
  goal: 'Chơi riff power chord có palm mute ở giọng E, A và G, với một phách nghỉ trọn vẹn.',
  needs: 'Một cây guitar lên dây chuẩn. Khoảng 15–20 phút.',
  recap: ['Trong nhịp 4/4, mỗi bar có bốn phách.', 'Hai nốt móc đơn vừa một phách.'],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Chơi E5 với dây 6 buông và phím 2 dây 5. Gảy hai lần theo “1 và” rồi để dây ngân. Chơi lại hai nốt móc đơn đó, lần này đặt nhẹ cạnh bàn tay gảy lên dây gần bridge. Tiếng sẽ ngắn hơn mà vẫn rõ cao độ. Nếu mất cao độ, chạm nhẹ hơn.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Power chord dùng root và bậc 5. Có thể thêm root cao hơn một quãng 8. Bậc 3 mới quyết định hợp âm trưởng hay thứ, nên power chord chơi được với cả hai. Shape ít nốt này vẫn nghe rõ khi dùng distortion.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Gảy E5 hai lần ở phách 1, G5 hai lần ở phách 2 và A5 hai lần ở phách 3. Các root trên dây 6 lần lượt là dây buông, phím 3 và phím 5. Tắt tiếng cả hai dây ở phách 4 và tiếp tục đếm. Vào bar sau đúng phách.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Nghe riff, nhận ra kiểu gảy rồi chơi lại trên đàn. Bắt đầu ở E. Chơi hai bar liên tiếp với tiếng chug rõ và để phách 4 của mỗi bar im tiếng.',
        'Dời root đầu đến phím 5 cho giọng A và phím 3 cho giọng G. Từ root đó, tiến ba phím tới hợp âm thứ hai, rồi thêm hai phím tới hợp âm thứ ba. Tự kiểm xem phách nghỉ có dài như nhau ở cả ba giọng không.',
      ],
    },
  },
  blocks: {
    sound: {
      ...listening,
      intro: 'Cả hai kiểu đều dùng E5, G5 và A5. Để ý xem tiếng ngân của từng lần gảy dài bao lâu.',
    },
    power: {
      intro:
        'Bấm vị trí dây buông trên dây 6 để dời shape từ A5 sang E5. Phát với 2 nốt rồi với 3 nốt. Nốt E phía trên cao hơn root một quãng 8. Thử hai nút quãng 3 trưởng và quãng 3 thứ để nghe power chord đi cùng cả hai kiểu.',
    },
    mute: {
      intro:
        'Phát riff hai bar rồi tắt và bật Palm mute. So tiếng PM ngắn với các hợp âm ngân. Trên đàn, đặt tay gần bridge để tiếng ngắn mà cao độ vẫn rõ.',
    },
    riff: {
      intro:
        'Phát riff một bar ở E. Đổi giữa Để ngân và Palm mute, chân vẫn gõ qua phách nghỉ. Chọn A hoặc G rồi phát lại để nghe cùng tiết tấu ở các phím mới.',
      grid: 'Riff power chord theo móc đơn, có dấu lặng ở phách 4',
      rest: 'Dấu lặng',
      articulation: 'Cách gảy',
      muted: 'Palm mute',
      open: 'Để ngân',
    },
    backing: {
      intro:
        'Dừng riff rồi phát backing giọng E thứ. Chơi một bar riff của bạn theo backing. Phần đàn của bạn nghỉ ở phách 4 trong khi backing vẫn chạy.',
    },
    echo: {
      ...listening,
      intro:
        'Gõ chân đủ bốn phách khi nghe. Khi phát đoạn so sánh, bạn nghe kiểu còn lại trước. Lượt thứ hai là riff ban đầu.',
    },
  },
  check: [
    {
      question: 'Power chord hai nốt gồm những nốt nào?',
      options: ['Root và bậc 3', 'Root và bậc 5', 'Bậc 3 và bậc 5'],
      why: 'Bậc 5 nằm trên root. Shape ba nốt thêm root ở quãng 8 cao hơn.',
    },
    {
      question: 'Cạnh bàn tay gảy chạm ở đâu để palm mute nghe rõ?',
      options: ['Trên các phím', 'Giữa đoạn dây', 'Chạm nhẹ gần bridge'],
      why: 'Chạm nhẹ gần bridge làm tiếng ngắn đi mà vẫn rõ cao độ.',
    },
    {
      question: 'Điều gì giữ nguyên khi dời riff từ giọng E sang A?',
      options: [
        'Hai nốt móc đơn ở mỗi phách 1–3 và một dấu lặng ở phách 4',
        'Phím xuất phát',
        'Tên của cả ba hợp âm',
      ],
      why: 'Dời shape và giữ nguyên cách đếm cùng vị trí phách nghỉ.',
    },
  ],
  canDo: [
    'Tôi chơi được E5 có palm mute với tiếng ngắn và cao độ vẫn rõ.',
    'Tôi lặp được riff ở giọng E, A và G, nghỉ ở phách 4 rồi vào lại đúng lúc.',
  ],
};
