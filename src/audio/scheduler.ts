import type { AudioEvent } from './compile';

/**
 * Fire, in order, every event at or before `windowEndSec` that hasn't fired yet, advancing from
 * `cursor` and returning the new cursor. Events must be sorted ascending by `timeSec`. Pure and
 * exactly-once: each event fires on the first pump whose window reaches it, never again.
 */
export function drainDue(
  events: readonly AudioEvent[],
  cursor: number,
  windowEndSec: number,
  fire: (event: AudioEvent) => void,
): number {
  let i = cursor;
  for (;;) {
    const event = events[i];
    if (event === undefined || event.timeSec > windowEndSec) break;
    fire(event);
    i++;
  }
  return i;
}

export interface SchedulerDeps {
  /** Current time in seconds on the audio clock. */
  now: () => number;
  setInterval: (fn: () => void, ms: number) => unknown;
  clearInterval: (handle: unknown) => void;
  /** How far ahead of `now` each pump schedules. Default 0.1s. */
  lookaheadSec?: number;
  /** Wall-clock poll interval. Default 25ms. */
  tickMs?: number;
}

/**
 * The "tale of two clocks" lookahead scheduler: a coarse wall-clock timer (`tickMs`) repeatedly
 * asks the caller to schedule everything falling in the next `lookaheadSec` window on the precise
 * audio clock. This keeps sample-accurate timing even when the timer is throttled (background tab).
 * Timers and clock are injected so it runs deterministically under a mocked clock in tests.
 */
export class Scheduler {
  private handle: unknown = null;
  private readonly deps: SchedulerDeps;

  constructor(deps: SchedulerDeps) {
    this.deps = deps;
  }

  get running(): boolean {
    return this.handle !== null;
  }

  start(pump: (windowEndSec: number) => void): void {
    if (this.handle !== null) return;
    const lookahead = this.deps.lookaheadSec ?? 0.1;
    const tick = () => pump(this.deps.now() + lookahead);
    tick(); // schedule the first window immediately, don't wait a full tick
    this.handle = this.deps.setInterval(tick, this.deps.tickMs ?? 25);
  }

  stop(): void {
    if (this.handle === null) return;
    this.deps.clearInterval(this.handle);
    this.handle = null;
  }
}
