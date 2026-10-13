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
  it('shows the header with Ear training as the current page', () => {
    localStorage.setItem('gm.lang', 'en');
    render();
    const current = host.querySelector('[aria-current="page"]');
    expect(current?.getAttribute('href')).toBe('/ear');
    expect(current?.textContent).toBe('Ear training');
    expect(host.querySelector('h1')?.textContent).toBe('Ear training');
    expect(document.title).toBe('Ear training · Guitarmateur');
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
