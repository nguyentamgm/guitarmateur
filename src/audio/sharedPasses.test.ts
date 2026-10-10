import { describe, expect, it } from 'vitest';
import { Sequencer, rateOf, semisAt, type Player, type SequencerDeps } from '@shared/core/audio';
import { defaultState } from '../state';
import { licksForState } from '../state/selectors';
import type { Lick, LickNote } from '../lick';
import type { Pitch } from '../music';
import { glideInto, lickPasses, toSeqEvents, type NoteTag } from './sharedPasses';
import { compileProgression } from './compile';

const A4: Pitch = { letter: 'A', alter: 0, octave: 4 };
const B4: Pitch = { letter: 'B', alter: 0, octave: 4 };
const n = (startBeat: number, pitch: Pitch, extra: Partial<LickNote> = {}): LickNote => ({
  string: 1,
  fret: 5,
  pitch,
  startBeat,
  durationBeats: 1,
  ...extra,
});

describe("Practice's licks as passes for the shared sequencer", () => {
  it('rings a note until the next one on its string, never longer', () => {
    const lick: Lick = { lengthBeats: 4, difficulty: 1, notes: [n(0, A4), n(1, B4), n(2, A4, { string: 2, durationBeats: 2 })] };
    const notes = toSeqEvents(compileProgression([lick], { tempoBpm: 60, metronome: false }).events).filter((e) => e.kind === 'note');
    expect(notes.map((e) => e.kind === 'note' && e.lengthSec)).toEqual([1, 1.6, 3.2]);
  });

  it('damps the last note of a pass by the next pass on a loop, and a glide by the next pick', () => {
    const lick: Lick = { lengthBeats: 2, difficulty: 1, notes: [n(0, A4), n(1, B4, { durationBeats: 4 })] };
    const looped = lickPasses([lick], { tempoBpm: 60, metronome: false }, true);
    const lastLooped = looped.next().events.at(-1)!;
    expect(lastLooped.kind === 'note' && lastLooped.lengthSec).toBe(1); // next pass picks string 1 at 2 s
    const once = lickPasses([lick], { tempoBpm: 60, metronome: false });
    const lastOnce = once.first.events.at(-1)!;
    expect(lastOnce.kind === 'note' && lastOnce.lengthSec).toBeCloseTo(6.4);

    // A sixteenth bend followed at once by a pick on the same string stops there, glide or not.
    const fast: Lick = { lengthBeats: 1, difficulty: 1, notes: [n(0, A4, { durationBeats: 0.25 }), n(0.25, B4, { durationBeats: 0.25, technique: 'bendFull' }), n(0.5, A4, { durationBeats: 0.25 })] };
    const ev = toSeqEvents(compileProgression([fast], { tempoBpm: 240, metronome: false }).events);
    expect(ev[1]!.kind === 'note' && ev[1]!.lengthSec).toBeCloseTo(0.0625);
  });

  it('turns a technique into a glide from the previous pitch that ends on the note', () => {
    for (const technique of ['hammer', 'pull', 'slide', 'bendFull'] as const) {
      const g = glideInto(technique, -2)!;
      // Picked 2 semitones below, the glide ends 2 above that: on the note.
      expect(semisAt(g, 10)).toBe(2);
      expect(rateOf(semisAt(g, 10))).toBeCloseTo(Math.pow(2, 2 / 12));
    }
    expect(glideInto(undefined, -2)).toBeUndefined();
    const lick: Lick = { lengthBeats: 4, difficulty: 1, notes: [n(0, A4), n(1, B4, { technique: 'slide' })] };
    const slid = toSeqEvents(compileProgression([lick], { tempoBpm: 60, metronome: false }).events)[1]!;
    expect(slid).toMatchObject({ kind: 'note', midi: 69, tag: { entryIndex: 0, noteIndex: 1 } });
  });

  it('plays a whole progression and its licks through the shared engine (prototype)', () => {
    const state = defaultState(() => 7);
    const licks = licksForState(state).map((l) => l.lick);
    let time = 0;
    const plucked: number[] = [];
    let clicks = 0;
    const player: Player = {
      pluck: (m) => plucked.push(m),
      mute: (m) => plucked.push(m),
      click: () => clicks++,
      setEnabled: () => {},
      enabled: true,
      now: () => time,
      setLevels: () => {},
    };
    const clock: { tick: (() => void) | null } = { tick: null };
    const timers: { at: number; fn: () => void }[] = [];
    const deps: SequencerDeps = {
      setInterval: (fn) => ((clock.tick = fn), 1),
      clearInterval: () => (clock.tick = null),
      setTimeout: (fn, ms) => (timers.push({ at: time + ms / 1000, fn }), 0),
      clearTimeout: () => {},
    };
    const heard: NoteTag[] = [];
    const seq = new Sequencer<NoteTag>(player, { onSound: (e) => e.kind === 'note' && e.tag && heard.push(e.tag) }, deps);

    const { first } = lickPasses(licks, { tempoBpm: 120, countIn: true, swing: 1 });
    seq.play(first);
    while (clock.tick && time < 120) {
      time += 0.025;
      for (const t of timers.splice(0).filter((t) => (t.at <= time ? (t.fn(), false) : true))) timers.push(t);
      clock.tick?.();
    }

    const expected = licks.flatMap((l) => l.notes);
    expect(plucked).toHaveLength(expected.length);
    expect(heard).toEqual(licks.flatMap((l, entryIndex) => l.notes.map((_, noteIndex) => ({ entryIndex, noteIndex }))));
    // A bar of count-in plus the metronome under every beat.
    const beats = licks.reduce((s, l) => s + l.lengthBeats, 0);
    expect(clicks).toBe(4 + beats);
    expect(seq.isPlaying).toBe(false);
  });
});
