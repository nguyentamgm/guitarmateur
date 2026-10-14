import { describe, expect, it } from 'vitest';
import { MAJOR_KEY_TONICS, MINOR_KEY_TONICS, format, parseNote, pc } from '@shared/core/music';
import { presetDegrees } from '../core/degrees';
import { DEFAULT_SETTINGS, type EarSettings } from '../store/settings';
import { BEFORE, beforeOf, lowEFret, presetOf, withBefore, withMode } from './editSettings';

const major = (tonic: string, degrees = DEFAULT_SETTINGS.degrees): EarSettings => ({
  ...DEFAULT_SETTINGS,
  key: { tonic: parseNote(tonic), mode: 'major' },
  degrees,
});

describe('withMode', () => {
  it('keeps the tonic pitch class in every key, spelled as the new mode spells it', () => {
    for (const t of MAJOR_KEY_TONICS) {
      const minor = withMode({ ...DEFAULT_SETTINGS, key: { tonic: t, mode: 'major' } }, 'minor');
      expect(pc(minor.key.tonic), format(t)).toBe(pc(t));
      expect(MINOR_KEY_TONICS).toContain(minor.key.tonic);
      expect(withMode(minor, 'major').key.tonic, format(t)).toBe(t);
    }
    expect(format(withMode(major('Db'), 'minor').key.tonic)).toBe('C♯');
    expect(format(withMode(major('Gb'), 'minor').key.tonic)).toBe('F♯');
  });

  it('turns a preset into the same preset in the new mode', () => {
    expect(withMode(major('A'), 'minor').degrees).toEqual(['1', 'b3', '5']);
    expect(withMode(major('A', presetDegrees('scale', 'major')!), 'minor').degrees).toEqual(
      presetDegrees('scale', 'minor'),
    );
    expect(withMode(major('A', presetDegrees('chromatic', 'major')!), 'minor').degrees).toEqual(
      presetDegrees('chromatic', 'minor'),
    );
    expect(withMode(major('A', presetDegrees('blues', 'major')!), 'minor').degrees).toEqual(
      presetDegrees('blues', 'minor'),
    );
    // The pentatonics swap.
    expect(
      withMode(major('A', presetDegrees('majorPentatonic', 'major')!), 'minor').degrees,
    ).toEqual(presetDegrees('minorPentatonic', 'minor'));
  });

  it('keeps hand-picked degrees, and does nothing for the same mode', () => {
    expect(withMode(major('C', ['1', 'b3', '3']), 'minor').degrees).toEqual(['1', 'b3', '3']);
    const s = major('C');
    expect(withMode(s, 'major')).toBe(s);
  });
});

describe('presetOf', () => {
  it('finds the preset whatever the order or the label', () => {
    expect(presetOf('major', ['5', '3', '1'])).toBe('triad');
    expect(presetOf('minor', ['1', 'b3', '4', 'b5', '5', 'b7'])).toBe('blues');
    expect(presetOf('major', ['1', '2'])).toBeNull();
  });
});

describe('before each question', () => {
  it('maps the four choices to the cadence policy and form, and back', () => {
    for (const b of BEFORE) expect(beforeOf(withBefore(DEFAULT_SETTINGS, b))).toBe(b);
    expect(withBefore(DEFAULT_SETTINGS, 'short')).toMatchObject({
      context: 'everyQuestion',
      cadenceForm: 'short',
    });
    expect(withBefore(DEFAULT_SETTINGS, 'droneOnly')).toMatchObject({ context: 'droneOnly' });
    expect(beforeOf(DEFAULT_SETTINGS)).toBe('full');
  });
});

describe('lowEFret', () => {
  it('is where the tonic sits on the low E string', () => {
    expect(['E', 'F', 'G', 'A', 'B', 'C', 'D', 'Eb'].map((n) => lowEFret(parseNote(n)))).toEqual([
      0, 1, 3, 5, 7, 8, 10, 11,
    ]);
  });
});
