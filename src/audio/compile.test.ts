import { describe, expect, it } from 'vitest';
import type { Pitch } from '../music';
import type { Lick, LickNote } from '../lick';
import { compileProgression, type AudioEvent } from './compile';

/** A4 = MIDI 69; octave controls pitch but tests here only care about timing/structure. */
const A = (octave: number): Pitch => ({ letter: 'A', alter: 0, octave });

function note(startBeat: number, durationBeats: number): LickNote {
  return { string: 0, fret: 5, pitch: A(4), startBeat, durationBeats };
}

function lick(lengthBeats: number, starts: number[]): Lick {
  return { lengthBeats, difficulty: 1, notes: starts.map((s) => note(s, 1)) };
}

const plucks = (events: AudioEvent[]) => events.filter((e): e is Extract<AudioEvent, { kind: 'pluck' }> => e.kind === 'pluck');
const clicks = (events: AudioEvent[]) => events.filter((e): e is Extract<AudioEvent, { kind: 'click' }> => e.kind === 'click');

describe('compileProgression', () => {
  it('converts beats to seconds via 60 / tempoBpm', () => {
    const l = lick(4, [0, 2]);
    for (const [bpm, secPerBeat] of [
      [60, 1],
      [120, 0.5],
      [90, 60 / 90],
    ] as const) {
      const { events } = compileProgression([l], { tempoBpm: bpm, metronome: false });
      const p = plucks(events);
      expect(p[0]!.timeSec).toBeCloseTo(0);
      expect(p[1]!.timeSec).toBeCloseTo(2 * secPerBeat);
      expect(p[1]!.durationSec).toBeCloseTo(secPerBeat); // 1 beat
    }
  });

  it('count-in prepends exactly one bar (4 clicks) and shifts the music back a bar', () => {
    const l = lick(4, [0]);
    const { events } = compileProgression([l], { tempoBpm: 60, countIn: true, metronome: false });
    const c = clicks(events);
    expect(c).toHaveLength(4);
    expect(c.map((e) => e.timeSec)).toEqual([0, 1, 2, 3]);
    expect(c[0]!.accented).toBe(true);
    expect(c.slice(1).every((e) => !e.accented)).toBe(true);
    // The single note now starts at beat 4 (after the count-in bar).
    expect(plucks(events)[0]!.timeSec).toBeCloseTo(4);
  });

  it('metronome emits one click per beat, accented on each downbeat', () => {
    const two = [lick(4, [0]), lick(4, [0])]; // two 1-bar chords = 8 beats
    const { events } = compileProgression(two, { tempoBpm: 60 });
    const c = clicks(events);
    expect(c).toHaveLength(8);
    expect(c.map((e) => e.accented)).toEqual([true, false, false, false, true, false, false, false]);
  });

  it('lays chords end-to-end; a 2-bar chord occupies 8 beats', () => {
    const prog = [lick(8, [0, 4]), lick(4, [0])]; // 2-bar chord, then 1-bar chord
    const { events, musicDurationSec, totalDurationSec } = compileProgression(prog, { tempoBpm: 60, metronome: false });
    const p = plucks(events);
    // entry 0 notes at beats 0 and 4; entry 1's note starts at beat 8 (after the 2-bar chord).
    expect(p.map((e) => [e.entryIndex, e.timeSec])).toEqual([
      [0, 0],
      [0, 4],
      [1, 8],
    ]);
    expect(musicDurationSec).toBeCloseTo(12);
    expect(totalDurationSec).toBeCloseTo(12);
  });

  it('loop wraps seamlessly: first note of a repeat is one music-length after the previous pass', () => {
    const l = lick(4, [0]);
    const { events, musicDurationSec } = compileProgression([l], { tempoBpm: 120, metronome: false, repeats: 2 });
    const p = plucks(events);
    expect(p).toHaveLength(2);
    expect(p[1]!.timeSec - p[0]!.timeSec).toBeCloseTo(musicDurationSec);
  });

  it('returns events sorted ascending by time', () => {
    const { events } = compileProgression([lick(4, [0, 1, 2, 3])], { tempoBpm: 100 });
    for (let i = 1; i < events.length; i++) {
      expect(events[i]!.timeSec).toBeGreaterThanOrEqual(events[i - 1]!.timeSec);
    }
  });
});
