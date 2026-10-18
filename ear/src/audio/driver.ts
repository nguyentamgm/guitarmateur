/**
 * Plays a beginner level's parts on the shared player (docs/ear.md "Sound"), one at a time. Every
 * note goes to the player at once with its exact delay on the audio clock; one coarse timer only
 * watches that clock for the end of a part, so timer jitter never moves a sound.
 */
import type { Player } from '@shared/core/audio';
import type { Part } from './timeline';

export interface DriverDeps {
  setInterval(fn: () => void, ms: number): unknown;
  clearInterval(handle: unknown): void;
  /** How often the audio clock is checked for the end of a part. Default 25 ms. */
  readonly tickMs?: number;
}

export interface DriverCallbacks {
  /** Audio cannot start, or stopped (`player.now()` is null): show a message, not a silent quiz. */
  onNoAudio?(): void;
}

export interface EarAudio {
  /**
   * Play one part in the guitar voice (a level's question, its replay, an answer's comparison, a
   * demo), first stopping whatever was playing; `onEnd` when it has ended, unless cut short.
   */
  playPart(part: Part, onEnd?: () => void): void;
  /** Stop what is playing, and drop its `onEnd` (moving on). */
  cancel(): void;
  /** Leaving the page: silence everything and stop the clock watch. */
  dispose(): void;
}

/** Head start for a part, so its first note is never scheduled in the past. */
export const LEAD_SEC = 0.05;

const browserTimers: DriverDeps = {
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (h) => clearInterval(h as ReturnType<typeof setInterval>),
};

export function createEarAudio(
  player: Player,
  cb: DriverCallbacks = {},
  deps: DriverDeps = browserTimers,
): EarAudio {
  /** The audio-clock time the playing part ends, and what to do then. */
  let pending: { readonly at: number; readonly run: () => void } | null = null;
  let timer: unknown = null;

  const stopWatch = () => {
    if (timer !== null) deps.clearInterval(timer);
    timer = null;
  };

  const tick = () => {
    const now = player.now();
    if (now === null) {
      pending = null;
      stopWatch();
      cb.onNoAudio?.();
      return;
    }
    if (!pending || pending.at > now) return;
    const { run } = pending;
    pending = null;
    stopWatch();
    run();
  };

  const cancel = () => {
    player.cancel();
    pending = null;
    stopWatch();
  };

  return {
    playPart(part, onEnd) {
      cancel();
      const now = player.now();
      if (now === null) {
        cb.onNoAudio?.();
        return;
      }
      for (const s of part.sounds) {
        const delay = LEAD_SEC + s.time;
        if (s.kind === 'click') player.click(true, delay);
        else player.pluck(s.midi!, delay, s.length, s.glide);
      }
      if (!onEnd) return;
      pending = { at: now + LEAD_SEC + part.duration, run: onEnd };
      timer = deps.setInterval(tick, deps.tickMs ?? 25);
    },
    cancel,
    dispose: cancel,
  };
}
