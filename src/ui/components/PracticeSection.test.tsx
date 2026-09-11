import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement, useState, Fragment } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Regression test: clearing the last chord while the transport is playing used to leave
 * audio running with no visible stop control, because `PlaybackControls` only renders
 * inside the non-empty-progression branch. The fix stops the transport whenever the
 * progression becomes empty, independent of whether `PlaybackControls` is mounted.
 */

const T = { isPlaying: false, playCalls: 0, stopCalls: 0 };
vi.mock('../useTransport', () => ({
  useTransport: () => ({
    supported: true,
    isPlaying: T.isPlaying,
    position: null,
    play: () => { T.playCalls++; T.isPlaying = true; },
    stop: () => { T.stopCalls++; T.isPlaying = false; },
    setClickGain: () => {},
    setNoteGain: () => {},
  }),
}));

import { PracticeSection } from './PracticeSection';
import { defaultState, type AppState, type Action } from '../../state';
import { reducer } from '../../state/appState';

let c = 1;
const seed = () => c++;

function Harness({ initial }: { initial: AppState }) {
  const [state, setState] = useState(initial);
  const dispatch = (a: Action) => setState((s) => reducer(s, a, seed));
  return createElement(
    Fragment,
    null,
    createElement('button', { 'aria-label': 'TEST-CLEAR', onClick: () => dispatch({ type: 'clearProgression' }) }),
    createElement('button', { 'aria-label': 'TEST-REROLL', onClick: () => dispatch({ type: 'rerollAll' }) }),
    createElement(PracticeSection, { state, dispatch }),
  );
}

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

afterEach(() => { act(() => root.unmount()); container.remove(); });

function byName(re: RegExp): HTMLButtonElement | null {
  return (
    [...container.querySelectorAll('button')].find(
      (b) => re.test(b.getAttribute('aria-label') ?? '') || re.test(b.textContent ?? ''),
    ) ?? null
  );
}

async function mount(): Promise<void> {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root.render(createElement(Harness, { initial: defaultState(seed, 'en') })); });
}

describe('PracticeSection transport vs. progression edits', () => {
  it('stops playback when the progression is cleared mid-playback', async () => {
    T.isPlaying = false; T.playCalls = 0; T.stopCalls = 0;
    await mount();

    const play = byName(/Play progression/);
    expect(play).not.toBeNull();
    await act(async () => { play!.click(); });
    expect(T.isPlaying).toBe(true);

    await act(async () => { byName(/TEST-CLEAR/)!.click(); });

    expect(T.isPlaying).toBe(false);
    expect(T.stopCalls).toBe(1);
    expect(byName(/Stop playback/)).toBeNull();
  });

  it('does not interrupt playback when an edit leaves the progression non-empty', async () => {
    T.isPlaying = false; T.playCalls = 0; T.stopCalls = 0;
    await mount();

    const play = byName(/Play progression/);
    expect(play).not.toBeNull();
    await act(async () => { play!.click(); });
    expect(T.isPlaying).toBe(true);

    await act(async () => { byName(/TEST-REROLL/)!.click(); });

    expect(T.isPlaying).toBe(true);
    expect(T.stopCalls).toBe(0);
    expect(byName(/Stop playback/)).not.toBeNull();
  });
});
