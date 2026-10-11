/**
 * Practice's licks as passes for the shared sequencer (shared/core/audio/sequencer.ts), which
 * plays them on the shared guitar sound (Theory's). Count-in, swing, bars per chord and the
 * metronome are laid out by `compileProgression` as before; this turns its events into the
 * sequencer's: a note sounds until the next note on its string (a string sounds one note at a
 * time), and a technique becomes a glide into the note from the one before it.
 */
import { bend, glideEnd, legato, slide, type Glide, type Pass, type SeqEvent } from '@shared/core/audio';
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
}

/** What a sounding event reports: a note (`NoteTag`) or a bar's downbeat (`BarTag`). */
export type PlayTag = NoteTag | BarTag;

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
  }
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
      out[i] = { timeSec: e.timeSec, kind: 'click', accent: e.accented, ...(e.bar !== undefined && { tag: { bar: e.bar } }) };
      continue;
    }
    const fromSemis = e.fromMidi === undefined ? 0 : e.fromMidi - e.midi;
    const glide = glideInto(e.technique, fromSemis);
    // Ring for the notated length plus a tail (at least through a glide), but never past the next
    // pick on the same string: a string sounds one note at a time.
    const ring = Math.max(e.durationSec * 1.6, glide ? glideEnd(glide) : 0);
    const next = nextPick.get(e.string);
    nextPick.set(e.string, e.timeSec);
    out[i] = {
      timeSec: e.timeSec,
      kind: 'note',
      // A glided note is picked at the pitch it comes from.
      midi: glide ? e.midi + fromSemis : e.midi,
      lengthSec: next === undefined ? ring : Math.min(ring, next - e.timeSec),
      glide,
      tag: { entryIndex: e.entryIndex, noteIndex: e.noteIndex },
    };
  }
  return out;
}

/**
 * The first pass (with the count-in) and, for a loop, every pass after it (without). With `loop`,
 * each pass's last notes are damped by the next pass's first ones.
 */
export function lickPasses(licks: Lick[], opts: CompileOptions, loop = false): { first: Pass<PlayTag>; next: () => Pass<PlayTag> } {
  const first = compileProgression(licks, { ...opts, repeats: 1 });
  const again = compileProgression(licks, { ...opts, countIn: false, repeats: 1 });
  const after = (offset: number) => (loop ? again.events.map((e) => ({ ...e, timeSec: e.timeSec + offset })) : []);
  const nextPass: Pass<PlayTag> = { events: toSeqEvents(again.events, after(again.musicDurationSec)), durationSec: again.musicDurationSec };
  return {
    first: { events: toSeqEvents(first.events, after(first.totalDurationSec)), durationSec: first.totalDurationSec },
    next: () => nextPass,
  };
}
