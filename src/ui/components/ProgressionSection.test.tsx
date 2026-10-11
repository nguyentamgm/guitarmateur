import { describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { chordLabel, romanNumeral } from '../../music';
import { defaultState, type AppState } from '../../state';
import { ProgressionSection } from './ProgressionSection';

async function mount(state: AppState, currentBar: number | null = null) {
  const container = document.createElement('div');
  const root = createRoot(container);
  await act(async () => {
    root.render(createElement(ProgressionSection, { state, dispatch: () => {}, currentBar }));
  });
  return { container, unmount: () => act(async () => root.unmount()) };
}

const cells = (container: HTMLElement) =>
  [...container.querySelectorAll('svg.bars g.bar')].map((g) => [g.querySelector('.deg')!.textContent, g.querySelector('.sym')!.textContent]);

describe('ProgressionSection bar grid', () => {
  it('draws one bar per bar of the progression, a 2-bar chord twice, numeral above chord', async () => {
    const base = defaultState(() => 1, 'en');
    const [first, ...rest] = base.progression;
    const state = { ...base, progression: [{ ...first!, bars: 2 as const }, ...rest] };
    const { container, unmount } = await mount(state);
    const expected = state.progression.flatMap((e) => Array.from({ length: e.bars }, () => [romanNumeral(state.key, e.chord), chordLabel(e.chord)]));
    expect(cells(container)).toEqual(expected);
    expect(cells(container)[0]).toEqual(cells(container)[1]);
    expect(container.querySelector('svg.bars')!.getAttribute('aria-label')).toBe('Progression, bar by bar');
    await unmount();
  });

  it('lights the bar being heard, none when idle', async () => {
    const state = defaultState(() => 1, 'en');
    const idle = await mount(state);
    expect(idle.container.querySelectorAll('g.bar.on')).toHaveLength(0);
    await idle.unmount();
    const playing = await mount(state, 1);
    const bars = [...playing.container.querySelectorAll('g.bar')];
    expect(bars.map((g) => g.classList.contains('on'))).toEqual(bars.map((_, i) => i === 1));
    await playing.unmount();
  });

  it('draws no grid for an empty progression', async () => {
    const { container, unmount } = await mount({ ...defaultState(() => 1, 'en'), progression: [] });
    expect(container.querySelector('svg.bars')).toBeNull();
    await unmount();
  });
});
