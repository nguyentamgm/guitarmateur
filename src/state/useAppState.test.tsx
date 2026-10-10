import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Action, AppState } from './appState';
import { useAppState } from './useAppState';

function mount() {
  let state!: AppState;
  let dispatch!: (a: Action) => void;
  function Probe() {
    [state, dispatch] = useAppState();
    return null;
  }
  const root = createRoot(document.createElement('div'));
  act(() => root.render(createElement(Probe)));
  return { get: () => state, dispatch: (a: Action) => act(() => dispatch(a)), unmount: () => act(() => root.unmount()) };
}

describe("useAppState and a link's ?lang=", () => {
  afterEach(() => {
    localStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  it('opens in the link language for this visit without remembering it', () => {
    localStorage.setItem('gm.lang', 'en');
    window.history.replaceState(null, '', '/?lang=vi');
    const app = mount();
    expect(app.get().language).toBe('vi');
    expect(localStorage.getItem('gm.lang')).toBe('en');
    expect(window.location.search).toBe('');

    // Picking a language is remembered as usual.
    app.dispatch({ type: 'setLanguage', language: 'en' });
    app.dispatch({ type: 'setLanguage', language: 'vi' });
    expect(localStorage.getItem('gm.lang')).toBe('vi');
    app.unmount();
  });
});
