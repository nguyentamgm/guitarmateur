import { describe, expect, it } from 'vitest';
import { act, createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Import the App module to verify it compiles and can be mounted.
 * Uses act() for proper React 19 rendering lifecycle.
 */
describe('App', () => {
  it('renders the header copy', async () => {
    const { App } = await import('./App');
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(createElement(StrictMode, null, createElement(App)));
    });

    expect(container.innerHTML).toContain('Fretboard Trainer');
    expect(container.innerHTML).toContain('Pentatonic Practice');

    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);
  });
});
