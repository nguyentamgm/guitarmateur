import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Lick blues đầu tiên',
  summary: 'Dùng ba nốt quen thuộc để mở câu gọi rồi đáp lại trên nhịp shuffle.',
  goal: 'Đổi tiết tấu của một lick ngắn, đáp đúng lúc và đổi nốt đáp ở vòng sau.',
  needs: 'Một cây guitar lên dây chuẩn. Khoảng 15–20 phút.',
  recap: [
    'Trong box 1, A và C ở phím 5 và 8 trên dây 6. D ở phím 5 trên dây 5.',
    'Mỗi bar trong vòng shuffle này có bốn phách đều. Lắng nghe tiếng “và” giữa hai lần gõ chân.',
  ],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Chơi A–C–D ở phách 1, 2 và 3. Nghỉ ở phách 4. Đáp lại bằng D–C–A và giữ A hai phách. Hát nốt D cuối câu gọi rồi hát nốt A cuối câu đáp. Nốt nào nghe như đã về tới nơi?',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Câu gọi đưa ra một ý ngắn dễ nhớ. Bạn có thể đáp bằng cùng các nốt theo thứ tự mới rồi về root để câu nghe có điểm dừng. Vẫn đếm qua các dấu lặng để mỗi câu có chỗ vang lên rõ ràng.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Giữ ba nốt A–C–D cho cả ba lượt. Lượt đầu vào phách 1 và nghỉ ở phách 4. Lượt sau vào tiếng “và” sau phách 1, rồi gảy cả ba nốt vào tiếng “và”. Nghe xem câu nhạc thay đổi thế nào khi các nốt rơi giữa hai tiếng click.',
        'Ở lượt cuối, gảy A vào phách 1 và C vào phách 2. Gảy D vào phách 4 rồi để ngân qua phách 1 của bar kế tiếp. Ngắt nốt ở phách 2 và tiếp tục đếm đến hết bar.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Đếm thành tiếng. Nghe hết bar 1–2 rồi đáp trên đàn ở bar 3–4. Thử gảy D và C vào hai phách đầu của bar 3. Đáp vào A ở phách 1 của bar 4, giữ hai phách rồi chừa chỗ cho câu gọi kế tiếp ở bar 5.',
        'Nghe tiếp ở bar 5–6 và 9–10, rồi đáp ở bar 7–8 và 11–12. Khi cả vòng bắt đầu lại, giữ D và C rồi đổi nốt đáp từ A sang E. Tự kiểm bằng cách nghe xem câu gọi sau có vang lên rõ khi bạn đã đáp xong không.',
      ],
    },
  },
  blocks: {
    ending: {
      intro:
        'Để ý dấu lặng sau câu gọi. Sau đó nghe nốt cuối của câu thứ hai. Câu đó có thể đáp về nốt xuất phát hoặc lặp lại nốt kết ban đầu.',
      ask: 'Câu thứ hai đáp lại hay lặp lại câu gọi?',
      answers: { response: 'Đáp về root', repeat: 'Lặp lại' },
      right: 'Đúng. Bạn vừa nghe {answer} trong {detail} minor pentatonic.',
      wrong:
        'Bạn vừa nghe {answer} trong {detail} minor pentatonic. Nghe lại cả hai câu rồi so hai nốt kết.',
    },
    lengths: {
      intro:
        'Chọn nốt đen rồi bấm thanh thứ tư để đổi thành dấu lặng. Bấm Bắt đầu và tiếp tục gõ chân qua phách trống.',
    },
    legato: {
      intro:
        'Chọn Lick rồi phát trên nền 12-bar. Nghe cú bend ở đầu và cú slide dẫn vào nốt ngân cuối câu. Sau khi lick kết thúc, đếm hai bar được chừa trống.',
    },
    rhythms: {
      intro:
        'Nghe ba cách chơi trên cùng tiếng click đều. Nhìn ba chỗ vào câu trên tab và gõ chân tiếp qua bar mà D còn ngân.',
      label: 'Ba cách chơi A–C–D theo tiết tấu',
      play: 'Nghe ba cách chơi',
    },
    backing: {
      intro:
        'Phát shuffle giọng A và thử cả ba cách trên đàn. Vẫn đếm bốn phách mỗi bar khi vào giữa hai phách hoặc khi giữ D qua vạch bar.',
    },
    exchange: {
      intro:
        'Câu gọi mở đầu bằng A–C–D, với hammer-on vào D. Nghe E♭ dẫn vào E, rồi nghe cú bend từ D lên E ở bar thứ hai. Backing vẫn giữ nhịp khi đến lượt bạn đáp.',
    },
  },
  check: [
    {
      question: 'Nốt kết nào đưa câu gọi A–C–D về root?',
      options: ['Kết ở D', 'Kết ở E', 'Kết ở A'],
      why: 'A là root. Kết ở A khiến câu đáp nghe như đã về tới nơi.',
    },
    {
      question: 'Bạn làm gì khi D ngân từ phách 4 qua phách 1 của bar kế tiếp?',
      options: ['Giữ nốt đang ngân và đếm phách mới', 'Gảy lại D ở phách 1', 'Ngắt D ở vạch bar'],
      why: 'Một lần gảy có thể ngân qua cả hai phách. Tiếp tục đếm khi nốt ngân qua vạch bar.',
    },
    {
      question: 'Câu gọi đầu tiên vang ở bar 1–2. Bạn đáp vào lúc nào?',
      options: ['Bar 2–3', 'Bar 3–4', 'Bar 5–6'],
      why: 'Hai bar sau câu gọi là lượt của bạn. Câu gọi kế tiếp bắt đầu ở bar 5.',
    },
  ],
  canDo: [
    'Tôi chơi được A–C–D từ đầu phách hoặc ở tiếng “và”, và giữ được D ngân qua vạch bar.',
    'Tôi vào đúng hai bar sau câu gọi, chừa chỗ cho câu gọi tiếp theo và đổi được nốt đáp ở vòng sau.',
  ],
};
