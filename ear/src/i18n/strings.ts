/**
 * The ear trainer's interface strings. English is the source; `vi` must have exactly the same keys
 * and placeholders (i18n.test.ts). Words follow docs/glossary.md (glossary.test.ts).
 */
import type { Lang } from './lang';

/** A playable level's words (docs/ear-levels.md), by answer id (`String(id)`) where they name one. */
export interface PlayText {
  /** The intro: what to listen for, in one or two plain sentences. */
  readonly intro: string;
  /** The question, under Play again. */
  readonly question: string;
  /** Each answer button. */
  readonly answers: Readonly<Record<string, string>>;
  /** What each answer sounds like, for "Listen: …", "Right: …" and "Not quite: …". */
  readonly heard: Readonly<Record<string, string>>;
  readonly tip: string;
  /** What a passed round shows the learner can now hear: "You can now hear {learned}." */
  readonly learned: string;
}

/** Each level's words for the map, by level id. */
export interface LevelText {
  readonly name: string;
  /** One line: what you'll learn. */
  readonly learn: string;
}

const en = {
  /** The tab title. */
  appName: 'Ear training · Guitarmateur',
  /** The site name in the header, the same on every page. */
  brand: 'Guitarmateur',
  langLabel: 'Language',
  langName: { en: 'English', vi: 'Tiếng Việt' },
  navLabel: 'Sections',
  navLessons: 'Lessons',
  navReview: 'Review',
  navPractice: 'Practice',
  navEar: 'Ear training',
  kicker: 'Train your ear',
  title: 'Ear training',
  keyName: '{tonic} {mode}',
  modeName: { major: 'major', minor: 'minor' },
  next: 'Next',
  stripLabel: 'Answer by degree: one string, fret 0 is the root',
  /** The visible label first (WCAG 2.5.3, label in name), then how it is said. */
  cellLabel: '{shown} ({spoken}), fret {fret}',
  /** Each degree as spoken, by id: what a screen reader says for an answer button. */
  spoken: {
    '1': 'one',
    b2: 'flat two',
    '2': 'two',
    b3: 'flat three',
    '3': 'three',
    '4': 'four',
    '#4': 'sharp four or flat five',
    '5': 'five',
    b6: 'flat six',
    '6': 'six',
    b7: 'flat seven',
    '7': 'seven',
  },
  footer: 'Sound is synthesized in your browser. Nothing is tracked or uploaded.',
  /** The neck window after an answer. */
  neckLabel: 'On the neck: {degree} ({note}) in {key}, from the root on string {string}',
  neckWords: { fret: 'fret {n}', string: 'string {n}', root: 'root', target: 'the note you heard' },
  /** The beginner levels (docs/ear-levels.md). The welcome, first visit only. */
  welcomeTitle: 'Train your ear, one small step at a time',
  welcomeLines: {
    noMusic: "You don't need to know anything about music. You only need your ears, and later your guitar.",
    time: 'Each level takes a few minutes. 10 minutes a day is plenty.',
    headphones: '🎧 Headphones or good speakers help. A phone speaker can make low notes hard to hear.',
  },
  checkSound: 'Check my sound',
  soundCheckQuestion: 'Can you hear the guitar?',
  yes: 'Yes',
  no: 'No',
  soundCheckHelp: 'Turn up the volume. On an iPhone, turn off the silent switch. Then try again.',
  tryAgain: 'Try again',
  levelsNoAudio: 'Sound could not start in this browser, so the levels cannot play. On an iPhone, turn off the silent switch, then try again.',
  /** The level map. */
  mapTitle: 'Your levels',
  continue: 'Continue',
  /** The visible label first (WCAG 2.5.3), then where it goes. */
  continueLabel: 'Continue: level {n}, {name}',
  moreSoon: 'More levels are on the way.',
  stageTitle: 'Stage {n} · {name}',
  stages: {
    1: 'Hearing differences',
    2: 'Feelings',
    3: 'Finding the root',
    4: 'The soloing notes',
    5: 'On your guitar',
  },
  levelNumber: 'Level {n}',
  levelState: {
    locked: 'Locked',
    ready: 'Ready',
    done: 'Done · best {best} of {total}',
    soon: 'Coming soon',
  },
  howItWorks: 'How does this level work?',
  howItWorksLabel: 'How does this level work? Level {n}, {name}',
  levels: {
    1: { name: 'Same or different?', learn: 'Tell if two notes are the same.' },
    2: { name: 'Higher or lower?', learn: 'Hear which way a note moved.' },
    3: { name: 'Up or down?', learn: 'Follow the shape of a short tune.' },
    4: { name: 'Close or far?', learn: 'Feel the distance between two notes.' },
    5: { name: 'Happy or sad?', learn: 'Hear if a chord sounds happy or sad.' },
    6: { name: 'Finished or not?', learn: 'Hear when a tune has come home.' },
    7: { name: 'Root or not?', learn: 'Find the note that sounds like home.' },
    8: { name: 'Root or 5?', learn: 'Your first named note after the root: the 5.' },
    9: { name: '1, 3 or 5: happy', learn: 'Hear the 3, the note that makes a chord happy.' },
    10: { name: '1, ♭3 or 5: sad', learn: 'Hear the ♭3, the note that makes a chord sad.' },
    11: { name: 'Add ♭7', learn: 'The note that makes a riff sound like rock or blues.' },
    12: { name: 'Add 4: the minor pentatonic', learn: 'All five notes of the minor pentatonic.' },
    13: { name: 'The blues note', learn: 'The ♭5, the tense note of the blues scale.' },
    14: { name: 'See it on the neck', learn: 'Where each sound you know sits on the guitar.' },
    15: { name: 'Find the root on your guitar', learn: 'Hear a song, then find its root on your own guitar.' },
  } as Readonly<Record<number, LevelText>>,
  /** The words of each level that can be played so far, by level id. */
  play: {
    1: {
      intro: "You'll hear two notes. Are they the same note, or different?",
      question: 'Were the two notes the same, or different?',
      answers: { same: 'Same', different: 'Different' },
      heard: { same: 'the two notes are the same', different: 'the two notes are different' },
      tip: 'Hum the first note quietly, then compare.',
      learned: 'if two notes are the same or different',
    },
    2: {
      intro: "You'll hear two notes. Is the second one higher or lower than the first? 'Higher' is the sound of a thinner string, or a fret closer to your body.",
      question: 'Was the second note higher or lower?',
      answers: { higher: 'Higher', lower: 'Lower' },
      heard: { higher: 'the second note is higher', lower: 'the second note is lower' },
      tip: "Many people mix up 'higher' and 'louder'. Higher means thinner, like a bird; lower means deeper, like a big drum.",
      learned: 'which way a note moved',
    },
    3: {
      intro: "You'll hear three notes. Does the tune go up or down?",
      question: 'Did the tune go up or down?',
      answers: { up: 'Up', down: 'Down', upDown: 'Up, then down', downUp: 'Down, then up' },
      heard: {
        up: 'the tune goes up',
        down: 'the tune goes down',
        upDown: 'the tune goes up, then down',
        downUp: 'the tune goes down, then up',
      },
      tip: 'Hum along quietly, and feel which way your voice moves.',
      learned: 'which way a short tune goes',
    },
    4: {
      intro: "You'll hear two notes. Are they close together, or far apart? Close means 1 or 2 frets apart; far means a big jump.",
      question: 'Were the two notes close together, or far apart?',
      answers: { close: 'Close', far: 'Far' },
      heard: { close: 'the notes are close together', far: 'the notes are far apart' },
      tip: 'In a solo, most notes move to a close neighbour; a big jump stands out.',
      learned: 'how far apart two notes are',
    },
  } as Readonly<Partial<Record<number, PlayText>>>,
  /** A Stage 1 wrong answer's picture: the notes on one string. */
  gapLabel: 'On the neck: the two notes are {n} frets apart',
  /** Shown before an answer's words, hidden from screen readers; the same in every language. */
  answerIcons: { higher: '⬆', lower: '⬇', up: '⬆', down: '⬇', upDown: '⛰', downUp: '⌄', major: '🙂', minor: '🙁' } as Readonly<Record<string, string>>,
  /** A level's intro. */
  listenFirst: 'Listen first',
  example: 'Listen: {heard}.',
  playExample: 'Play',
  playExampleLabel: 'Play: {heard}',
  ready: "I'm ready",
  backToMap: 'Back to the map',
  /** The question screen. */
  levelTitle: 'Level {n} · {name}',
  questionCount: '{n} of {total}',
  questionCountLabel: 'Question {n} of {total}',
  playAgain: 'Play again',
  answersLabel: 'Your answer',
  rightLine: 'Right: {heard}.',
  wrongLine: 'Not quite: {heard}.',
  listenBoth: 'Listen to both again',
  stuck: 'This one is tricky. Want to make it a bit easier?',
  easier: 'Yes, easier',
  keepGoing: 'No, keep going',
  levelKeys: 'Keys: Space plays again, 1 to {n} answer, Enter goes on.',
  /** The end of a round. */
  roundScore: '{right} of {total} right!',
  roundDotsLabel: '{right} right first try, {wrong} not',
  passed: 'Level done! You can now hear {learned}.',
  notYet: '{right} of {total}: almost! Play another round; most people need a few.',
  nextLevel: 'Next level',
  roundAgain: 'Play again',
};

export type UiStrings = typeof en;

const vi: UiStrings = {
  appName: 'Luyện tai · Guitarmateur',
  brand: 'Guitarmateur',
  langLabel: 'Ngôn ngữ',
  langName: { en: 'English', vi: 'Tiếng Việt' },
  navLabel: 'Các mục',
  navLessons: 'Bài học',
  navReview: 'Ôn tập',
  navPractice: 'Luyện tập',
  navEar: 'Luyện tai',
  kicker: 'Luyện tai nghe',
  title: 'Luyện tai',
  keyName: '{tonic} {mode}',
  modeName: { major: 'trưởng', minor: 'thứ' },
  next: 'Câu tiếp',
  stripLabel: 'Trả lời bằng bậc: một dây, phím 0 là root',
  cellLabel: '{shown} ({spoken}), phím {fret}',
  spoken: {
    '1': 'bậc 1',
    b2: 'bậc 2 giáng',
    '2': 'bậc 2',
    b3: 'bậc 3 giáng',
    '3': 'bậc 3',
    '4': 'bậc 4',
    '#4': 'bậc 4 thăng hoặc bậc 5 giáng',
    '5': 'bậc 5',
    b6: 'bậc 6 giáng',
    '6': 'bậc 6',
    b7: 'bậc 7 giáng',
    '7': 'bậc 7',
  },
  footer: 'Âm thanh được tổng hợp ngay trong trình duyệt. Không theo dõi, không tải gì lên.',
  neckLabel: 'Trên cần đàn: bậc {degree} ({note}) trong giọng {key}, tính từ root trên dây {string}',
  neckWords: { fret: 'phím {n}', string: 'dây {n}', root: 'root', target: 'nốt vừa nghe' },
  welcomeTitle: 'Luyện tai, từng bước nhỏ một',
  welcomeLines: {
    noMusic: 'Bạn không cần biết gì về nhạc. Bạn chỉ cần đôi tai, và sau này là cây đàn.',
    time: 'Mỗi cấp chỉ mất vài phút. Mỗi ngày 10 phút là đủ.',
    headphones: '🎧 Tai nghe hoặc loa tốt sẽ giúp nghe rõ hơn. Loa điện thoại có thể làm nốt trầm khó nghe.',
  },
  checkSound: 'Kiểm tra âm thanh',
  soundCheckQuestion: 'Bạn có nghe thấy tiếng đàn không?',
  yes: 'Có',
  no: 'Không',
  soundCheckHelp: 'Hãy tăng âm lượng. Trên iPhone, hãy tắt công tắc im lặng. Rồi thử lại.',
  tryAgain: 'Thử lại',
  levelsNoAudio: 'Trình duyệt này không phát được âm thanh, nên chưa luyện được. Trên iPhone, hãy tắt công tắc im lặng rồi thử lại.',
  mapTitle: 'Các cấp của bạn',
  continue: 'Tiếp tục',
  continueLabel: 'Tiếp tục: cấp {n}, {name}',
  moreSoon: 'Các cấp tiếp theo đang được làm.',
  stageTitle: 'Chặng {n} · {name}',
  stages: {
    1: 'Nghe ra sự khác nhau',
    2: 'Cảm xúc',
    3: 'Tìm root',
    4: 'Các nốt để solo',
    5: 'Trên cây đàn của bạn',
  },
  levelNumber: 'Cấp {n}',
  levelState: {
    locked: 'Chưa mở',
    ready: 'Sẵn sàng',
    done: 'Xong · cao nhất {best}/{total}',
    soon: 'Sắp có',
  },
  howItWorks: 'Cấp này luyện thế nào?',
  howItWorksLabel: 'Cấp này luyện thế nào? Cấp {n}, {name}',
  levels: {
    1: { name: 'Giống hay khác?', learn: 'Nhận ra hai nốt có giống nhau không.' },
    2: { name: 'Cao hơn hay thấp hơn?', learn: 'Nghe ra nốt đi lên hay đi xuống.' },
    3: { name: 'Đi lên hay đi xuống?', learn: 'Theo được dáng đi của một giai điệu ngắn.' },
    4: { name: 'Gần hay xa?', learn: 'Cảm nhận khoảng cách giữa hai nốt.' },
    5: { name: 'Vui hay buồn?', learn: 'Nghe ra một hợp âm vui hay buồn.' },
    6: { name: 'Đã hết hay chưa?', learn: 'Nghe ra khi nào giai điệu đã về nhà.' },
    7: { name: 'Root hay không?', learn: 'Tìm nốt nghe như đã về nhà.' },
    8: { name: 'Root hay 5?', learn: 'Nốt đầu tiên có tên sau root: bậc 5.' },
    9: { name: '1, 3 hay 5: vui', learn: 'Nghe ra bậc 3, nốt làm hợp âm nghe vui.' },
    10: { name: '1, ♭3 hay 5: buồn', learn: 'Nghe ra bậc ♭3, nốt làm hợp âm nghe buồn.' },
    11: { name: 'Thêm ♭7', learn: 'Nốt làm riff nghe chất rock, chất blues.' },
    12: { name: 'Thêm 4: minor pentatonic', learn: 'Đủ năm nốt của minor pentatonic.' },
    13: { name: 'Blue note', learn: 'Bậc ♭5, nốt căng của blues scale.' },
    14: { name: 'Xem trên cần đàn', learn: 'Mỗi âm bạn đã biết nằm ở đâu trên đàn.' },
    15: { name: 'Tìm root trên đàn của bạn', learn: 'Nghe một bài, rồi tìm root của nó trên chính cây đàn của bạn.' },
  },
  play: {
    1: {
      intro: 'Bạn sẽ nghe hai nốt. Đó là cùng một nốt, hay hai nốt khác nhau?',
      question: 'Hai nốt đó giống hay khác nhau?',
      answers: { same: 'Giống', different: 'Khác' },
      heard: { same: 'hai nốt giống nhau', different: 'hai nốt khác nhau' },
      tip: 'Khẽ ngân theo nốt đầu tiên, rồi so sánh.',
      learned: 'hai nốt giống hay khác nhau',
    },
    2: {
      intro: 'Bạn sẽ nghe hai nốt. Nốt thứ hai cao hơn hay thấp hơn nốt đầu? "Cao hơn" là tiếng của dây mảnh hơn, hoặc phím gần thân đàn hơn.',
      question: 'Nốt thứ hai cao hơn hay thấp hơn?',
      answers: { higher: 'Cao hơn', lower: 'Thấp hơn' },
      heard: { higher: 'nốt thứ hai cao hơn', lower: 'nốt thứ hai thấp hơn' },
      tip: 'Nhiều người nhầm "cao" với "to". Cao là thanh và mảnh, như tiếng chim; thấp là trầm, như tiếng trống lớn.',
      learned: 'nốt đi lên hay đi xuống',
    },
    3: {
      intro: 'Bạn sẽ nghe ba nốt. Giai điệu đi lên hay đi xuống?',
      question: 'Giai điệu đi lên hay đi xuống?',
      answers: { up: 'Đi lên', down: 'Đi xuống', upDown: 'Lên rồi xuống', downUp: 'Xuống rồi lên' },
      heard: {
        up: 'giai điệu đi lên',
        down: 'giai điệu đi xuống',
        upDown: 'giai điệu đi lên rồi xuống',
        downUp: 'giai điệu đi xuống rồi lên',
      },
      tip: 'Khẽ ngân theo, và cảm nhận giọng mình đi lên hay đi xuống.',
      learned: 'một giai điệu ngắn đi lên hay đi xuống',
    },
    4: {
      intro: 'Bạn sẽ nghe hai nốt. Chúng gần nhau, hay cách xa nhau? Gần là cách 1 hoặc 2 phím; xa là một bước nhảy lớn.',
      question: 'Hai nốt đó gần nhau hay cách xa nhau?',
      answers: { close: 'Gần', far: 'Xa' },
      heard: { close: 'hai nốt gần nhau', far: 'hai nốt cách xa nhau' },
      tip: 'Khi solo, hầu hết các nốt đi sang một nốt gần bên cạnh; một bước nhảy lớn sẽ nổi bật.',
      learned: 'hai nốt cách nhau gần hay xa',
    },
  },
  gapLabel: 'Trên cần đàn: hai nốt cách nhau {n} phím',
  answerIcons: { higher: '⬆', lower: '⬇', up: '⬆', down: '⬇', upDown: '⛰', downUp: '⌄', major: '🙂', minor: '🙁' },
  listenFirst: 'Nghe trước đã',
  example: 'Nghe này: {heard}.',
  playExample: 'Nghe',
  playExampleLabel: 'Nghe: {heard}',
  ready: 'Tôi sẵn sàng',
  backToMap: 'Về bản đồ',
  levelTitle: 'Cấp {n} · {name}',
  questionCount: '{n}/{total}',
  questionCountLabel: 'Câu {n} trên {total}',
  playAgain: 'Nghe lại',
  answersLabel: 'Câu trả lời của bạn',
  rightLine: 'Đúng: {heard}.',
  wrongLine: 'Chưa đúng: {heard}.',
  listenBoth: 'Nghe lại cả hai',
  stuck: 'Câu này khó đấy. Bạn có muốn dễ hơn một chút không?',
  easier: 'Có, dễ hơn',
  keepGoing: 'Không, cứ tiếp tục',
  levelKeys: 'Phím tắt: Space để nghe lại, 1 đến {n} để trả lời, Enter để đi tiếp.',
  roundScore: 'Đúng {right}/{total} câu!',
  roundDotsLabel: '{right} câu đúng ngay lần đầu, {wrong} câu chưa',
  passed: 'Xong cấp này! Giờ bạn đã nghe ra {learned}.',
  notYet: '{right}/{total}: gần được rồi! Chơi thêm một lượt nữa; hầu hết mọi người cần vài lượt.',
  nextLevel: 'Cấp tiếp theo',
  roundAgain: 'Chơi lại',
};

export const UI: Readonly<Record<Lang, UiStrings>> = { en, vi };
