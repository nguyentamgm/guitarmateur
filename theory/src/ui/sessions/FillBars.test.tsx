import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UI } from '../../i18n';
import type { FillBarsCopy } from '../../sessions/types';
import { Ctx, type TheoryContext } from '../context';
import { FillBars, type FillBarsBlock } from './FillBars';
import { SessionSettingsContext } from './sessionSettingsContext';

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

const testCopy: FillBarsCopy = {
  intro: 'Intro text',
  ask: 'Fill in the chords',
  allRight: 'All four bars right!',
  someWrong: 'Some bars were different.',
};

const testBlock: FillBarsBlock = {
  kind: 'fillBars',
  key: 'test',
  in: { tonic: 'G', mode: 'major' },
  keys: ['G', 'D', 'C'],
  pool: [1, 4, 5],
  bars: 4,
  bpm: 80,
};

describe('FillBars', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'],
    });
    mockPlayer.pluck.mockClear();
    mockPlayer.click.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders start button, key chips, and ? in bars 2-4 initially', () => {
    const container = render(
      <Ctx.Provider value={mockCtx}>
        <FillBars block={testBlock} copy={testCopy} />
      </Ctx.Provider>,
    );

    const startBtn = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === UI.en.session.start,
    );
    expect(startBtn).toBeDefined();

    // Key chips exist
    const keyChips = [...container.querySelectorAll('.chip')].map((el) => el.textContent);
    expect(keyChips).toContain('G');
    expect(keyChips).toContain('D');
    expect(keyChips).toContain('C');

    // Bar 1 shows given Roman numeral and symbol
    const degTexts = [...container.querySelectorAll('.deg')].map((el) => el.textContent);
    expect(degTexts[0]).toBe('I');
    expect(degTexts.slice(1)).toEqual(['?', '?', '?']);

    const symTexts = [...container.querySelectorAll('.sym')].map((el) => el.textContent);
    expect(symTexts[0]).toBe('G');
    expect(symTexts.slice(1)).toEqual(['', '', '']);
  });

  it('plays plan on start, lets user pick chords, checks, reveals real chords, and gives next round', () => {
    const container = render(
      <Ctx.Provider value={mockCtx}>
        <FillBars block={testBlock} copy={testCopy} />
      </Ctx.Provider>,
    );

    const startBtn = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === UI.en.session.start,
    )!;
    click(startBtn);

    // Play again and check buttons exist now
    const playAgainBtn = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === UI.en.session.playAgain,
    );
    expect(playAgainBtn).toBeDefined();

    const checkBtn = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === UI.en.session.check,
    ) as HTMLButtonElement | undefined;
    expect(checkBtn).toBeDefined();
    // Check button disabled until all bars have picks
    expect(checkBtn?.disabled).toBe(true);

    // Bar groups for bars 2, 3, 4 exist
    const groups = [...container.querySelectorAll('[role="radiogroup"]')].filter(
      (g) => g.getAttribute('aria-label')?.startsWith('Bar '),
    );
    expect(groups.length).toBe(3);

    // Pick chord IV for bar 2
    const bar2Chips = [...groups[0]!.querySelectorAll('button')];
    const ivChip = bar2Chips.find((c) => c.textContent === 'IV')!;
    click(ivChip);

    // Pick chord V for bar 3
    const bar3Chips = [...groups[1]!.querySelectorAll('button')];
    const vChip = bar3Chips.find((c) => c.textContent === 'V')!;
    click(vChip);

    // Still disabled
    expect(checkBtn?.disabled).toBe(true);

    // Pick chord I for bar 4
    const bar4Chips = [...groups[2]!.querySelectorAll('button')];
    const iChip = bar4Chips.find((c) => c.textContent === 'I')!;
    click(iChip);

    // Let clock finish playing the 4 bars (at 80 BPM, 4 beats * 4 bars = 16 beats = 12s)
    act(() => vi.advanceTimersByTime(13000));

    // Now check button is enabled
    expect(checkBtn?.disabled).toBe(false);

    // Grid shows learner's picks (I, IV, V, I), but never symbols before Check
    const pickedDegrees = [...container.querySelectorAll('.deg')].map((el) => el.textContent);
    expect(pickedDegrees).toEqual(['I', 'IV', 'V', 'I']);

    const pickedSymbols = [...container.querySelectorAll('.sym')].map((el) => el.textContent);
    expect(pickedSymbols[0]).toBe('G');
    expect(pickedSymbols.slice(1)).toEqual(['', '', '']);

    // Click Check
    click(checkBtn ?? null);

    // Marks appear on grid
    const marks = [...container.querySelectorAll('.mark')].map((el) => el.lastChild!.textContent);
    expect(marks.length).toBe(4);
    expect(marks.every((m) => m === '✓' || m === '✗')).toBe(true);
    expect(marks[0]).toBe('✓'); // Bar 1 is given, so always true

    // Real symbols are revealed for all bars
    const revealedSymbols = [...container.querySelectorAll('.sym')].map((el) => el.textContent);
    expect(revealedSymbols.every((s) => s && s.length > 0 && s !== '?')).toBe(true);

    // Result caption appears
    const caption = container.querySelector('p.caption');
    expect(caption).toBeDefined();
    expect([testCopy.allRight, testCopy.someWrong]).toContain(caption?.textContent);

    // Visit-only roundsRight line appears
    const scoreLine = container.querySelector('p.muted.small');
    expect(scoreLine).toBeDefined();
    expect(scoreLine?.textContent).toContain('of 1 rounds right');

    // Next button appears
    const nextBtn = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === UI.en.session.next,
    );
    expect(nextBtn).toBeDefined();

    // Clicking Next starts a new round
    click(nextBtn!);
    const newCheckBtn = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === UI.en.session.check,
    ) as HTMLButtonElement | undefined;
    expect(newCheckBtn).toBeDefined();
    expect(newCheckBtn?.disabled).toBe(true);
  });

  it('honours slow strum speed widening string gap during plan playback and on chip press', () => {
    const container = render(
      <Ctx.Provider value={mockCtx}>
        <SessionSettingsContext.Provider
          value={{ strumSpeed: 'slow', setStrumSpeed: () => {} }}
        >
          <FillBars block={testBlock} copy={testCopy} />
        </SessionSettingsContext.Provider>
      </Ctx.Provider>,
    );

    const startBtn = [...container.querySelectorAll('button')].find(
      (b) => b.textContent === UI.en.session.start,
    )!;
    click(startBtn);

    // Strumming step 0 should have slow strum spread = 0.08
    expect(mockPlayer.pluck).toHaveBeenCalled();
    const plucks = mockPlayer.pluck.mock.calls;
    expect(plucks.length).toBeGreaterThanOrEqual(6);
    const firstStrum = plucks.slice(0, 6);
    expect(firstStrum[1]![1] - firstStrum[0]![1]).toBeCloseTo(0.08, 3);

    // Clear and click a chord chip
    mockPlayer.pluck.mockClear();
    const groups = [...container.querySelectorAll('[role="radiogroup"]')].filter(
      (g) => g.getAttribute('aria-label')?.startsWith('Bar '),
    );
    const chip = groups[0]!.querySelector('button')!;
    click(chip);

    expect(mockPlayer.pluck).toHaveBeenCalled();
    const chipPlucks = mockPlayer.pluck.mock.calls;
    expect(chipPlucks.length).toBeGreaterThanOrEqual(6);
    expect(chipPlucks[1]![1] - chipPlucks[0]![1]).toBeCloseTo(0.08, 3);
  });
});
