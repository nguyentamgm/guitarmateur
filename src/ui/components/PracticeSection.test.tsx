import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement, useState, Fragment } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Clearing the last chord while the transport is playing must stop it: `PlaybackControls` only
 * renders inside the non-empty-progression branch, so there would be no visible stop control.
 */

const T: {
  isPlaying: boolean;
  playCalls: number;
  stopCalls: number;
  position: { entryIndex: number; noteIndex: number } | null;
  cardIndex: number | null;
  isResponding: boolean;
  lastOpts: Record<string, unknown> | null;
} = {
  isPlaying: false,
  playCalls: 0,
  stopCalls: 0,
  position: null,
  cardIndex: null,
  isResponding: false,
  lastOpts: null,
};
vi.mock('../useTransport', () => ({
  useTransport: () => ({
    supported: true,
    isPlaying: T.isPlaying,
    position: T.position,
    cardIndex: T.cardIndex,
    isResponding: T.isResponding,
    play: (_licks: unknown, opts: Record<string, unknown>) => {
      T.playCalls++;
      T.isPlaying = true;
      T.lastOpts = opts;
      T.cardIndex = (opts?.cardIndex as number | undefined) ?? null;
    },
    stop: () => {
      T.stopCalls++;
      T.isPlaying = false;
      T.cardIndex = null;
      T.isResponding = false;
    },
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

    const play = byName(/Play the progression/);
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

    const play = byName(/Play the progression/);
    expect(play).not.toBeNull();
    await act(async () => { play!.click(); });
    expect(T.isPlaying).toBe(true);

    await act(async () => { byName(/TEST-REROLL/)!.click(); });

    expect(T.isPlaying).toBe(true);
    expect(T.stopCalls).toBe(0);
    expect(byName(/Stop playback/)).not.toBeNull();
  });
});

describe('PracticeSection playback status', () => {
  it('tells a screen reader playing (with the chord being heard) and stopped, in one polite region', async () => {
    T.isPlaying = false; T.position = null;
    // jsdom has no scrollIntoView; the card being heard scrolls into view.
    Element.prototype.scrollIntoView = () => {};
    await mount();
    const regions = container.querySelectorAll('[role="status"]');
    expect(regions).toHaveLength(1);
    const status = regions[0]!;
    expect(status.className).toBe('sr-only');
    expect(status.textContent).toBe('Stopped');
    const rerender = () => act(async () => { byName(/TEST-REROLL/)!.click(); });

    await act(async () => { byName(/Play the progression/)!.click(); });
    await rerender(); // the mock transport does not re-render by itself
    expect(status.textContent).toBe('Playing'); // counting in: no chord yet
    T.position = { entryIndex: 1, noteIndex: 0 };
    await rerender();
    expect(status.textContent).toBe('Playing: G');
    // The same region, kept: a live region must exist before its text changes.
    expect(container.querySelector('[role="status"]')).toBe(status);
    T.position = { entryIndex: 2, noteIndex: 0 };
    await rerender();
    expect(status.textContent).toBe('Playing: F');

    T.isPlaying = false; T.position = null;
    await rerender();
    expect(status.textContent).toBe('Stopped');
  });

  it('loops a single chord card and announces Your turn during trade response passes', async () => {
    T.isPlaying = false; T.position = null; T.cardIndex = null; T.isResponding = false; T.lastOpts = null;
    Element.prototype.scrollIntoView = () => {};
    await mount();
    const status = container.querySelector('[role="status"]')!;
    const rerender = () => act(async () => { byName(/TEST-REROLL/)!.click(); });

    // Enable Trade bars on PlaybackControls, then click Loop on the second card (G).
    await act(async () => { byName(/Trade bars on or off/)!.click(); });
    await act(async () => { byName(/Loop lick for G/)!.click(); });
    await rerender();

    expect(T.lastOpts).toMatchObject({ cardIndex: 1, loop: true, trade: true });
    expect(status.textContent).toBe('Playing: G');
    expect(byName(/Stop looping G/)).not.toBeNull();

    // Response pass (learner's turn): announces Your turn: G.
    T.isResponding = true;
    T.position = { entryIndex: 1, noteIndex: -1 };
    await rerender();
    expect(status.textContent).toBe('Your turn: G');

    // Clicking Stop looping G stops playback.
    await act(async () => { byName(/Stop looping G/)!.click(); });
    await rerender();
    expect(T.isPlaying).toBe(false);
    expect(status.textContent).toBe('Stopped');
  });
});
