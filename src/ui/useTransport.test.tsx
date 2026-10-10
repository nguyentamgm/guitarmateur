import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { UseTransport } from './useTransport';

const muteCalls: boolean[] = [];

vi.mock('../audio', () => ({
  isAudioSupported: () => true,
  createEngine: () => ({ ctx: { close: () => Promise.resolve() } }),
  setMuted: (_engine: unknown, muted: boolean) => muteCalls.push(muted),
  Transport: class {
    isPlaying = true;
    play() {}
    stop() {}
    setClickGain() {}
    setNoteGain() {}
  },
}));

const { useTransport } = await import('./useTransport');
const { resetEngineForTests } = await import('./audioEngine');

function mount() {
  let current!: UseTransport;
  function Probe({ muted }: { muted: boolean }) {
    current = useTransport(muted);
    return null;
  }
  const root = createRoot(document.createElement('div'));
  const render = (muted: boolean) => act(() => root.render(createElement(Probe, { muted })));
  return { render, get: () => current, unmount: () => act(() => root.unmount()) };
}

describe('useTransport mute (the header sound toggle)', () => {
  beforeEach(() => {
    muteCalls.length = 0;
    resetEngineForTests();
  });

  it('a muted toggle before the first play mutes the engine as soon as it exists', () => {
    const t = mount();
    t.render(true);
    expect(muteCalls).toEqual([]); // no engine before a user gesture
    act(() => t.get().play([], { tempoBpm: 90 }));
    expect(muteCalls).toEqual([true]);
    t.unmount();
  });

  it('follows the toggle once the engine exists', () => {
    const t = mount();
    t.render(false);
    act(() => t.get().play([], { tempoBpm: 90 }));
    expect(muteCalls).toEqual([]);
    t.render(true);
    t.render(false);
    expect(muteCalls).toEqual([true, false]);
    t.unmount();
  });
});
