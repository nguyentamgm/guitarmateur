# M6 · Blues và kỹ thuật guitar điện

Mục tiêu: người học biến pentatonic thành âm thanh guitar điện thật: thêm nốt blue, nhéo dây đúng cao độ, luyến, trượt, chặn tiếng, double stop.

Mọi kỹ thuật cần được **nghe** và **thấy cao độ thay đổi theo thời gian**. Theory vẽ một đường cong cao độ phía trên tab cho các kỹ thuật này.

---

## K6.1 Âm giai blues

**Cốt lõi.** Âm giai blues thứ là pentatonic thứ thêm bậc b5. Nốt b5 là nốt đi qua, tạo độ căng, hiếm khi dùng để dừng. Âm giai blues trưởng là pentatonic trưởng thêm bậc b3, thường trượt hoặc luyến từ b3 lên 3.

**Dữ liệu.**
- Blues thứ: 1 b3 4 b5 5 b7, khoảng cách 3 2 1 1 3 2.
- Blues trưởng: 1 2 b3 3 5 6, khoảng cách 2 1 1 3 2 3.
- Trong mỗi hộp pentatonic (K3.4), b5 nằm giữa bậc 4 và bậc 5.

**Dạy trong Theory.** Bài `/theory/blues` bước 1: năm hộp pentatonic với một chấm nét đứt cho nốt blue (A blues thứ hoặc C blues trưởng, cùng các hộp). Bật tắt nốt blue và nghe câu ngắn từ nốt nhà lên bậc 5 rồi về, có và không có nốt blue. Bước 3 nói tới K6.2: A thứ pentatonic chơi trên cả ba hợp âm 7 của blues 12 ô.

**Bẫy.** Sách gộp hai âm giai thành một âm giai 9 nốt. Theory tách riêng (xem Đính chính trong README).

**Cần trước:** K3.2, K3.1. **Nguồn:** ch. 13.

## K6.2 Nốt blue

**Cốt lõi.** So với âm giai trưởng, ba nốt b3, b5, b7 là các nốt blue. Chơi pentatonic thứ trên hợp âm trưởng hoặc 7 át (như trong blues 12 ô) đặt b3 lên trên hợp âm có bậc 3 trưởng. Chính sự va chạm này tạo ra âm thanh blues. Người chơi hay nhéo nhẹ b3 lên gần 3.

**Cần trước:** K6.1, K5.4. **Nguồn:** ch. 13.

## K6.3 Nhéo dây

**Cốt lõi.** Gảy một nốt rồi đẩy dây sang ngang để cao độ tăng lên nửa cung hoặc một cung. Luôn phải tới **đúng** cao độ đích. Dùng ngón 3 có ngón 1 và 2 đỡ phía sau. Nhả nhéo là đưa dây về cao độ gốc. Nhéo trước là đẩy dây lên trước rồi mới gảy và nhả.

**Dữ liệu.** Các nhéo tự nhiên trong pentatonic thứ (nhéo tới một nốt khác của âm giai):
- bậc 4 → bậc 5 (một cung);
- bậc b7 → bậc 1 (một cung);
- bậc b3 → bậc 4 (một cung);
- bậc b3 → gần bậc 3 (nhéo nhẹ, khoảng ¼ đến ½ cung, màu blues).

Kiểm tra: nốt đích nằm 2 phím trên (một cung) hoặc 1 phím trên (nửa cung) cùng dây.

**Dạy trong Theory.** Bài `/theory/blues` bước 4: chọn một trong bốn nhéo (nốt nhéo là nốt cao nhất của bậc đó trong hộp 1), phát nốt đích rồi phát nhéo; đường cong cao độ (`ui/PitchCurve.tsx`) vẽ theo thời gian với vạch đích nét đứt. Âm thanh nhéo là `playbackRate` tăng dần trên cùng tiếng gảy (`bend()` trong `core/audio`). Bài tai: nhéo đủ, thiếu hay thừa một phần tư cung; nhéo nhẹ ♭3 không đưa vào bài đố vì không có đích.

**Cần trước:** K3.4. **Nguồn:** ch. 14.

## K6.4 Luyến, trượt, rung và tapping

**Cốt lõi.**
- **Luyến lên:** gảy nốt thấp, rồi "đập" ngón xuống phím cao hơn mà không gảy lại.
- **Luyến xuống:** gảy nốt cao, rồi kéo ngón ra để nốt thấp hơn đã bấm sẵn kêu lên.
- **Trượt:** giữ ngón ấn và trượt dọc dây sang phím khác. Trượt vào một nốt từ 1–2 phím dưới là cách tạo cảm giác mềm.
- **Rung (vibrato):** lắc cao độ đều quanh nốt, thường ở nốt dài cuối câu.
- **Tapping:** dùng ngón tay phải gõ lên phím như một luyến lên, rồi luyến xuống về nốt tay trái.

**Dữ liệu.** Ký hiệu trên tab: h (luyến lên), p (luyến xuống), / và \ (trượt lên, xuống), b (nhéo), r (nhả), ~ (rung), t (tapping).

**Dạy trong Theory.** Bài `/theory/blues` bước 5: mỗi kỹ thuật có đường cong cao độ riêng (bậc thang cho luyến, dốc liền cho trượt, sóng cho rung) và âm thanh tương ứng: nốt sau của luyến, trượt, nhả là cùng một tiếng gảy đổi cao độ, không gảy lại. Kết thúc bằng một câu mẫu hai ô (ghi theo vị trí trong hộp 1, nên đổi giọng thì câu đi theo) chạy trên nền blues 12 ô, tab ghi h p / b r ~. Tapping chưa dạy.

**Nguồn:** ch. 14.

## K6.5 Chặn tiếng

**Cốt lõi.** Đặt cạnh lòng bàn tay phải nhẹ lên dây ngay sát ngựa đàn. Tiếng thành trầm, đục, ngắn. Đây là âm thanh của riff rock với power chord.

**Dạy trong Theory.** Bật tắt chặn tiếng trên một riff power chord để nghe sự khác biệt. Âm thanh: lọc bớt tần số cao và tắt nhanh hơn.

**Nguồn:** ch. 14.

## K6.6 Double stop, trượt quãng 4, riff

**Cốt lõi.** Double stop là chơi hai nốt cùng lúc. Trong pentatonic, cặp hay dùng là hai nốt trên hai dây kề nhau cùng phím (quãng 4), riêng cặp dây G–B cùng phím là quãng 3 trưởng. Trượt quãng 4 là trượt cả cặp double stop vào vị trí, rất hay gặp trong rock và country. Riff là một câu ngắn lặp lại, thường dựng từ power chord và pentatonic thứ.

**Cần trước:** K2.4, K3.4, K4.2. **Nguồn:** ch. 15.

## K6.7 Quãng 8 kiểu jazz

**Cốt lõi.** Chơi giai điệu bằng hai nốt cách nhau một quãng 8 (hình K0.6, cách hai dây), chặn tiếng dây ở giữa. Âm thanh dày và tròn hơn một nốt đơn.

**Cần trước:** K0.6. **Nguồn:** ch. 14.
