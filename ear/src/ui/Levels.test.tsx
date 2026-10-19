import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Player } from '@shared/core/audio';
import type { AnswerId, Level } from '../core/levels';
import type { KindSounds, LevelSounds } from '../audio/levelSounds';
import { SOUND_CHECK_MIDI } from '../audio/levelSounds';
import type { Part } from '../audio/timeline';
import { EAR_STORAGE_KEY, loadEar } from '../store/store';
import { App } from './App';

/** Each answer's note: the stub's question plays it, so a test hears the right answer. */
const NOTE: Readonly<Record<string, number>> = { same: 60, different: 61, higher: 62, lower: 63 };
const ANSWER_OF = Object.fromEntries(Object.entries(NOTE).map(([a, m]) => [m, a]));
const COMPARE_MIDI = 70;
const DEMO_MIDI = 80;
const note = (midi: number): Part => ({
  sounds: [{ kind: 'note', midi, time: 0, length: 0.5 }],
  duration: 0.5,
});

/** A stand-in for a kind's sounds, two-answer levels only (levels 1 and 2). */
const stub: LevelSounds = {
  question: (_level, q) => note(NOTE[String(q.answer)]!),
  compare: () => note(COMPARE_MIDI),
  demo: (level: Level) =>
    level.answers.map((answer, i) => ({ answer: answer as AnswerId, part: note(DEMO_MIDI + i) })),
};
const SOUNDS: KindSounds = { sameDifferent: stub, higherLower: stub };

function fakePlayer(audio = true) {
  const played: number[] = [];
  const player: Player = {
    enabled: true,
    setEnabled: () => {},
    now: () => (audio ? Date.now() / 1000 : null),
    pluck: (midi) => played.push(midi),
    mute: () => {},
    click: () => {},
    setLevels: () => {},
    cancel: () => {},
  };
  return { player, played };
}

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  localStorage.setItem('gm.lang', 'en');
  window.history.replaceState(null, '', '/ear');
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

const render = (player: Player, sounds: KindSounds = SOUNDS) =>
  act(() => root.render(createElement(App, { player, sounds })));
/** Leave and come back: a new page on the same storage. */
const reload = (player: Player, sounds: KindSounds = SOUNDS) => {
  act(() => root.unmount());
  root = createRoot(host);
  render(player, sounds);
};
const buttons = () => [...host.querySelectorAll<HTMLButtonElement>('button')];
const button = (text: string) => {
  const b = buttons().find((x) =>
    x
      .textContent!.trim()
      .replace(/^[^\p{L}\d]+/u, '')
      .startsWith(text),
  );
  if (!b)
    throw new Error(
      `No button "${text}" in: ${buttons()
        .map((x) => x.textContent)
        .join(' | ')}`,
    );
  return b;
};
const click = (b: HTMLElement) => act(() => b.click());
const heading = () => host.querySelector('h2')!.textContent;
const text = () => host.querySelector('.levels')!.textContent!;
const wait = (sec: number) => act(() => vi.advanceTimersByTime(sec * 1000));
const answerButtons = () => [...host.querySelectorAll<HTMLButtonElement>('.lv-answer')];
/** The right answer to the question playing, from the stub's note. */
const heardAnswer = (played: readonly number[]) =>
  ANSWER_OF[played.filter((m) => m in ANSWER_OF).at(-1)!]!;
const answerButton = (label: string) =>
  answerButtons().find((b) => b.textContent!.includes(label))!;
const LABEL: Readonly<Record<string, string>> = {
  same: 'Same',
  different: 'Different',
  higher: 'Higher',
  lower: 'Lower',
};
const OTHER: Readonly<Record<string, string>> = {
  same: 'different',
  different: 'same',
  higher: 'lower',
  lower: 'higher',
};
const key = (k: string, code = k) =>
  act(
    () => void window.dispatchEvent(new KeyboardEvent('keydown', { key: k, code, bubbles: true })),
  );

/** Past the welcome, as a learner who has been here before. */
const welcomed = () =>
  localStorage.setItem(EAR_STORAGE_KEY, JSON.stringify({ ...loadEar(), welcomed: true }));

/** Answer `n` questions right, the way a learner would: by ear, then the pause. */
function answerRight(played: readonly number[], n: number) {
  for (let i = 0; i < n; i++) {
    click(answerButton(LABEL[heardAnswer(played)]!));
    wait(2);
  }
}

describe('the welcome and its sound check (first visit only)', () => {
  it('welcome → one guitar note → "No" shows what to do → "Yes" → the map, never again', () => {
    const { player, played } = fakePlayer();
    render(player);
    expect(heading()).toBe('Train your ear, one small step at a time');
    expect(text()).toContain("You don't need to know anything about music.");
    click(button('Check my sound'));
    expect(played).toEqual([SOUND_CHECK_MIDI]);
    expect(text()).toContain('Can you hear the guitar?');
    click(button('No'));
    expect(text()).toContain(
      'Turn up the volume. On an iPhone, turn off the silent switch. Then try again.',
    );
    click(button('Try again'));
    expect(played).toEqual([SOUND_CHECK_MIDI, SOUND_CHECK_MIDI]);
    click(button('Yes'));
    expect(heading()).toBe('Your levels');
    expect(loadEar().welcomed).toBe(true);
    reload(player);
    expect(heading()).toBe('Your levels');
  });

  it('says so when sound cannot start in this browser, instead of asking', () => {
    const { player } = fakePlayer(false);
    render(player);
    click(button('Check my sound'));
    expect(text()).toContain('Sound could not start in this browser');
    expect(text()).not.toContain('Can you hear the guitar?');
    expect(buttons().some((b) => b.textContent === 'Yes')).toBe(false);
    expect(button('Try again')).toBeTruthy();
  });
});

describe('the level map', () => {
  it('five stages, fifteen levels: level 1 ready, the rest locked; Continue opens level 1', () => {
    welcomed();
    render(fakePlayer().player);
    expect([...host.querySelectorAll('.lv-stage h3')].map((h) => h.textContent)).toEqual([
      'Stage 1 · Hearing differences',
      'Stage 2 · Feelings',
      'Stage 3 · Finding the root',
      'Stage 4 · The soloing notes',
      'Stage 5 · On your guitar',
    ]);
    const cards = [...host.querySelectorAll('.lv-card')];
    expect(cards).toHaveLength(15);
    expect(cards.map((c) => c.className.split(' ')[1])).toEqual([
      'ready',
      ...Array<string>(14).fill('locked'),
    ]);
    expect(cards[0]!.textContent).toBe(
      'Level 1Same or different?Tell if two notes are the same.▶ ReadyHow does this level work?',
    );
    // A locked card is not a button.
    expect(cards[1]!.querySelector('button')).toBeNull();
    expect(button('Continue').getAttribute('aria-label')).toBe(
      'Continue: level 1, Same or different?',
    );
  });

  it('with the real sounds, Stage 1 opens level by level and levels 5–15 stay locked', () => {
    const progress = Object.fromEntries(
      [1, 2, 3].map((id) => [id, { step: 2, best: 9, done: true, counts: {} }]),
    );
    localStorage.setItem(
      EAR_STORAGE_KEY,
      JSON.stringify({ ...loadEar(), welcomed: true, levels: progress }),
    );
    act(() => root.render(createElement(App, { player: fakePlayer().player })));
    const states = [...host.querySelectorAll('.lv-card')].map((c) => c.className.split(' ')[1]);
    expect(states).toEqual(['done', 'done', 'done', 'ready', ...Array<string>(11).fill('locked')]);
    click(button('Continue'));
    expect(heading()).toBe('Level 4 · Close or far?');
  });

  it('a level whose sounds are not built yet shows as coming soon', () => {
    welcomed();
    render(fakePlayer().player, {});
    expect(host.querySelector('.lv-card')!.className).toBe('lv-card soon');
    expect(host.querySelector('.lv-card button')).toBeNull();
    expect(text()).toContain('More levels are on the way.');
    expect(buttons().some((b) => b.textContent!.includes('Continue'))).toBe(false);
  });
});

describe('a level, start to end', () => {
  it('intro with its demo → 10 questions → level done → the next level; a reload keeps it all', () => {
    welcomed();
    const { player, played } = fakePlayer();
    render(player);
    click(button('Continue'));
    // The first time: the intro, with an example per answer.
    expect(heading()).toBe('Level 1 · Same or different?');
    expect(text()).toContain("You'll hear two notes. Are they the same note, or different?");
    expect([...host.querySelectorAll('.lv-demo li')].map((li) => li.textContent)).toEqual([
      '▶ PlayListen: the two notes are the same.',
      '▶ PlayListen: the two notes are different.',
    ]);
    const plays = [...host.querySelectorAll<HTMLButtonElement>('.lv-demo button')];
    expect(plays.map((b) => b.getAttribute('aria-label'))).toEqual([
      'Play: the two notes are the same',
      'Play: the two notes are different',
    ]);
    click(plays[1]!);
    expect(played.at(-1)).toBe(DEMO_MIDI + 1);

    // I'm ready: the question plays by itself.
    click(button("I'm ready"));
    expect(played.at(-1)! in ANSWER_OF).toBe(true);
    expect(text()).toContain('Were the two notes the same, or different?');
    expect(host.querySelector('.lv-progress')!.getAttribute('aria-label')).toBe('Question 1 of 10');
    expect(answerButtons().map((b) => b.textContent)).toEqual(['Same', 'Different']);

    // Play again, as often as wanted.
    const before = played.length;
    click(button('Play again'));
    click(button('Play again'));
    expect(played.length).toBe(before + 2);

    // Right: a tick, one line, then the next question by itself.
    const first = heardAnswer(played);
    click(answerButton(LABEL[first]!));
    expect(host.querySelector('.lv-right')!.textContent).toBe(
      `✓ Right: the two notes are ${first === 'same' ? 'the same' : 'different'}.`,
    );
    expect(answerButton(LABEL[first]!).className).toBe('lv-answer right');
    wait(1);
    expect(host.querySelector('.lv-progress')!.getAttribute('aria-label')).toBe('Question 1 of 10');
    wait(1);
    expect(host.querySelector('.lv-progress')!.getAttribute('aria-label')).toBe('Question 2 of 10');
    expect(host.querySelector('.lv-dot')!.className).toBe('lv-dot right');

    // The rest, all right: 5 in a row move it up a step, so the round ends on the last one.
    answerRight(played, 9);
    expect(heading()).toBe('10 of 10 right!');
    expect(text()).toContain(
      'Level done! You can now hear if two notes are the same or different.',
    );
    expect(host.querySelectorAll('.lv-dots.big .lv-dot.right')).toHaveLength(10);
    const stored = loadEar().levels[1]!;
    expect(stored).toMatchObject({ done: true, best: 10, step: 2 });

    click(button('Next level'));
    expect(heading()).toBe('Level 2 · Higher or lower?');

    reload(player);
    const cards = [...host.querySelectorAll('.lv-card')];
    expect(cards[0]!.className).toBe('lv-card done');
    expect(cards[0]!.querySelector('.lv-card-state')!.textContent).toBe('✓ Done · best 10 of 10');
    expect(cards[1]!.className).toBe('lv-card ready');
    expect(button('Continue').getAttribute('aria-label')).toBe(
      'Continue: level 2, Higher or lower?',
    );
    // A level played before skips its intro; "How does this level work?" shows it again.
    click(cards[0]!.querySelector<HTMLButtonElement>('.lv-open')!);
    expect(text()).toContain('Were the two notes the same, or different?');
    click(button('Back to the map'));
    click(host.querySelector<HTMLButtonElement>('.lv-card .lv-how')!);
    expect(text()).toContain('Listen first');
  });

  it('wrong: an orange mark, what it was, both sounds again; Next when ready', () => {
    welcomed();
    const { player, played } = fakePlayer();
    render(player);
    click(button('Continue'));
    click(button("I'm ready"));
    const right = heardAnswer(played);
    click(answerButton(LABEL[OTHER[right]!]!));
    expect(played.at(-1)).toBe(COMPARE_MIDI);
    expect(answerButton(LABEL[OTHER[right]!]!).className).toBe('lv-answer wrong');
    expect(answerButton(LABEL[right]!).className).toBe('lv-answer right');
    expect(host.querySelector('.lv-wrong')!.textContent).toMatch(
      /^● Not quite: the two notes are /,
    );
    expect(host.querySelector('.lv-dot')!.className).toBe('lv-dot wrong');
    // Only the first answer counts: the right one now changes nothing.
    click(answerButton(LABEL[right]!));
    expect(host.querySelector('.lv-wrong')).not.toBeNull();
    // No pause: it waits for Next.
    wait(10);
    expect(host.querySelector('.lv-progress')!.getAttribute('aria-label')).toBe('Question 1 of 10');
    played.length = 0;
    click(button('Listen to both again'));
    expect(played).toEqual([COMPARE_MIDI]);
    click(button('Next'));
    expect(host.querySelector('.lv-progress')!.getAttribute('aria-label')).toBe('Question 2 of 10');
    expect(loadEar().levels[1]!.counts[right]).toEqual({ asked: 1, right: 0 });
  });

  it('4 wrong in a row: "make it a bit easier?" — keep going, or the demo again; then "almost"', () => {
    welcomed();
    const { player, played } = fakePlayer();
    render(player);
    click(button('Continue'));
    click(button("I'm ready"));
    const wrongOnce = () => {
      click(answerButton(LABEL[OTHER[heardAnswer(played)]!]!));
      click(button('Next'));
    };
    for (let i = 0; i < 4; i++) wrongOnce();
    expect(text()).toContain('This one is tricky. Want to make it a bit easier?');
    expect(answerButtons()).toHaveLength(0);
    click(button('No, keep going'));
    expect(host.querySelector('.lv-progress')!.getAttribute('aria-label')).toBe('Question 5 of 10');
    for (let i = 0; i < 4; i++) wrongOnce();
    click(button('Yes, easier'));
    // Already at the easiest step: the demo again, then the questions.
    expect(text()).toContain('Listen first');
    click(button("I'm ready"));
    expect(host.querySelector('.lv-progress')!.getAttribute('aria-label')).toBe('Question 9 of 10');
    answerRight(played, 2);
    expect(heading()).toBe('2 of 10 right!');
    expect(text()).toContain('2 of 10: almost! Play another round; most people need a few.');
    expect(loadEar().levels[1]).toMatchObject({ done: false, best: 2 });
    click(button('Play again'));
    expect(host.querySelector('.lv-progress')!.getAttribute('aria-label')).toBe('Question 1 of 10');
  });

  it('the keyboard: Space plays again, a digit or an arrow answers, Enter goes on', () => {
    welcomed();
    const { player, played } = fakePlayer();
    render(player);
    click(button('Continue'));
    click(button("I'm ready"));
    (document.activeElement as HTMLElement | null)?.blur();
    const n = played.length;
    key(' ', 'Space');
    expect(played.length).toBe(n + 1);
    const right = heardAnswer(played);
    // Digits pick by place: 1 is Same, 2 is Different. Pick the wrong one.
    key(right === 'same' ? '2' : '1', right === 'same' ? 'Digit2' : 'Digit1');
    expect(host.querySelector('.lv-wrong')).not.toBeNull();
    // The focus is on Next now; with it elsewhere, Enter still goes on.
    expect(document.activeElement?.textContent).toContain('Next');
    (document.activeElement as HTMLElement).blur();
    key('Enter');
    expect(host.querySelector('.lv-progress')!.getAttribute('aria-label')).toBe('Question 2 of 10');
    key(heardAnswer(played) === 'same' ? 'ArrowLeft' : 'ArrowRight');
    expect(host.querySelector('.lv-right')).not.toBeNull();
  });

  it('Back to the map leaves the round, keeping its answers', () => {
    welcomed();
    const { player, played } = fakePlayer();
    render(player);
    click(button('Continue'));
    click(button("I'm ready"));
    click(answerButton(LABEL[heardAnswer(played)]!));
    click(button('Back to the map'));
    expect(heading()).toBe('Your levels');
    expect(loadEar().levels[1]!.counts).not.toEqual({});
  });
});

describe('level 14: answer on the neck', () => {
  it("only the level's frets answer; the feedback names the fret; the neck shows that note; Next waits", () => {
    const levels = Object.fromEntries(
      Array.from({ length: 13 }, (_, i) => [i + 1, { step: 2, best: 9, done: true, counts: {} }]),
    );
    localStorage.setItem(EAR_STORAGE_KEY, JSON.stringify({ ...loadEar(), welcomed: true, levels }));
    act(() => root.render(createElement(App, { player: fakePlayer().player })));
    click(button('Continue'));
    expect(heading()).toBe('Level 14 · See it on the neck');
    click(button("I'm ready"));
    expect(text()).toContain('Where is that note? Tap its fret.');
    const cells = [...host.querySelectorAll<HTMLButtonElement>('.strip .cell')];
    expect(cells).toHaveLength(12);
    // Step A: the minor pentatonic, each at its fret from the root.
    expect(cells.filter((c) => !c.disabled).map((c) => [c.dataset.fret, c.textContent])).toEqual([
      ['0', '1'],
      ['3', '♭3'],
      ['5', '4'],
      ['7', '5'],
      ['10', '♭7'],
    ]);
    expect(host.querySelector('.neck-answer')).toBeNull();

    click(cells[0]!);
    const right = host.querySelector<HTMLButtonElement>('.cell.right')!;
    const line = host.querySelector('.lv-feedback')!.textContent!;
    const fret = right.dataset.fret!;
    expect(line).toContain(
      fret === '0'
        ? 'fret 0 is the root: the note A, in the key of A minor'
        : `fret ${fret} from the root is ${right.textContent}: the note `,
    );
    const note = /the note ([A-G][♭♯]?)/.exec(line)![1]!;
    const target = host.querySelector('.neck-answer g.dot.target')!;
    expect(target.getAttribute('aria-label')).toMatch(
      new RegExp(`^${note}, fret \\d+, string \\d, ${right.textContent}`),
    );
    // Right or wrong, it waits for Next, so the neck can be looked at.
    wait(10);
    expect(host.querySelector('.lv-progress')!.getAttribute('aria-label')).toBe('Question 1 of 10');
    click(button('Next'));
    expect(host.querySelector('.lv-progress')!.getAttribute('aria-label')).toBe('Question 2 of 10');
    expect(host.querySelector('.neck-answer')).toBeNull();
  });
});

describe('in Vietnamese', () => {
  it('the same path, every screen in Vietnamese', () => {
    localStorage.setItem('gm.lang', 'vi');
    const { player, played } = fakePlayer();
    render(player);
    expect(heading()).toBe('Luyện tai, từng bước nhỏ một');
    click(button('Kiểm tra âm thanh'));
    expect(text()).toContain('Bạn có nghe thấy tiếng đàn không?');
    click(button('Có'));
    expect(heading()).toBe('Các cấp của bạn');
    expect(host.querySelector('.lv-stage h3')!.textContent).toBe('Chặng 1 · Nghe ra sự khác nhau');
    click(button('Tiếp tục'));
    expect(heading()).toBe('Cấp 1 · Giống hay khác?');
    click(button('Tôi sẵn sàng'));
    expect(answerButtons().map((b) => b.textContent)).toEqual(['Giống', 'Khác']);
    const right = heardAnswer(played);
    click(answerButton({ same: 'Giống', different: 'Khác' }[right]!));
    expect(host.querySelector('.lv-right')!.textContent).toMatch(/^✓ Đúng: hai nốt /);
    wait(2);
    for (let i = 1; i < 10; i++) {
      click(answerButton({ same: 'Giống', different: 'Khác' }[heardAnswer(played)]!));
      wait(2);
    }
    expect(heading()).toBe('Đúng 10/10 câu!');
    expect(text()).toContain('Xong cấp này! Giờ bạn đã nghe ra hai nốt giống hay khác nhau.');
    click(button('Cấp tiếp theo'));
    expect(heading()).toBe('Cấp 2 · Cao hơn hay thấp hơn?');
  });
});
