import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UI } from '../../i18n';
import type { ChangeTapCopy } from '../../sessions/types';
import { Ctx, type TheoryContext } from '../context';
import { ChangeTap, type ChangeTapBlock } from './ChangeTap';

const roots: Root[] = [];
function render(el: ReactElement) {
  const container = document.createElement('div');
  const root = createRoot(container);
  roots.push(root);
  act(() => root.render(el));
  return container;
}

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount());
});

function click(el: Element | null) {
  act(() => {
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

const mockPlayer = {
  pluck: vi.fn(),
  mute: vi.fn(),
  click: vi.fn(),
  cancel: vi.fn(),
  close: vi.fn(),
  unlock: vi.fn().mockResolvedValue(undefined),
  loadSample: vi.fn().mockResolvedValue(undefined),
  samplesLoaded: () => true,
  setEnabled: vi.fn(),
  enabled: true,
  now: () => 0,
  setLevels: vi.fn(),
};

const mockCtx: TheoryContext = {
  lang: 'en',
  ui: UI.en,
  setLang: () => {},
  player: mockPlayer,
  navigate: () => {},
  recordQuiz: () => {},
  toggleSessionTick: () => {},
};

const testCopy: ChangeTapCopy = {
  intro: 'Intro text',
  ask: 'Tap when the chord changes',
  result: 'You caught {caught} of {total} chord changes. Extra taps: {extra}.',
};

const testBlock: ChangeTapBlock = {
  kind: 'changeTap',
  key: 'test',
  in: { tonic: 'G', mode: 'major' },
  pool: [1, 4, 5],
  holds: [2],
  bars: 8,
  bpm: 120,
};

describe('ChangeTap', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders start button and ? bars initially', () => {
    const container = render(
      <Ctx.Provider value={mockCtx}>
        <ChangeTap block={testBlock} copy={testCopy} />
      </Ctx.Provider>,
    );

    const startBtn = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === UI.en.session.start,
    );
    expect(startBtn).toBeDefined();

    const symTexts = [...container.querySelectorAll('.sym')].map((el) => el.textContent);
    expect(symTexts.length).toBe(8);
    expect(symTexts.every((t) => t === '?')).toBe(true);
  });

  it('runs a full round with taps, scores marks, and allows another round', () => {
    const container = render(
      <Ctx.Provider value={mockCtx}>
        <ChangeTap block={testBlock} copy={testCopy} />
      </Ctx.Provider>,
    );

    const startBtn = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === UI.en.session.start,
    )!;
    click(startBtn);

    // Now tap button is visible
    const tapBtn = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === testCopy.ask,
    )!;
    expect(tapBtn).toBeDefined();

    // Advance 4 beats (at 120 BPM, 0.5s per beat, 1 bar = 2.0s)
    // Tap near bar 2 (starts at beat 8 = 4.0s)
    act(() => vi.advanceTimersByTime(4050));
    click(tapBtn);

    // Tap near bar 4 (starts at beat 16 = 8.0s)
    act(() => vi.advanceTimersByTime(4000));
    click(tapBtn);

    // Let the clock run out all 8 bars (total ~16 seconds)
    act(() => vi.advanceTimersByTime(10000));

    // Finished: "Another round" button appears
    const againBtn = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === UI.en.session.again,
    );
    expect(againBtn).toBeDefined();

    // Bars now show real Roman numerals and symbols instead of ?
    const symTexts = [...container.querySelectorAll('.sym')].map((el) => el.textContent);
    expect(symTexts.some((t) => t === '?')).toBe(false);

    // Result caption appears with score
    const caption = container.querySelector('.caption.good');
    expect(caption).toBeDefined();
    expect(caption?.textContent).toContain('chord changes');

    // Marks are displayed on change bars
    const markTexts = [...container.querySelectorAll('.mark')].map((el) => el.lastChild!.textContent);
    expect(markTexts.length).toBeGreaterThan(0);
    expect(markTexts.every((m) => m === '✓' || m === '✗')).toBe(true);

    // Mark description comes from ui strings
    const markTitles = [...container.querySelectorAll('.mark title')].map((el) => el.textContent);
    expect(markTitles.every((t) => t === UI.en.session.changeCaught || t === UI.en.session.changeMissed)).toBe(true);

    // Clicking Another round starts over
    click(againBtn!);
    const newTapBtn = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === testCopy.ask,
    );
    expect(newTapBtn).toBeDefined();
  });
});
