import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './App';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  localStorage.clear();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  window.history.replaceState(null, '', '/');
});

const render = () => act(() => root.render(createElement(App)));

describe('ear trainer page', () => {
  it('is named Ear training but stays out of the header for now', () => {
    localStorage.setItem('gm.lang', 'en');
    render();
    expect(host.querySelector('header nav a[href="/ear"]')).toBeNull();
    expect(host.querySelector('h1')?.textContent).toBe('Ear training');
    expect(document.title).toBe('Ear training · Guitarmateur');
  });

  it('opens the beginner levels, also from an old link, whose query it ignores', () => {
    localStorage.setItem('gm.lang', 'en');
    window.history.replaceState(null, '', '/ear?key=A&mode=minor&notes=blues');
    render();
    expect(host.querySelector('.levels h2')?.textContent).toBe(
      'Train your ear, one small step at a time',
    );
    expect(localStorage.getItem('gm.ear')).toBeNull();
  });

  it('?level=n opens that level when it is open, else the map saying why; then leaves the address', () => {
    localStorage.setItem('gm.lang', 'en');
    const levels = Object.fromEntries(
      [1, 2, 3].map((i) => [i, { step: 2, best: 9, done: true, counts: {} }]),
    );
    localStorage.setItem('gm.ear', JSON.stringify({ version: 2, welcomed: true, levels }));
    window.history.replaceState(null, '', '/ear?level=12');
    render();
    expect(host.querySelector('.lv-warn')?.textContent).toBe(
      'Level 12 opens once you have passed the levels before it.',
    );
    expect(host.querySelector('.levels h2')?.textContent).toBe('Your levels');
    expect(window.location.search).toBe('');
    act(() => root.unmount());
    root = createRoot(host);
    window.history.replaceState(null, '', '/ear?level=4');
    render();
    expect(host.querySelector('.levels h2')?.textContent).toBe('Level 4 · Close or far?');
  });

  it('switches language and remembers it for every page', () => {
    localStorage.setItem('gm.lang', 'en');
    render();
    const vi = host.querySelector<HTMLButtonElement>('button[lang="vi"]')!;
    act(() => vi.click());
    expect(host.querySelector('h1')?.textContent).toBe('Luyện tai');
    expect(document.documentElement.lang).toBe('vi');
    expect(localStorage.getItem('gm.lang')).toBe('vi');
  });

  it('takes ?lang= for this visit only and clears it from the address', () => {
    localStorage.setItem('gm.lang', 'en');
    window.history.replaceState(null, '', '/ear?lang=vi');
    render();
    expect(host.querySelector('h1')?.textContent).toBe('Luyện tai');
    expect(window.location.search).toBe('');
    expect(localStorage.getItem('gm.lang')).toBe('en');
  });
});
