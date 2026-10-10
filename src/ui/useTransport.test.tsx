import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { UseTransport } from './useTransport';

const calls: { play: unknown[]; click: number[]; note: number[] } = { play: [], click: [], note: [] };

vi.mock('../audio', () => ({
  isAudioSupported: () => true,
  createEngine: () => ({ ctx: { close: () => Promise.resolve() } }),
  Transport: class {
    isPlaying = true;
    play(_licks: unknown, opts: unknown) {
      calls.play.push(opts);
    }
    stop() {}
    setClickGain(v: number) {
      calls.click.push(v);
    }
    setNoteGain(v: number) {
      calls.note.push(v);
    }
  },
}));

const { useTransport } = await import('./useTransport');

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
    calls.play = [];
    calls.click = [];
    calls.note = [];
  });

  it('plays silently while muted and brings back the last gains when unmuted', () => {
    const t = mount();
    t.render(true);
    act(() => t.get().play([], { tempoBpm: 90, clickGain: 0.5, noteGain: 0.8 }));
    expect(calls.play[0]).toMatchObject({ clickGain: 0, noteGain: 0 });

    // A slider moved while muted is remembered, not heard.
    act(() => t.get().setNoteGain(0.3));
    expect(calls.note).not.toContain(0.3);

    t.render(false);
    expect(calls.click.at(-1)).toBe(0.5);
    expect(calls.note.at(-1)).toBe(0.3);

    t.render(true);
    expect(calls.click.at(-1)).toBe(0);
    expect(calls.note.at(-1)).toBe(0);
    t.unmount();
  });

  it('passes the gains straight through when sound is on', () => {
    const t = mount();
    t.render(false);
    act(() => t.get().play([], { tempoBpm: 90, clickGain: 0.5, noteGain: 0.8 }));
    expect(calls.play[0]).toMatchObject({ clickGain: 0.5, noteGain: 0.8 });
    act(() => t.get().setClickGain(0.2));
    expect(calls.click.at(-1)).toBe(0.2);
    t.unmount();
  });
});
