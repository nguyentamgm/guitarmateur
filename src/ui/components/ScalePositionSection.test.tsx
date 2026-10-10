import { describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { note, type ScaleId } from '../../music';
import { defaultState, type AppState } from '../../state';

/**
 * Regression tests for the legend's blue-note entry. The dashed decoration ring is rendered for
 * EVERY decorated scale (blues ♭5, major blues ♭3), so the legend must explain each by its own
 * interval name — the previous hardcoded `'blues'` check omitted major blues entirely and would
 * have mislabeled it as ♭5.
 */

function stateForScale(scaleId: ScaleId, leftHanded = false): AppState {
  return { ...defaultState(() => 1), key: { tonic: note('A'), scaleId }, leftHanded };
}

async function mount(scaleId: ScaleId, leftHanded = false): Promise<{ container: HTMLDivElement; unmount: () => Promise<void> }> {
  const { ScalePositionSection } = await import('./ScalePositionSection');
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(createElement(ScalePositionSection, { state: stateForScale(scaleId, leftHanded), dispatch: () => {} }));
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

describe('ScalePositionSection legend', () => {
  it('names the blues ♭5 blue note', async () => {
    const { container, unmount } = await mount('blues');
    expect(container.innerHTML).toContain('♭5 (blue note)');
    await unmount();
  });

  it('names the major-blues ♭3 blue note', async () => {
    const { container, unmount } = await mount('major-blues');
    expect(container.innerHTML).toContain('♭3 (blue note)');
    expect(container.innerHTML).not.toContain('♭5 (blue note)');
    await unmount();
  });

  it('shows no blue-note entry for an undecorated scale', async () => {
    const { container, unmount } = await mount('minorPentatonic');
    expect(container.innerHTML).not.toContain('blue note');
    await unmount();
  });
});

describe('ScalePositionSection neck', () => {
  it('draws one whole neck, mirrored for a left-handed player', async () => {
    const { container, unmount } = await mount('minorPentatonic', true);
    const necks = container.querySelectorAll('svg[role="group"]');
    expect(necks).toHaveLength(1);
    expect(necks[0]!.querySelector(':scope > g')!.getAttribute('transform')).toMatch(/scale\(-1 1\)/);
    await unmount();
  });

  it('frames every box on the neck, one chip per box, the selected one highlighted', async () => {
    const { container, unmount } = await mount('minorPentatonic');
    expect(container.querySelectorAll('g.boxghost')).toHaveLength(5);
    expect(container.querySelectorAll('g.boxghost.on')).toHaveLength(1);
    const chips = [...container.querySelectorAll('button.chip.text')].filter((b) => b.textContent?.startsWith('Box'));
    expect(chips).toHaveLength(5);
    expect(chips.filter((b) => b.getAttribute('aria-pressed') === 'true')).toHaveLength(1);
    expect(container.querySelector('rect.boxrect')).not.toBeNull();
    await unmount();
  });

  it('labels the dots with degrees, the root as home', async () => {
    const { container, unmount } = await mount('minorPentatonic');
    const labels = new Set([...container.querySelectorAll('g.dot > text')].map((t) => t.textContent));
    expect([...labels].sort()).toEqual(['1', '4', '5', '♭3', '♭7'].sort());
    expect([...container.querySelectorAll('g.dot.home > text')].every((t) => t.textContent === '1')).toBe(true);
    await unmount();
  });

  it('marks the blues ♭5 as a blue note', async () => {
    const { container, unmount } = await mount('blues');
    const blue = [...container.querySelectorAll('g.dot.blue > text')].map((t) => t.textContent);
    expect(blue.length).toBeGreaterThan(0);
    expect(new Set(blue)).toEqual(new Set(['♭5']));
    await unmount();
  });
});
