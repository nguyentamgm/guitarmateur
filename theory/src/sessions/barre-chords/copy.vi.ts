import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Hợp âm chặn: mọi giọng với hai shape',
  summary: 'Mở rộng mọi giọng với hợp âm chặn: di chuyển shape E và A dọc cần đàn với ngón trỏ đóng vai trò như capo để chơi ở bất kỳ giọng nào.',
  goal: 'Sau buổi học này bạn có thể chơi F và Bm, và di chuyển một shape dọc theo cần đàn để chơi I–IV–V ở mọi giọng.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'Các nốt trên dây 6: E F G A B C D ở các phím 0 1 3 5 7 8 10.',
    'Một phím đàn là nửa cung.',
    'Capo nâng cao mọi hợp âm dây buông.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Cùng một hợp âm có thể chơi ở nhiều vị trí trên cần đàn.',
        'Lắng nghe một hợp âm dây buông, sau đó là một hợp âm chặn.',
        'Nghe xem hợp âm thứ hai là cùng hợp âm hay là một hợp âm khác.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Hợp âm chặn là một shape mở được đẩy lên cao trên cần đàn, với ngón trỏ đóng vai trò như chiếc capo.',
        'Shape E lấy tên từ nốt dưới ngón chặn trên dây 6; shape A lấy tên từ dây 5.',
        'Hai shape, mười hai phím đàn: chơi được mọi hợp âm trưởng và thứ.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Lời khuyên thật lòng: hợp âm chặn cần vài tuần luyện tập, không phải vài phút.',
        'Bấm sát thanh phím, giữ ngón cái phía sau cần đàn và kiểm tra từng dây một.',
        'Tập F và B♭ trước; dây bị rè lúc đầu là chuyện bình thường.',
        'Một mẹo hình ảnh: với I là hợp âm chặn shape E, IV là shape A cùng phím và V là shape A cao hơn hai phím.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'I–V–vi–IV chỉ bằng số bậc ở giọng F, B♭ và E♭: các giọng không có hợp âm dây buông dễ bấm.',
        'Sử dụng shape E và shape A để chơi vòng hợp âm ở bất kỳ đâu trên cần đàn.',
      ],
    },
  },
  blocks: {
    same: {
      intro: 'Cùng một hợp âm có thể chơi ở nhiều vị trí khác nhau.',
      ask: 'Hợp âm thứ hai là cùng hợp âm hay hợp âm khác?',
      answers: {
        same: 'Cùng hợp âm',
        different: 'Hợp âm khác',
      },
      right: 'Đúng: {answer}. Đó là {detail}.',
      wrong: 'Đó là {answer}: {detail}. Hãy nghe lại cả hai, rồi nghe shape mở.',
    },
    slide: {
      intro: 'Trượt một shape mở lên cần đàn: ngón trỏ của bạn thay thế cho nut hoặc capo.',
    },
    eShape: {
      intro: 'Shape E lấy tên từ nốt dưới ngón chặn trên dây 6.',
    },
    aShape: {
      intro: 'Shape A lấy tên từ nốt dưới ngón chặn trên dây 5.',
    },
    inF: {
      intro: 'F, B♭ và C ở giọng F trưởng. Bấm sát thanh phím và kiểm tra từng dây một.',
    },
    bm: {
      intro: 'Bm là shape Am được chặn ở phím 2. Giữ ngón cái phía sau cần đàn.',
    },
    loop: {
      intro: 'Chơi I–IV–V–I ở giọng F, rồi chuyển sang B♭. Với I là shape E, IV là shape A cùng phím và V cao hơn hai phím.',
    },
    anyKey: {
      intro: 'I–V–vi–IV chỉ bằng số bậc ở các giọng F, B♭ và E♭: các giọng không có hợp âm dây buông dễ bấm.',
    },
  },
  check: [
    {
      question: 'Hợp âm chặn shape E ở phím 3 là hợp âm nào?',
      options: ['G', 'A', 'F'],
      why: 'Dây 6 ở phím 3 là nốt G, nên shape E chặn ở phím 3 là hợp âm G trưởng.',
    },
    {
      question: 'Bộ phận nào thay thế cho capo trong một hợp âm chặn?',
      options: ['Ngón trỏ của bạn.', 'Ngón cái của bạn.', 'Dây đeo đàn.'],
      why: 'Ngón trỏ của bạn đặt ngang qua các dây, thay thế cho nut hoặc capo.',
    },
    {
      question: 'Từ hợp âm I ở shape E, hợp âm IV nằm ở đâu?',
      options: ['Shape A, ở cùng phím.', 'Shape E, cao hơn hai phím.', 'Shape A, thấp hơn hai phím.'],
      why: 'Bậc 4 của bất kỳ root nào trên dây 6 nằm ngay ngang sang dây 5 ở cùng phím, chơi bằng shape A.',
    },
  ],
  canDo: [
    'Chơi F và Bm để hầu hết các dây đều vang rõ.',
    'Chơi I–IV–V–I ở giọng F.',
    'Tìm I, IV, V dưới dạng hợp âm chặn ở một giọng tuỳ chọn.',
  ],
};
