/**
 * Plays the session (#216) on the shared player: it carries out each step's effects and sends
 * `audioDone(phase)` back when a part with a `done` ends (docs/ear.md "Sound"). Every note goes to
 * the player at once with its exact delay on the audio clock; one coarse timer only watches that
 * clock for the ends of parts, so timer jitter never moves a sound.
 */
import type { Player, Held } from '@shared/core/audio';
import { droneNotes } from '../core/context';
import type { CadenceForm } from '../core/context';
import type { Effect, Phase } from '../core/session';
import {
  RIGHT_CLICK,
  comparePart,
  contextPart,
  notePart,
  resolutionPart,
  waitPart,
  type Part,
  type Voice,
} from './timeline';

/** The settings the sound needs; the session reads the rest. */
export interface AudioSettings {
  readonly bpm: number;
  readonly sound: Voice;
  /** Default 'full'. */
  readonly cadenceForm?: CadenceForm;
  /** The drone's level, 0..1 (the player's `drone` level). Default 1. */
  readonly droneLevel?: number;
}

export interface DriverDeps {
  setInterval(fn: () => void, ms: number): unknown;
  clearInterval(handle: unknown): void;
  /** How often the audio clock is checked for the end of a part. Default 25 ms. */
  readonly tickMs?: number;
}

export interface DriverCallbacks {
  /** A part with a `done` has ended: dispatch `audioDone(phase)`. */
  onDone(phase: Phase): void;
  /** Audio cannot start, or stopped (`player.now()` is null): show a message, not a silent quiz. */
  onNoAudio?(): void;
}

export interface EarAudio {
  /** Carry out one step's effects, in order. */
  run(effects: readonly Effect[], settings: AudioSettings): void;
  /** Leaving the page: silence everything, the drone included, and stop the clock watch. */
  dispose(): void;
}

/** Head start for a part, so its first note is never scheduled in the past. */
export const LEAD_SEC = 0.05;
/** The drone's level while the cadence plays, as a share of its own: it sits under the chords. */
export const DRONE_DUCK = 0.5;

const browserTimers: DriverDeps = {
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (h) => clearInterval(h as ReturnType<typeof setInterval>),
};

/** Something to do once the audio clock reaches `at`. */
interface Pending {
  readonly at: number;
  readonly run: () => void;
}

export function createEarAudio(
  player: Player,
  cb: DriverCallbacks,
  deps: DriverDeps = browserTimers,
): EarAudio {
  let drone: Held | null = null;
  let ducked = false;
  let level = 1;
  let pending: Pending[] = [];
  let timer: unknown = null;

  const stopWatch = () => {
    if (timer !== null) deps.clearInterval(timer);
    timer = null;
  };

  const tick = () => {
    const now = player.now();
    if (now === null) {
      pending = [];
      stopWatch();
      cb.onNoAudio?.();
      return;
    }
    const due = pending.filter((p) => p.at <= now);
    pending = pending.filter((p) => p.at > now);
    if (pending.length === 0) stopWatch();
    for (const p of due) p.run();
  };

  const at = (time: number, run: () => void) => {
    pending.push({ at: time, run });
    if (timer === null) timer = deps.setInterval(tick, deps.tickMs ?? 25);
  };

  const applyLevel = () => player.setLevels({ drone: ducked ? level * DRONE_DUCK : level });
  const duck = (on: boolean) => {
    if (ducked === on) return;
    ducked = on;
    applyLevel();
  };

  /** Hand a part's sounds to the player from `now + LEAD_SEC`; returns when it ends on the audio clock. */
  const play = (part: Part, voice: Voice, now: number): number => {
    for (const s of part.sounds) {
      const delay = LEAD_SEC + s.time;
      if (s.kind === 'click') player.click(true, delay);
      else if (s.kind === 'chord' || voice === 'guitar') player.pluck(s.midi!, delay, s.length);
      else player.tone(s.midi!, delay, s.length);
    }
    return now + LEAD_SEC + part.duration;
  };

  const run = (effects: readonly Effect[], settings: AudioSettings) => {
    const voice = settings.sound;
    const wanted = settings.droneLevel ?? 1;
    if (wanted !== level) {
      level = wanted;
      applyLevel();
    }
    const bpm = settings.bpm;
    const resolves = effects.some((e) => e.type === 'playResolution');
    for (const e of effects) {
      switch (e.type) {
        case 'cancelAudio':
          player.cancel();
          pending = [];
          stopWatch();
          duck(false);
          continue;
        case 'startDrone':
          drone?.stop();
          drone = player.hold(droneNotes(e.key));
          continue;
        case 'stopDrone':
          drone?.stop();
          drone = null;
          duck(false);
          continue;
        case 'score':
          // A right answer with no walk home (resolution off) still gets a sound: a soft click.
          if (e.right && !resolves) {
            const now = player.now();
            if (now !== null) play(RIGHT_CLICK, voice, now);
          }
          continue;
        default:
          break;
      }
      // The rest sound for a while, and may end a phase.
      const now = player.now();
      if (now === null) {
        cb.onNoAudio?.();
        return;
      }
      let part: Part;
      if (e.type === 'playContext') part = contextPart(e.key, e.tonic, bpm, settings.cadenceForm);
      else if (e.type === 'playNote') part = notePart(e.midi, bpm);
      else if (e.type === 'playCompare') part = comparePart(e.answer, e.right, bpm);
      else if (e.type === 'playResolution') part = resolutionPart(e.steps, bpm);
      else part = waitPart(e.beats, bpm);
      const end = play(part, voice, now);
      if (e.type === 'playContext' && drone) {
        duck(true);
        at(end, () => duck(false));
      }
      const done = e.done;
      if (done) at(end, () => cb.onDone(done));
    }
  };

  return {
    run,
    dispose() {
      player.cancel();
      drone?.stop();
      drone = null;
      pending = [];
      stopWatch();
      duck(false);
    },
  };
}
