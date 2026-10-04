# M3 · Pentatonic

Mục tiêu: người học chơi được pentatonic ở mọi giọng trên toàn cần đàn, và hiểu vì sao cùng một hình dùng được cho cả giọng trưởng lẫn thứ. Bài **Bản đồ Pentatonic** (`/theory/pentatonic-map`, phiên 0.3, dựng từ bản demo [`docs/prototypes/ban-do-pentatonic.html`](../prototypes/ban-do-pentatonic.html)) đã dạy K3.1–K3.5 cùng K0.2, K0.4, K0.7. Bài đầy đủ (phiên 2.1) mở rộng từ đó. Các chỗ "bước N" dưới đây là bước của bài này.

---

## K3.1 Pentatonic trưởng

**Cốt lõi.** Pentatonic là âm giai 5 nốt. Pentatonic trưởng lấy bậc 1, 2, 3, 5, 6 của âm giai trưởng và bỏ bậc 4 và 7. Hai bậc bị bỏ là hai nốt tạo khoảng nửa cung, nên pentatonic không còn khoảng nửa cung nào. Nhờ vậy nó khó nghe "sai", rất hợp để bắt đầu solo.

**Dữ liệu.** Bậc 1 2 3 5 6. Khoảng cách theo phím 2 2 3 2 3. Vị trí so với nhà: 0 2 4 7 9.

**Cần trước:** K2.1. **Nguồn:** ch. 11.

## K3.2 Pentatonic thứ

**Cốt lõi.** Pentatonic thứ là âm giai chính của rock và blues. Công thức đi từ nhà: +3, +2, +2, +3, +2 phím.

**Dữ liệu.** Bậc 1 b3 4 5 b7. Khoảng cách 3 2 2 3 2. Vị trí so với nhà: 0 3 5 7 10.

**Dạy trong Theory.** Bước 2 của Bản đồ Pentatonic: phát công thức trên dây 6 từ nhà phím 5 (A), các cung hiện dần kèm tiếng.

**Cần trước:** K0.2. **Nguồn:** ch. 11.

## K3.3 Cùng nốt, khác nhà

**Cốt lõi.** Pentatonic thứ của một nốt và pentatonic trưởng của nốt cao hơn 3 phím dùng **cùng 5 nốt**. La thứ pentatonic và Đô trưởng pentatonic là một ví dụ. Đây là K2.8 áp dụng cho pentatonic. Trưởng hay thứ do nốt bạn coi là nhà quyết định: nốt bạn bắt đầu, dừng lại và nhấn vào.

**Dữ liệu.** Nhà trưởng = nhà thứ + 3 nửa cung.

**Dạy trong Theory.** Bước 5 của Bản đồ Pentatonic: bật trưởng/thứ, các chấm đứng yên, chỉ màu nhà đổi chỗ (xanh cho thứ, hổ phách cho trưởng).

**Cần trước:** K3.1, K3.2, K2.8. **Nguồn:** ch. 11.

## K3.4 Năm hộp

**Cốt lõi.** Bấm pentatonic với đúng 2 nốt trên mỗi dây sẽ được một hộp gọn trong khoảng 4 phím. Bắt đầu từ mỗi nốt trong 5 nốt cho ra 5 hộp. Năm hộp nối nhau như gạch lát: hai hộp kề nhau dùng chung một cạnh. Sau phím 12, chuỗi hộp lặp lại.

**Dữ liệu.**
- Quy ước đánh số: **hộp 1** là hộp có nhà thứ trên dây 6 dưới ngón trỏ. Hộp k bắt đầu từ nốt thứ k của âm giai (theo thứ tự đi lên) trên dây 6. Ở giọng trưởng vẫn giữ cách đánh số này, giống sách (cùng hình cho C và Am).
- Ví dụ La thứ: hộp 1 khoảng phím 5–8, hộp 2 khoảng 7–10, hộp 3 khoảng 9–13, hộp 4 khoảng 12–15, hộp 5 khoảng 2–5 (cũng là 14–17).
- Lõi sinh hộp bằng thuật toán: lấy 12 nốt liên tiếp của âm giai từ điểm xuất phát, chia 2 nốt cho mỗi dây từ dây 6 lên dây 1. Không dùng bảng hình cứng. Mỗi hộp đều có chỗ lệch một phím ở dây B (K0.4); thuật toán tự xử lý vì nó tính theo cao độ.

**Dạy trong Theory.** Bước 3 của Bản đồ Pentatonic: khung hộp trượt mượt từ hộp này sang hộp khác, các nốt ngoài hộp mờ đi. Nút "phát hộp" chạy lên rồi xuống.

**Bẫy.** Đừng bắt học thuộc cả 5 hộp cùng lúc. Thuộc hộp 1 trước, rồi chỉ tập phần nối 1→2 (K3.5).

**Cần trước:** K0.4, K3.2. **Nguồn:** ch. 11.

## K3.5 Nối hộp và đổi giọng

**Cốt lõi.** Hình không bao giờ đổi. Muốn đổi giọng, chỉ cần dời cả bộ hộp sao cho nhà thứ nằm đúng nốt mới trên dây 6. Muốn đi dọc cần, tập phần chung giữa hai hộp kề nhau rồi trượt sang.

**Dữ liệu.** Độ dời (phím) = vị trí nhà mới trên dây 6 − vị trí nhà cũ, lấy trong khoảng −6…+6 để đi quãng ngắn nhất.

**Dạy trong Theory.** Bước 4 của Bản đồ Pentatonic: bảng tìm nhà và chế độ tự trượt qua các giọng. Bài nối hộp: chỉ hiện hai cột phím chung của hai hộp kề nhau.

**Cần trước:** K0.7, K3.4. **Nguồn:** ch. 11.

## K3.6 Mẫu luyện ngón

**Cốt lõi.** Chạy âm giai thẳng lên xuống chưa đủ. Mẫu luyện ngón đi theo nhóm để tay và tai quen mọi đường trong hộp. Các mẫu này là bài tập, chưa phải câu solo (K7.4).

**Dữ liệu.** Đánh số các nốt của hộp theo thứ tự cao độ 1, 2, 3, …:
- bộ 4: 1-2-3-4, 2-3-4-5, 3-4-5-6, …
- bộ 3: 1-2-3, 2-3-4, 3-4-5, …
- cách một: 1-3, 2-4, 3-5, … (sách gọi "đôi 3")

Mỗi mẫu có chiều lên và chiều xuống. Lõi sinh mẫu từ thứ tự nốt, không chép tab.

**Dạy trong Theory.** Mẫu chạy trên cần với metronome. Người học chọn mẫu, tempo và hộp. Có thể tăng tempo dần sau mỗi vòng đúng.

**Cần trước:** K3.4, K1.1. **Nguồn:** ch. 11.

## K3.7 Chọn pentatonic theo bài

**Cốt lõi.**
- Bài giọng thứ: pentatonic thứ của nốt nhà bài.
- Bài giọng trưởng: pentatonic trưởng của nốt nhà bài. Mẹo: dùng hình pentatonic thứ dời xuống 3 phím.
- Blues (hợp âm trưởng hoặc 7): pentatonic thứ của nốt nhà vẫn dùng được và tạo màu blues (K6.2).

**Dạy trong Theory.** Một vòng đệm ngắn và câu hỏi "dùng hình nào?". Người học kéo hộp vào đúng chỗ, rồi nghe thử.

**Cần trước:** K3.3. **Nguồn:** ch. 11, 13.
