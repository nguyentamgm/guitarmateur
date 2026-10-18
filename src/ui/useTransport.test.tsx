import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { Player } from '@shared/core/audio';
import type { Lick } from '../lick';
import type { UseTransport } from './useTransport';

const calls = { levels: [] as object[], plucks: [] as number[], clicks: 0 };
let clock = 0;
const player: Player = {
  enabled: true,
  setEnabled: () => {},
  setLevels: (l) => calls.levels.push(l),
  pluck: (midi) => calls.plucks.push(midi),
  mute: (midi) => calls.plucks.push(midi),
  click: () => calls.clicks++,
  now: () => clock,
  cancel: () => {},
};

vi.mock('@shared/core/audio', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/core/audio')>()),
  isAudioSupported: () => true,
}));
vi.mock('./audioPlayer', () => ({ getPlayer: () => player }));

const { useTransport } = await import('./useTransport');

function mount() {
  let current!: UseTransport;
  function Probe() {
    current = useTransport();
    return null;
  }
  const root = createRoot(document.createElement('div'));
  const render = () => act(() => root.render(createElement(Probe)));
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
    calls.levels.length = 0;
    calls.plucks.length = 0;
    calls.clicks = 0;
    clock = 0;
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('plays a lick through the player, with the mix, and stops', () => {
    const t = mount();
    t.render();
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

  it('reports the bar being heard from each downbeat, null once stopped', () => {
    const t = mount();
    t.render();
    // Advance the audio clock and the timers together, 25 ms at a time.
    const run = (sec: number) => {
      for (let i = 0; i < sec / 0.025; i++) {
        clock += 0.025;
        act(() => vi.advanceTimersByTime(25));
      }
    };
    act(() => t.get().play([lick, { ...lick, lengthBeats: 8 }], { tempoBpm: 60, countIn: true }));
    run(1);
    expect(t.get().bar).toBeNull(); // counting in
    run(4);
    expect(t.get().bar).toBe(0);
    run(4);
    expect(t.get().bar).toBe(1); // the 2-bar chord's first bar
    run(4);
    expect(t.get().bar).toBe(2); // and its second
    act(() => t.get().stop());
    expect(t.get().bar).toBeNull();
    t.unmount();
  });

  it('a progression without notes plays nothing', () => {
    const t = mount();
    t.render();
    act(() => t.get().play([{ ...lick, notes: [] }], { tempoBpm: 90 }));
    expect(t.get().isPlaying).toBe(false);
    expect(calls.plucks).toEqual([]);
    t.unmount();
  });
});
