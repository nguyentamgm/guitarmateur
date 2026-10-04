# Kế hoạch app Theory — chuyển Learn & Master Guitar sang học trực quan

Cập nhật: 2026-10-04 · File này là bản chuẩn của kế hoạch. Bảng tiến độ ở cuối file được cập nhật sau mỗi phiên.

## Mục tiêu và nguyên tắc

Dự án chia thành khoảng 16 phiên làm việc, gom vào 6 giai đoạn. Kết quả là **Theory**, một app riêng chạy ở `guitarmateur.com/theory`, làm song song tiếng Việt và tiếng Anh ngay từ đầu. Mỗi phiên thêm một bài học theo phong cách của Bản đồ Pentatonic, bản demo lưu ở [`docs/prototypes/ban-do-pentatonic.html`](prototypes/ban-do-pentatonic.html).

Cuốn Learn & Master Guitar dạy theo thứ tự cổ điển: đọc khuông nhạc trước, rồi tên nốt từng dây, rồi hợp âm, đến chương 11 mới tới pentatonic. Theory đảo lại thứ tự đó. Mục tiêu là người chơi guitar điện solo được sớm, còn lý thuyết chỉ xuất hiện khi cần cho việc đang tập.

Năm nguyên tắc áp dụng cho mọi bài:

1. **Hình trước, tên sau.** Mọi khái niệm hiện ra trên cần đàn dưới dạng khoảng cách (số phím). Tên nốt và ký hiệu chỉ là một lớp nhãn bật tắt được.
2. **Một bài, một ý.** Mỗi bước có một hình động, một câu kết luận và một thao tác để người học tự thử.
3. **Nghe được.** Bấm vào đâu cũng phát ra tiếng. Nhịp và tiết tấu được dạy bằng âm thanh và lưới thời gian, không dùng khuông nhạc.
4. **Tạm gác lại có chủ đích.** Mỗi trang ghi rõ những gì chưa cần học, để người học không phải tập trung vào mọi thứ cùng lúc.
5. **Viết lại bằng lời của mình.** Sách chỉ là bản đồ kiến thức. Bài học không chép lời văn, bài tập hay bản nhạc có bản quyền của sách.

## Sách gồm những gì

Sách có 20 chương, khoảng 110 trang, lộ trình dự kiến hơn 45 tuần. Khoảng một phần năm số trang (chương 2–4, khoảng 24 trang) dành cho đọc khuông nhạc và điền tên nốt, còn pentatonic phải đến chương 11 mới xuất hiện. Bảng dưới đây xếp mỗi chương vào một trong ba cách xử lý: giữ và vẽ lại, rút gọn thành công cụ, hoặc tạm gác lại.

| Chương | Nội dung trong sách | Cách xử lý | Vào module |
| --- | --- | --- | --- |
| 1 | Tên dây, cầm phím, đọc tab, hợp âm C, G7 | Giữ phần tab và tên dây | M0 Cần đàn |
| 2–4 | Khuông nhạc, nốt từng dây, giá trị nốt, dấu nối, chấm dôi, thăng giáng | Thay tên nốt bằng hình quãng 8. Thay khuông nhạc bằng lưới nhịp | M0, M1 Nhịp |
| 5–6 | Hợp âm dây buông, sus, m7 | Giữ, giải thích bằng công thức quãng | M4 Hợp âm |
| 7 | Nửa cung, một cung, hợp âm chặn dây 6, âm giai trưởng | Giữ. Đây là gốc của mọi lý thuyết | M2 Âm giai, M4 |
| 8 | Hợp âm chặn dây 5, giọng, hóa biểu, trưởng/thứ song song | Giữ phần song song. Gác phần đoán giọng qua hóa biểu | M4, M5 Giọng |
| 9 | Quạt dây, quãng nguyên cung | Quạt dây vào lưới nhịp. Quãng thành hình trên cần | M1, M2 |
| 10 | Fingerstyle, cổ điển | Tạm gác lại | — |
| 11 | Pentatonic, 5 kiểu, mẫu bộ 3 và bộ 4 | Giữ toàn bộ. Đã có bản demo | M3 Pentatonic |
| 12 | Hợp âm 2, maj7, m11 di động, hợp âm thay thế | Rút gọn thành bộ hình di động | M4 |
| 13 | Âm giai blues, b5, tiến trình 12 ô, hợp âm ba | Giữ. Ưu tiên cao cho guitar điện | M6 Blues, M4 |
| 14 | Trượt, nhéo dây, luyến âm | Giữ, minh họa bằng đường cong cao độ | M6 |
| 15 | Power chord, country, trượt quãng 4 | Giữ phần power chord và double stop | M6 |
| 16 | Quạt dây móc kép, trọng âm | Rút gọn vào lưới nhịp | M1 |
| 17 | Âm giai 3 nốt mỗi dây, hợp âm 7 | Giữ | M2, M4 |
| 18 | Jazz: maj7/m7 di động, II–V, giai điệu hợp âm | Giữ II–V. Gác phần giai điệu hợp âm | M5 |
| 19 | Solo theo giọng và nốt hợp âm | Giữ. Đây là đích đến của cả bộ | M7 Solo |
| 20 | Bảng công thức hợp âm, đảo, hợp âm trầm | Biến thành công cụ tra cứu tương tác | M4 |

Các track Jam Along trên CD không dùng lại được. Chúng sẽ được thay bằng vòng đệm tự sinh trong trình duyệt.

## Guitarmateur và app Theory

Theory là một app riêng. Nó nằm trong cùng repo và cùng tên miền với Guitarmateur nhưng không dùng chung code. Hai app dành cho hai nhóm người khác nhau:

- **App Luyện tập** ở trang chủ: dành cho người đã hiểu nhạc lý, dùng để tra cứu và tập scale.
- **App Theory**: dành cho người đang học, gồm lý thuyết, bài tập và cách áp dụng trên guitar điện.

Việc nối hai app với nhau để sau. Khảo sát dựa trên commit `4dfdc73` ngày 15/9/2026.

| Phần | App Luyện tập đang có | App Theory làm gì |
| --- | --- | --- |
| Nhạc lý | `src/music/`: tên nốt đúng chính tả, quãng mang cả số bậc và số nửa cung | Viết lõi riêng nhỏ hơn, cùng nguyên tắc, có test. Không import từ app chính |
| Cần đàn | `src/fretboard/` tính hộp bằng thuật toán, `FretboardDiagram` vẽ tĩnh một vùng phím | Cần đàn đầy đủ, có hình động, bấm nốt để nghe |
| Âm thanh | `src/audio/`: sóng sawtooth qua mô phỏng amp, nghe chưa hay | Dựa trên tiếng gảy (Karplus-Strong) của Bản đồ Pentatonic rồi chỉnh thêm |
| Ngôn ngữ | Catalog en và vi, test bắt hai bản phải đủ khóa | Catalog riêng; vi và en viết trong cùng một PR |
| Công cụ | Vite, TypeScript strict, Vitest, ESLint, CI, Vercel | Dùng chung nguyên như vậy |

Sáu quyết định:

1. **App riêng trong cùng repo.** Thêm một entry Vite thứ hai là `theory/index.html`, code nằm trong `theory/src/`. ESLint chặn import qua lại giữa `src/` và `theory/src/`. Bản build ra `dist/theory/` và chạy ở `/theory`. Vì hiện `tsconfig.app.json` chỉ có `"include": ["src"]` và các luật ESLint chỉ nhắm vào `src/...`, phải thêm cấu hình cho `theory/` (ví dụ `tsconfig.theory.json` được tham chiếu từ `tsconfig.json`, glob ESLint cho `theory/**`, và kiểm tra Vitest chạy test trong `theory/`). Nếu không, CI sẽ bỏ qua typecheck và luật import của Theory.
2. **Hai ngôn ngữ cùng lúc.** Mỗi bài có lời giảng `vi` và `en`, viết trong cùng một PR. Một test kiểm tra hai bản có cùng các bước và cùng khóa, để không bản nào bị thiếu.
3. **Âm thanh mới.** Lấy tiếng gảy trong `docs/prototypes/ban-do-pentatonic.html` làm điểm xuất phát, sau đó thêm chỉnh âm sắc, nhéo dây và trượt khi cần. Âm thanh chỉ phát sau khi người dùng thao tác.
4. **Lõi nhạc lý riêng, có test.** Theo cùng nguyên tắc với `src/music/`: làm việc với tên nốt đã đánh vần đúng (âm giai F thứ có B♭, không có A♯), không dùng số thứ tự nốt thuần túy.
5. **Đường dẫn `/theory/<bài>`.** Cần thêm rewrite trong `vercel.json`. Khi offline, service worker hiện tại (`public/sw.js`) trả về trang chủ cho mọi đường dẫn, nên phải sửa để `/theory` trả về trang của Theory.
6. **Sách không vào repo.** File sách và bản tóm tắt được quản lý trên máy và nằm trong `.gitignore`.

Tiến độ học của người dùng được lưu trong localStorage của Theory, dùng khóa khác với app Luyện tập.

## Kiến trúc

Theory nằm trong thư mục `theory/` của repo và có entry Vite riêng. Mỗi bài học là một pull request. CI chạy lint, typecheck, test và build. Vercel tạo bản xem trước cho từng PR, và bài học lên `guitarmateur.com/theory` khi được merge vào main.

```mermaid
flowchart LR
  subgraph local["Ngoài repo (máy bạn, .gitignore)"]
    pdf["Sách PDF<br/>trích một lần (0.1)"] --> sum["Bản tóm tắt sách<br/>đọc 1–2 chương/phiên"]
  end
  subgraph repo["Repo guitarmateur"]
    main["src/ · app Luyện tập<br/>không đụng tới"]
    docs["docs/theory*.md<br/>quy ước + kế hoạch"]
    core["theory/src/core/<br/>nhạc lý, cần đàn, âm thanh, test"]
    lessons["theory/src/lessons/ + ui/<br/>bài học vi + en"]
    core --> lessons
  end
  sum --> lessons
  repo --> pr["Pull request<br/>CI: lint, test, build"] --> preview["Bản xem trước Vercel"] --> prod["guitarmateur.com/theory<br/>khi merge vào main"]
```

Phần việc của Theory gồm bốn phần:

- `theory/src/core/`: nhạc lý, cần đàn, âm thanh, lưới nhịp, tất cả đều có test;
- `theory/src/lessons/`: dữ liệu bài và kịch bản cảnh, mỗi bài kèm lời giảng `vi` và `en`;
- `theory/src/ui/`: cần đàn có hình động, khung trang bài, mục lục, chọn ngôn ngữ;
- `docs/theory.md` ghi quy ước của Theory, còn bản kế hoạch này nằm ở `docs/theory-plan.md`.

App Luyện tập trong `src/` không bị đụng tới, trừ các file dùng chung là `vercel.json`, `vite.config.ts`, `tsconfig.json`, service worker và cấu hình ESLint. Bản demo Bản đồ Pentatonic nằm ở `docs/prototypes/` để tham khảo, không được ship và không được import. Bản tóm tắt sách nằm ngoài repo.

## Lộ trình theo giai đoạn

Pentatonic và blues nằm ở giai đoạn 2, ngay sau phần nền móng tối thiểu. Trong sách, phần này nằm ở chương 11 và 13. Hợp âm và giọng để sau vì đến lúc đó người học đã có lý do để cần chúng.

```mermaid
flowchart TB
  p0["0 · Nền tảng (3 phiên)<br/>Tóm tắt sách, lõi nhạc lý và âm thanh, khung app Theory"]
  p1["1 · Nền móng (3 phiên)<br/>Cần đàn là lưới, nhịp không cần khuông, âm giai trưởng và quãng"]
  p2["2 · Solo pentatonic (3 phiên)<br/>Pentatonic đầy đủ, blues, kỹ thuật guitar điện"]
  p3["3 · Hợp âm (3 phiên)<br/>Hợp âm từ quãng, hợp âm chặn di động, bảng công thức"]
  p4["4 · Kết nối (3 phiên)<br/>Giọng và tiến trình, solo theo hợp âm, 3 nốt mỗi dây"]
  p5["5 · Ôn tập (1 phiên)<br/>Chế độ đố xuyên các bài, liên kết với app Luyện tập"]
  p0 -- "Cổng: Bản đồ Pentatonic chạy ở /theory bằng cả hai thứ tiếng" --> p1
  p1 -- "Cổng: tự tìm được nốt nhà và quãng 8 ở mọi giọng, giữ nhịp với metronome" --> p2
  p2 -- "Cổng: solo được trên blues 12 ô, nối được cả 5 hộp" --> p3
  p3 -- "Cổng: dựng được bất kỳ hợp âm nào trong bảng từ công thức" --> p4
  p4 -- "Cổng: đổi nốt đích đúng lúc khi hợp âm đổi" --> p5
```

Mỗi cổng là một việc người học phải tự làm được trên đàn. Chưa qua cổng thì nên sửa bài cũ trước khi làm bài mới. Chi tiết từng phiên nằm trong bảng tiến độ ở cuối tài liệu.

## Cách làm mỗi phiên

Mỗi phiên là một cuộc trò chuyện mới, làm đúng một bài học và kết thúc bằng một PR. Bắt đầu cuộc trò chuyện mới giúp Claude không phải mang theo toàn bộ lịch sử các phiên trước, nhờ vậy tốn ít token hơn.

Quy trình trong một phiên:

1. **Nạp bối cảnh.** Claude đọc `AGENTS.md`, `docs/theory.md` và bản tóm tắt của chương cần dùng. Không đọc lại PDF.
2. **Chọn ý.** Claude gửi một dàn ý ngắn gồm 3–5 bước. Mỗi bước có một câu kết luận và mô tả hình động. Dàn ý kèm danh sách những gì "tạm gác lại".
3. **Bạn duyệt dàn ý.** Sửa ở bước này chỉ tốn vài trao đổi. Sửa sau khi đã code xong tốn gấp nhiều lần.
4. **Dựng bài trên một nhánh mới.** Claude viết dữ liệu bài, lời giảng tiếng Việt và tiếng Anh, dùng lõi có sẵn trong `theory/src/core/`. Nếu cần thành phần mới dùng lại được, thành phần đó được thêm vào lõi kèm test.
5. **Kiểm tra như CI.** Chạy lint, typecheck, test, build theo đúng thứ tự. Sau đó xem trang một lần trên dev server, ở cả hai ngôn ngữ.
6. **Mở PR và ghi sổ.** PR kèm link bản xem trước của Vercel. Bạn xem và merge, rồi đánh dấu xong trong bảng tiến độ.

Prompt mẫu để mở một phiên. Bạn chỉ cần thay mã phiên và chương:

```
Dự án Theory trong Guitarmateur, phiên 2.2 (Blues).
Kế hoạch: docs/theory-plan.md. Repo: nguyentamgm/guitarmateur (cần quyền push).
Đọc AGENTS.md, docs/theory.md, docs/theory-plan.md, và bản tóm tắt chương 13, 14 trên máy tôi.
Không đọc PDF. Chỉ làm trong theory/; không import từ src/.
Dùng lõi trong theory/src/core/; chỉ thêm vào lõi khi thiếu, kèm test.
Gửi dàn ý trước, chờ tôi duyệt rồi mới code.
Đầu ra: bài /theory/blues bằng tiếng Việt và tiếng Anh; chạy lint, typecheck,
test, build; mở PR; cập nhật trạng thái phiên 2.2 trong docs/theory-plan.md.
```

## Tiết kiệm token và rủi ro

Phần lớn token bị tốn vào ba việc: đọc lại nguồn, viết lại code đã có, và sửa một trang đã dựng xong. Kế hoạch này chặn cả ba.

- **Trích sách một lần.** Ở phiên 0.1, toàn bộ PDF được chuyển thành các file tóm tắt theo chương, mỗi file vài KB, nằm ngoài repo. Các phiên sau chỉ đọc file của chương mình cần.
- **Lõi làm một lần.** Phiên 0.2 dựng nhạc lý, cần đàn và âm thanh cho Theory. Từ đó trở đi, một bài mới chủ yếu là dữ liệu và lời giảng.
- **Duyệt dàn ý trước khi code.** Đây là cách rẻ nhất để đổi hướng.
- **Mỗi phiên một cuộc trò chuyện mới.** `docs/theory.md` và `docs/theory-plan.md` thay cho lịch sử trò chuyện. Claude chỉ đọc phần code mình sắp sửa, không đọc cả repo.
- **Không dùng agent phụ cho việc dựng bài.** Agent phụ bắt đầu từ con số 0 và phải nạp lại bối cảnh. Chỉ đáng dùng khi cần một người kiểm tra độc lập kiến thức nhạc lý của một bài quan trọng.

Ước lượng thô: mỗi phiên bài học tốn khoảng 120–250 nghìn token, vì mỗi bài phải viết hai thứ tiếng và chạy CI. Cả dự án khoảng 2,5–3,5 triệu token. Phiên 0.2 và 0.3 tốn nhất vì phải dựng lõi và khung app. Sau phiên 1.1, hãy xem số thực tế rồi chỉnh lại ước lượng này.

| Rủi ro | Cách xử lý |
| --- | --- |
| Sai kiến thức nhạc lý (tên nốt, bậc, công thức) | Mọi nốt đều do lõi Theory tính ra, không gõ tay. Lõi có test chính tả cho cả 12 giọng. Mỗi bài thêm test cho các cảnh của mình |
| Bản tiếng Việt và tiếng Anh lệch nhau | Test so hai bản phải có cùng bước và cùng khóa. Thuật ngữ được thống nhất trong một bảng thuật ngữ ở `docs/theory.md` |
| Theory vô tình phụ thuộc app Luyện tập, hoặc code Theory không được CI kiểm tra | ESLint chặn import qua lại giữa `src/` và `theory/src/`. Phiên 0.3 đưa `theory/` vào typecheck, lint và test, rồi thử một import sai để chắc luật có tác dụng |
| Tải lại `/theory/<bài>` bị lỗi 404, hoặc offline thì mở ra trang chủ | Ngay ở phiên 0.3: thêm rewrite trong `vercel.json`, sửa service worker, kiểm tra trên bản xem trước |
| Sửa file dùng chung làm hỏng app Luyện tập | Chỉ có `vercel.json`, `vite.config.ts`, `tsconfig.json`, service worker và cấu hình ESLint là dùng chung. Kiểm tra trang chủ trên bản xem trước mỗi khi một trong các file này thay đổi |
| Bản quyền của sách | Sách và bản tóm tắt nằm trong `.gitignore`. Không chép lời văn, bài tập hay bản nhạc có bản quyền. Bài tập được tự sinh |
| Đường cong nhéo dây và tiết tấu khó minh họa | Làm thử một demo nhỏ ở đầu phiên đó trước khi dựng cả bài |

## Theo dõi tiến độ

Mỗi dòng là một phiên. Làm theo thứ tự từ trên xuống, nhưng sau giai đoạn 0 có thể đổi thứ tự các phiên trong cùng một giai đoạn. Trạng thái: Chưa làm · Đang làm · Xong.

| Phiên | Bài học / đầu ra | Nguồn trong sách | Trạng thái |
| --- | --- | --- | --- |
| 0.1 | Trích sách thành tóm tắt theo chương (ngoài repo, trong `.gitignore`). Viết `docs/theory.md` kèm bảng thuật ngữ vi–en | Cả sách | Chưa làm |
| 0.2 | Lõi Theory: nhạc lý đánh vần đúng, cần đàn, tiếng gảy mới (từ bản demo trong `docs/prototypes/`), tất cả có test | Ch. 7, 11 | Chưa làm |
| 0.3 | Khung app Theory: entry Vite riêng, `/theory`, đưa `theory/` vào tsconfig, ESLint và Vitest, mục lục, chọn ngôn ngữ, rewrite Vercel, service worker. Bài thử: Bản đồ Pentatonic (vi + en) | Ch. 11 | Chưa làm |
| 1.1 | Cần đàn là lưới: đọc tab, hình quãng 8, tìm nốt nhà | Ch. 1–4, 7 | Chưa làm |
| 1.2 | Nhịp không cần khuông: lưới phách, metronome, mẫu quạt | Ch. 2–3, 9, 16 | Chưa làm |
| 1.3 | Âm giai trưởng và quãng là hình trên cần | Ch. 7, 9 | Chưa làm |
| 2.1 | Pentatonic bản đầy đủ: 5 hộp, mẫu bộ 3/bộ 4, nối hộp, trưởng/thứ song song | Ch. 11 | Chưa làm |
| 2.2 | Blues: nốt b5, tiến trình 12 ô, nhéo dây, trượt | Ch. 13, 14 | Chưa làm |
| 2.3 | Guitar điện: power chord, double stop, quãng 8 | Ch. 14, 15 | Chưa làm |
| 3.1 | Hợp âm là xếp chồng quãng: hợp âm ba, hợp âm dây buông | Ch. 5, 6, 13 | Chưa làm |
| 3.2 | Hợp âm chặn di động gốc dây 6 và dây 5, sus, m7, maj7, m11 | Ch. 7, 8, 12 | Chưa làm |
| 3.3 | Bảng công thức hợp âm tương tác, hợp âm 7, thế đảo | Ch. 17, 20 | Chưa làm |
| 4.1 | Giọng và tiến trình: số La Mã, trưởng/thứ song song, II–V–I | Ch. 8, 13, 18 | Chưa làm |
| 4.2 | Solo theo hợp âm: nốt đích sáng lên khi hợp âm đổi, vòng đệm tự sinh | Ch. 19 | Chưa làm |
| 4.3 | Âm giai 3 nốt mỗi dây, phủ toàn cần đàn | Ch. 17 | Chưa làm |
| 5.1 | Chế độ đố và ôn tập xuyên các bài, liên kết với app Luyện tập | Tất cả | Chưa làm |
