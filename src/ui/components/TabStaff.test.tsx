import { describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Lick, LickNote } from '../../lick';
import type { TabStaffProps } from './TabStaff';

const A2 = { letter: 'A', alter: 0, octave: 2 } as const;
const D3 = { letter: 'D', alter: 0, octave: 3 } as const;

/** Minimal lick with two notes; `lengthBeats` controls how many beat ticks are drawn. */
function makeLick(lengthBeats: number, notes?: LickNote[]): Lick {
  return {
    lengthBeats,
    difficulty: 1,
    notes: notes ?? [
      { string: 0, fret: 5, pitch: A2, startBeat: 0, durationBeats: 1 },
      { string: 1, fret: 5, pitch: D3, startBeat: 2, durationBeats: 1 },
    ],
  };
}

async function mount(props: TabStaffProps): Promise<{ container: HTMLDivElement; unmount: () => Promise<void> }> {
  const { TabStaff } = await import('./TabStaff');
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(createElement(TabStaff, props));
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

const texts = (container: HTMLElement, selector: string) => [...container.querySelectorAll(selector)].map((t) => t.textContent ?? '');

/**
 * Regression tests for the beat-tick numbering. The closing barline tick (at b === lengthBeats) is
 * NOT a beat start and must not carry a number label, otherwise 1-bar licks show a phantom "5" and
 * 2-bar licks a phantom "9".
 */
describe('TabStaff beat ticks', () => {
  it('numbers only real beats for a 1-bar lick (no phantom "5")', async () => {
    const { container, unmount } = await mount({ lick: makeLick(4) });
    expect(texts(container, 'text.tabbeatnum')).toEqual(['1', '2', '3', '4']);
    await unmount();
  });

  it('numbers only real beats for a 2-bar lick (no phantom "9")', async () => {
    const { container, unmount } = await mount({ lick: makeLick(8) });
    expect(texts(container, 'text.tabbeatnum')).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
    await unmount();
  });

  it('draws bar lines at the start, between bars and closing; faint ticks on the other beats', async () => {
    const { container, unmount } = await mount({ lick: makeLick(8) });
    expect(container.querySelectorAll('line.tabbar')).toHaveLength(3);
    expect(container.querySelectorAll('line.tabbeat')).toHaveLength(6);
    await unmount();
  });
});

describe('TabStaff in Theory\'s look', () => {
  it('names the strings from the tuning, thinnest on top', async () => {
    const { container, unmount } = await mount({ lick: makeLick(4), stringLabels: ['D', 'A', 'D', 'G', 'B', 'e'] });
    expect(texts(container, 'text.tabname')).toEqual(['D', 'A', 'D', 'G', 'B', 'e']);
    const ys = [...container.querySelectorAll('text.tabname')].map((t) => Number(t.getAttribute('y')));
    expect(ys[0]).toBeGreaterThan(ys[5]!); // the low string is drawn lowest
    await unmount();
  });

  it('writes the technique into the number, with readable duration and chord-tone rows', async () => {
    const lick = makeLick(4, [
      { string: 2, fret: 7, pitch: { letter: 'A', alter: 0, octave: 3 }, startBeat: 0, durationBeats: 0.5, role: 'R' },
      { string: 2, fret: 9, pitch: { letter: 'B', alter: 0, octave: 3 }, startBeat: 0.5, durationBeats: 0.5, technique: 'bendFull' },
      { string: 2, fret: 7, pitch: { letter: 'A', alter: 0, octave: 3 }, startBeat: 1, durationBeats: 1, technique: 'pull', role: 'R' },
    ]);
    const { container, unmount } = await mount({ lick });
    expect(texts(container, 'g.tabnum text')).toEqual(['7', '7b9', 'p7']);
    expect(texts(container, 'text.tabcount')).toEqual(['½', '½', '1']);
    expect(texts(container, 'text.tabrole')).toEqual(['R', 'R']);
    await unmount();
  });

  it('keeps the closest notes far enough apart that their numbers never touch', async () => {
    const sixteenths = Array.from({ length: 16 }, (_, i) => ({ string: 2, fret: 12, pitch: D3, startBeat: i / 4, durationBeats: 0.25 }));
    const { container, unmount } = await mount({ lick: makeLick(4, sixteenths) });
    const rects = [...container.querySelectorAll('g.tabnum rect')].map((r) => ({ x: Number(r.getAttribute('x')), w: Number(r.getAttribute('width')) }));
    for (let i = 1; i < rects.length; i++) expect(rects[i]!.x).toBeGreaterThan(rects[i - 1]!.x + rects[i - 1]!.w);
    await unmount();
  });

  it('fills the sounding note', async () => {
    const { container, unmount } = await mount({ lick: makeLick(4), activeNoteIndex: 1 });
    expect([...container.querySelectorAll('g.tabnum')].map((g) => g.classList.contains('on'))).toEqual([false, true]);
    expect(container.querySelector('rect.tabcol')).not.toBeNull();
    await unmount();
  });

  it('with `play`, each number is a button that plays its note', async () => {
    const play = vi.fn();
    const { container, unmount } = await mount({ lick: makeLick(4), play });
    const buttons = [...container.querySelectorAll<SVGGElement>('g.tabnum[role="button"]')];
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(['E/5', 'A/5']);
    act(() => buttons[1]!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    expect(play).toHaveBeenCalledWith(50); // D3
    await unmount();
  });

  it('without `play`, the numbers are not buttons', async () => {
    const { container, unmount } = await mount({ lick: makeLick(4) });
    expect(container.querySelector('[role="button"]')).toBeNull();
    await unmount();
  });
});
