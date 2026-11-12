import { describe, expect, it } from 'vitest';
import { defaultPattern, strumSteps } from './strum';

describe('strum', () => {
  it('creates default patterns for 3 and 4 beats per bar', () => {
    expect(defaultPattern(4)).toBe('D-D-D-D-');
    expect(defaultPattern(3)).toBe('D-D-D-');
  });

  it('generates 16 steps for 2 bars of 4 beats with default pattern', () => {
    const pattern = defaultPattern(4);
    const steps = strumSteps(2, 4, pattern);

    expect(steps).toHaveLength(16);

    // Accents at beat 0 of each bar (step 0 and 8)
    expect(steps[0]?.click).toBe('accent');
    expect(steps[8]?.click).toBe('accent');

    // Down strums on even steps
    expect(steps[0]?.stroke).toBe('down');
    expect(steps[2]?.stroke).toBe('down');
    expect(steps[4]?.stroke).toBe('down');
    expect(steps[6]?.stroke).toBe('down');
    expect(steps[8]?.stroke).toBe('down');
    expect(steps[10]?.stroke).toBe('down');
    expect(steps[12]?.stroke).toBe('down');
    expect(steps[14]?.stroke).toBe('down');

    // Odd eighths have click: null and stroke: null
    for (let i = 1; i < 16; i += 2) {
      expect(steps[i]?.click).toBeNull();
      expect(steps[i]?.stroke).toBeNull();
    }

    // Other even eighths have plain clicks
    expect(steps[2]?.click).toBe('plain');
    expect(steps[4]?.click).toBe('plain');
    expect(steps[6]?.click).toBe('plain');
    expect(steps[10]?.click).toBe('plain');
    expect(steps[12]?.click).toBe('plain');
    expect(steps[14]?.click).toBe('plain');

    // Beat numbers 0-based
    expect(steps[0]?.beat).toBe(0);
    expect(steps[1]?.beat).toBe(0);
    expect(steps[2]?.beat).toBe(1);
    expect(steps[3]?.beat).toBe(1);
    expect(steps[4]?.beat).toBe(2);
    expect(steps[5]?.beat).toBe(2);
    expect(steps[6]?.beat).toBe(3);
    expect(steps[7]?.beat).toBe(3);

    // Bar numbers 0-based
    expect(steps[0]?.bar).toBe(0);
    expect(steps[7]?.bar).toBe(0);
    expect(steps[8]?.bar).toBe(1);
    expect(steps[15]?.bar).toBe(1);
  });

  it('generates 6 steps per bar for 3 beats', () => {
    const steps = strumSteps(1, 3, defaultPattern(3));
    expect(steps).toHaveLength(6);
    expect(steps[0]?.click).toBe('accent');
    expect(steps[2]?.click).toBe('plain');
    expect(steps[4]?.click).toBe('plain');
    expect(steps.map((s) => s.beat)).toEqual([0, 0, 1, 1, 2, 2]);
  });

  it('handles up strokes such as D-D-D-DU', () => {
    const steps = strumSteps(1, 4, 'D-D-D-DU');
    expect(steps).toHaveLength(8);
    expect(steps[7]?.stroke).toBe('up');
    expect(steps[7]?.click).toBeNull();
  });

  it('throws on wrong length pattern', () => {
    expect(() => strumSteps(1, 4, 'D-D-D-')).toThrow(/Pattern length 6 does not match expected 8/);
    expect(() => strumSteps(1, 3, 'D-D-D-D-')).toThrow(/Pattern length 8 does not match expected 6/);
  });

  it('throws on unknown pattern character', () => {
    expect(() => strumSteps(1, 4, 'D-D-D-DX')).toThrow(/Unknown pattern character 'X'/);
  });
});
