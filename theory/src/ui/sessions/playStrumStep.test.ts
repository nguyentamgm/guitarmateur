import { describe, expect, it } from 'vitest';
import type { Player } from '../../core/audio';
import type { StrumStep } from '../../sessions/strum';
import { playStrumStep } from './playStrumStep';

function fakePlayer() {
  const plucks: { midi: number; delay?: number; length?: number }[] = [];
  const clicks: boolean[] = [];
  const player: Player = {
    pluck: (midi, delay, length) => plucks.push({ midi, delay, length }),
    mute: () => {},
    click: (accent = false) => clicks.push(accent),
    setEnabled: () => {},
    now: () => 0,
    setLevels: () => {},
    cancel: () => {},
    enabled: true,
  };
  return { player, plucks, clicks };
}

describe('playStrumStep', () => {
  it('plays clicks based on step.click', () => {
    const { player, clicks } = fakePlayer();
    const stepAccent: StrumStep = { bar: 0, beat: 0, click: 'accent', stroke: null };
    const stepPlain: StrumStep = { bar: 0, beat: 1, click: 'plain', stroke: null };
    const stepNone: StrumStep = { bar: 0, beat: 1, click: null, stroke: null };

    playStrumStep(player, stepAccent, undefined, 0.05, 80, 0.04);
    playStrumStep(player, stepPlain, undefined, 0.1, 80, 0.04);
    playStrumStep(player, stepNone, undefined, 0.15, 80, 0.04);

    expect(clicks).toEqual([true, false]);
  });

  it('strums down across all midis and honours spread', () => {
    const { player, plucks } = fakePlayer();
    const midis = [40, 45, 50, 55, 59, 64]; // 6 strings
    const step: StrumStep = { bar: 0, beat: 0, click: 'accent', stroke: 'down' };

    playStrumStep(player, step, midis, 0, 60, 0.08);

    expect(plucks.length).toBe(6);
    expect(plucks.map((p) => p.midi)).toEqual(midis);
    // Gap between strings should be 0.08s
    expect(plucks[1]!.delay! - plucks[0]!.delay!).toBeCloseTo(0.08, 4);
    expect(plucks[2]!.delay! - plucks[1]!.delay!).toBeCloseTo(0.08, 4);
  });

  it('strums up across top four midis only', () => {
    const { player, plucks } = fakePlayer();
    const midis = [40, 45, 50, 55, 59, 64]; // 6 strings
    const step: StrumStep = { bar: 0, beat: 0, click: null, stroke: 'up' };

    playStrumStep(player, step, midis, 0, 60, 0.04);

    expect(plucks.length).toBe(4);
    // High to low in up strum
    expect(plucks.map((p) => p.midi)).toEqual([64, 59, 55, 50]);
  });
});
