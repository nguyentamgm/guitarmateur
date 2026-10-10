import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { INSTALL_STORAGE_KEY, resetVisitCountForTests } from '../../state/install';
import { InstallPrompt } from './InstallPrompt';

function installEvent() {
  const e = new Event('beforeinstallprompt') as Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
  e.prompt = vi.fn(() => Promise.resolve());
  e.userChoice = Promise.resolve({ outcome: 'dismissed' });
  return e;
}

function render(played: boolean) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const draw = (p: boolean) => act(() => root.render(createElement(InstallPrompt, { language: 'en', played: p, buttonStyle: {} })));
  draw(played);
  act(() => {
    window.dispatchEvent(installEvent());
  });
  return { container, draw, unmount: () => act(() => root.unmount()) };
}

const installButton = (c: HTMLElement) => [...c.querySelectorAll('button')].find((b) => b.textContent === 'Install');

describe('InstallPrompt', () => {
  beforeEach(() => {
    localStorage.clear();
    resetVisitCountForTests();
  });
  afterEach(() => localStorage.clear());

  it('shows nothing to a first-time visitor until they play', () => {
    const r = render(false);
    expect(r.container.innerHTML).toBe('');
    r.draw(true);
    expect(installButton(r.container)).toBeDefined();
    r.unmount();
  });

  it('is an inline item, never a fixed overlay', () => {
    const r = render(true);
    expect(r.container.querySelector('[style*="fixed"]')).toBeNull();
    r.unmount();
  });

  it('shows on a second visit, and a dismissal is remembered', () => {
    localStorage.setItem(INSTALL_STORAGE_KEY, JSON.stringify({ visits: 1, done: false }));
    const r = render(false);
    expect(installButton(r.container)).toBeDefined();
    act(() => r.container.querySelector<HTMLButtonElement>('button[aria-label="Dismiss"]')!.click());
    expect(r.container.innerHTML).toBe('');
    expect(JSON.parse(localStorage.getItem(INSTALL_STORAGE_KEY)!).done).toBe(true);
    r.unmount();

    resetVisitCountForTests();
    const again = render(true);
    expect(again.container.innerHTML).toBe('');
    again.unmount();
  });

  it('shows nothing when the browser cannot install', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(createElement(InstallPrompt, { language: 'en', played: true, buttonStyle: {} })));
    expect(container.innerHTML).toBe('');
    act(() => root.unmount());
  });
});
