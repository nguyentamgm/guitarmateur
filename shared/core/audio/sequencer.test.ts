import { describe, expect, it } from 'vitest';
import type { Player } from './player';
import { Sequencer, type Pass, type SeqEvent, type SequencerDeps } from './sequencer';

/** A player on a clock the test moves, recording what is handed to it and with which delay. */
function rig(audio = true) {
  let time = 10;
  let clockLost = false;
  const heard: string[] = [];
  const player: Player = {
    pluck: (midi, delay = 0, length) => heard.push(`p${midi}@${(time + delay).toFixed(2)}${length ? `~${length.toFixed(2)}` : ''}`),
    mute: (midi, delay = 0) => heard.push(`m${midi}@${(time + delay).toFixed(2)}`),
    click: (accent = false, delay = 0) => heard.push(`${accent ? 'C' : 'c'}@${(time + delay).toFixed(2)}`),
    setEnabled: () => {},
    enabled: true,
    now: () => (audio && !clockLost ? time : null),
    setLevels: () => {},
  };
  let tick: (() => void) | null = null;
  const timeouts: { at: number; fn: () => void }[] = [];
  const deps: SequencerDeps = {
    setInterval: (fn) => ((tick = fn), 1),
    clearInterval: () => (tick = null),
    setTimeout: (fn, ms) => (timeouts.push({ at: time + ms / 1000, fn }), timeouts.length),
    clearTimeout: (h) => (timeouts[(h as number) - 1]!.fn = () => {}),
  };
  /** Advance the clock in 25 ms ticks, firing due timers. */
  const run = (sec: number) => {
    const end = time + sec;
    while (time < end - 1e-9) {
      time += 0.025;
      for (const t of timeouts.filter((t) => t.at <= time + 1e-9)) {
        timeouts.splice(timeouts.indexOf(t), 1);
        t.fn();
      }
      tick?.();
    }
  };
  /** Jump the clock without ticking: a stalled timer (a background tab). */
  const stall = (sec: number) => {
    time += sec;
  };
  return { player, deps, heard, run, stall, ticking: () => tick !== null, loseClock: () => (clockLost = true) };
}

const pass: Pass<string> = {
  events: [
    { timeSec: 0, kind: 'click', accent: true },
    { timeSec: 0, kind: 'note', midi: 57, lengthSec: 0.4, tag: 'a' },
    { timeSec: 0.5, kind: 'click', accent: false },
    { timeSec: 0.5, kind: 'note', midi: 60, muted: true, tag: 'b' },
  ],
  durationSec: 1,
};

describe('Sequencer', () => {
  it('hands every event to the player at its exact time, once, and reports it as it sounds', () => {
    const r = rig();
    const sounded: SeqEvent<string>[] = [];
    let ended = 0;
    const seq = new Sequencer<string>(r.player, { onSound: (e) => sounded.push(e), onEnd: () => ended++ }, r.deps);
    seq.play(pass);
    expect(seq.isPlaying).toBe(true);
    r.run(2);
    // Starts 0.1 s after play (a lead, never in the past).
    expect(r.heard).toEqual(['C@10.10', 'p57@10.10~0.40', 'c@10.60', 'm60@10.60']);
    expect(sounded.flatMap((e) => (e.kind === 'note' ? [e.tag] : []))).toEqual(['a', 'b']);
    // A single pass ends by itself once played out.
    expect(seq.isPlaying).toBe(false);
    expect(ended).toBe(1);
    expect(r.ticking()).toBe(false);
  });

  it('loops by asking for the next pass, seamlessly, until stopped', () => {
    const r = rig();
    const seq = new Sequencer<string>(r.player, {}, r.deps);
    seq.play(pass, () => pass);
    r.run(3.3);
    const notes = r.heard.filter((h) => h.startsWith('p57'));
    expect(notes).toEqual(['p57@10.10~0.40', 'p57@11.10~0.40', 'p57@12.10~0.40', 'p57@13.10~0.40']);
    seq.stop();
    const count = r.heard.length;
    r.run(3);
    expect(r.heard.length).toBe(count);
    expect(seq.isPlaying).toBe(false);
  });

  it('plays nothing without audio, or with nothing to play', () => {
    const r = rig(false);
    const seq = new Sequencer(r.player, {}, r.deps);
    seq.play(pass);
    expect(seq.isPlaying).toBe(false);
    const r2 = rig();
    const seq2 = new Sequencer(r2.player, {}, r2.deps);
    seq2.play({ events: [], durationSec: 1 });
    expect(seq2.isPlaying).toBe(false);
  });

  it('ends a loop whose next pass takes no time, and never spins on an empty pass', () => {
    const r = rig();
    let ended = 0;
    const seq = new Sequencer(r.player, { onEnd: () => ended++ }, r.deps);
    seq.play(pass, () => ({ events: [], durationSec: 0 }));
    r.run(2);
    expect(seq.isPlaying).toBe(false);
    expect(ended).toBe(1);

    const r2 = rig();
    const seq2 = new Sequencer(r2.player, {}, r2.deps);
    seq2.play(pass, () => ({ events: [], durationSec: 2 }));
    r2.run(5); // returns: an empty pass still moves the loop on
    expect(seq2.isPlaying).toBe(true);
    seq2.stop();
  });

  it('skips what a stalled timer missed instead of playing it in a burst', () => {
    const r = rig();
    const seq = new Sequencer(r.player, {}, r.deps);
    seq.play(pass, () => pass);
    r.run(0.2); // the first beat is heard
    r.stall(1.2); // the timer sleeps through the second beat and the next pass's first
    r.run(0.1);
    expect(r.heard.filter((h) => h.endsWith('@10.60'))).toEqual([]);
    expect(r.heard.filter((h) => h.endsWith('@11.10') || h.startsWith('p57@11.10'))).toEqual([]);
    r.run(1);
    expect(r.heard).toContain('p57@12.10~0.40');
    seq.stop();
  });

  it('stops when the audio clock is lost', () => {
    const r = rig();
    const seq = new Sequencer(r.player, {}, r.deps);
    seq.play(pass, () => pass);
    r.run(0.3);
    r.loseClock();
    r.run(0.1);
    expect(seq.isPlaying).toBe(false);
    expect(r.ticking()).toBe(false);
  });
});
