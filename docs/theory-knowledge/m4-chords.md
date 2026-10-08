# M4 · Hợp âm

Mục tiêu: người học hiểu **hợp âm là các quãng xếp chồng lên nốt nhà**. Từ một công thức, họ tự dựng được hợp âm ở bất kỳ đâu trên cần, thay vì học thuộc từng thế bấm.

Mọi tên nốt trong hợp âm do lõi tính từ công thức (K2.5), không gõ tay.

---

## K4.1 Hợp âm ba

**Cốt lõi.** Hợp âm ba gồm 3 nốt: nhà, bậc 3 và bậc 5. Đổi bậc 3 hoặc bậc 5 lên xuống nửa cung cho ra bốn loại chính. Bậc 3 quyết định trưởng hay thứ. Hợp âm sus thay bậc 3 bằng bậc 2 hoặc bậc 4, nên không trưởng cũng không thứ, nghe "lửng".

**Dữ liệu.**

| Loại | Công thức | Ký hiệu (gốc C) | Nốt (gốc C) |
| --- | --- | --- | --- |
| Trưởng | 1 3 5 | C | C E G |
| Thứ | 1 b3 5 | Cm | C E♭ G |
| Tăng | 1 3 #5 | C+, Caug | C E G♯ |
| Giảm | 1 b3 b5 | C°, Cdim | C E♭ G♭ |
| Sus4 | 1 4 5 | Csus4 (sách: Csus) | C F G |
| Sus2 | 1 2 5 | Csus2 | C D G |

**Dạy trong Theory.** Bài `/theory/chords`. Bước 1: chồng quãng trên ba dây kề nhau (gốc dây 5, bậc 3 dây 4, bậc 5 dây 3; lõi `triadShape()`), chấm nhà sáng trước, rồi bậc 3, rồi bậc 5, mỗi lớp ghi tên quãng (K2.3). Bước 2: bốn tính chất trên 12 nốt gốc; từ trưởng, thứ và tăng dời một chấm một phím, giảm dời hai chấm (bậc 3 và 5). Nốt gốc đặt từ phím 4 trở lên vì ♭5 của hợp âm giảm nằm lệch trái nốt gốc 4 phím. Bước 3: sus2/sus4 và "sus rồi trưởng". Bước 5: bài đố dựng hợp âm từ công thức, quãng 8 nào cũng tính.

**Cần trước:** K2.3. **Nguồn:** ch. 5, 6, 13, 20.

## K4.2 Power chord

**Cốt lõi.** Power chord chỉ có nhà và bậc 5 (thường thêm nhà cao hơn một quãng 8). Không có bậc 3 nên không trưởng không thứ. Vì vậy nó nghe sạch khi chơi với tiếng méo (distortion), và là nền của rock.

**Dữ liệu.** Công thức 1 5 (8), ký hiệu C5. Hình gốc dây 6 hoặc dây 5: nhà, dây kế trên +2 phím (K2.4), thêm dây kế nữa +2 phím cho quãng 8. Bỏ nốt cao nhất thì được power chord 2 nốt.

**Dạy trong Theory.** Bài `/theory/electric` bước 1: hình power chord (lõi `powerChord()`, dựng từ `shapeAt`) như một con dấu, bấm phím nào trên dây 6 hoặc dây 5 thì con dấu trượt tới đó; tên hợp âm theo quy tắc tên giọng (B♭5, F♯5); nghe cùng hình dưới quãng 3 trưởng rồi quãng 3 thứ. Bước 2: riff ngắn với chặn tiếng (K6.5). Bước 5: boogie blues là power chord có ngón trên đi 5–6–♭7–6 (lõi `BOOGIE`).

**Cần trước:** K2.4, K0.7. **Nguồn:** ch. 15.

## K4.3 Hợp âm 7

**Cốt lõi.** Thêm bậc 7 lên hợp âm ba được hợp âm 4 nốt. Ba loại hay gặp nhất là 7 trưởng (êm, sáng), 7 thứ (mềm) và 7 át (căng, muốn đi tiếp về hợp âm I, xem K5.5).

**Dữ liệu.**

| Loại | Công thức | Ký hiệu (gốc C) | Nốt (gốc C) |
| --- | --- | --- | --- |
| 7 trưởng | 1 3 5 7 | Cmaj7, CΔ7 | C E G B |
| 7 thứ | 1 b3 5 b7 | Cm7, C−7 | C E♭ G B♭ |
| 7 át | 1 3 5 b7 | C7 | C E G B♭ |
| 7 tăng | 1 3 #5 b7 | C+7, Caug7 | C E G♯ B♭ |
| Nửa giảm | 1 b3 b5 b7 | Cm7♭5, Cø7 | C E♭ G♭ B♭ |
| 7 giảm | 1 b3 b5 bb7 | C°7, Cdim7 | C E♭ G♭ B𝄫 |

Sách in nhầm vài dòng của bảng này (xem Đính chính trong README).

**Dạy trong Theory.** Bài `/theory/chord-table`. Bước 1: sáu hợp âm 7 chồng bốn nốt trên dây 5–2 (lõi `stackShape()`), ghi ba quãng 3 chồng lên nhau. Bước 2: bảng công thức tương tác: chọn nốt gốc và loại hợp âm, cần đàn hiện mọi vị trí của các nốt, tô màu theo vai trò (gốc, 3, 5, 7, nốt màu). Bước 3: hợp âm 7 và m11 dây buông, so với hợp âm ba bên dưới, và hình m11 di động (hình A, Dm11 = x55565).

**Cần trước:** K4.1, K2.5. **Nguồn:** ch. 17, 20.

## K4.4 Hợp âm mở rộng và hợp âm thêm nốt

**Cốt lõi.** Tiếp tục xếp quãng 3 lên trên hợp âm 7 được bậc 9, 11, 13 (K2.6). Các nốt này gọi là nốt màu (K4.9). "Add" nghĩa là thêm nốt mà không cần bậc 7.

**Dữ liệu.**

| Loại | Công thức | Ký hiệu |
| --- | --- | --- |
| 9 trưởng | 1 3 5 7 9 | Cmaj9 |
| 9 thứ | 1 b3 5 b7 9 | Cm9 |
| 9 át | 1 3 5 b7 9 | C9 |
| 11 thứ | 1 b3 5 b7 9 11 | Cm11 |
| 11 át | 1 3 5 b7 9 11 | C11 |
| Thêm 2 | 1 2 3 5 | Cadd2, Cadd9 |

Khi bấm trên guitar, thường bỏ bớt nốt (hay bỏ bậc 5, với 11 át thường bỏ bậc 3). Sách gọi một số hợp âm là "hợp âm 2" (C2): bậc 2 được thêm vào, tùy thế bấm có còn bậc 3 hay không. Theory gọi rõ là add2 nếu còn bậc 3, sus2 nếu không.

**Dạy trong Theory.** Bài `/theory/chord-table` bước 2 (nhóm "9, 11, add") và bước 5 (rút gọn). Nốt màu được ghi đúng bậc trong công thức (11 chứ không phải 4), qua `chordToneDegree()`.

**Cần trước:** K4.3, K2.6. **Nguồn:** ch. 12, 18, 20.

## K4.5 Hợp âm dây buông

**Cốt lõi.** Hợp âm dây buông là những thế bấm đầu tiên người học gặp. Theory không dạy chúng như hình để thuộc, mà dùng chúng để **soi công thức**: mỗi chấm được ghi bậc (1, 3, 5, b7…), để người học thấy C, A, G, E, D thực chất là cùng công thức trưởng ở các vị trí khác nhau.

**Dữ liệu.** Bộ hợp âm dây buông của sách: C, C7, D, D7, Dm, E, E7, Em, G, G7, A, A7, Am, B7, Am7, Dm7, Em7, Asus4, Dsus4, Esus4. Chương 12 thêm hợp âm 2 (C2, D2, E2, G2, A2), maj7 dây buông (Amaj7, Cmaj7, Dmaj7, Fmaj7, Gmaj7) và m11 dây buông. Thế bấm cụ thể lấy từ kiến thức chuẩn về guitar, không chép biểu đồ của sách.

**Dạy trong Theory.** Bài `/theory/chords` bước 4: C A G E D, Am Em Dm, Asus4 Dsus4 Esus4, Asus2 Dsus2 với lớp nhãn bậc/tên nốt; đổi giữa E và Em, A và Am, D và Dm thì chỉ bậc 3 đổi chỗ.

**Dữ liệu (cách sinh thế bấm).** Không gõ tay thế bấm. Lõi `openVoicing()`: nốt bass (nốt gốc, hoặc nốt khác cho thế đảo) nằm trên dây thấp nhất có nó trong phím 0–3; mỗi dây cao hơn chơi một nốt của hợp âm trong phím 0–3; trong mọi cách chọn, lấy cách có đủ các nốt thiết yếu với ít nốt bấm nhất (rồi phím thấp nhất); tối đa bốn nốt bấm. Nốt thiết yếu: cả hợp âm ba; với hợp âm lớn hơn là gốc, bậc 3, bậc 7 và nốt màu trên cùng (bậc 5 và nốt màu ở giữa có thể bỏ). Ví dụ: C7 x32310, G7 320001, B7 x21202, Cmaj7 x32000, Am11 x00010, Em11 000000, C/E 032010, G/B x20003. Hợp âm sus là hình trưởng với bậc 3 dời lên bậc 4 (+1 phím) hoặc xuống bậc 2 (−2 phím). Quy tắc cho đúng các thế quen thuộc (C x32010, G 320003, D xx0232…); hợp âm thiếu nốt (C7) hoặc cần năm ngón (F) thì không có thế dây buông. Quy tắc cũng sinh ra vài thế lạ (Cm x31013) nên bài chỉ hiện danh sách hợp âm chọn sẵn.

**Cần trước:** K4.1, K0.3. **Nguồn:** ch. 5, 6, 12.

## K4.6 Hợp âm chặn di động

**Cốt lõi.** Dùng ngón trỏ chặn ngang thay cho lược đàn, một hình dây buông trở thành hình di động. Hai hình chính: hình E (nốt nhà trên dây 6) và hình A (nốt nhà trên dây 5). Tên hợp âm là tên nốt dưới ngón chặn trên dây nhà, nên chỉ cần K0.7 là gọi được tên mọi hợp âm chặn.

**Dữ liệu.** Mỗi hình có các biến thể trưởng, thứ, 7, m7, sus4 (và maj7, m11 ở ch. 12). Biến thể khác nhau ở vị trí bậc 3 và bậc 7, đúng theo bảng ở K4.1 và K4.3.

**Dạy trong Theory.** Bài `/theory/barre`. Bước 1: hình E trượt theo thanh kéo phím 0–12, tên đổi theo nốt dưới ngón chặn trên dây 6. Bước 2–3: sáu biến thể (trưởng, m, 7, m7, maj7, sus4) của hình E và hình A, chấm dời so với hợp âm trưởng được làm nổi, có ghi bậc. Bước 4: bài đố tìm hợp âm (nốt gốc trên dây 6 hoặc 5 đều đúng, hiện cả chỗ thứ hai). Bước 5: vòng I–vi–IV–V, trộn hình E và A để ngón chặn ít di chuyển nhất.

**Dữ liệu (cách sinh thế bấm).** Lõi `barreVoicing()` lấy thế dây buông E hoặc A cùng loại từ `openVoicing()` rồi dời lên tới phím nốt gốc; không gõ tay thế chặn. Kiểm tra với các thế chuẩn: F 133211, Bm x24432, C7 x35353, Cmaj7 x35453. m11 chưa có vì quy tắc dây buông không sinh được Em11/Am11 đúng. Vòng hợp âm: hợp âm đầu ở hình E tại phím nhà; các hợp âm sau chọn hình và quãng 8 sao cho tổng quãng đường ngón chặn qua cả vòng là ngắn nhất.

**Bẫy.** Người học hay coi mỗi biến thể là một hình mới. Luôn hiện các bậc để thấy chúng chỉ khác nhau một hai nốt.

**Cần trước:** K4.5, K0.7. **Nguồn:** ch. 7, 8, 12.

## K4.7 Thế đảo và hợp âm có bass riêng

**Cốt lõi.** Ký hiệu G/B nghĩa là hợp âm G với nốt thấp nhất là B. Khi nốt bass thuộc hợp âm, đó là **thế đảo**. Khi nốt bass không thuộc hợp âm (F/G), đó là hợp âm có bass riêng.

**Dữ liệu.** Đảo 1: bậc 3 ở bass. Đảo 2: bậc 5 ở bass. Đảo 3 (hợp âm 7): bậc 7 ở bass.

**Dạy trong Theory.** Bài `/theory/chord-table` bước 4: chọn hợp âm và nốt bass (1, 3, 5, hoặc 7), nốt bass sáng màu riêng; ví dụ đi bass C → G/B → Am → G. Thế bấm do `openVoicing(chord, { bass })` sinh. Hợp âm có bass ngoài hợp âm (F/G) chưa dạy.

**Cần trước:** K4.1. **Nguồn:** ch. 20.

## K4.8 Thay thế đơn giản và gặp hợp âm lạ

**Cốt lõi.** Có thể làm hợp âm "đậm" hơn mà vẫn đúng: thay hợp âm trưởng bằng add2, thay hợp âm thứ bằng m11. Khi gặp một hợp âm chưa biết, có ba cách: dựng nó từ công thức, tra cứu, hoặc rút gọn về hợp âm ba hay hợp âm 7 bằng cách bỏ các nốt màu.

**Dạy trong Theory.** Bài `/theory/chord-table` bước 5: bậc thang rút gọn (lõi `simplifyChord()`: bỏ nốt màu cao nhất, mỗi bậc phải là một hợp âm trong bảng): G11 → G9 → G7 → G, Cm11 → Cm9 → Cm7 → Cm, Fmaj9 → Fmaj7 → F, Bm7♭5 → B°, Eadd2 → E. Chưa có hợp âm 13 trong bảng.

**Cần trước:** K4.3, K4.4. **Nguồn:** ch. 12, 20.

## K4.9 Nốt màu

**Cốt lõi.** Nốt màu là nốt thêm vào hợp âm cơ bản để nó giàu hơn, lấy từ âm giai trưởng của nốt nhà (9, 11, 13), đôi khi được nâng hoặc hạ (♯9, ♭9). Jazz dùng nhiều nốt màu, rock thì ít.

**Cần trước:** K4.4. **Nguồn:** ch. 18.
