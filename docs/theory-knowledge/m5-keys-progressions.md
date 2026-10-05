# M5 · Giọng và tiến trình

Mục tiêu: người học nhìn một vòng hợp âm và biết nó thuộc giọng nào, các hợp âm đóng vai trò gì, và dịch nó sang giọng khác bằng **số La Mã** thay vì đổi từng tên hợp âm.

---

## K5.1 Giọng

**Cốt lõi.** Giọng của bài là âm giai mà bài lấy làm "nhà": nốt nhà và hợp âm nhà là nơi bài muốn quay về. Theory xác định giọng bằng tai và bằng hợp âm (hợp âm mở đầu, hợp âm kết thúc, hợp âm xuất hiện nhiều nhất), không bằng hóa biểu.

**Dạy trong Theory.** Phát một vòng hợp âm rồi dừng giữa chừng. Người học chọn hợp âm nào nghe "về nhà".

**Cần trước:** K2.1. **Nguồn:** ch. 8, 19.

## K5.2 Hợp âm thuận trong giọng trưởng

**Cốt lõi.** Dựng một hợp âm ba trên mỗi bậc của âm giai trưởng, chỉ dùng nốt của âm giai, bằng cách lấy các nốt cách một (1-3-5, 2-4-6, 3-5-7, …). Kết quả có cùng một mẫu ở mọi giọng: bậc I, IV, V là hợp âm trưởng; bậc ii, iii, vi là hợp âm thứ; bậc vii là hợp âm giảm.

**Dữ liệu.**
- Hợp âm ba: I ii iii IV V vi vii°. Ví dụ ở C: C Dm Em F G Am B°.
- Hợp âm 7: Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiø7. Ví dụ ở C: Cmaj7 Dm7 Em7 Fmaj7 G7 Am7 Bm7♭5.
- Giọng thứ tự nhiên (nhìn từ nhà thứ): i ii° III iv v VI VII.

**Dạy trong Theory.** Âm giai trưởng xếp thành một hàng nốt. Một "khung ba ô" trượt qua từng bậc, gom các nốt cách một thành hợp âm, rồi hợp âm đó hiện ra trên cần và phát tiếng. Màu cho trưởng, thứ, giảm.

**Cần trước:** K2.1, K4.1. **Nguồn:** ch. 15, 18.

## K5.3 Số La Mã

**Cốt lõi.** Gọi hợp âm theo bậc thay vì theo tên: chữ hoa là trưởng, chữ thường là thứ, ° là giảm. Một vòng I–V–vi–IV giữ nguyên ở mọi giọng; chỉ cần đổi nốt nhà. Người chơi thật hay dùng cách này để đổi giọng và nhớ bài.

**Dữ liệu.** Vòng hay gặp: I–IV–V, I–V–vi–IV, ii–V–I, vi–IV–I–V, i–VII–VI (thứ).

**Dạy trong Theory.** Một vòng hợp âm hiện cả tên và số La Mã. Kéo nốt nhà sang giọng khác: tên đổi, số giữ nguyên, các hình chặn trượt theo (K4.6).

**Cần trước:** K5.2. **Nguồn:** ch. 13, 18.

## K5.4 Blues 12 ô

**Cốt lõi.** Blues 12 ô là tiến trình quan trọng nhất cho người chơi guitar điện. Chỉ dùng ba hợp âm I, IV, V, thường đều là hợp âm 7 át, chia thành ba câu 4 ô.

**Dữ liệu.**
- Mẫu cơ bản: | I | I | I | I | IV | IV | I | I | V | IV | I | I |
- Biến thể "đổi sớm": ô 2 chơi IV.
- Biến thể "quay vòng": ô 12 chơi V để quay lại đầu.
- Ví dụ ở A: A7 A7 A7 A7 D7 D7 A7 A7 E7 D7 A7 A7 (hoặc E7 ở ô cuối).
- Thường chơi swing (K1.5).

**Dạy trong Theory.** Bài `/theory/blues` bước 3: lưới 12 ô (ba hàng bốn ô, số La Mã trên, tên hợp âm dưới), ô đang phát sáng lên. Vòng đệm tự sinh kiểu boogie shuffle: nốt gốc trầm với 5 5 6 6 ♭7 ♭7 6 6 phía trên, mỗi cặp móc đơn. Chọn giọng (12 giọng trưởng), bật đổi sớm và quay vòng. Lõi: `twelveBar()` và `bluesChord()` trong `core/music`. Đây là nền cho bài blues (K6.1) và bài solo (K7.2).

**Cần trước:** K5.3, K1.5. **Nguồn:** ch. 13.

## K5.5 Hợp âm át về nhà, và II–V–I

**Cốt lõi.** Hợp âm V7 (hợp âm át) rất muốn đi về hợp âm I, ví dụ G7 → C. Thêm hợp âm ii trước V được II–V–I, tiến trình phổ biến nhất của jazz: Dm7 → G7 → Cmaj7. Muốn "dẫn" vào bất kỳ hợp âm nào, có thể đặt II–V của chính hợp âm đó ngay trước nó.

**Dữ liệu.** II–V tới hợp âm X: (bậc 2 của X)m7 → (bậc 5 của X)7 → X. Ví dụ dẫn tới F: Gm7 → C7 → F.

**Dạy trong Theory.** Một vòng hợp âm đơn giản; nút "thêm II–V" chèn hai hợp âm trước hợp âm đích, nghe trước/sau.

**Cần trước:** K5.2, K4.3. **Nguồn:** ch. 18.

## K5.6 Giọng song song trong tiến trình

**Cốt lõi.** Giọng trưởng và giọng thứ song song dùng chung bộ hợp âm (K2.8). Hợp âm vi của giọng trưởng chính là hợp âm i của giọng thứ. Nhiều bài đi qua lại giữa hai nhà này. Khi solo, chọn pentatonic theo nhà đang "thắng" (K3.7).

**Cần trước:** K2.8, K5.2. **Nguồn:** ch. 8, 11.
