import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Legato và slide',
  summary: 'Nghe cách tay bấm nối hai nốt và tập chơi theo các ký hiệu kỹ thuật trên tab.',
  goal: 'Đọc tab để chơi hammer-on, pull-off và slide, mỗi cặp nốt chỉ gảy một lần.',
  needs: 'Một cây guitar lên dây chuẩn. Khoảng 15–20 phút.',
  recap: [
    'Dòng trên cùng của tab là dây 1, dây mảnh nhất.',
    'Trong box 1 của A minor pentatonic, A và C nằm ở phím 5 và 8 trên dây đó.',
  ],
  parts: {
    listen: {
      title: 'Nghe',
      body: [
        'Để ý cách nốt thứ hai cất lên. Khi gảy rời, nốt thứ hai có tiếng gảy mới. Khi nối bằng legato, cao độ đổi nhanh sang nốt thứ hai. Khi slide, bạn nghe cao độ di chuyển giữa hai phím.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Trên dây 1, gảy riêng phím 5 và phím 8. Sau đó thử 5h8. Gảy phím 5 một lần rồi đặt ngón út xuống phím 8 đủ dứt khoát để nốt thứ hai vang lên. Đây là hammer-on, ký hiệu h.',
        'Với 8p5, giữ phím 5 trước khi gảy phím 8. Lúc nhấc ngón út, kéo nhẹ ngón ngang qua dây để nốt ở phím 5 vang lên. Đây là pull-off, ký hiệu p. Với slide, ở đây ghi bằng dấu /, giữ ngón ép dây khi di chuyển dọc cần đàn. Dấu ~ là vibrato trên nốt đang ngân.',
      ],
    },
    play: {
      title: 'Chơi',
      body: [
        'Phát backing giọng A thứ. Trên dây 1, chơi 5h8 vào phách 1 và 2, rồi 8p5 vào phách 3 và 4. Để trống bar kế tiếp để nghe. Khi tới Dm, gảy phím 5 rồi slide tới phím 8. Giữ nốt cuối và thử thêm một chút vibrato.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Nghe cả câu trên tab rồi chơi chậm trên đàn. Mỗi cặp chỉ gảy ở nốt đầu. Nghe xem hai cao độ có rõ không và đoạn slide có liền tiếng không.',
      ],
    },
  },
  blocks: {
    articulation: {
      intro:
        'Hai nốt nằm trên cùng một dây. Hãy nghe tiếng gảy thứ hai, cú đổi cao độ đột ngột, hoặc đoạn cao độ đi liền giữa hai nốt.',
      ask: 'Hai nốt vừa rồi được chơi bằng cách nào?',
      answers: { picked: 'Gảy riêng hai nốt', legato: 'Hammer-on hoặc pull-off', slide: 'Slide' },
      right: 'Đúng. {answer}.',
      wrong: 'Bạn vừa nghe {answer}. Nghe lại cùng ví dụ ở tốc độ chậm hơn.',
    },
    techniques: {
      intro:
        'Chọn Hammer-on rồi bấm Phát. Sơ đồ dùng phím 5 và 7 trên dây 3. Chọn Pull-off để nghe cặp đó theo chiều ngược lại. Ví dụ Slide dùng phím 5 và 7 trên dây 4. Nhìn đường cao độ trong từng ví dụ, rồi chọn Vibrato để nghe trên một nốt ngân dài.',
    },
    backing: {
      intro:
        'Nhìn bar đang sáng để biết lúc Am chuyển sang Dm. Bạn dùng cùng một cặp phím ở cả hai đoạn.',
    },
    tab: {
      intro:
        'Cả sáu nốt nằm trên dây 1. Chơi 5h8, rồi 8p5, sau đó gảy phím 5 và slide đến phím 8. Giữ phím 8 và thêm vibrato khi nốt đã tới đúng cao độ.',
      label: 'Tab cho câu hammer-on, pull-off và slide',
      play: 'Phát câu trên tab',
    },
    echo: {
      intro:
        'Nếu muốn tập thêm, nghe một câu ngắn mới và chơi lại trên sơ đồ. Sau đó thử trên đàn. Nếu hai nốt nằm trên cùng một dây, thử nối chúng bằng một lần gảy.',
      ask: 'Bạn tìm được các nốt còn lại trong box 1 không?',
      right: 'Đúng nốt rồi. Chơi tiếp hoặc chọn Tiếp theo nếu đã hết câu.',
      higher: 'Nghe và tìm một nốt cao hơn.',
      lower: 'Nghe và tìm một nốt thấp hơn.',
      done: 'Bạn đã chơi lại bốn câu. Thử nối hai nốt trên đàn.',
    },
  },
  check: [
    {
      question: 'Ký hiệu 5h8 chỉ cách chơi nào trên cùng một dây?',
      options: [
        'Gảy riêng ở cả hai phím',
        'Gảy phím 5 rồi hammer-on tới phím 8',
        'Gảy phím 8 rồi pull-off về phím 5',
      ],
      why: 'Số đầu là phím bạn gảy. Ký hiệu h báo tay bấm sẽ làm nốt thứ hai vang lên.',
    },
    {
      question: 'Cần chuẩn bị gì trước khi chơi 8p5?',
      options: [
        'Nhấc cả hai ngón',
        'Di chuyển ngón dọc cần đàn',
        'Giữ phím 5 trong lúc gảy phím 8',
      ],
      why: 'Phím thấp đã được giữ sẵn để vang lên khi ngón kia rời phím 8.',
    },
    {
      question: 'Cao độ thay đổi thế nào trong một cú slide?',
      options: [
        'Đi qua các cao độ giữa hai phím',
        'Nhảy thẳng tới cao độ thứ hai',
        'Dao động quanh cao độ ban đầu',
      ],
      why: 'Ngón tay vẫn ép dây nên cao độ thay đổi khi ngón di chuyển.',
    },
  ],
  canDo: [
    'Tôi nghe ra hai lần gảy, hammer-on hoặc pull-off, và slide.',
    'Tôi chơi được tab với một lần gảy cho mỗi cặp và nghe rõ cả hai nốt của từng cặp.',
  ],
};
