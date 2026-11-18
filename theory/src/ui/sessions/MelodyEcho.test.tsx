import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UI } from '../../i18n';
import type { MelodyEchoCopy } from '../../sessions/types';
import { Ctx, type TheoryContext } from '../context';
import { MelodyEcho, type MelodyEchoBlock } from './MelodyEcho';

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

const testCopy: MelodyEchoCopy = {
  intro: 'Intro text',
  ask: 'Hear and tap',
  right: 'Right.',
  higher: 'The note you want is higher.',
  lower: 'The note you want is lower.',
  done: 'That was Frère Jacques.',
};

describe('MelodyEcho', () => {
  it('renders start button, starts playback, allows tapping, and advances phrases', () => {
    const block: MelodyEchoBlock = {
      kind: 'melodyEcho',
      key: 'tune',
      tonic: 'G',
      string: 3,
      phrases: [
        [1, 2], // 2-note phrase
        [2, 3], // 2-note phrase
      ],
    };

    const container = render(
      <Ctx.Provider value={mockCtx}>
        <MelodyEcho block={block} copy={testCopy} />
      </Ctx.Provider>,
    );

    // Initial state: Start button is visible
    const buttons = container.querySelectorAll('button');
    const startBtn = Array.from(buttons).find((b) => b.textContent === UI.en.session.start);
    expect(startBtn).toBeDefined();

    // First note (degree 1 -> fret 0) is given (not faint)
    const dots = container.querySelectorAll('.dot');
    expect(dots.length).toBe(8); // degrees 1..8
    const firstDot = dots[0]!;
    expect(firstDot.classList.contains('faint')).toBe(false);
    // Other dots are faint
    expect(dots[1]!.classList.contains('faint')).toBe(true);

    // Click Start
    click(startBtn!);
    expect(mockPlayer.cancel).toHaveBeenCalled();

    // Now button changes to Play again
    const playAgainBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === UI.en.session.playAgain,
    );
    expect(playAgainBtn).toBeDefined();

    // Tap wrong note: looking for degree 2 (fret 2), tap degree 5 (fret 7, index 4)
    const fret7Dot = dots[4]!;
    click(fret7Dot);
    const caption = container.querySelector('p.caption');
    expect(caption?.textContent).toBe(testCopy.lower);

    // Tap wrong note: tap degree 1 (fret 0, index 0)
    click(firstDot);
    expect(caption?.textContent).toBe(testCopy.higher);

    // Tap right note: degree 2 (fret 2, index 1)
    const fret2Dot = dots[1]!;
    click(fret2Dot);
    expect(caption?.textContent).toBe(testCopy.right);
    expect(caption?.classList.contains('good')).toBe(true);
    expect(fret2Dot.classList.contains('faint')).toBe(false);

    // Next button is now shown
    const nextBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === UI.en.session.next,
    );
    expect(nextBtn).toBeDefined();

    // Click Next -> moves to phrase 2 [2, 3]
    click(nextBtn!);
    // In phrase 2, first note is degree 2 (fret 2) -> given!
    expect(dots[1]!.classList.contains('faint')).toBe(false);

    // Solve phrase 2: tap degree 3 (fret 4, index 2)
    const fret4Dot = dots[2]!;
    click(fret4Dot);
    expect(caption?.textContent).toBe(testCopy.right);

    // Next button appears
    const nextBtn2 = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === UI.en.session.next,
    );
    expect(nextBtn2).toBeDefined();

    // Click Next -> last phrase was finished, so it shows copy.done!
    click(nextBtn2!);
    expect(container.querySelector('p.caption')?.textContent).toBe(testCopy.done);
  });
});
