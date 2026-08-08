import { midi } from '../music';
import type { Lick, Technique } from '../lick';

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
      /** Which string it is fretted on. A string sounds one note at a time, so the transport uses
       *  this to release the note already ringing there — see `Voice.release`. */
      string: number;
      /** Which progression entry / note this pluck belongs to — used for UI highlighting. */
      entryIndex: number;
      noteIndex: number;
      /** Articulation *into* this note from the previous one, if any. */
      technique?: Technique;
      /** MIDI of the previous note in the same lick — the start pitch for bend/slide glides. */
      fromMidi?: number;
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
        // A technique articulates *into* a note, so it needs where the previous note was. Licks
        // never articulate across a chord change, hence the lookup stays inside this lick. We also
        // consult `prev` in the swing block below to spot the closing 8th of a notated shuffle unit.
        const prev = noteIndex > 0 ? lick.notes[noteIndex - 1] : undefined;
        // The app has two independent swing mechanisms and this note can sit at the seam of both.
        // (1) The Swing toggle delays off-beat 8th notes (durationBeats >= 0.5) by swing * (1/6) beat.
        // (2) rhythm.ts also notates a shuffle feel directly, as the dotted-quarter + 8th `shuffleUnit`
        //     (a 1.5-beat long half followed by a 0.5-beat 8th on the "and") — the long-short pair
        //     already encodes the 3:1 boogie by its durations.
        // If both fire on that closing 8th, the notated 3:1 (gaps 1.5, 0.5) collapses into a 5:1 lurch
        // (gaps 1.667, 0.333). So skip the swing offset when this note closes a shuffle unit: it must
        // keep its notated time. We detect that via the previous note being the dotted quarter
        // (durationBeats === 1.5, which occurs only as shuffleUnit's long half) exactly 1.5 beats
        // earlier. This mirrors the 16th-grid fix from commit e22c559 (PR #67). 16ths keep their
        // notated timing too — swung-16th feels are already encoded as long-short durations.
        const closesShuffleUnit =
          prev !== undefined &&
          prev.durationBeats === 1.5 &&
          Math.abs(note.startBeat - prev.startBeat - 1.5) < 1e-9;
        if (
          swing > 0 &&
          note.durationBeats >= 0.5 &&
          Math.abs((note.startBeat % 1) - 0.5) < 0.01 &&
          !closesShuffleUnit
        ) {
          adjustedBeat += swing * (1 / 6);
        }
        events.push({
          timeSec: adjustedBeat * secPerBeat,
          kind: 'pluck',
          midi: midi(note.pitch),
          durationSec: note.durationBeats * secPerBeat,
          string: note.string,
          entryIndex,
          noteIndex,
          technique: note.technique,
          fromMidi: prev ? midi(prev.pitch) : undefined,
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
