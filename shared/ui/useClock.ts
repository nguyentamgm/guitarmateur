import { useCallback, useEffect, useRef, useState } from 'react';

export interface Clock {
  /** Index of the step being heard, or null when stopped. */
  readonly current: number | null;
  readonly playing: boolean;
  toggle(): void;
  stop(): void;
}

/** How far ahead sounds are handed to the audio player, and how often the clock wakes up. */
const LOOKAHEAD_SEC = 0.12;
const TICK_MS = 25;
/** Head start before the first step, so it is never scheduled in the past. */
const LEAD_SEC = 0.06;

const now = () => performance.now() / 1000;

/** Stops the clock that is playing, if any: one clock plays at a time on a page. */
let stopPlaying: (() => void) | null = null;

/**
 * A steady clock for metronomes and grids. A timer wakes every 25 ms and hands each step due in
 * the next 120 ms to `onStep(i, delaySec)` with its exact delay, which the audio player schedules
 * on its own clock. Timer jitter therefore moves only the cursor, never the sound. `stepSec` is
 * read on every step, so a tempo change takes effect at once. `loop` repeats from step 0.
 */
export function useClock(steps: number, stepSec: number, onStep: (i: number, delaySec: number) => void, loop = true): Clock {
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cursors = useRef(new Set<ReturnType<typeof setTimeout>>());
  const next = useRef({ i: 0, t: 0 });
  const live = useRef({ steps, stepSec, onStep, loop });
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    live.current = { steps, stepSec, onStep, loop };
  });

  const stop = useCallback(() => {
    if (stopPlaying === stopRef.current) stopPlaying = null;
    if (timer.current !== null) clearInterval(timer.current);
    timer.current = null;
    for (const c of cursors.current) clearTimeout(c);
    cursors.current.clear();
    setCurrent(null);
    setPlaying(false);
  }, []);

  const later = useCallback((sec: number, fn: () => void) => {
    const id = setTimeout(() => {
      cursors.current.delete(id);
      fn();
    }, Math.max(0, sec * 1000));
    cursors.current.add(id);
  }, []);

  const tick = useCallback(() => {
    const { steps: n, stepSec: dt, onStep: step, loop: again } = live.current;
    const t = now();
    // After a stall (a background tab throttles timers), skip what was missed instead of playing
    // it all at once: carry on from now, on the step that was due.
    if (next.current.t < t) next.current = { ...next.current, t: t + LEAD_SEC };
    while (next.current.t < t + LOOKAHEAD_SEC) {
      let { i } = next.current;
      if (i >= n) {
        if (!again || n === 0) {
          if (timer.current !== null) clearInterval(timer.current);
          timer.current = null;
          later(next.current.t - t, stop);
          return;
        }
        i = 0;
      }
      const delay = next.current.t - t;
      step(i, delay);
      const shown = i;
      later(delay, () => setCurrent(shown));
      next.current = { i: i + 1, t: next.current.t + dt };
    }
  }, [later, stop]);

  const start = useCallback(() => {
    stop();
    stopPlaying?.();
    stopPlaying = stop;
    next.current = { i: 0, t: now() + LEAD_SEC };
    setPlaying(true);
    timer.current = setInterval(tick, TICK_MS);
    tick();
  }, [stop, tick]);

  useEffect(() => {
    stopRef.current = stop;
    return stop;
  }, [stop]);

  const toggle = useCallback(() => (playing ? stop() : start()), [playing, start, stop]);
  return { current, playing, toggle, stop };
}
