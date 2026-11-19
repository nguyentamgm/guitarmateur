import type { SessionCopy } from '../types';

export const vi: SessionCopy = {
  title: 'Hợp âm 7 hút về nhà',
  summary: 'Làm quen với hợp âm dominant 7: thêm nốt ♭7 để tạo sức hút mạnh mẽ kéo về hợp âm I.',
  goal: 'Sau buổi học này bạn có thể nghe ra hợp âm 7, chơi D7, A7 và E7, và dùng V7 để dẫn về I.',
  needs: 'Một cây đàn guitar đã lên dây chuẩn. Khoảng 15 phút.',
  recap: [
    'Hợp âm V hút mạnh về I.',
    'Một hợp âm có ba chord tone: 1, 3, 5.',
    'Đổi giọng vẫn giữ nguyên các con số.',
  ],
  parts: {
    listen: {
      title: 'Lắng nghe',
      body: [
        'Hợp âm trưởng nghe mộc mạc và an định.',
        'Hợp âm 7 nghe bồn chồn, hơi gắt và muốn chuyển động.',
        'Hãy lắng nghe một hợp âm được quạt: bạn có phân biệt được nó là hợp âm thường hay có thêm nốt 7 không?',
      ],
    },
    understand: {
      title: 'Hiểu',
      body: [
        'Thêm một nốt nữa vào hợp âm trưởng, nốt cách root một cung bên dưới (viết là ♭7), và bạn có hợp âm 7 (tên đầy đủ: dominant 7).',
        'Ví dụ, D trở thành D7.',
        'Trên hợp âm V, nốt phụ này nằm cách bậc 3 của hợp âm I đúng nửa cung và nghiêng hẳn về nó: đó là lý do vì sao V7 → I nghe dứt khoát như vậy.',
        'Sách bài hát hay ghi "G7", "D7"; giờ bạn đã hiểu số 7 mang ý nghĩa gì.',
      ],
    },
    play: {
      title: 'Chơi đàn',
      body: [
        'So sánh ba cặp hợp âm, mỗi cặp gồm một hợp âm V và hợp âm V7 tương ứng: D và D7 ở giọng G, A và A7 ở giọng D, E và E7 ở giọng A. Trong mỗi cặp, chỉ một ngón tay thay đổi.',
        'Sau đó quạt I–IV–V7–I trong các giọng G, D và A.',
        'Hãy lắng nghe hợp âm V7 hút mạnh mẽ về I ở hợp âm kết thúc.',
      ],
    },
    challenge: {
      title: 'Thử thách',
      body: [
        'Chơi lại bài Twinkle Twinkle Little Star, lần này có thêm lựa chọn hợp âm V7.',
        'Dùng V7 ở nơi giai điệu chuẩn bị quay về nhà ở I.',
        'Cả V và V7 đều được chấp nhận, nhưng hãy nghe cách V7 tạo thêm sức hút.',
      ],
    },
  },
  blocks: {
    plain: {
      intro: 'Hợp âm 7 nghe bồn chồn và muốn chuyển động, trong khi hợp âm trưởng thường nghe êm dịu.',
      ask: 'Thường, hay có thêm nốt 7?',
      answers: {
        plain: 'Thường',
        seventh: 'Có thêm nốt 7',
      },
      right: 'Đúng: {answer}. Hợp âm là {detail}.',
      wrong: 'Đó là {answer}: {detail}. Hãy nghe hợp âm còn lại, rồi nghe lại hợp âm này.',
    },
    sevenths: {
      intro: 'Thêm nốt cách root một cung bên dưới (♭7) vào triad trưởng để tạo thành hợp âm dominant 7.',
    },
    pull: {
      intro: 'Chỉ tập trung vào phần đầu: quan sát nốt ♭7 của V7 nghiêng về bậc 3 của I (V7 → I). Vòng ii–V–I sẽ học sau.',
    },
    inG: {
      intro: 'Trong giọng G: V là D và V7 là D7. Để ý chỉ có một ngón tay thay đổi vị trí.',
    },
    inD: {
      intro: 'Trong giọng D: V là A và V7 là A7. Nhấc một ngón tay ra để tạo nốt ♭7.',
    },
    inA: {
      intro: 'Trong giọng A: V là E và V7 là E7. Tương tự, chỉ cần đổi một ngón tay.',
    },
    loop: {
      intro: 'Quạt I–IV–V7–I ở 85 BPM. Lắng nghe V7 dẫn thẳng vòng hợp âm về I. Hãy thử ở các giọng G, D và A.',
    },
    with7: {
      intro: 'Giai điệu quen thuộc, lần này có thêm V7: hãy dùng nó ở nơi giai điệu chuẩn bị về nhà.',
      ask: 'Chọn hợp âm cho mỗi ô',
      result: 'Đúng {right} trên {total} ô.',
      allRight: 'Hoàn toàn chính xác: bạn đã dùng V7 để dẫn về nhà!',
    },
  },
  check: [
    {
      question: 'Nốt bổ sung vào hợp âm trưởng để tạo thành hợp âm 7 là…',
      options: ['♭7', '7', '6'],
      why: 'Hợp âm dominant 7 thêm nốt ♭7, cách root một cung bên dưới, vào triad trưởng (1, 3, 5, ♭7).',
    },
    {
      question: 'Trong giọng G, hợp âm V7 là…',
      options: ['D7', 'G7', 'C7'],
      why: 'Hợp âm V trong giọng G major là D, do đó hợp âm V7 là D7.',
    },
    {
      question: 'Hợp âm V7 tạo sức căng muốn dẫn về nhất là…',
      options: ['I', 'IV', 'vi'],
      why: 'Nốt ♭7 của hợp âm V7 tựa trực tiếp vào bậc 3 của hợp âm I, tạo lực hút mạnh mẽ về nhà ở I.',
    },
  ],
  canDo: [
    'Tôi có thể nghe ra sự khác biệt giữa hợp âm trưởng thường và hợp âm 7.',
    'Tôi có thể chơi D7, A7 và E7.',
    'Tôi có thể chơi I–IV–V7–I trong ba giọng (G, D, A).',
  ],
};
