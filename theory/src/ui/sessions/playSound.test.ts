import { describe, expect, it } from 'vitest';
import type { Player } from '../../core/audio';
import { strummed, type Sound } from '../../sessions/sound';
import { playSound } from './playSound';

function fakePlayer() {
  const plucks: { midi: number; delay?: number; length?: number }[] = [];
  const clicks: { accent?: boolean; delay?: number }[] = [];
  let cancels = 0;

  const player: Player = {
    pluck: (midi, delay, length) => {
      plucks.push({ midi, delay, length });
    },
    mute: (midi, delay) => {
      plucks.push({ midi, delay });
    },
    click: (accent = false, delay) => {
      clicks.push({ accent, delay });
    },
    setEnabled: () => {},
    now: () => 0,
    setLevels: () => {},
    cancel: () => {
      cancels++;
    },
    get enabled() {
      return true;
    },
  };

  return { player, plucks, clicks, getCancels: () => cancels };
}

describe('playSound', () => {
  it('cancels the player and schedules strummed notes with rising delays and clicks with delays', () => {
    const fake = fakePlayer();
    const sound: Sound = {
      bpm: 80,
      events: [
        strummed([40, 47, 52], 1, 2),
        { at: 3, click: 'accent', length: 0.5 },
        { at: 4, click: 'plain' },
        { at: 5, midis: [64], length: 1 },
      ],
    };

    playSound(fake.player, sound);

    // Cancel called first
    expect(fake.getCancels()).toBe(1);

    // Strummed chord: 3 notes, rising delays
    expect(fake.plucks.length).toBe(4); // 3 strummed + 1 individual note
    const strumPlucks = fake.plucks.slice(0, 3);
    expect(strumPlucks.map((p) => p.midi)).toEqual([40, 47, 52]);

    // at = 1 beat at 80 bpm -> 1 * 60 / 80 = 0.75s
    expect(strumPlucks[0]!.delay).toBeCloseTo(0.75, 4);
    expect(strumPlucks[1]!.delay!).toBeGreaterThan(strumPlucks[0]!.delay!);
    expect(strumPlucks[2]!.delay!).toBeGreaterThan(strumPlucks[1]!.delay!);

    // length = 2 beats at 80 bpm -> 2 * 60 / 80 = 1.5s
    for (const p of strumPlucks) {
      expect(p.length).toBeCloseTo(1.5, 4);
    }

    // Individual note at beat 5: delay = 5 * 60 / 80 = 3.75s, length = 1 * 60 / 80 = 0.75s
    const singleNote = fake.plucks[3]!;
    expect(singleNote.midi).toBe(64);
    expect(singleNote.delay).toBeCloseTo(3.75, 4);
    expect(singleNote.length).toBeCloseTo(0.75, 4);

    // Clicks:
    expect(fake.clicks.length).toBe(2);
    // beat 3: accent = true, delay = 3 * 60 / 80 = 2.25s
    expect(fake.clicks[0]).toEqual({ accent: true, delay: 2.25 });
    // beat 4: accent = false, delay = 4 * 60 / 80 = 3.0s
    expect(fake.clicks[1]).toEqual({ accent: false, delay: 3.0 });
  });
});
