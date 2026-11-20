import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Dò hợp âm một bài hát mới',
  summary:
    'Dò hợp âm của bất kỳ bài hát nào bằng quy trình 5 bước, và thử sức với ba giai điệu.',
  goal: 'Sau buổi học này bạn có một quy trình năm bước để tìm hợp âm của một bài hát bạn chưa từng chơi, và đã áp dụng nó trên ba giai điệu.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'Root là nơi bài hát về nghỉ.',
    'I là nhà, V hút về nhà, IV đi xa, vi là hợp âm trầm buồn.',
    'Các số La Mã không đổi khi đổi giọng.',
  ],
  parts: {
    listen: {
      title: 'Quy trình',
      body: [
        '1. Tìm root. Ngân nga nốt mà bài hát dừng lại và cảm thấy yên nghỉ ở cuối câu; tìm nốt đó trên dây 6. Đó chính là tên giọng của bài.',
        '2. Giọng trưởng hay thứ? Chơi hợp âm trưởng trên root đó, rồi chơi hợp âm thứ. Một trong hai hợp âm đó là nhà.',
        '3. Đếm nhịp. Gõ nhịp theo bài hát và đếm từ một phách mạnh: 3 hoặc 4 phách.',
        '4. Tìm chỗ chuyển, rồi tìm hợp âm. Đánh dấu những chỗ hợp âm thay đổi. Thử I trước, rồi đến V, rồi IV, rồi vi. Vẫn chưa đúng? Hãy thử hợp âm khách: ♭VII, iv hoặc III7.',
        '5. Vừa với người hát. Quá cao hoặc quá thấp? Giữ nguyên các số La Mã, đổi root, hoặc dùng capo.',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Bảng này là bản đồ của bạn: bốn hợp âm trong năm giọng.',
        'Bất kỳ bài hát nào bạn dò ra bằng số La Mã đều có thể tra trên bảng này ở một giọng khác.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'Khởi động chỉ với các số La Mã, qua bốn giọng.',
        'Nếu C thấy khó, đó là vì hợp âm F: hãy kiên trì tập luyện.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Ba giai điệu, các ô trống, không gợi ý: hãy dùng quy trình. Sau đó đổi giọng và kiểm tra xem các số La Mã vẫn dùng được.',
        'Bây giờ hãy chọn một bài hát bạn yêu thích. Đặt điện thoại xuống, dùng năm bước, và ghi lại các hợp âm dưới dạng số La Mã. Có thể sẽ mất vài buổi tối: điều đó hoàn toàn bình thường, và đó chính là mục đích của tất cả những gì bạn đã học.',
      ],
    },
  },
  blocks: {
    keys: {
      intro:
        'Bảng cung cấp bốn hợp âm chính (I, V, vi, IV) qua năm giọng. Bấm vào dòng bất kỳ để nghe.',
      caption: 'Bất kỳ bài hát nào bạn dò ra bằng số La Mã đều có thể tra trên bảng này ở một giọng khác.',
    },
    review: {
      intro:
        'Chơi bốn hợp âm (I–V–vi–IV) chỉ bằng số La Mã. Đổi giọng bằng các thẻ phím để khởi động đôi tai.',
    },
    one: {
      intro:
        'Giai điệu 1: tìm root, rồi điền các ô trống bằng quy trình. Đổi giọng để kiểm tra lại.',
      ask: 'Chọn một hợp âm cho mỗi ô',
      result: '{right} / {total} ô đúng.',
      allRight: 'Hoàn toàn chính xác: London Bridge chỉ dùng I và V!',
    },
    two: {
      intro: 'Giai điệu 2: ngân nga nốt về nghỉ và làm theo năm bước mà không cần gợi ý.',
      ask: 'Chọn một hợp âm cho mỗi ô',
      result: '{right} / {total} ô đúng.',
      allRight: 'Hoàn toàn chính xác: Ode to Joy với I và V!',
    },
    three: {
      intro:
        'Giai điệu 3: đếm nhịp, chú ý chỗ hợp âm chuyển và thử từng số La Mã.',
      ask: 'Chọn một hợp âm cho mỗi ô',
      result: '{right} / {total} ô đúng.',
      allRight: 'Hoàn toàn chính xác: Jingle Bells khớp với I, IV và V ở mọi giọng!',
    },
  },
  check: [
    {
      question: 'Điều đầu tiên cần tìm ở một bài hát mới là…',
      options: ['Root của bài (nốt mà bài hát dừng lại)', 'Điệu quạt nhanh nhất', 'Một hợp âm khách như ♭VII'],
      why: 'Ngân nga nốt về nghỉ ở cuối câu sẽ cho bạn root, từ đó xác định được tên giọng.',
    },
    {
      question: 'Khi hợp âm chuyển, bạn nên thử hợp âm nào đầu tiên?',
      options: ['I', 'vi', '♭VII'],
      why: 'Luôn thử hợp âm I đầu tiên vì đây là nhà; nếu bị nghịch, hãy thử tiếp V, rồi IV, rồi vi.',
    },
    {
      question: 'Nếu bài hát quá cao so với người hát, bạn…',
      options: [
        'giữ nguyên các số La Mã và đổi root, hoặc dùng capo.',
        'đổi time signature sang 3/4.',
        'chỉ chơi các hợp âm thứ.',
      ],
      why: 'Các số La Mã không đổi khi đổi giọng: dời root sang phím khác hoặc kẹp capo.',
    },
  ],
  canDo: [
    'Tôi có thể đọc năm bước mà không cần nhìn.',
    'Tôi đã tìm được hợp âm của cả ba giai điệu.',
    'Tôi đã bắt đầu thử sức với một bài hát tự chọn.',
  ],
};
