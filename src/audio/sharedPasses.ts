/**
 * Practice's licks as passes for the shared sequencer (shared/core/audio/sequencer.ts), which
 * plays them on the shared guitar sound (Theory's). Count-in, swing, bars per chord and the
 * metronome are laid out by `compileProgression` as before; this turns its events into the
 * sequencer's: a note sounds until the next note on its string (a string sounds one note at a
 * time), and a technique becomes a glide into the note from the one before it.
 */
import { bend, glideEnd, slide, type Glide, type Pass, type SeqEvent } from '@shared/core/audio';
import type { Lick, Technique } from '../lick';
import { compileProgression, type AudioEvent, type CompileOptions } from './compile';

/** Which chord card and which of its notes a sounding note is: for tab highlighting. */
export interface NoteTag {
  readonly entryIndex: number;
  readonly noteIndex: number;
}

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
      return [
        { t: 0, semis: 0, ramp: 'step' },
        { t: 0.005, semis: to, ramp: 'step' },
      ];
  }
}

/** Compiled events → sequencer events. */
export function toSeqEvents(events: readonly AudioEvent[]): SeqEvent<NoteTag>[] {
  const out: SeqEvent<NoteTag>[] = [];
  events.forEach((e, i) => {
    if (e.kind === 'click') {
      out.push({ timeSec: e.timeSec, kind: 'click', accent: e.accented });
      return;
    }
    // Ring for the notated length plus a tail, but never past the next note on the same string.
    const nextOnString = events.slice(i + 1).find((n) => n.kind === 'pluck' && n.string === e.string);
    const ring = e.durationSec * 1.6;
    const lengthSec = nextOnString ? Math.min(ring, nextOnString.timeSec - e.timeSec) : ring;
    const fromSemis = e.fromMidi === undefined ? 0 : e.fromMidi - e.midi;
    const glide = glideInto(e.technique, fromSemis);
    out.push({
      timeSec: e.timeSec,
      kind: 'note',
      // A glided note is picked at the pitch it comes from.
      midi: glide ? e.midi + fromSemis : e.midi,
      lengthSec: Math.max(lengthSec, glide ? glideEnd(glide) : 0),
      glide,
      tag: { entryIndex: e.entryIndex, noteIndex: e.noteIndex },
    });
  });
  return out;
}

/** The first pass (with the count-in) and, for a loop, every pass after it (without). */
export function lickPasses(licks: Lick[], opts: CompileOptions): { first: Pass<NoteTag>; next: () => Pass<NoteTag> } {
  const first = compileProgression(licks, { ...opts, repeats: 1 });
  const again = compileProgression(licks, { ...opts, countIn: false, repeats: 1 });
  const nextPass: Pass<NoteTag> = { events: toSeqEvents(again.events), durationSec: again.musicDurationSec };
  return {
    first: { events: toSeqEvents(first.events), durationSec: first.totalDurationSec },
    next: () => nextPass,
  };
}
