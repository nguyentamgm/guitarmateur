import { describe, expect, it } from 'vitest';
import { durationGlyph } from './TabStaff';

describe('durationGlyph', () => {
  it('maps every rhythm-engine duration to a compact fraction glyph', () => {
    // Durations produced by src/lick/rhythm.ts: q/h/e/s/de/dq.
    expect(durationGlyph(2)).toBe('2');
    expect(durationGlyph(1.5)).toBe('1½');
    expect(durationGlyph(1)).toBe('1');
    expect(durationGlyph(0.75)).toBe('¾');
    expect(durationGlyph(0.5)).toBe('½');
    expect(durationGlyph(0.25)).toBe('¼');
  });
});
