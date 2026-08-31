import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./voices', () => ({
  click: vi.fn(),
  pluck: vi.fn(() => ({ release: vi.fn() })),
}));

import { Transport, type Position } from './transport';
import { click, pluck } from './voices';
import type { AudioEngine } from './engine';
import type { Lick, Technique } from '../lick';

const mockClick = vi.mocked(click);
const mockPluck = vi.mocked(pluck);

interface NoteSpec {
  string: number;
  fret: number;
  startBeat: number;
  durationBeats: number;
  technique?: Technique;
}

function makeLick(notes: NoteSpec[]): Lick {
  return {
    notes: notes.map((n) => ({
      string: n.string,
      fret: n.fret,
      pitch: { letter: 'A', alter: 0, octave: 2 },
      startBeat: n.startBeat,
      durationBeats: n.durationBeats,
      technique: n.technique,
      role: 'R',
    })),
    lengthBeats: 4,
    difficulty: 1,
  };
}

function setup() {
  const fakeCtx = { currentTime: 0, resume: vi.fn(), sampleRate: 48000 };
  const fakeGain = { gain: { value: 1 } };
  const engine = {
    ctx: fakeCtx,
    master: fakeGain,
    clickBus: fakeGain,
    noteBus: fakeGain,
    noteOut: fakeGain,
    amp: {},
  } as unknown as AudioEngine;

  const positions: Array<Position | null> = [];
  let stopCount = 0;
  const transport = new Transport(engine, {
    onPosition: (p) => positions.push(p),
    onStop: () => {
      stopCount++;
    },
  });

  const advance = (sec: number) => {
    fakeCtx.currentTime += sec;
    vi.advanceTimersByTime(sec * 1000);
  };

  return { transport, engine, fakeCtx, positions, getStopCount: () => stopCount, advance };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Transport', () => {
  it('play() with countIn fires 4 clicks (first accented) then plucks in order, updating position and isPlaying', () => {
    const { transport, positions, advance } = setup();
    const lick = makeLick([
      { string: 1, fret: 5, startBeat: 0, durationBeats: 1 },
      { string: 2, fret: 7, startBeat: 2, durationBeats: 1 },
    ]);

    transport.play([lick], { tempoBpm: 60, countIn: true, metronome: false, loop: false });
    expect(transport.isPlaying).toBe(true);

    advance(0.2);
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(mockClick.mock.calls[0]?.[2]).toBeCloseTo(0.12, 5);
    expect(mockClick.mock.calls[0]?.[3]).toBe(true);

    advance(1.0);
    advance(1.0);
    advance(1.0);
    expect(mockClick).toHaveBeenCalledTimes(4);
    expect(mockClick.mock.calls[1]?.[3]).toBe(false);
    expect(mockClick.mock.calls[2]?.[3]).toBe(false);
    expect(mockClick.mock.calls[3]?.[3]).toBe(false);
    expect(mockPluck).toHaveBeenCalledTimes(0);

    advance(1.0);
    expect(mockPluck).toHaveBeenCalledTimes(1);
    expect(mockPluck.mock.calls[0]?.[2]).toBeCloseTo(4.12, 5);
    expect(positions).toEqual([{ entryIndex: 0, noteIndex: 0 }]);
    expect(transport.isPlaying).toBe(true);

    advance(2.0);
    expect(mockPluck).toHaveBeenCalledTimes(2);
    expect(mockPluck.mock.calls[1]?.[2]).toBeCloseTo(6.12, 5);
    expect(positions).toEqual([
      { entryIndex: 0, noteIndex: 0 },
      { entryIndex: 0, noteIndex: 1 },
    ]);
    expect(transport.isPlaying).toBe(true);
  });

  it('auto-stops after all events fire and the tail passes, then stays stopped', () => {
    const { transport, positions, getStopCount, advance } = setup();
    const lick = makeLick([
      { string: 1, fret: 5, startBeat: 0, durationBeats: 1 },
      { string: 2, fret: 7, startBeat: 2, durationBeats: 1 },
    ]);

    transport.play([lick], { tempoBpm: 60, countIn: true, metronome: false, loop: false });

    // Drive through the count-in and both notes.
    advance(0.2);
    advance(1.0);
    advance(1.0);
    advance(1.0);
    advance(1.0);
    advance(2.0);
    expect(transport.isPlaying).toBe(true);
    expect(getStopCount()).toBe(0);

    // currentTime is now 6.2s; nextPassStartSec is 8.12s — not stopped yet.
    advance(1.0); // 7.2s
    expect(transport.isPlaying).toBe(true);

    advance(1.0); // 8.2s, past the tail
    expect(transport.isPlaying).toBe(false);
    expect(getStopCount()).toBe(1);
    expect(positions[positions.length - 1]).toBeNull();

    const clicksAfterStop = mockClick.mock.calls.length;
    const plucksAfterStop = mockPluck.mock.calls.length;
    advance(5.0);
    expect(mockClick).toHaveBeenCalledTimes(clicksAfterStop);
    expect(mockPluck).toHaveBeenCalledTimes(plucksAfterStop);
    expect(getStopCount()).toBe(1);
  });

  it('loop mode fires every note of every pass exactly once across 3+ passes', () => {
    const { transport, advance } = setup();
    const lick = makeLick([{ string: 1, fret: 5, startBeat: 0, durationBeats: 1 }]);

    transport.play([lick], { tempoBpm: 60, countIn: false, metronome: false, loop: true });

    advance(0.2);
    expect(mockPluck).toHaveBeenCalledTimes(1); // pass 1

    advance(4.0);
    expect(mockPluck).toHaveBeenCalledTimes(2); // pass 2

    advance(4.0);
    expect(mockPluck).toHaveBeenCalledTimes(3); // pass 3

    advance(4.0);
    expect(mockPluck).toHaveBeenCalledTimes(4); // pass 4

    expect(transport.isPlaying).toBe(true);

    const times = mockPluck.mock.calls.map((c) => c[2]);
    expect(times[0]).toBeCloseTo(0.12, 5);
    expect(times[1]).toBeCloseTo(4.12, 5);
    expect(times[2]).toBeCloseTo(8.12, 5);
    expect(times[3]).toBeCloseTo(12.12, 5);
  });

  it('loop mode compacts the event queue past 256 fired events without losing or duplicating events', () => {
    const { transport, positions, advance } = setup();
    const lick = makeLick([
      { string: 1, fret: 5, startBeat: 0, durationBeats: 1 },
      { string: 2, fret: 7, startBeat: 2, durationBeats: 1 },
    ]);

    transport.play([lick], { tempoBpm: 60, countIn: false, metronome: false, loop: true });

    // 150 passes × 4s each; every pass fires 2 plucks, so one window drains 300 events —
    // crossing the cursor > 256 threshold, which slices the buffer mid-play.
    advance(600);

    expect(mockPluck).toHaveBeenCalledTimes(300);

    // Strictly increasing fire times: nothing was lost to the slice, nothing fired twice.
    const times = mockPluck.mock.calls.map((c) => c[2] as number);
    for (let i = 1; i < times.length; i++) {
      expect(times[i]!).toBeGreaterThan(times[i - 1]!);
    }
    expect(times[0]!).toBeCloseTo(0.12, 5);
    expect(times[299]!).toBeCloseTo(598.12, 5);

    // Position callbacks kept flowing past the compaction too.
    expect(positions).toHaveLength(300);

    transport.stop();
  });

  it('releases the previously ringing note on the same string with technique-aware damp time, but not across strings', () => {
    const { transport, advance } = setup();
    const lick = makeLick([
      { string: 1, fret: 5, startBeat: 0, durationBeats: 1 },
      { string: 1, fret: 7, startBeat: 1, durationBeats: 1 },
      { string: 1, fret: 8, startBeat: 2, durationBeats: 1, technique: 'hammer' },
      { string: 2, fret: 3, startBeat: 3, durationBeats: 1 },
    ]);

    transport.play([lick], { tempoBpm: 60, countIn: false, metronome: false, loop: false });

    advance(0.2); // fires note0 (string 1) — nothing ringing yet
    expect(mockPluck).toHaveBeenCalledTimes(1);
    const voice0 = mockPluck.mock.results[0]?.value as { release: ReturnType<typeof vi.fn> };
    expect(voice0.release).not.toHaveBeenCalled();

    advance(1.0); // fires note1 (string 1, repick) — releases voice0
    expect(mockPluck).toHaveBeenCalledTimes(2);
    expect(voice0.release).toHaveBeenCalledTimes(1);
    expect(voice0.release.mock.calls[0]?.[0]).toBeCloseTo(1.12, 5);
    expect(voice0.release.mock.calls[0]?.[1]).toBe(0.055);
    const voice1 = mockPluck.mock.results[1]?.value as { release: ReturnType<typeof vi.fn> };

    advance(1.0); // fires note2 (string 1, hammer) — releases voice1
    expect(mockPluck).toHaveBeenCalledTimes(3);
    expect(voice1.release).toHaveBeenCalledTimes(1);
    expect(voice1.release.mock.calls[0]?.[0]).toBeCloseTo(2.12, 5);
    expect(voice1.release.mock.calls[0]?.[1]).toBe(0.025);
    const voice2 = mockPluck.mock.results[2]?.value as { release: ReturnType<typeof vi.fn> };

    advance(1.0); // fires note3 (string 2) — nothing was ringing on string 2
    expect(mockPluck).toHaveBeenCalledTimes(4);
    expect(voice0.release).toHaveBeenCalledTimes(1);
    expect(voice1.release).toHaveBeenCalledTimes(1);
    expect(voice2.release).not.toHaveBeenCalled();
  });

  it('stop() clears the timer, fires onPosition(null)/onStop exactly once, and is idempotent', () => {
    const { transport, positions, getStopCount, advance } = setup();
    const lick = makeLick([
      { string: 1, fret: 5, startBeat: 0, durationBeats: 1 },
      { string: 1, fret: 7, startBeat: 5, durationBeats: 1 },
    ]);

    transport.play([lick], { tempoBpm: 60, countIn: false, metronome: false, loop: false });
    advance(0.2);
    expect(mockPluck).toHaveBeenCalledTimes(1);

    transport.stop();
    expect(transport.isPlaying).toBe(false);
    expect(getStopCount()).toBe(1);
    expect(positions[positions.length - 1]).toBeNull();

    // The second note (at 5.12s) must never fire — the scheduler timer was cleared.
    advance(10.0);
    expect(mockPluck).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledTimes(0);

    // A second stop() is a no-op.
    transport.stop();
    expect(getStopCount()).toBe(1);
  });

  it('setClickGain/setNoteGain clamp to 0..1', () => {
    const { transport, engine } = setup();

    transport.setClickGain(1.5);
    expect(engine.clickBus.gain.value).toBe(1);

    transport.setNoteGain(-0.2);
    expect(engine.noteOut.gain.value).toBe(0);
  });

  it('play() with all-empty licks does nothing', () => {
    const { transport, advance } = setup();
    const lick = makeLick([]);

    transport.play([lick], { tempoBpm: 60 });
    expect(transport.isPlaying).toBe(false);

    advance(5.0);
    expect(mockClick).not.toHaveBeenCalled();
    expect(mockPluck).not.toHaveBeenCalled();
    expect(transport.isPlaying).toBe(false);
  });

  it('play() while already playing stops the old run cleanly and starts the new one', () => {
    const { transport, getStopCount, advance } = setup();
    const lickA = makeLick([
      { string: 1, fret: 5, startBeat: 0, durationBeats: 1 },
      { string: 1, fret: 7, startBeat: 10, durationBeats: 1 },
    ]);
    const lickB = makeLick([{ string: 2, fret: 3, startBeat: 0, durationBeats: 1 }]);
    const opts = { tempoBpm: 60, countIn: false, metronome: false, loop: false };

    transport.play([lickA], opts);
    advance(0.2); // fires lickA's first note only
    expect(mockPluck).toHaveBeenCalledTimes(1);
    expect(getStopCount()).toBe(0);

    transport.play([lickB], opts); // restarts before lickA's second note (at 10.12s) fires
    expect(getStopCount()).toBe(1); // old run's onStop fired
    expect(transport.isPlaying).toBe(true);

    advance(0.2);
    expect(mockPluck).toHaveBeenCalledTimes(2);
    expect(mockPluck.mock.calls[1]?.[2]).toBeCloseTo(0.32, 5);

    // lickA's stale second note must never fire, and the new run auto-stops on schedule.
    advance(20.0);
    expect(mockPluck).toHaveBeenCalledTimes(2);
    expect(transport.isPlaying).toBe(false);
    expect(getStopCount()).toBe(2);
  });
});
