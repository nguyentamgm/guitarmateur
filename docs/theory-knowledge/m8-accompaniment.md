# M8 · Đệm hát bằng tai

Mục tiêu: người học nghe một bài hát và tự tìm được vòng hợp âm để đệm trên guitar bằng tai: nhận ra nhịp đổi hợp âm, hiểu vai trò của các hợp âm chính (I, IV, V), ghép hợp âm theo giai điệu, dùng capo đổi giọng và nhận biết các hợp âm ngoài giọng.

---

## K8.1 Nhịp hòa âm

**Cốt lõi.** Hợp âm thường đổi ở phách 1 của bar, và được giữ trong 1 hoặc 2 bar (đôi khi đổi ở nửa bar). Khi nghe một bài hát để đệm, tai cần nhận ra *thời điểm* đổi hợp âm trước, sau đó mới xác định *hợp âm gì*.

**Dữ liệu.** Vị trí đổi hợp âm rơi vào phách 1 hoặc phách 3 trong bar 4/4; chu kỳ giữ hợp âm thường là 1 hoặc 2 bar.

**Dạy trong Theory.** Buổi học `/theory/s/chord-changes`.

**Cần trước:** K1.1.

## K8.2 Chức năng I, IV, V

**Cốt lõi.** Hợp âm I đóng vai trò root (nghe như về nhà, mang lại cảm giác nghỉ), V tạo sức căng muốn về I, còn IV mang lại cảm giác đi xa khỏi root. Ba hợp âm này đủ để đệm rất nhiều bài hát quen thuộc.

**Dữ liệu.** `diatonicChords()`. Trong giọng trưởng: I (trưởng), IV (trưởng), V (trưởng hoặc dominant 7).

**Dạy trong Theory.** Buổi học `/theory/s/one-four-five`.

**Cần trước:** K5.2, K5.3.

## K8.3 Ghép hợp âm cho giai điệu

**Cốt lõi.** Nốt giai điệu rơi vào phách mạnh thường là nốt của hợp âm đang vang (bậc 1, 3 hoặc 5 của hợp âm đó). Khi tìm hợp âm cho giai điệu, thử I trước, rồi đến V, rồi đến IV. Cách làm này cùng ý với việc nhắm nốt đích khi solo (K7.2).

**Dữ liệu.** Nốt của hợp âm ba gồm bậc 1, 3, 5 (K4.1). Nốt giai điệu ở phách mạnh thường thuộc tập nốt của hợp âm được chọn.

**Dạy trong Theory.** Buổi học `/theory/s/first-song`.

**Cần trước:** K8.2, K4.1.

## K8.4 Đổi giọng và capo

**Cốt lõi.** Khi đổi giọng, số La Mã giữ nguyên còn tên hợp âm thay đổi theo root mới. Kẹp capo ở phím n nâng mọi open chord lên n nửa cung: ví dụ shape của giọng G với capo phím 2 sẽ vang thành giọng A.

**Dữ liệu.** `transpose()`, `majorKeyTonic()`. Capo phím n dịch toàn bộ bài lên n nửa cung mà giữ nguyên shape bấm.

**Dạy trong Theory.** Buổi học `/theory/s/change-key`.

**Cần trước:** K5.3, K0.2.

## K8.5 Hợp âm ngoài giọng thường gặp

**Cốt lõi.** Ba hợp âm mượn hay gặp trong giọng trưởng gồm: ♭VII (trưởng), iv (thứ), và III7 (dominant 7 dẫn vào vi). Người chơi nghe ra chúng nhờ cảm giác "có một hợp âm lạ" xuất hiện ngoài scale của giọng.

**Dữ liệu.** Các hợp âm ngoài giọng thường gặp: ♭VII (trưởng), iv (thứ), III7 (dominant 7).

**Dạy trong Theory.** Buổi học `/theory/s/outside-chords`.

**Cần trước:** K5.2, K4.3.

## K8.6 Quy trình dò hợp âm một bài

**Cốt lõi.** Dò hợp âm của một bài hát gồm năm bước: 1) tìm root của bài; 2) xác định giọng trưởng hay thứ; 3) đếm nhịp để xác định time signature (3 hay 4 phách); 4) thử I, IV, V rồi đến vi ở những chỗ hợp âm đổi; 5) dùng capo hoặc đổi giọng cho vừa giọng hát.

**Dữ liệu.** Năm bước: tìm root → trưởng hay thứ → đếm nhịp (3 hay 4) → thử I, IV, V, vi → đổi giọng hoặc dùng capo.

**Dạy trong Theory.** Buổi học `/theory/s/new-song`.

**Cần trước:** K8.1–K8.4.
