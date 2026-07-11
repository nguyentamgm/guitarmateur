import { describe, expect, it } from 'vitest';
import { Scheduler, drainDue } from './scheduler';
import type { AudioEvent } from './compile';

const click = (timeSec: number): AudioEvent => ({ timeSec, kind: 'click', accented: false });

describe('drainDue', () => {
  it('fires only events within the window, exactly once, advancing the cursor', () => {
    const events = [click(0.1), click(0.2), click(0.3)];
    const fired: number[] = [];
    const push = (e: AudioEvent) => fired.push(e.timeSec);

    let cursor = drainDue(events, 0, 0.15, push);
    expect(fired).toEqual([0.1]);
    expect(cursor).toBe(1);

    cursor = drainDue(events, cursor, 0.35, push);
    expect(fired).toEqual([0.1, 0.2, 0.3]);
    expect(cursor).toBe(3);

    // Nothing left to fire, even with a wide window.
    cursor = drainDue(events, cursor, 10, push);
    expect(fired).toEqual([0.1, 0.2, 0.3]);
    expect(cursor).toBe(3);
  });

  it('fires nothing when the window is before the first event', () => {
    const events = [click(1)];
    const fired: number[] = [];
    const cursor = drainDue(events, 0, 0.5, (e) => fired.push(e.timeSec));
    expect(fired).toEqual([]);
    expect(cursor).toBe(0);
  });
});

describe('Scheduler', () => {
  function harness() {
    let time = 0;
    let intervalFn: (() => void) | null = null;
    const events = [click(0.05), click(0.2), click(0.5)];
    let cursor = 0;
    const fired: number[] = [];

    const sched = new Scheduler({
      now: () => time,
      setInterval: (fn) => {
        intervalFn = fn;
        return 1;
      },
      clearInterval: () => {
        intervalFn = null;
      },
      lookaheadSec: 0.1,
      tickMs: 25,
    });

    const pump = (windowEnd: number) => {
      cursor = drainDue(events, cursor, windowEnd, (e) => fired.push(e.timeSec));
    };

    return {
      start: () => sched.start(pump),
      stop: () => sched.stop(),
      running: () => sched.running,
      tick: () => intervalFn?.(),
      hasTimer: () => intervalFn !== null,
      setTime: (t: number) => {
        time = t;
      },
      fired,
    };
  }

  it('schedules the first window immediately on start (now + lookahead)', () => {
    const h = harness();
    h.start();
    // now=0, lookahead=0.1 → only the 0.05 event is due.
    expect(h.fired).toEqual([0.05]);
    expect(h.running()).toBe(true);
  });

  it('each tick schedules the next lookahead window, firing each event exactly once', () => {
    const h = harness();
    h.start();
    h.setTime(0.15);
    h.tick(); // window 0.25 → fires 0.2
    expect(h.fired).toEqual([0.05, 0.2]);

    h.tick(); // same time, window unchanged → nothing new
    expect(h.fired).toEqual([0.05, 0.2]);

    h.setTime(0.45);
    h.tick(); // window 0.55 → fires 0.5
    expect(h.fired).toEqual([0.05, 0.2, 0.5]);
  });

  it('start is idempotent and stop clears the timer', () => {
    const h = harness();
    h.start();
    h.start(); // second call is a no-op (already running)
    expect(h.running()).toBe(true);

    h.stop();
    expect(h.running()).toBe(false);
    expect(h.hasTimer()).toBe(false);
  });
});
