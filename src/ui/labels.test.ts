import { describe, expect, it } from 'vitest';
import { note, pitch, type ToneRole } from '../music';
import { durationGlyph, roleLabel, targetBadgeText } from './labels';

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

describe('roleLabel', () => {
  it('names every chord-tone role', () => {
    const expected: Record<ToneRole, string> = { R: 'Root', '3': '3rd', '5': '5th', '7': '7th' };
    for (const [role, label] of Object.entries(expected)) {
      expect(roleLabel(role as ToneRole)).toBe(label);
    }
  });
});

describe('targetBadgeText', () => {
  const dMinorTonic = note('D');
  const bFlatTonic = note('B', -1);

  it('names the landing note, with no arrow when the target role was reached', () => {
    const landing = { pitch: pitch('D', 0, 4), role: 'R' as const };
    expect(targetBadgeText('R', landing, dMinorTonic)).toBe('target · Root (D)');
  });

  it('shows the fallback role and the note actually landed on, not the chord root', () => {
    // The bug this guards: B♭ major in D minor pentatonic has no root in the box (the scale omits
    // scale degrees 2 and 6), so the lick lands on the 3rd — which is D, not B♭.
    const landing = { pitch: pitch('D', 0, 4), role: '3' as const };
    const text = targetBadgeText('R', landing, bFlatTonic);
    expect(text).toBe('target · Root → 3rd (D)');
    expect(text).not.toContain('B');
  });

  it('drops the octave and keeps the accidental spelling', () => {
    const landing = { pitch: pitch('B', -1, 3), role: 'R' as const };
    expect(targetBadgeText('R', landing, bFlatTonic)).toBe('target · Root (B♭)');
  });

  it('still names a landing note that is not a chord tone at all', () => {
    // `pickChordTone` can fall all the way through to any box note; there is no role to report,
    // but the note itself is still the honest thing to show.
    const landing = { pitch: pitch('G', 0, 3) };
    expect(targetBadgeText('3', landing, bFlatTonic)).toBe('target · 3rd (G)');
  });

  it('falls back to the chord root only when there is no lick to land anywhere', () => {
    expect(targetBadgeText('5', undefined, bFlatTonic)).toBe('target · 5th (B♭)');
  });
});
