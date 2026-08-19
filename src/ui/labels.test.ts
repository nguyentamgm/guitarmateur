import { describe, expect, it } from 'vitest';
import { IV, SCALES, note, pitch } from '../music';
import { durationGlyph, intervalLabel, targetBadgeText } from './labels';
import type { Translate } from '../i18n';

/** Fixture translator rendering exactly what the en catalog says for the keys the badge uses. */
const t: Translate = (key, params) => {
  switch (key) {
    case 'role.R':
      return 'Root';
    case 'role.3':
      return '3rd';
    case 'role.5':
      return '5th';
    case 'role.7':
      return '7th';
    case 'practice.targetBadge':
      return `target · ${params!.target} (${params!.note})`;
    case 'practice.targetBadgeRedirect':
      return `target · ${params!.target} → ${params!.actual} (${params!.note})`;
    default:
      return key;
  }
};

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

describe('intervalLabel', () => {
  it('names every registry interval with the correct accidental against the major scale', () => {
    expect(intervalLabel(IV.P1)).toBe('1');
    expect(intervalLabel(IV.m2)).toBe('♭2');
    expect(intervalLabel(IV.M2)).toBe('2');
    expect(intervalLabel(IV.m3)).toBe('♭3');
    expect(intervalLabel(IV.M3)).toBe('3');
    expect(intervalLabel(IV.P4)).toBe('4');
    expect(intervalLabel(IV.d5)).toBe('♭5');
    expect(intervalLabel(IV.P5)).toBe('5');
    expect(intervalLabel(IV.m6)).toBe('♭6');
    expect(intervalLabel(IV.M6)).toBe('6');
    expect(intervalLabel(IV.m7)).toBe('♭7');
    expect(intervalLabel(IV.M7)).toBe('7');
    expect(intervalLabel(IV.P8)).toBe('8');
  });

  it('names the added tone of every decorated scale', () => {
    expect(SCALES.blues.decoration).toBeDefined();
    expect(SCALES['major-blues'].decoration).toBeDefined();
    expect(intervalLabel(SCALES.blues.decoration!.addedIntervals[0]!)).toBe('♭5');
    expect(intervalLabel(SCALES['major-blues'].decoration!.addedIntervals[0]!)).toBe('♭3');
  });
});

describe('targetBadgeText', () => {
  const dMinorTonic = note('D');
  const bFlatTonic = note('B', -1);

  it('names the landing note, with no arrow when the target role was reached', () => {
    const landing = { pitch: pitch('D', 0, 4), role: 'R' as const };
    expect(targetBadgeText(t, 'R', landing, dMinorTonic)).toBe('target · Root (D)');
  });

  it('shows the fallback role and the note actually landed on, not the chord root', () => {
    // The bug this guards: B♭ major in D minor pentatonic has no root in the box (the scale omits
    // scale degrees 2 and 6), so the lick lands on the 3rd — which is D, not B♭.
    const landing = { pitch: pitch('D', 0, 4), role: '3' as const };
    const text = targetBadgeText(t, 'R', landing, bFlatTonic);
    expect(text).toBe('target · Root → 3rd (D)');
    expect(text).not.toContain('B');
  });

  it('drops the octave and keeps the accidental spelling', () => {
    const landing = { pitch: pitch('B', -1, 3), role: 'R' as const };
    expect(targetBadgeText(t, 'R', landing, bFlatTonic)).toBe('target · Root (B♭)');
  });

  it('still names a landing note that is not a chord tone at all', () => {
    // `pickChordTone` can fall all the way through to any box note; there is no role to report,
    // but the note itself is still the honest thing to show.
    const landing = { pitch: pitch('G', 0, 3) };
    expect(targetBadgeText(t, '3', landing, bFlatTonic)).toBe('target · 3rd (G)');
  });

  it('falls back to the chord root only when there is no lick to land anywhere', () => {
    expect(targetBadgeText(t, '5', undefined, bFlatTonic)).toBe('target · 5th (B♭)');
  });

  it('resolveToNext: badge shows the target role with no fallback arrow when the landing note is the next chord root', () => {
    // C (root of the next chord) landing on Am→C with target Root: role 'R', no arrow.
    const landing = { pitch: pitch('C', 0, 4), role: 'R' as const };
    expect(targetBadgeText(t, 'R', landing, note('A'))).toBe('target · Root (C)');
  });
});
