/**
 * Practice's licks as passes for the shared sequencer (shared/core/audio/sequencer.ts), which
 * plays them on the shared guitar sound (Theory's). Count-in, swing, bars per chord and the
 * metronome are laid out by `compileProgression` as before; this turns its events into the
 * sequencer's: a note sounds until the next note on its string (a string sounds one note at a
 * time), and a technique becomes a glide into the note from the one before it.
 */
import { bend, glideEnd, legato, slide, withVibrato, type Glide, type Pass, type SeqEvent } from '@shared/core/audio';
import type { Lick, Technique } from '../lick';
import { compileProgression, type AudioEvent, type CompileOptions } from './compile';

/** Which chord card and which of its notes a sounding note is: for tab highlighting. */
export interface NoteTag {
  readonly entryIndex: number;
  readonly noteIndex: number;
}

/** Which bar of the progression a downbeat click starts: for the bar grid. */
export interface BarTag {
  readonly bar: number;
  /** On a trade response pass, which card's bar this is and that it is the learner's turn. */
  readonly entryIndex?: number;
  readonly response?: boolean;
}

/** Which beat (1..4) of the count-in bar a count-in click sounds on. */
export interface CountInTag {
  readonly countInBeat: number;
}

/** What a sounding event reports: a note (`NoteTag`), a bar's downbeat (`BarTag`), or a count-in beat (`CountInTag`). */
export type PlayTag = NoteTag | BarTag | CountInTag;

/**
 * How a technique reaches a note picked `fromSemis` away from it (at the previous note's pitch):
 * the glide, in semitones from that picked pitch, ends on the note itself.
 */
export function glideInto(technique: Technique | undefined, fromSemis: number): Glide | undefined {
  if (technique === undefined || fromSemis === 0) return undefined;
  const to = -fromSemis;
  switch (technique) {
    case 'bendHalf':
    case 'bendFull':
      return bend(to, 0, 0.12);
    case 'slide':
      return slide(to, 0, 0.07);
    case 'hammer':
    case 'pull':
      // Legato: the new pitch almost at once.
      return legato(to, 0.005);
    case 'release':
      // The bent string coming back down to its fretted pitch.
      return slide(to, 0, 0.1);
  }
}

/** Vibrato waits this long after the note (and any glide into it) before it starts. */
const VIBRATO_DELAY_SEC = 0.15;

/** `glide` with vibrato on the rest of the note, when it is long enough to hear it. */
function vibratoOn(glide: Glide | undefined, lengthSec: number): Glide | undefined {
  const start = (glide ? glideEnd(glide) : 0) + VIBRATO_DELAY_SEC;
  const length = lengthSec - start;
  return length >= 0.15 ? withVibrato(glide, start, length) : glide;
}

/**
 * Compiled events → sequencer events. `following` are the plucks that come right after (the next
 * loop pass, shifted to this pass's time), so a note at the end of a pass is still damped by the
 * next note on its string.
 */
export function toSeqEvents(events: readonly AudioEvent[], following: readonly AudioEvent[] = []): SeqEvent<PlayTag>[] {
  // Walking backwards, remember when each string is next picked: one pass, not a search per note.
  const nextPick = new Map<number, number>();
  for (const f of following) {
    if (f.kind === 'pluck' && !nextPick.has(f.string)) nextPick.set(f.string, f.timeSec);
  }
  const out: SeqEvent<PlayTag>[] = new Array(events.length);
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i]!;
    if (e.kind === 'click') {
      const tag: PlayTag | undefined =
        e.bar !== undefined
          ? {
              bar: e.bar,
              ...(e.response && {
                response: true,
                ...(e.entryIndex !== undefined && { entryIndex: e.entryIndex }),
              }),
            }
          : e.countInBeat !== undefined
            ? { countInBeat: e.countInBeat }
            : undefined;
      out[i] = {
        timeSec: e.timeSec,
        kind: 'click',
        accent: e.accented,
        ...(tag !== undefined && { tag }),
      };
      continue;
    }
    if (e.kind === 'backing') {
      out[i] = {
        timeSec: e.timeSec,
        kind: 'note',
        midi: e.midi,
        lengthSec: e.durationSec,
        ...(e.muted && { muted: true }),
        channel: 'backing',
      };
      continue;
    }
    const fromSemis = e.fromMidi === undefined ? 0 : e.fromMidi - e.midi;
    const into = glideInto(e.technique, fromSemis);
    // Ring for the notated length plus a tail (at least through a glide), but never past the next
    // pick on the same string: a string sounds one note at a time.
    const ring = Math.max(e.durationSec * 1.6, into ? glideEnd(into) : 0);
    const next = nextPick.get(e.string);
    nextPick.set(e.string, e.timeSec);
    const lengthSec = next === undefined ? ring : Math.min(ring, next - e.timeSec);
    const glide = e.vibrato ? vibratoOn(into, Math.min(lengthSec, e.durationSec)) : into;
    out[i] = {
      timeSec: e.timeSec,
      kind: 'note',
      // A glided note is picked at the pitch it comes from.
      midi: into ? e.midi + fromSemis : e.midi,
      lengthSec,
      velocity: e.velocity,
      glide,
      tag: { entryIndex: e.entryIndex, noteIndex: e.noteIndex },
    };
  }
  return out;
}

/**
 * The first pass (with the count-in) and, for a loop or trade mode, the passes after it (without).
 * With `loop` (and not `trade`), each pass's last notes are damped by the next pass's first ones.
 * With `trade`, odd passes play the lick and even passes silence the lick notes while keeping click
 * and backing so the learner can play the lick back.
 */
export function lickPasses(licks: Lick[], opts: CompileOptions, loop = false): { first: Pass<PlayTag>; next: () => Pass<PlayTag> } {
  const trade = Boolean(opts.trade);
  const first = compileProgression(licks, { ...opts, trade: false, repeats: 1 });
  const again = compileProgression(licks, { ...opts, countIn: false, trade: false, repeats: 1 });
  const after = (offset: number) => (loop && !trade ? again.events.map((e) => ({ ...e, timeSec: e.timeSec + offset })) : []);
  const nextPass: Pass<PlayTag> = { events: toSeqEvents(again.events, after(again.musicDurationSec)), durationSec: again.musicDurationSec };
  if (!trade) {
    return {
      first: { events: toSeqEvents(first.events, after(first.totalDurationSec)), durationSec: first.totalDurationSec },
      next: () => nextPass,
    };
  }
  const responseEvents = again.events
    .filter((e) => e.kind !== 'pluck')
    .map((e) => (e.kind === 'click' && e.bar !== undefined ? { ...e, response: true } : e));
  const responsePass: Pass<PlayTag> = { events: toSeqEvents(responseEvents), durationSec: again.musicDurationSec };
  const emptyPass: Pass<PlayTag> = { events: [], durationSec: 0 };
  let passCount = 1;
  return {
    first: { events: toSeqEvents(first.events), durationSec: first.totalDurationSec },
    next: () => {
      passCount++;
      if (passCount % 2 === 0) return responsePass;
      return loop ? nextPass : emptyPass;
    },
  };
}
