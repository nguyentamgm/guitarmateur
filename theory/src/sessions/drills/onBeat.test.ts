import { describe, expect, it } from 'vitest';
import { onBeat } from './onBeat';
import type { DrillQuestion } from './types';

describe('onBeat drill', () => {
  it('has answers "on" and "off"', () => {
    expect(onBeat.answers).toEqual(['on', 'off']);
  });

  it('for "on" every strum coincides with a click', () => {
    const q = onBeat.next(() => 0.1); // < 0.5 -> 'on'
    expect(q.answer).toBe('on');
    expect(q.sound.bpm).toBe(80);

    const clicks = q.sound.events.filter((e) => e.click !== undefined);
    const strums = q.sound.events.filter((e) => e.strum);

    expect(clicks).toHaveLength(4);
    expect(strums).toHaveLength(4);

    expect(clicks[0]?.click).toBe('accent');
    expect(clicks[1]?.click).toBe('plain');
    expect(clicks[2]?.click).toBe('plain');
    expect(clicks[3]?.click).toBe('plain');

    const clickAts = new Set(clicks.map((c) => c.at));
    for (const s of strums) {
      expect(clickAts.has(s.at)).toBe(true);
      expect(s.length).toBe(0.5);
    }

    // compare is the other version (off)
    expect(q.compare).toBeDefined();
    const compareStrums = q.compare!.events.filter((e) => e.strum);
    for (const s of compareStrums) {
      expect(clickAts.has(s.at)).toBe(false);
    }
  });

  it('for "off" no strum coincides with a click', () => {
    const q = onBeat.next(() => 0.9); // >= 0.5 -> 'off'
    expect(q.answer).toBe('off');
    expect(q.sound.bpm).toBe(80);

    const clicks = q.sound.events.filter((e) => e.click !== undefined);
    const strums = q.sound.events.filter((e) => e.strum);

    expect(clicks).toHaveLength(4);
    expect(strums).toHaveLength(4);

    const clickAts = new Set(clicks.map((c) => c.at));
    for (const s of strums) {
      expect(clickAts.has(s.at)).toBe(false);
      expect(s.length).toBe(0.5);
    }

    // compare is the other version (on)
    expect(q.compare).toBeDefined();
    const compareStrums = q.compare!.events.filter((e) => e.strum);
    for (const s of compareStrums) {
      expect(clickAts.has(s.at)).toBe(true);
    }
  });

  it('never has three equal answers in a row', () => {
    let prev: DrillQuestion | undefined;
    for (let i = 0; i < 100; i++) {
      // Force random returning 0 (which would be 'on' indefinitely without run limit)
      const q = onBeat.next(() => 0.1, prev);
      if (prev && prev.run === 2) {
        expect(q.answer).not.toBe(prev.answer);
        expect(q.run).toBe(1);
      }
      prev = q;
    }

    // Also test with random returning 0.9 (which would be 'off' indefinitely)
    prev = undefined;
    for (let i = 0; i < 100; i++) {
      const q = onBeat.next(() => 0.9, prev);
      if (prev && prev.run === 2) {
        expect(q.answer).not.toBe(prev.answer);
        expect(q.run).toBe(1);
      }
      prev = q;
    }
  });
});
