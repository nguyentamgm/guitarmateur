import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, createElement, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Import the App module to verify it compiles and can be mounted.
 * Uses act() for proper React 19 rendering lifecycle.
 */
describe('App', () => {
  // The language switch is remembered; every test starts in English.
  afterEach(() => localStorage.clear());

  it('renders the header copy', async () => {
    const { App } = await import('./App');
    const description = document.createElement('meta');
    description.name = 'description';
    document.head.appendChild(description);
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    try {
      await act(async () => {
        root.render(createElement(StrictMode, null, createElement(App)));
      });

      // The page is named by its header link, in the tab too; the description follows the language.
      expect(container.querySelector('h1')?.textContent).toBe('Practice');
      expect(document.title).toBe('Practice · Guitarmateur');
      expect(description.getAttribute('content')).toMatch(/^Guitarmateur Practice: /);

      // The shared site header: brand · Lessons · Review · Practice (current) · language.
      const header = container.querySelector('header.topbar')!;
      expect(header.querySelector('a.brand')?.getAttribute('href')).toBe('/');
      const nav = [...header.querySelectorAll('nav a')].map((a) => [a.textContent, a.getAttribute('href')]);
      expect(nav).toEqual([
        ['Lessons', '/theory'],
        ['Review', '/theory/review'],
        ['Practice', '/'],
      ]);
      expect(header.querySelector('nav a[aria-current="page"]')?.textContent).toBe('Practice');
      // No sound toggle: nothing sounds until a click asks for it.
      const language = header.querySelector('nav')!.nextElementSibling!;
      expect(language.getAttribute('aria-label')).toBe('Language');
      expect(language.querySelector('svg[aria-hidden="true"]')).not.toBeNull();

      // The page's own actions stay in the page, out of the site header.
      expect(header.textContent).not.toContain('Share');
      expect(container.querySelector('[role="group"][aria-label="Practice actions"]')?.textContent).toContain('Share');

      // The EN/VI switch translates the nav: no untranslated labels in VI.
      await act(async () => {
        language.querySelector<HTMLButtonElement>('button[lang="vi"]')!.click();
      });
      expect([...header.querySelectorAll('nav a')].map((a) => a.textContent)).toEqual(['Bài học', 'Ôn tập', 'Luyện tập']);
      expect(container.querySelector('h1')?.textContent).toBe('Luyện tập');
      expect(document.title).toBe('Luyện tập · Guitarmateur');
      expect(description.getAttribute('content')).toMatch(/^Guitarmateur Luyện tập: /);
    } finally {
      await act(async () => {
        root.unmount();
      });
      container.remove();
      description.remove();
    }
  });

  it('links each step to the lessons that explain it, in the page language', async () => {
    const { App } = await import('./App');
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    try {
      await act(async () => {
        root.render(createElement(App));
      });
      // Lesson links in the page, not the site header's.
      const why = () =>
        [...container.querySelectorAll('section a[href^="/theory/"]')].map((a) => [a.textContent, a.getAttribute('href')]);
      expect(why()).toEqual([
        ['The Pentatonic Map', '/theory/pentatonic-map?lang=en#boxes'],
        ['Pentatonic, the Whole Neck', '/theory/pentatonic?lang=en#connect'],
        ['Keys and Progressions: Chords by Number', '/theory/keys?lang=en'],
        ['Soloing over the Changes: Aim for the Chord', '/theory/solo?lang=en#tones'],
      ]);
      expect(container.querySelector('section')!.textContent).toContain('Why? The Pentatonic Map · Pentatonic, the Whole Neck');

      await act(async () => {
        container.querySelector<HTMLButtonElement>('button[lang="vi"]')!.click();
      });
      // The lesson opens in the page's language too.
      expect(why()[0]).toEqual(['Bản đồ Pentatonic', '/theory/pentatonic-map?lang=vi#boxes']);
      expect(container.querySelector('section')!.textContent).toContain('Vì sao? Bản đồ Pentatonic');
    } finally {
      await act(async () => {
        root.unmount();
      });
      container.remove();
    }
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
