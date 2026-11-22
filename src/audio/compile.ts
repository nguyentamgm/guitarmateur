import { EIGHTHS_PER_BAR, backingAt, type BackingStyle } from '@shared/core/audio';
import type { Chord as SharedChord, ChordId } from '@shared/core/music';
import { strumDelays, swingOnset } from '@shared/core/rhythm';
import { midi, type Chord, type QualityId } from '../music';
import type { Lick, LickNote, Technique } from '../lick';

const SHARED_CHORD_ID: Readonly<Record<QualityId, ChordId>> = {
  M: 'major',
  m: 'minor',
  dom7: 'dom7',
  m7: 'm7',
  M7: 'maj7',
};

/** Sounding part of a backing note's length: slightly short so repeated notes do not run together. */
const BACKING_RING = 0.85;

/**
 * A single scheduled audio event on the transport timeline. Times are in seconds relative to the
 * start of playback (the transport shifts them onto the AudioContext clock). Pure data — no nodes.
 */
export type AudioEvent =
  | {
      timeSec: number;
      kind: 'click';
      accented: boolean;
      /** On a downbeat of the music: which bar starts (0-based, a 2-bar chord counts twice). Not
       *  on the count-in. Drives the bar grid's highlight. */
      bar?: number;
      /** Which progression entry covers this downbeat. */
      entryIndex?: number;
      /** True on a downbeat of the learner's response pass in trade mode. */
      response?: boolean;
    }
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
      /** Held with vibrato. */
      vibrato?: boolean;
      /** How hard it is played, 0..1 — see `noteVelocity`. */
      velocity: number;
    }
  | {
      timeSec: number;
      kind: 'backing';
      midi: number;
      durationSec: number;
      muted?: boolean;
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
  /** Chords of the progression (one per lick): when provided, schedules backing chords under the licks. */
  chords?: readonly Chord[];
  /** Backing pattern style; defaults to `'shuffle'` when `swing > 0`, otherwise `'strum'`. */
  backingStyle?: BackingStyle;
  /** When set, compile only this progression card (0-based index into `licks`), preserving its `entryIndex` and bar offset. */
  cardIndex?: number;
  /** Trade bars (call and response): odd passes play the lick; even passes silence the lick notes and keep click (and backing) for the learner to answer. */
  trade?: boolean;
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
 * How hard a note is played. A machine plays every note the same; a player leans on the strong
 * beats, plays the "and"s lighter, and does not pick a hammer-on, pull-off or release at all (the
 * fretting hand sounds it, so it is softer). A chromatic passing note is played lightly too.
 */
export function noteVelocity(note: LickNote): number {
  if (note.technique === 'hammer' || note.technique === 'pull' || note.technique === 'release') return 0.6;
  const inBar = note.startBeat % BEATS_PER_BAR;
  let v = inBar === 0 || inBar === 2 ? 1 : note.startBeat % 1 === 0 ? 0.88 : 0.76;
  if (note.chromatic) v *= 0.85;
  return v;
}

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

  const entries: { lick: Lick; entryIndex: number }[] =
    opts.cardIndex !== undefined
      ? licks[opts.cardIndex]
        ? [{ lick: licks[opts.cardIndex]!, entryIndex: opts.cardIndex }]
        : []
      : licks.map((lick, entryIndex) => ({ lick, entryIndex }));
  const barOffset =
    opts.cardIndex !== undefined && opts.cardIndex > 0
      ? Math.floor(licks.slice(0, opts.cardIndex).reduce((sum, l) => sum + l.lengthBeats, 0) / BEATS_PER_BAR)
      : 0;
  const musicBeats = entries.reduce((sum, { lick }) => sum + lick.lengthBeats, 0);
  const countInBeats = countIn ? BEATS_PER_BAR : 0;

  const events: AudioEvent[] = [];

  for (let b = 0; b < countInBeats; b++) {
    events.push({ timeSec: b * secPerBeat, kind: 'click', accented: b % BEATS_PER_BAR === 0 });
  }

  for (let pass = 0; pass < repeats; pass++) {
    const passStartBeat = countInBeats + pass * musicBeats;
    const isResponse = Boolean(opts.trade) && pass % 2 === 1;

    let entryStartBeat = passStartBeat;
    entries.forEach(({ lick, entryIndex }) => {
      if (!isResponse) {
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
          const velocity = noteVelocity(note);
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
            vibrato: note.vibrato,
            velocity,
          });
          // A double stop: its second note is struck with the first, on its own string.
          if (note.partner) {
            events.push({
              timeSec: adjustedBeat * secPerBeat,
              kind: 'pluck',
              midi: midi(note.partner.pitch),
              durationSec: note.durationBeats * secPerBeat,
              string: note.partner.string,
              entryIndex,
              noteIndex,
              vibrato: note.vibrato,
              velocity: velocity * 0.9,
            });
          }
        });
      }

      const chord = opts.chords?.[entryIndex];
      if (chord) {
        const style: BackingStyle = opts.backingStyle ?? (swing > 0 ? 'shuffle' : 'strum');
        const sharedChord: SharedChord = { root: chord.tonic, id: SHARED_CHORD_ID[chord.quality] };
        const bars = Math.max(1, Math.round(lick.lengthBeats / BEATS_PER_BAR));
        for (let bar = 0; bar < bars; bar++) {
          const barStartBeat = entryStartBeat + bar * BEATS_PER_BAR;
          for (let eighth = 0; eighth < EIGHTHS_PER_BAR; eighth++) {
            const onsetBeats = swingOnset(eighth, swing);
            const atSec = (barStartBeat + onsetBeats) * secPerBeat;
            for (const hit of backingAt(sharedChord, style, eighth)) {
              const durationSec = (swingOnset(eighth + hit.eighths, swing) - onsetBeats) * secPerBeat * BACKING_RING;
              if (hit.muted) {
                for (const m of hit.midis) {
                  events.push({ timeSec: atSec, kind: 'backing', midi: m, durationSec, muted: true });
                }
              } else if (hit.stroke) {
                for (const s of strumDelays(hit.midis, hit.stroke)) {
                  events.push({ timeSec: atSec + s.delay, kind: 'backing', midi: s.item, durationSec });
                }
              } else {
                for (const m of hit.midis) {
                  events.push({ timeSec: atSec, kind: 'backing', midi: m, durationSec });
                }
              }
            }
          }
        }
      }

      entryStartBeat += lick.lengthBeats;
    });

    if (metronome) {
      for (let b = 0; b < musicBeats; b++) {
        const isDownbeat = b % BEATS_PER_BAR === 0;
        let downbeatEntry: number | undefined;
        if (isDownbeat) {
          let cursor = 0;
          for (const { lick, entryIndex } of entries) {
            if (b >= cursor && b < cursor + lick.lengthBeats) {
              downbeatEntry = entryIndex;
              break;
            }
            cursor += lick.lengthBeats;
          }
        }
        events.push({
          timeSec: (passStartBeat + b) * secPerBeat,
          kind: 'click',
          accented: isDownbeat,
          ...(isDownbeat && {
            bar: barOffset + b / BEATS_PER_BAR,
            ...(downbeatEntry !== undefined && { entryIndex: downbeatEntry }),
            ...(isResponse && { response: true }),
          }),
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
