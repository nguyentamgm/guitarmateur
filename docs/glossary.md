# Glossary · Thuật ngữ

One word per idea, on every page (Practice at `/`, Theory at `/theory`, Ear training at `/ear`)
and in both languages. Theory is the reference: when the pages disagree, this file follows Theory,
and the other page changes.
Translators and anyone writing copy (UI strings, lesson text) start here; see
[`i18n.md`](i18n.md) for how to ship a language and [`theory-knowledge/`](theory-knowledge/README.md)
for what the lessons teach.

Mỗi khái niệm một từ, dùng chung cho mọi trang (Practice ở `/`, Theory ở `/theory`, Luyện tai ở
`/ear`) và cả hai ngôn ngữ. Theory là chuẩn: khi các trang gọi khác nhau, file này theo Theory và
trang kia đổi theo.
Người dịch và người viết lời (chuỗi giao diện, lời giảng) đọc file này trước.

## Rules · Quy tắc

**English**

- Use the standard term a guitarist would search for: *root*, not "home note"; *extension*, not
  "colour note"; *semitone* or *half step*, never *step* alone.
- Labels and headings are in sentence case: "Minor pentatonic", "Step 1 · Scale and box". Scale
  names are lowercase in running text: "the A minor pentatonic".
- Prefer *neck* in copy ("the notes on the neck"); *fretboard* only in a name that already has it.

**Tiếng Việt**

- **Ưu tiên thuật ngữ tiếng Anh** (root, box, scale, pentatonic, bend, lick, backing…), vì đó là
  từ người chơi guitar Việt thật sự dùng và tra cứu được. Phần câu xung quanh viết tiếng Việt bình
  thường: "Bấm root ở phím 5", "Chọn một box".
- Chỉ dùng từ Việt khi từ đó vốn đã quen và dễ hiểu: hợp âm, hợp âm chặn, ngón chặn, quãng, phách,
  bậc, giọng, phím, dây, cần đàn.
- Không tự chế từ dịch (đã bỏ: "nốt nhà", "hộp", "nhéo dây", "luyến lên", "chặn tiếng", "nốt màu",
  "trí-ô", "âm giai", "ngũ cung"). Lần đầu một thuật ngữ xuất hiện trong bài, có thể kèm một câu
  giải nghĩa ngắn bằng tiếng Việt.
- Nhãn và tiêu đề viết hoa chữ đầu câu, không viết hoa mọi chữ: "Minor pentatonic", "Bước 1 ·
  Scale và box".

## Degrees and chord tones · Bậc và nốt của hợp âm

The same notation everywhere: on a neck, in tab, in a legend, in a picker, in prose.
Cùng một cách viết ở mọi nơi: trên cần đàn, trong tab, chú thích, nút chọn, lời giảng.

- **Degrees are numbers with real accidentals:** 1, ♭2, 2, ♭3, 3, 4, ♯4 / ♭5, 5, ♭6, 6, ♭7, 7, and
  9, 11, 13 above the octave. Use ♭ and ♯, never `b` or `#` (those are only the data format, e.g.
  `'b3'`). Bậc viết bằng số với dấu ♭ ♯ thật.
- **Said aloud** (a screen reader's name for a degree button): "flat three", "sharp four or flat
  five"; in Vietnamese the number first, then giáng / thăng: "bậc 3 giáng", "bậc 4 thăng hoặc bậc
  5 giáng" (decided for #260). Khi đọc thành lời: "bậc 3 giáng", "bậc 4 thăng".
- **The root is 1.** A mark, a dot, a tab row or a legend shows `1`, never `R`. The *word* root
  (EN and VI) is for prose and for a picker that names a role in any chord: "Root · 3rd · 5th ·
  7th" (vi: "Root · bậc 3 · bậc 5 · bậc 7"). Root là `1` trên mọi nhãn; chữ "root" dùng trong lời
  giảng và nút chọn.
- **Count from the right root.** A chord tone is numbered from the chord's root (Am7: 1 ♭3 5 ♭7);
  a scale degree from the key's root (A minor pentatonic: 1 ♭3 4 5 ♭7). When both appear on one
  screen, say which ("degrees of the chord" / "bậc của hợp âm"). So the 3rd of an Am chord is
  shown `♭3`, even though the picker that asked for it said "3rd".
- **Roman numerals** name chords by degree of the key: uppercase major (I, IV, V), lowercase minor
  (ii, iii, vi), ° diminished (vii°), ♭ for borrowed roots (♭VII, ♭VI).
- **Intervals in prose:** minor 3rd, perfect 5th, octave (vi: quãng 3 thứ, quãng 5 đúng, quãng 8).
- **Note names** are the letters A–G with ♭ ♯ (B♭, F♯), the same in Vietnamese (not Đô, Rê, Mi).
  Spelling follows the key: F minor has B♭, not A♯.

## Terms · Thuật ngữ

Terms in `backticks` in the *Avoid* columns are checked automatically (see
[Checking](#checking--kiểm-tra)); write only words there that are wrong in every context.
Những từ trong `backtick` ở cột *Avoid* được test kiểm tra tự động.

### Neck and tuning · Cần đàn và lên dây

| English | Tiếng Việt | Avoid (en) | Avoid (vi) |
| --- | --- | --- | --- |
| neck | cần đàn | | |
| string 1 (thinnest) … string 6 | dây 1 (dây mảnh nhất) … dây 6 | | |
| fret (a place to press); fret wire | phím; thanh phím | | |
| open string | dây buông | | |
| nut, bridge | nut, bridge | | `lược đàn`, `ngựa đàn` |
| pick | pick (miếng gảy), never "phím", which is a fret | | |
| tuning; standard tuning; drop D | lên dây; chuẩn; drop D | | |
| the notes on strings 6 and 5 | bảng nốt trên dây 6 và 5 | `home fret` | `bảng nốt nhà` |
| the G–B shift | G–B shift | | `chỗ lệch G–B` |
| left-handed | thuận tay trái | | |

### Scales and keys · Scale và giọng

| English | Tiếng Việt | Avoid (en) | Avoid (vi) |
| --- | --- | --- | --- |
| root (of a key: tonic, key centre) | root (của giọng: tonic) | `home note` | `nốt nhà`, `nốt gốc` |
| resolution; resolve (a note moving to the tonic) | resolution; resolve (về tonic) | | |
| scale; scale note | scale; nốt của scale | | `âm giai` |
| major scale; natural minor scale | major scale; natural minor scale | | `thứ tự nhiên` |
| minor pentatonic; major pentatonic; A minor pentatonic | minor pentatonic; major pentatonic; A minor pentatonic | | `ngũ cung`, `pentatonic trưởng` |
| minor blues scale; major blues scale | minor blues scale; major blues scale | | `blues trưởng` |
| Dorian, Mixolydian | Dorian, Mixolydian | | |
| box, box 1 (a pentatonic position) | box, box 1 | | `hộp` |
| shape (octave shape, E shape) | shape | | |
| key; key of C major; A minor | giọng; giọng C trưởng; giọng A thứ | | |
| relative minor / relative major | relative minor / relative major ("giọng song song" chỉ dùng kèm giải nghĩa) | | |
| key signature, circle of fifths, mode | key signature, circle of fifths, mode | | `hóa biểu`, `vòng quãng năm`, `điệu thức` |
| degree; scale degree | bậc | | |
| semitone / half step; whole step | nửa cung; một cung | | |
| major 3rd, perfect 5th, octave | quãng 3 trưởng, quãng 5 đúng, quãng 8 | | |
| quality (of an interval or chord) | loại | | |
| blue note | blue note | | `nốt blue` |
| passing note | passing note | | `nốt đi qua` |
| extension, extended chord | extension; hợp âm mở rộng | `colour note`, `color note` | `nốt màu` |

Vietnamese calls C major and A minor "giọng song song" (same key signature). English calls that
*relative*; *parallel* in English is two keys with the same root (C major and C minor). Copy says
*relative*. · Tiếng Việt gọi C trưởng và A thứ là "giọng song song"; tiếng Anh gọi là *relative*,
còn *parallel* là hai giọng cùng root. Lời giảng dùng *relative*.

### Chords and progressions · Hợp âm và vòng hợp âm

| English | Tiếng Việt | Avoid (en) | Avoid (vi) |
| --- | --- | --- | --- |
| chord; chord tone | hợp âm; nốt của hợp âm | | `nốt hợp âm` |
| chord progression; progression | vòng hợp âm; vòng | | `tiến trình hợp âm` |
| cadence (chords that set the key: I–IV–V7–I, i–iv–V7–i) | cadence (vài hợp âm dẫn về giọng) | | |
| I chord; dominant 7th chord | hợp âm I; hợp âm dominant 7 | | `hợp âm át` |
| major, minor (chord quality) | trưởng, thứ | | |
| triad | triad ("hợp âm ba" chỉ kèm giải nghĩa) | | |
| barre chord; barre | hợp âm chặn; ngón chặn | | |
| open chord | open chord / hợp âm dây buông | | |
| sus chord | hợp âm sus | | `bậc 3 bị treo` |
| inversion | inversion | | `thế đảo` |
| slash chord | slash chord | | `hợp âm có bass riêng` |
| add2 / add9 | add2 / add9 | | |
| altered note, close voicing | altered note, close voicing | | `nốt biến`, `thế bấm khít` |
| half-diminished; augmented, diminished | half-diminished; tăng, giảm | | `nửa giảm` |
| quick change, turnaround | quick change, turnaround | | `đổi sớm` |
| bar; 12-bar blues | bar; 12-bar blues | | `blues 12 ô` |
| rub, clash | nghe chỏi, độ chỏi | | |

### Rhythm and playback · Nhịp và phát nhạc

| English | Tiếng Việt | Avoid (en) | Avoid (vi) |
| --- | --- | --- | --- |
| beat; time signature; 4/4 | phách; time signature; nhịp 4/4 | | `số chỉ nhịp` |
| whole, half, quarter, 8th, 16th note; dotted | nốt tròn, trắng, đen, móc đơn, móc kép; chấm dôi | | |
| rest | dấu lặng | | |
| triplet; counting "1 trip-let" | triplet; đếm "1 trip-let" | | `liên ba`, `trí-ô` |
| syncopation, accent, dynamics | syncopation, accent, dynamics | | `đảo phách` |
| straight, swing, shuffle | straight (thẳng), swing, shuffle | | |
| tempo; BPM | tempo; BPM | | `nhịp độ` |
| count-in | count-in (đếm vào; "đếm nhịp" là counting beats) | | |
| click; metronome | click; metronome | | |
| loop (repeat playback) | lặp | | |
| backing, vamp, drone | backing, vamp, drone ("nốt ngân dài" là a long held note, không phải drone) | | `vòng đệm`, `nhạc nền` |
| play; stop | phát; dừng | | |

### Technique and soloing · Kỹ thuật và solo

| English | Tiếng Việt | Avoid (en) | Avoid (vi) |
| --- | --- | --- | --- |
| alternate picking, ghost strum | alternate picking, ghost strum | | |
| bend, curl, bend & release | bend, curl, bend & release | | `nhéo dây`, `nhéo` |
| hammer-on, pull-off, legato | hammer-on, pull-off, legato | | `luyến lên`, `luyến xuống` |
| slide, vibrato | slide, vibrato | | |
| palm mute, chug | palm mute, chug | | `chặn tiếng` |
| distortion | distortion | | `tiếng méo` |
| lick, riff, sequence | lick, riff, sequence | | `câu mẫu`, `mẫu luyện ngón` |
| target note; target | nốt đích | | |
| landing note (the note a lick ends on) | nốt đáp | | |
| level (of a lick) | mức | | |

### Ear training · Luyện tai

The ear trainer's words are in the tables above: *root* (of a key), *scale degree* and
*resolution* under Scales and keys, *cadence* under Chords and progressions, *drone* under Rhythm
and playback. Below: the page's name, its score, and *tonic*. Nothing here is checked
automatically. · Các từ của trang Luyện tai nằm trong các bảng trên; phần dưới đây không kiểm tra
tự động.

- *Ear training* is "luyện tai": the page ("Ear training" / "Luyện tai") and the skill.
- *Right first try* is "đúng ngay lần đầu": a question counts as right only if the first answer
  was, as in Theory's quizzes.
- The key's home is the *root*, on this page too. *Tonic* and *key centre* are what ear-training
  books call it: fine to explain it ("the root of the key, its tonic"), not as the label. · Trang
  Luyện tai cũng gọi là *root*; *tonic* chỉ dùng để giải nghĩa.

### Not checked automatically · Không kiểm tra tự động

These words are wrong for the idea but fine elsewhere, so no test can catch them; reviewers do.
Những từ sau sai với khái niệm nhưng vẫn đúng ở chỗ khác, nên test không bắt được; người review
kiểm tra.

- *Root* is "root": not "gốc" or "nhà" ("Gốc", "Nhà thứ"); "nhà" and "home" only to explain it
  ("root, nốt nghe như về nhà" / "the root, the note that sounds like home"). A key is "giọng":
  "Giọng thứ", not "Nhà thứ".
- Scale names keep the English order: "A minor pentatonic", "minor blues scale", not "A thứ
  pentatonic", "pentatonic thứ" or "blues thứ" (those words also appear as ordinals, "bài blues
  thứ hai", so they are not checked).
- *Chord progression* is "vòng hợp âm", not "tiến trình" (fine for "progress": "tiến trình luyện
  tập"). *Target note* is "nốt đích", not "mục tiêu" (fine for "goal": "Mục tiêu của bài").
- *I chord* is "hợp âm I", not "hợp âm chủ" (fine in "hợp âm chủ đạo"); *turnaround* not "quay
  vòng"; *quality* is "loại", not "tính chất"; *rest* is "dấu lặng", not "khoảng lặng" (fine for
  leaving space in a solo); *dynamics* not "cường độ"; *inversion* "inversion 1", not "đảo 1".
- For the techniques, say *slide* and *vibrato*, not "trượt" or "rung" (these stay fine in their
  plain sense: "trượt tay lên box 2", "dây rung"). Not "tiếng chặt" for a chug, "cọ" for a clash,
  or "toàn hợp âm 7" for dominant 7th chords.
- *Semitone* is "nửa cung", never "bước" alone; *bar* is "bar", never "ô" alone; a fingering is a
  *shape*, not "hình".
- In English: the root is never "R" on a label (see [Degrees](#degrees-and-chord-tones--bậc-và-nốt-của-hợp-âm));
  blues chords are *dominant 7th* chords, not bare "7 chords"; *home* only to explain the root.

## Checking · Kiểm tra

`shared/i18n/glossary.ts` reads the *Avoid* columns of this file. Three tests use it:

- `theory/src/lessons/glossary.test.ts` — Theory's UI strings, concept names and every lesson's
  copy, in English and Vietnamese, must contain none of them.
- `src/i18n/glossary.test.ts` — the same for every catalog in `src/i18n/locales/`.
- `ear/src/i18n/i18n.test.ts` — the same for the ear trainer's UI strings
  (`ear/src/i18n/strings.ts`), in English and Vietnamese.

A term is matched as a whole word, ignoring case; an English term also matches its plural ("home
notes"). A table the check cannot read (an *Avoid* column not named `Avoid (xx)`, a row with the
wrong number of cells) fails the tests rather than being skipped. To add a rule, add the term to a
row here. If a word is wrong in one place but fine in another, it does not belong in an *Avoid*
column: explain it in the prose under the tables instead.
