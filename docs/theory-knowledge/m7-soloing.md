# M7 · Solo

Mục tiêu: người học solo trên một vòng hợp âm mà **nghe có chủ đích**: biết chọn âm giai, biết nhắm vào nốt hợp âm khi hợp âm đổi, và xây câu từ một ý nhỏ. Đây là đích đến của cả bộ kiến thức.

---

## K7.1 Chọn âm giai

**Cốt lõi.** Bắt đầu từ giọng của bài (K5.1). Giọng trưởng thì âm giai trưởng hoặc pentatonic trưởng. Giọng thứ thì pentatonic thứ. Blues thì pentatonic thứ, thêm nốt blue (K6.1). Chi tiết chọn pentatonic ở K3.7.

**Dạy trong Theory.** `/theory/solo` bước 1: bốn backing (blues 12-bar, pop I–V–vi–IV, rock i–VII–VI–VII, jazz ii–V–I), đổi được giọng và tempo; cần đàn hiện box 1 của scale hợp. Nút "scale sai" đổi sang pentatonic ngược tính chất và chỉ ra những nốt nằm ngoài giọng (với blues: major pentatonic không sai, chỉ sáng hơn).

**Cần trước:** K3.7, K5.1. **Nguồn:** ch. 19.

## K7.2 Nốt đích theo hợp âm

**Cốt lõi.** Âm giai cho biết nốt nào "được phép", còn hợp âm đang vang cho biết nốt nào "đúng nhất" lúc đó. Ở phách mạnh và khi kết câu, dừng trên nốt của hợp âm (1, 3, 5, 7). Các nốt khác của âm giai dùng để đi qua. Khi hợp âm đổi, nhắm vào bậc 3 của hợp âm mới là cách rõ nhất để người nghe nhận ra sự thay đổi.

**Dữ liệu.** Với mỗi hợp âm trong vòng: tập nốt hợp âm = công thức (K4.1, K4.3) giao với âm giai đang dùng. Nốt đích ưu tiên: 3, rồi 1, rồi 5, rồi 7.

**Dạy trong Theory.** `/theory/solo` bước 2: trong box 1, nốt của hợp âm đang vang sáng lên, ghi bậc trong hợp âm, và đổi theo backing; khi dừng thì chọn từng hợp âm. Bước 3: đường guide tone, mỗi bar một nốt đích, đi ít nhất có thể (`closestPath()` theo cao độ). Thứ tự ưu tiên ở bước này là 3, rồi 7, rồi 1, rồi 5: guide tone là bậc 3 và 7; trên blues trong box thứ không có bậc 3 trưởng nên đường nốt dùng ♭7. App Luyện tập đã có tính năng nốt đích; phần nối hai app để sau.

**Cần trước:** K4.1, K5.4, K3.4. **Nguồn:** ch. 19.

## K7.3 Phong cách

**Cốt lõi.** Mỗi phong cách có thói quen riêng. Rock: pentatonic, nhiều nhéo dây. Blues: pentatonic với nốt blue, nhiều móc kép, nhiều nhéo và rung. Jazz: nhiều nốt màu và nốt hợp âm theo từng hợp âm.

**Dạy trong Theory.** `/theory/solo` bước 1, mỗi backing kèm một câu về cách chơi của phong cách đó.

**Nguồn:** ch. 19.

## K7.4 Xây câu

**Cốt lõi.** Mẫu luyện ngón (K3.6) là điểm khởi đầu, nhưng một chuỗi mẫu không thành câu solo. Câu hay thường bắt đầu từ một ý nhỏ (2–4 nốt), lặp lại, rồi biến đổi nhịp, cao độ hoặc kết thúc. Khoảng lặng là một phần của câu: chừa chỗ trống cho ý vừa chơi được nghe rõ.

**Dạy trong Theory.** `/theory/solo` bước 4: mỗi nhóm bốn bar là ý nhạc (3–4 nốt, `motif()`), lặp lại, đổi đoạn kết sang một nốt của hợp âm bar thứ ba (`landOn()`), rồi một bar trống để người học đáp. Tab có chữ đếm dưới mỗi nốt. Phần app biến đổi câu của người học cần thu câu chơi, để chung với K7.6 ở phiên 5.1.

**Cần trước:** K7.2, K1.2. **Nguồn:** ch. 19.

## K7.5 Luyện tai

**Cốt lõi.** Nghe một câu ngắn rồi chơi lại. Bắt đầu từ câu ngắn với nốt đầu được cho sẵn, rồi tăng dần độ khó. Nhìn hợp âm đang vang để đoán nốt.

**Dạy trong Theory.** `/theory/solo` bước 5: app phát một ý 3–4 nốt (`motif()`, có nhịp) trong box 1 của A minor pentatonic; người học bấm lại trên cần theo thứ tự, đúng nốt nào sáng nốt đó. Bấm sai thì app nói nốt kế cao hơn hay thấp hơn. Trợ giúp: cho sẵn nốt đầu, hoặc không. Điểm được lưu và hiện ở `/theory/review` (bài đố `solo-ear`). Chưa có: câu dài hơn, box khác, giọng khác.

**Cần trước:** K3.4. **Nguồn:** ch. 19.

## K7.6 Thử và nghe lại

**Cốt lõi.** Tai học chọn nốt bằng cách nghe kết quả: thử một ý, nghe lại, giữ cái nghe hay và bỏ cái không hợp. Một nốt nghe chói thường chỉ cần đổi chỗ dừng hoặc đi tiếp sang nốt bên cạnh.

**Dạy trong Theory.** `/theory/solo` bước 6: bấm Thu, backing chạy đúng một lượt; mỗi nốt bấm trên box được lưu với phách móc đơn nó rơi vào (không cần micro). Nghe lại thì backing chạy lại kèm bản thu, nốt nào đang vang sáng trên cần. Mỗi bar của lưới hợp âm được đánh dấu theo **nốt đầu tiên** chơi trong bar: ✓ kèm bậc nếu là nốt của hợp âm, ✗ nếu không, để trống nếu nghỉ (K7.2). Dưới lưới là tab của bản thu và tổng kết (bao nhiêu bar đáp vào nốt của hợp âm, bao nhiêu nốt là nốt của hợp âm). Bản thu không được lưu khi rời trang.

**Nguồn:** ch. 19.
