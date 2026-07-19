import { midi } from '../music';
import type { Lick } from '../lick';

/**
 * A single scheduled audio event on the transport timeline. Times are in seconds relative to the
 * start of playback (the transport shifts them onto the AudioContext clock). Pure data — no nodes.
 */
export type AudioEvent =
  | { timeSec: number; kind: 'click'; accented: boolean }
  | {
      timeSec: number;
      kind: 'pluck';
      midi: number;
      durationSec: number;
      /** Which progression entry / note this pluck belongs to — used for UI highlighting. */
      entryIndex: number;
      noteIndex: number;
    };

export interface CompileOptions {
  tempoBpm: number;
  /** Prepend one bar of clicks before the music. Default false. */
  countIn?: boolean;
  /** Emit metronome clicks under the music. Default true. */
  metronome?: boolean;
  /** How many times the progression plays back-to-back. Default 1. */
  repeats?: number;
  /** Swing/shuffle feel: 0 = straight (default), 1 = full triplet swing. Off-beat 8ths are delayed by swing * (1/6) beats. */
  swing?: number;
}

export interface CompiledProgression {
  /** All events, ascending by `timeSec`. */
  events: AudioEvent[];
  /** Duration of one pass of the progression (excludes the count-in). */
  musicDurationSec: number;
  /** Total duration including count-in and all repeats. */
  totalDurationSec: number;
}

const BEATS_PER_BAR = 4;

/**
 * Compile a progression's licks into a flat, time-sorted event list. Pure and deterministic:
 * beats → seconds via `60 / tempoBpm`, count-in prepends one bar of clicks, and each repeat lays
 * the music (and its metronome) end-to-end so a loop wraps seamlessly — the first note of a repeat
 * lands exactly `musicDurationSec` after the first note of the previous pass.
 */
export function compileProgression(licks: Lick[], opts: CompileOptions): CompiledProgression {
  const countIn = opts.countIn ?? false;
  const metronome = opts.metronome ?? true;
  const repeats = Math.max(1, Math.floor(opts.repeats ?? 1));
  const swing = Math.min(1, Math.max(0, opts.swing ?? 0));
  const secPerBeat = 60 / opts.tempoBpm;

  const musicBeats = licks.reduce((sum, l) => sum + l.lengthBeats, 0);
  const countInBeats = countIn ? BEATS_PER_BAR : 0;

  const events: AudioEvent[] = [];

  for (let b = 0; b < countInBeats; b++) {
    events.push({ timeSec: b * secPerBeat, kind: 'click', accented: b % BEATS_PER_BAR === 0 });
  }

  for (let pass = 0; pass < repeats; pass++) {
    const passStartBeat = countInBeats + pass * musicBeats;

    let entryStartBeat = passStartBeat;
    licks.forEach((lick, entryIndex) => {
      lick.notes.forEach((note, noteIndex) => {
        let adjustedBeat = entryStartBeat + note.startBeat;
        if (swing > 0 && Math.abs((note.startBeat % 1) - 0.5) < 0.01) {
          adjustedBeat += swing * (1 / 6);
        }
        events.push({
          timeSec: adjustedBeat * secPerBeat,
          kind: 'pluck',
          midi: midi(note.pitch),
          durationSec: note.durationBeats * secPerBeat,
          entryIndex,
          noteIndex,
        });
      });
      entryStartBeat += lick.lengthBeats;
    });

    if (metronome) {
      for (let b = 0; b < musicBeats; b++) {
        events.push({
          timeSec: (passStartBeat + b) * secPerBeat,
          kind: 'click',
          accented: b % BEATS_PER_BAR === 0,
        });
      }
    }
  }

  events.sort((a, b) => a.timeSec - b.timeSec);

  return {
    events,
    musicDurationSec: musicBeats * secPerBeat,
    totalDurationSec: (countInBeats + repeats * musicBeats) * secPerBeat,
  };
}
