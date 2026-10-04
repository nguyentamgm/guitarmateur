# M1 · Nhịp

Mục tiêu: người học giữ được phách, đếm được, và chơi đúng các nhóm nốt thường gặp mà **không cần khuông nhạc**. Theory dạy nhịp bằng âm thanh và một lưới thời gian.

---

## K1.1 Phách, tempo, ô nhịp

**Cốt lõi.** Phách là nhịp đập đều của bài, thứ bạn gõ chân theo. Tempo là số phách mỗi phút (BPM). Phách được gom thành ô nhịp. Số chỉ nhịp 4/4 nghĩa là mỗi ô có 4 phách và nốt đen dài một phách. Phần lớn rock, pop, blues dùng 4/4.

**Dữ liệu.** Thời lượng một phách (giây) = 60 / BPM.

**Dạy trong Theory.** Metronome có đèn chạy qua 4 ô vuông của một ô nhịp; phách 1 được nhấn mạnh hơn bằng âm và màu.

**Nguồn:** ch. 2.

## K1.2 Độ dài nốt và khoảng lặng

**Cốt lõi.** Nốt và khoảng lặng có cùng hệ độ dài. Chỗ không chơi cũng là một phần của nhịp, nên khoảng lặng cần chính xác như nốt. Chấm dôi làm nốt dài thêm một nửa. Dấu nối nối hai nốt cùng cao độ thành một nốt dài: chỉ gảy nốt đầu.

**Dữ liệu.** Tính theo phách trong 4/4: tròn 4, trắng 2, đen 1, móc đơn ½, móc kép ¼. Chấm dôi: trắng chấm 3, đen chấm 1½, tròn chấm 6. Lặng cùng tên có cùng độ dài.

**Dạy trong Theory.** Lưới 16 ô cho một ô nhịp (mỗi ô một móc kép), vẽ bằng `ui/BeatGrid.tsx`. Bài `/theory/rhythm` lấp ô nhịp bằng một loại nốt; phần dư cuối ô (sau nốt trắng chấm dôi) thành một khoảng lặng. Một nốt là một thanh dài theo số ô nó chiếm; khoảng lặng là ô trống. Người học bấm vào ô để bật tắt nốt và nghe ngay. Thay ký hiệu nốt bằng độ dài thanh.

**Bẫy.** Đừng dạy hình ký hiệu nốt (đầu tròn, đuôi, móc). Nếu cần, chỉ để ở dạng tra cứu.

**Nguồn:** ch. 2, 3, 16.

## K1.3 Đếm

**Cốt lõi.** Đếm to giúp giữ chỗ trong ô nhịp. Phách đếm bằng số, nửa phách bằng "và", phần tư phách bằng "1 e và a".

**Dữ liệu.** Móc đơn: "1 và 2 và 3 và 4 và". Móc kép: "1 e và a 2 e và a …". Liên ba: "1 trip let 2 trip let" (K1.5).

**Dạy trong Theory.** Chữ đếm hiện dưới lưới và sáng theo con trỏ phát. Có chế độ chỉ phát click để người học tự đếm.

**Nguồn:** ch. 3.

## K1.4 Quạt dây và gảy theo con lắc

**Cốt lõi.** Tay phải luôn chuyển động lên xuống đều như con lắc, kể cả khi không chạm dây. Phách chính đi xuống, nửa phách đi lên. Gặp dấu nối hoặc khoảng lặng, tay vẫn đi nhưng không chạm dây. Quạt xuống thì qua đủ dây, quạt lên thì chỉ vài dây trên. Trọng âm là gảy mạnh hơn ở một số phách để tạo nhịp điệu.

**Dữ liệu.** Mẫu quạt mô tả bằng 8 ô (móc đơn) hoặc 16 ô (móc kép), mỗi ô là xuống (D), lên (U) hoặc trượt qua không chạm (–). Ví dụ phổ biến: D – D U – U D U.

**Dạy trong Theory.** Mũi tên lên/xuống chạy theo lưới; mũi tên "ma" mờ cho lượt tay đi mà không chạm dây. Người học tự tạo mẫu quạt bằng cách bấm ô. Bài `/theory/rhythm` quạt trên dây buông (quạt xuống cả 6 dây, quạt lên 3 dây mỏng) để chưa phải bấm hợp âm.

**Cần trước:** K1.2. **Nguồn:** ch. 9, 16.

## K1.5 Liên ba, swing và shuffle

**Cốt lõi.** Liên ba là ba nốt đều nhau trong một phách. Swing (hay shuffle) chơi cặp móc đơn thành dài–ngắn, như hai phần ba và một phần ba của liên ba. Đây là cảm giác chính của blues.

**Dữ liệu.** Swing chuẩn: nốt đầu chiếm ⅔ phách, nốt sau ⅓. Có thể dùng một hệ số swing liên tục (0 = thẳng, 1 = liên ba đầy đủ).

**Dạy trong Theory.** Thanh trượt "thẳng ↔ swing" trên cùng một câu nhạc, lưới hiện vị trí nốt dịch chuyển khi kéo. Bài `/theory/rhythm` (phiên 1.2) chưa dạy mục này; nó đến cùng bài blues (phiên 2.2), nơi shuffle là cảm giác chính.

**Cần trước:** K1.3. **Nguồn:** ch. 17 (liên ba), ch. 13 (shuffle blues).
