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

function stateForScale(scaleId: ScaleId): AppState {
  return { ...defaultState(() => 1), key: { tonic: note('A'), scaleId } };
}

async function mount(scaleId: ScaleId): Promise<{ container: HTMLDivElement; unmount: () => Promise<void> }> {
  const { ScalePositionSection } = await import('./ScalePositionSection');
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(createElement(ScalePositionSection, { state: stateForScale(scaleId), dispatch: () => {} }));
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
