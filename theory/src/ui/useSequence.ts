import { useCallback, useEffect, useRef, useState } from 'react';

export interface Sequence {
  /** Index of the current item while playing, otherwise null. */
  readonly current: number | null;
  readonly playing: boolean;
  /** Start from the first item, or stop if already playing. */
  toggle(): void;
  /** Start from the first item, restarting if already playing. */
  start(): void;
  stop(): void;
}

/**
 * Step through `length` items, one every `intervalMs`, calling `onStep(i)` on each. Timers are
 * cleared on stop and on unmount. `loop` restarts from the first item instead of stopping.
 */
export function useSequence(
  length: number,
  intervalMs: number,
  onStep: (i: number) => void,
  loop = false,
): Sequence {
  const [current, setCurrent] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const step = useRef(onStep);
  useEffect(() => {
    step.current = onStep;
  });

  const stop = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    setCurrent(null);
  }, []);

  const run = useCallback(
    (i: number) => {
      if (i >= length) {
        if (!loop || length === 0) {
          stop();
          return;
        }
        i = 0;
      }
      setCurrent(i);
      step.current(i);
      timer.current = setTimeout(() => run(i + 1), intervalMs);
    },
    [length, intervalMs, loop, stop],
  );

  useEffect(() => stop, [stop]);

  const playing = current !== null;
  const toggle = useCallback(() => (playing ? stop() : run(0)), [playing, run, stop]);
  const start = useCallback(() => {
    stop();
    run(0);
  }, [run, stop]);
  return { current, playing, toggle, start, stop };
}
