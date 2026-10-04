import type { RhythmCopy } from './model';

export const vi: RhythmCopy = {
  title: 'Nhịp không cần khuông nhạc',
  summary: 'Nghe phách, nhìn độ dài nốt trên lưới, đếm to, quạt dây như con lắc.',
  lead:
    'Nhịp là chỗ của các nốt trong thời gian. Học nhịp không cần khuông nhạc: một lưới ô, một tiếng click và giọng đếm của bạn là đủ. Cảnh nào bên dưới cũng phát được; bắt đầu chậm và chỉ tăng tempo khi thấy dễ.',
  steps: {
    beat: {
      title: 'Phách là nhịp đập bạn gõ chân theo',
      body: [
        'Phách là nhịp đập đều bên dưới một bài nhạc. Tempo là số phách trong một phút, ghi là BPM: ở 60 BPM mỗi phách dài một giây, ở 120 BPM là nửa giây.',
        'Các phách được gom thành ô nhịp. Phần lớn nhạc rock, pop và blues dùng nhịp 4/4: mỗi ô có bốn phách, và phách 1 nghe mạnh nhất. Metronome bên dưới đánh dấu phách 1 bằng tiếng click cao hơn.',
      ],
      takeaway: 'Nhịp 4/4 là bốn phách mỗi ô nhịp, phách 1 mạnh nhất.',
      tryIt: 'Bật metronome ở 80 BPM, gõ chân theo, và đọc to "1" mỗi khi nghe tiếng click cao.',
    },
    lengths: {
      title: 'Nốt dài bao nhiêu thì thanh dài bấy nhiêu',
      body: [
        'Ở đây một ô nhịp là một dải 16 ô, mỗi phách 4 ô. Mỗi nốt là một thanh dài đúng bằng số ô nó chiếm: nốt tròn phủ cả 16 ô, nốt đen 4 ô, móc đơn 2 ô, móc kép 1 ô. Dấu chấm dôi cộng thêm một nửa, nên nốt trắng chấm dôi dài 3 phách.',
        'Khoảng lặng là một thanh rỗng cùng độ dài. Im lặng cũng là một phần của nhịp, và cần được đếm chính xác như các nốt.',
      ],
      takeaway: 'Độ dài = số ô; khoảng lặng là nốt được đếm nhưng không chơi.',
      tryIt: 'Chọn nốt đen, đổi phách 2 và 4 thành khoảng lặng, rồi chơi theo trên một dây.',
    },
    counting: {
      title: 'Đếm to để biết mình đang ở đâu',
      body: [
        'Đếm giúp bạn giữ chỗ trong ô nhịp. Đọc số phách đúng lúc phách đến. Chia mỗi phách làm hai và đọc "và" ở nửa sau: 1 và 2 và 3 và 4 và.',
        'Chia làm bốn thì thêm "e" và "a": 1 e và a 2 e và a. Chuyển âm thanh sang chỉ có click rồi tự đếm tiếp, không dựa vào tiếng nốt.',
      ],
      takeaway: 'Số ở phách, "và" ở nửa phách, "e" và "a" ở phần tư phách xen giữa.',
      tryIt: 'Đếm to móc đơn ở 70 BPM chỉ với tiếng click, rồi đếm móc kép ở 60 BPM.',
    },
    strum: {
      title: 'Tay quạt là một con lắc',
      body: [
        'Giữ tay quạt luôn đi xuống rồi đi lên như con lắc: xuống ở mỗi phách, lên ở mỗi "và". Tiết tấu đến từ lúc phím chạm dây, không phải từ việc đổi cách tay chuyển động.',
        'Trong lưới bên dưới, mũi tên đậm là chạm dây, mũi tên mờ là lượt tay cố ý không chạm. Quạt xuống đi qua cả sáu dây; quạt lên chỉ chạm các dây mỏng. Bấm vào ô để tự tạo mẫu quạt.',
      ],
      takeaway: 'Tay không bao giờ dừng: xuống ở phách, lên ở "và"; chỉ đổi chỗ chạm dây.',
      tryIt: 'Quạt D – D U – U D U trên các dây buông, vừa quạt vừa đếm "1 và 2 và 3 và 4 và".',
    },
    fingers: {
      title: 'Luyện ngón 1-2-3-4 theo tiếng click',
      body: [
        'Mỗi ngón một phím: ngón trỏ ở phím đầu, ngón giữa ở phím kế, rồi áp út, rồi ngón út. Chơi bốn phím trên dây 6, chuyển sang dây 5, cứ thế tới dây 1.',
        'Gảy xen kẽ xuống và lên, mỗi nốt rơi đúng tiếng click. Tốc độ đến từ việc chơi chậm và đều trước: chỉ tăng vài BPM khi cả lượt đã sạch.',
      ],
      takeaway: 'Chậm và đều trước, nhanh sau: chỉ tăng BPM sau một lượt sạch.',
      tryIt: 'Chạy bài luyện từ phím 5 ở 60 BPM, mỗi phách một nốt, rồi mỗi phách hai nốt.',
    },
  },
  scene: {
    tempo: { label: 'Tempo', value: '{bpm} BPM' },
    start: 'Bắt đầu',
    stop: 'Dừng',
    beat: {
      grid: 'Một ô nhịp bốn phách',
      idle: 'Bấm bắt đầu và gõ chân theo từng phách. Phách 1 có tiếng click cao hơn.',
      caption: 'Phách {n} trên 4',
    },
    lengths: {
      value: 'Nốt',
      names: {
        whole: 'tròn',
        dottedHalf: 'trắng chấm dôi',
        half: 'trắng',
        dottedQuarter: 'đen chấm dôi',
        quarter: 'đen',
        eighth: 'móc đơn',
        sixteenth: 'móc kép',
      },
      legendNote: 'nốt',
      legendRest: 'khoảng lặng',
      caption: 'Nốt {name}: {beats} phách mỗi nốt · {count} nốt mỗi ô nhịp',
      hint: 'Bấm vào một thanh để đổi nó thành khoảng lặng cùng độ dài, bấm lần nữa để đổi lại.',
      note: 'Nốt {name} ({beats} phách)',
      rest: 'Khoảng lặng ({beats} phách)',
    },
    counting: {
      level: 'Đếm',
      levels: { beats: 'Phách', eighths: 'Móc đơn', sixteenths: 'Móc kép' },
      sound: 'Âm thanh',
      notes: 'Nốt và click',
      clickOnly: 'Chỉ click',
      syllables: { e: 'e', and: 'và', a: 'a' },
      idle: 'Bấm bắt đầu và đếm to theo con trỏ.',
    },
    strum: {
      pattern: 'Mẫu',
      presets: { downs: 'Chỉ quạt xuống', downUp: 'Xuống-lên', folk: 'D – D U – U D U' },
      custom: 'Mẫu của bạn',
      down: 'xuống',
      up: 'lên',
      hit: 'chạm dây',
      miss: 'cố ý không chạm',
      cell: 'Ô {n}: {stroke}, {state}',
      caption: 'Mẫu: {pattern}',
    },
    fingers: {
      startFret: 'Từ phím',
      perBeat: 'Nốt mỗi phách',
      tab: 'Tab bài luyện ngón',
      idle: 'Bấm bắt đầu. Mỗi tiếng click một nốt, ngón 1-2-3-4.',
      caption: 'Dây {string}, phím {fret}, ngón {finger}',
      checklistTitle: 'Trước khi bấm bắt đầu',
      checklist: [
        'Ngón cái đặt sau cần đàn, không vắt lên trên.',
        'Cổ tay thấp và thả lỏng, chừa một khoảng nhỏ giữa lòng bàn tay và cần.',
        'Cầm phím giữa ngón cái và ngón trỏ, chỉ để lộ đầu phím.',
        'Đầu ngón bấm sát ngay sau phím đàn, mỗi ngón nằm trên phím của nó.',
      ],
    },
  },
  notYetTitle: 'Những gì chưa cần học',
  notYetIntro: 'Bạn sẽ gặp những thứ này sau. Bây giờ lưới ô, tiếng click và giọng đếm là đủ.',
  notYet: [
    { title: 'Ký hiệu nốt trên khuông', why: 'Đầu nốt, đuôi và móc chỉ là cách ghi lại độ dài mà ở đây bạn thấy bằng ô.' },
    { title: 'Số chỉ nhịp khác 4/4', why: 'Phần lớn những gì bạn chơi trên guitar điện là 4/4. Nhịp khác đến khi bài hát cần.' },
    { title: 'Liên ba, swing và shuffle', why: 'Đó là cảm giác của blues, nên chúng đến cùng bài blues.' },
    { title: 'Đọc đảo phách', why: 'Đếm và quạt đều trước; trọng âm lệch phách mọc ra từ chính con lắc.' },
    { title: 'Cường độ', why: 'Ngoài phách 1 mạnh hơn, chơi to nhỏ có thể để sau.' },
    { title: 'Bấm hợp âm khi quạt', why: 'Ở đây bạn quạt dây buông để tay phải được chú ý trọn vẹn. Hợp âm đến sau.' },
  ],
};
