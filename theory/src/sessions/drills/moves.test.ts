import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import { moves, type MoveAnswer } from './moves';
import type { DrillQuestion } from './types';

describe('drill moves', () => {
  it('has four answer choices', () => {
    expect(moves.answers).toEqual(['stepUp', 'stepDown', 'leapUp', 'leapDown']);
  });

  it('produces valid questions where midi difference matches the sign and size', () => {
    const rng = mulberry32(999);
    let prev: DrillQuestion | undefined;

    for (let i = 0; i < 200; i++) {
      const q = moves.next(rng, prev);
      expect(moves.answers).toContain(q.answer);

      // BPM checks
      expect(q.sound.bpm).toBe(70);
      expect(q.compare?.bpm).toBe(50);

      // Event length and timing checks: two notes, each 1.5 beats
      expect(q.sound.events.length).toBe(2);
      expect(q.sound.events[0]!.at).toBe(0);
      expect(q.sound.events[0]!.length).toBe(1.5);
      expect(q.sound.events[1]!.at).toBe(1.5);
      expect(q.sound.events[1]!.length).toBe(1.5);

      // Compare has identical notes
      expect(q.compare?.events.length).toBe(2);
      expect(q.compare?.events[0]!.midis).toEqual(q.sound.events[0]!.midis);
      expect(q.compare?.events[1]!.midis).toEqual(q.sound.events[1]!.midis);

      const m1 = q.sound.events[0]!.midis![0]!;
      const m2 = q.sound.events[1]!.midis![0]!;
      const diff = m2 - m1;
      const size = Math.abs(diff);

      const ans = q.answer as MoveAnswer;
      if (ans === 'stepUp') {
        expect(diff).toBeGreaterThan(0);
        expect(size >= 1 && size <= 2).toBe(true);
      } else if (ans === 'stepDown') {
        expect(diff).toBeLessThan(0);
        expect(size >= 1 && size <= 2).toBe(true);
      } else if (ans === 'leapUp') {
        expect(diff).toBeGreaterThan(0);
        expect(size >= 4 && size <= 7).toBe(true);
      } else if (ans === 'leapDown') {
        expect(diff).toBeLessThan(0);
        expect(size >= 4 && size <= 7).toBe(true);
      }

      // Repetition avoidance
      if (prev && prev.answer === q.answer) {
        expect(q.run).toBe((prev.run ?? 1) + 1);
        expect(q.run).toBeLessThanOrEqual(2);
      } else {
        expect(q.run).toBe(1);
      }

      prev = q;
    }
  });
});
