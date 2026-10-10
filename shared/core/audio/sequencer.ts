/**
 * Plays a timeline of notes and clicks on a `Player`, sample-accurately: the lookahead `Scheduler`
 * hands each event due in the next window to the player with its exact delay on the audio clock,
 * so timer jitter never moves the sound. Loops by asking for the next pass before the schedule
 * runs dry, and reports each event as it sounds (for a cursor, or tab highlighting).
 *
 * What a timeline means musically (count-in, swing, bars per chord, a lick per chord) is the
 * caller's: it hands over passes of events already laid out in seconds.
 */
import type { Glide } from './glide';
import type { Player } from './player';
import { Scheduler, drainDue } from './scheduler';

export type SeqEvent<Tag = unknown> =
  | { readonly timeSec: number; readonly kind: 'click'; readonly accent: boolean }
  | {
      readonly timeSec: number;
      readonly kind: 'note';
      readonly midi: number;
      /** Damp it after this long (its length, or until the next note on its string). */
      readonly lengthSec?: number;
      /** Bend, slide, hammer: pitch over time on the same sound. */
      readonly glide?: Glide;
      /** Palm-muted. */
      readonly muted?: boolean;
      /** Handed back to `onSound`, e.g. which chord and note this is. */
      readonly tag?: Tag;
    };

/** One pass of a timeline: events in seconds from the pass's start, sorted by time. */
export interface Pass<Tag = unknown> {
  readonly events: readonly SeqEvent<Tag>[];
  /** When the next pass starts, in seconds from this one's start. */
  readonly durationSec: number;
}

export interface SequencerDeps {
  setInterval(fn: () => void, ms: number): unknown;
  clearInterval(handle: unknown): void;
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
  /** How far ahead each pump schedules. Default 0.12 s. */
  readonly lookaheadSec?: number;
  /** Wall-clock poll interval. Default 25 ms. */
  readonly tickMs?: number;
}

export interface SequencerCallbacks<Tag> {
  /** As an event sounds (not when it is scheduled). */
  onSound?(event: SeqEvent<Tag>): void;
  /** When playback ends: stopped, or a single pass played out. */
  onEnd?(): void;
}

/** Head start before the first event, so it is never scheduled in the past. */
const LEAD_SEC = 0.1;
/** An event this late (a stalled timer, a background tab) is skipped, not played in a burst. */
const LATE_SEC = 0.05;

const browserTimers: SequencerDeps = {
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (h) => clearInterval(h as ReturnType<typeof setInterval>),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
};

export class Sequencer<Tag = unknown> {
  private readonly scheduler: Scheduler;
  private events: SeqEvent<Tag>[] = [];
  private cursor = 0;
  private nextPassAt = 0;
  private next: (() => Pass<Tag>) | null = null;
  private playing = false;
  private readonly timers = new Set<unknown>();
  private readonly player: Player;
  private readonly cb: SequencerCallbacks<Tag>;
  private readonly deps: SequencerDeps;

  constructor(player: Player, cb: SequencerCallbacks<Tag> = {}, deps: SequencerDeps = browserTimers) {
    this.player = player;
    this.cb = cb;
    this.deps = deps;
    this.scheduler = new Scheduler({
      now: () => this.player.now() ?? 0,
      setInterval: deps.setInterval,
      clearInterval: deps.clearInterval,
      lookaheadSec: deps.lookaheadSec ?? 0.12,
      tickMs: deps.tickMs,
    });
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  /**
   * Play `first`, then, while `next` is given, pass after pass from it (a loop). Call from a user
   * gesture: it starts the audio clock. Does nothing without audio, or with nothing to play.
   */
  play(first: Pass<Tag>, next?: () => Pass<Tag>): void {
    this.stop();
    const now = this.player.now();
    if (now === null || first.events.length === 0) return;
    const start = now + LEAD_SEC;
    this.events = shift(first.events, start);
    this.nextPassAt = start + first.durationSec;
    this.next = next ?? null;
    this.cursor = 0;
    this.playing = true;
    this.scheduler.start((windowEnd) => this.pump(windowEnd));
  }

  stop(): void {
    this.scheduler.stop();
    for (const t of this.timers) this.deps.clearTimeout(t);
    this.timers.clear();
    this.events = [];
    this.cursor = 0;
    this.next = null;
    if (this.playing) {
      // Notes already handed to the player ring out on their own.
      this.playing = false;
      this.cb.onEnd?.();
    }
  }

  private pump(windowEnd: number): void {
    const now = this.player.now();
    // The audio clock is gone (the context closed or failed): nothing more can sound.
    if (now === null) {
      this.stop();
      return;
    }
    // Keep a loop fed: append passes until the next one starts beyond the window. A pass that
    // takes no time cannot loop: the loop ends there.
    while (this.next && this.nextPassAt <= windowEnd + 1) {
      const pass = this.next();
      if (pass.durationSec <= 0) {
        this.next = null;
        break;
      }
      this.events.push(...shift(pass.events, this.nextPassAt));
      this.nextPassAt += pass.durationSec;
    }

    this.cursor = drainDue(this.events, this.cursor, windowEnd, (e) => {
      if (e.timeSec >= now - LATE_SEC) this.fire(e, now);
    });

    // Drop fired events, so an endless loop does not grow without bound.
    if (this.cursor > 256) {
      this.events = this.events.slice(this.cursor);
      this.cursor = 0;
    }

    if (!this.next && this.cursor >= this.events.length && now >= this.nextPassAt) this.stop();
  }

  private fire(e: SeqEvent<Tag>, now: number): void {
    const delay = Math.max(0, e.timeSec - now);
    if (e.kind === 'click') this.player.click(e.accent, delay);
    else if (e.muted) this.player.mute(e.midi, delay);
    else this.player.pluck(e.midi, delay, e.lengthSec, e.glide);
    if (this.cb.onSound) {
      const t = this.deps.setTimeout(() => {
        this.timers.delete(t);
        this.cb.onSound?.(e);
      }, delay * 1000);
      this.timers.add(t);
    }
  }
}

function shift<Tag>(events: readonly SeqEvent<Tag>[], offsetSec: number): SeqEvent<Tag>[] {
  return events.map((e) => ({ ...e, timeSec: e.timeSec + offsetSec }));
}
