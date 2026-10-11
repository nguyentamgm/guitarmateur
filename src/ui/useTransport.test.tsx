import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Player } from '@shared/core/audio';
import type { Lick } from '../lick';
import type { UseTransport } from './useTransport';

const calls = { enabled: [] as boolean[], levels: [] as object[], plucks: [] as number[], clicks: 0 };
let clock = 0;
const player: Player = {
  enabled: true,
  setEnabled: (on) => calls.enabled.push(on),
  setLevels: (l) => calls.levels.push(l),
  pluck: (midi) => calls.plucks.push(midi),
  mute: (midi) => calls.plucks.push(midi),
  click: () => calls.clicks++,
  now: () => clock,
};

vi.mock('@shared/core/audio', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/core/audio')>()),
  isAudioSupported: () => true,
}));
vi.mock('./audioPlayer', () => ({ getPlayer: () => player }));

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

const A4 = { letter: 'A', alter: 0, octave: 4 } as const;
const lick: Lick = {
  lengthBeats: 4,
  difficulty: 1,
  notes: [{ string: 1, fret: 5, pitch: A4, startBeat: 0, durationBeats: 1 }],
};

describe('useTransport (lick playback on the shared guitar sound)', () => {
  beforeEach(() => {
    calls.enabled.length = 0;
    calls.levels.length = 0;
    calls.plucks.length = 0;
    calls.clicks = 0;
    clock = 0;
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('the header sound toggle enables and disables the player', () => {
    const t = mount();
    t.render(true);
    t.render(false);
    expect(calls.enabled).toEqual([false, true]);
    t.unmount();
  });

  it('plays a lick through the player, with the mix, and stops', () => {
    const t = mount();
    t.render(false);
    act(() => t.get().play([lick], { tempoBpm: 60, metronome: false, clickGain: 0.3, noteGain: 0.7 }));
    expect(calls.levels).toContainEqual({ click: 0.3, note: 0.7 });
    expect(t.get().isPlaying).toBe(true);
    expect(calls.plucks).toEqual([69]);
    act(() => vi.advanceTimersByTime(200));
    expect(t.get().position).toEqual({ entryIndex: 0, noteIndex: 0 });
    act(() => t.get().stop());
    expect(t.get().isPlaying).toBe(false);
    expect(t.get().position).toBeNull();
    t.unmount();
  });

  it('a progression without notes plays nothing', () => {
    const t = mount();
    t.render(false);
    act(() => t.get().play([{ ...lick, notes: [] }], { tempoBpm: 90 }));
    expect(t.get().isPlaying).toBe(false);
    expect(calls.plucks).toEqual([]);
    t.unmount();
  });
});
