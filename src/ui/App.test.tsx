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

  describe('Export button download', () => {
    let originalCreateObjectURL: PropertyDescriptor | undefined;
    let originalRevokeObjectURL: PropertyDescriptor | undefined;
    let revokeSpy: ReturnType<typeof vi.fn>;
    let clickSpy: ReturnType<typeof vi.spyOn>;
    let container: HTMLDivElement;
    let root: ReturnType<typeof createRoot>;

    beforeEach(() => {
      originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
      originalRevokeObjectURL = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
      revokeSpy = vi.fn();
      Object.defineProperty(URL, 'createObjectURL', {
        value: vi.fn(() => 'blob:fake-url'),
        writable: true,
        configurable: true,
      });
      Object.defineProperty(URL, 'revokeObjectURL', {
        value: revokeSpy,
        writable: true,
        configurable: true,
      });
      clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click');
    });

    afterEach(async () => {
      if (originalCreateObjectURL) {
        Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL);
      }
      if (originalRevokeObjectURL) {
        Object.defineProperty(URL, 'revokeObjectURL', originalRevokeObjectURL);
      }
      vi.restoreAllMocks();
      await act(async () => {
        root.unmount();
      });
      document.body.removeChild(container);
    });

    it('appends anchor, clicks, detaches, defers revokeObjectURL', async () => {
      const { App } = await import('./App');
      container = document.createElement('div');
      document.body.appendChild(container);
      root = createRoot(container);

      await act(async () => {
        root.render(createElement(StrictMode, null, createElement(App)));
      });

      const exportBtn = [...container.querySelectorAll('button')].find(
        b => b.textContent?.trim() === 'Export',
      )!;

      let anchorWasInBody = false;
      let anchorDownload = '';
      clickSpy.mockImplementation(function (this: HTMLAnchorElement) {
        anchorWasInBody = document.body.contains(this);
        anchorDownload = this.download;
      });

      // Capture synchronous revoke state right after click, before any await yields
      let revokeCalledSynchronously = false;
      await act(async () => {
        exportBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        revokeCalledSynchronously = revokeSpy.mock.calls.length > 0;
      });

      expect(clickSpy).toHaveBeenCalledOnce();
      expect(anchorWasInBody).toBe(true);
      expect(anchorDownload).toBe('guitarmateur-practice.json');

      // Revoke must NOT have been called synchronously after the click dispatch
      expect(revokeCalledSynchronously).toBe(false);

      // After the next macrotask, revoke fires exactly once with the blob URL
      await new Promise(r => setTimeout(r, 15));
      expect(revokeSpy).toHaveBeenCalledOnce();
      expect(revokeSpy).toHaveBeenCalledWith('blob:fake-url');

      // Anchor was detached after click
      const anchors = document.body.querySelectorAll('a[download="guitarmateur-practice.json"]');
      expect(anchors.length).toBe(0);
    });
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
