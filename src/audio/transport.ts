import type { Lick } from '../lick';
import { compileProgression, type AudioEvent, type CompileOptions } from './compile';
import { Scheduler, drainDue } from './scheduler';
import { click, pluck } from './voices';
import type { AudioEngine } from './engine';

export interface Position {
  entryIndex: number;
  noteIndex: number;
}

export interface TransportCallbacks {
  /** Fires as each note sounds (and with `null` when playback stops) for UI highlighting. */
  onPosition?: (pos: Position | null) => void;
  onStop?: () => void;
}

export interface PlayOptions extends CompileOptions {
  /** Repeat the progression indefinitely until stopped. */
  loop?: boolean;
}

/** Small lead so the first events are scheduled slightly in the future, never in the past. */
const START_LEAD_SEC = 0.12;

/**
 * Play/stop state machine. Compiles licks to events (see `compile.ts`), shifts them onto the
 * AudioContext clock, and pumps them through the lookahead `Scheduler` into `voices`. Looping
 * appends further passes just ahead of the schedule window so it never runs dry. Not unit-tested
 * (audio output) — its pure dependencies `compileProgression`, `drainDue`, and the pitch math are.
 */
export class Transport {
  private readonly scheduler: Scheduler;
  private events: AudioEvent[] = [];
  private cursor = 0;
  private playing = false;
  private loop = false;
  private licks: Lick[] = [];
  private opts: CompileOptions = { tempoBpm: 90 };
  private nextPassStartSec = 0;
  private positionTimers = new Set<ReturnType<typeof setTimeout>>();
  private readonly engine: AudioEngine;
  private readonly cb: TransportCallbacks;

  constructor(engine: AudioEngine, cb: TransportCallbacks = {}) {
    this.engine = engine;
    this.cb = cb;
    this.scheduler = new Scheduler({
      now: () => this.engine.ctx.currentTime,
      setInterval: (fn, ms) => setInterval(fn, ms),
      clearInterval: (h) => clearInterval(h as ReturnType<typeof setInterval>),
    });
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  play(licks: Lick[], opts: PlayOptions): void {
    this.stop();
    if (licks.length === 0 || licks.every((l) => l.notes.length === 0)) return;

    void this.engine.ctx.resume();

    this.licks = licks;
    this.opts = opts;
    this.loop = opts.loop ?? false;

    const startTime = this.engine.ctx.currentTime + START_LEAD_SEC;
    const first = compileProgression(licks, { ...opts, repeats: 1 });
    this.events = shiftEvents(first.events, startTime);
    this.nextPassStartSec = startTime + first.totalDurationSec;
    this.cursor = 0;
    this.playing = true;

    this.scheduler.start((windowEnd) => this.pump(windowEnd));
  }

  stop(): void {
    this.scheduler.stop();
    for (const t of this.positionTimers) clearTimeout(t);
    this.positionTimers.clear();
    this.events = [];
    this.cursor = 0;
    if (this.playing) {
      this.playing = false;
      this.cb.onPosition?.(null);
      this.cb.onStop?.();
    }
  }

  /** Live mix: 0..1 gains for the metronome click and the plucked notes. */
  setClickGain(value: number): void {
    this.engine.clickBus.gain.value = clamp01(value);
  }
  setNoteGain(value: number): void {
    this.engine.noteBus.gain.value = clamp01(value);
  }

  private pump(windowEnd: number): void {
    // Keep the loop fed: append the next pass before the schedule window overtakes the last event.
    while (this.loop) {
      const last = this.events[this.events.length - 1];
      if (last && last.timeSec > windowEnd + 1) break;
      const pass = compileProgression(this.licks, { ...this.opts, countIn: false, repeats: 1 });
      this.events.push(...shiftEvents(pass.events, this.nextPassStartSec));
      this.nextPassStartSec += pass.musicDurationSec;
    }

    this.cursor = drainDue(this.events, this.cursor, windowEnd, (e) => this.fire(e));

    // Drop already-fired events so an indefinite loop doesn't grow the array without bound.
    // Times are absolute (audio clock), so slicing the prefix leaves upcoming events unchanged.
    if (this.cursor > 256) {
      this.events = this.events.slice(this.cursor);
      this.cursor = 0;
    }

    // Non-looping playback: stop once everything has sounded and the tail has passed.
    if (!this.loop && this.cursor >= this.events.length && this.engine.ctx.currentTime >= this.nextPassStartSec) {
      this.stop();
    }
  }

  private fire(event: AudioEvent): void {
    if (event.kind === 'click') {
      click(this.engine.ctx, this.engine.clickBus, event.timeSec, event.accented);
      return;
    }
    pluck(this.engine.ctx, this.engine.noteBus, event.timeSec, event.midi, event.durationSec);
    if (this.cb.onPosition) {
      const delayMs = Math.max(0, (event.timeSec - this.engine.ctx.currentTime) * 1000);
      const timer = setTimeout(() => {
        this.positionTimers.delete(timer);
        this.cb.onPosition?.({ entryIndex: event.entryIndex, noteIndex: event.noteIndex });
      }, delayMs);
      this.positionTimers.add(timer);
    }
  }
}

function shiftEvents(events: readonly AudioEvent[], offsetSec: number): AudioEvent[] {
  return events.map((e) => ({ ...e, timeSec: e.timeSec + offsetSec }));
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}
