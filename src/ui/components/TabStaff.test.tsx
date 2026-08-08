import { describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Lick } from '../../lick';

/**
 * Regression tests for the beat-tick numbering. The closing barline tick (at
 * b === lengthBeats) is NOT a beat start and must not carry a number label,
 * otherwise 1-bar licks show a phantom "5" and 2-bar licks a phantom "9".
 */

/** Minimal lick with two notes; `lengthBeats` controls how many beat ticks are drawn. */
function makeLick(lengthBeats: number): Lick {
  return {
    lengthBeats,
    difficulty: 1,
    notes: [
      { string: 0, fret: 5, pitch: { letter: 'A', alter: 0, octave: 2 }, startBeat: 0, durationBeats: 1 },
      { string: 1, fret: 5, pitch: { letter: 'D', alter: 0, octave: 3 }, startBeat: 2, durationBeats: 1 },
    ],
  };
}

/** Text elements rendered as beat number labels are the ones with font-size 9. */
function beatLabels(container: HTMLElement): string[] {
  return [...container.querySelectorAll('text')]
    .filter(t => t.getAttribute('font-size') === '9')
    .map(t => t.textContent ?? '');
}

async function mount(lick: Lick): Promise<{ container: HTMLDivElement; unmount: () => Promise<void> }> {
  const { TabStaff } = await import('./TabStaff');
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(createElement(TabStaff, { lick }));
  });
  return {
    container,
    unmount: async () => {
      await act(async () => {
        root.unmount();
      });
      document.body.removeChild(container);
    },
  };
}

describe('TabStaff beat ticks', () => {
  it('numbers only real beats for a 1-bar lick (no phantom "5")', async () => {
    const { container, unmount } = await mount(makeLick(4));
    expect(beatLabels(container)).toEqual(['1', '2', '3', '4']);
    await unmount();
  });

  it('numbers only real beats for a 2-bar lick (no phantom "9")', async () => {
    const { container, unmount } = await mount(makeLick(8));
    expect(beatLabels(container)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
    await unmount();
  });

  it('still renders the closing barline tick at the staff right edge', async () => {
    const { container, unmount } = await mount(makeLick(4));
    // Right edge = padL (26) + stageW (260) = 286. Tick lines are vertical, so
    // jsdom reports the edge on x1/x2 rather than a bare `x` attribute.
    const closing = [...container.querySelectorAll('line')].filter(
      l => l.getAttribute('x1') === '286' && l.getAttribute('x2') === '286',
    );
    expect(closing.length).toBeGreaterThanOrEqual(1);
    await unmount();
  });
});
