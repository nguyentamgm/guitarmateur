import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
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

  describe('Share button clipboard fallback', () => {
    let originalExecCommand: Document['execCommand'] | undefined;

    beforeEach(() => {
      vi.stubGlobal('prompt', vi.fn());
      originalExecCommand = (document as unknown as { execCommand?: Document['execCommand'] })
        .execCommand;
      Object.defineProperty(document, 'execCommand', {
        value: vi.fn().mockReturnValue(true),
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(document, 'execCommand', {
        value: originalExecCommand,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it('writeText rejects -> execCommand fallback -> shows Copied!', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockRejectedValue(new Error('permission denied')) },
        writable: true,
        configurable: true,
      });

      const { App } = await import('./App');
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      await act(async () => {
        root.render(createElement(StrictMode, null, createElement(App)));
      });

      const shareBtn = [...container.querySelectorAll('button')].find(
        b => b.textContent?.trim() === 'Share',
      )!;

      await act(async () => {
        shareBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await Promise.resolve();
      });

      expect(container.innerHTML).toContain('Copied!');

      await act(async () => {
        root.unmount();
      });
      document.body.removeChild(container);
    });

    it('navigator.clipboard undefined -> execCommand fallback -> shows Copied!', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { App } = await import('./App');
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      await act(async () => {
        root.render(createElement(StrictMode, null, createElement(App)));
      });

      const shareBtn = [...container.querySelectorAll('button')].find(
        b => b.textContent?.trim() === 'Share',
      )!;

      await act(async () => {
        shareBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(container.innerHTML).toContain('Copied!');

      await act(async () => {
        root.unmount();
      });
      document.body.removeChild(container);
    });
  });
});
