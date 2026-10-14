import { describe, expect, it } from 'vitest';
import { format, parseNote } from '@shared/core/music';
import { presetDegrees } from '../core/degrees';
import { DEFAULT_SETTINGS } from '../store/settings';
import { settingsFromLink } from './deepLink';

const link = (search: string) => settingsFromLink(search, DEFAULT_SETTINGS);
const keyOf = (search: string) => {
  const s = link(search)!;
  return `${format(s.key.tonic)} ${s.key.mode}`;
};

describe('settingsFromLink: valid', () => {
  it("the issue's example: A minor, the minor blues scale", () => {
    expect(link('?key=A&mode=minor&notes=blues')).toEqual({
      ...DEFAULT_SETTINGS,
      key: { tonic: parseNote('A'), mode: 'minor' },
      degrees: presetDegrees('blues', 'minor'),
    });
  });

  it('notes as a preset name, kebab or camel case, or as a list of degrees', () => {
    expect(link('?notes=major-pentatonic')!.degrees).toEqual(['1', '2', '3', '5', '6']);
    expect(link('?notes=majorPentatonic')!.degrees).toEqual(['1', '2', '3', '5', '6']);
    expect(link('?notes=all')!.degrees).toHaveLength(12);
    expect(link('?mode=minor&notes=1,b3,4,5,b7')!.degrees).toEqual(['1', 'b3', '4', '5', 'b7']);
    // Any label of a degree, in any order, once each; ♭ and ♯ too.
    expect(link('?notes=5,b5,%231,♭3,b3')!.degrees).toEqual(['b2', 'b3', '#4', '5']);
  });

  it("the key in the mode's own spelling, by pitch", () => {
    expect(keyOf('?key=Bb')).toBe('B♭ major');
    expect(keyOf('?key=A%23')).toBe('B♭ major');
    expect(keyOf('?key=Gb&mode=minor')).toBe('F♯ minor');
    expect(keyOf('?key=e&mode=minor')).toBe('E minor');
    expect(keyOf('?key=B♭')).toBe('B♭ major');
  });

  it('every link Practice builds (src/ui/earLink.ts) opens its scale', () => {
    const cases: [string, string, readonly string[]][] = [
      [
        '?key=A&mode=minor&notes=minor-pentatonic&lang=en',
        'A minor',
        presetDegrees('minorPentatonic', 'minor')!,
      ],
      [
        '?key=A&mode=major&notes=major-pentatonic&lang=en',
        'A major',
        presetDegrees('majorPentatonic', 'major')!,
      ],
      ['?key=A&mode=minor&notes=blues&lang=en', 'A minor', presetDegrees('blues', 'minor')!],
      ['?key=A&mode=major&notes=scale&lang=en', 'A major', presetDegrees('scale', 'major')!],
      ['?key=A&mode=minor&notes=scale&lang=en', 'A minor', presetDegrees('scale', 'minor')!],
      [
        '?key=A&mode=minor&notes=1%2C2%2Cb3%2C4%2C5%2C6%2Cb7&lang=en',
        'A minor',
        ['1', '2', 'b3', '4', '5', '6', 'b7'],
      ],
      [
        '?key=A&mode=major&notes=1%2C2%2C3%2C4%2C5%2C6%2Cb7&lang=en',
        'A major',
        ['1', '2', '3', '4', '5', '6', 'b7'],
      ],
      [
        '?key=A&mode=major&notes=1%2C2%2Cb3%2C3%2C5%2C6&lang=en',
        'A major',
        ['1', '2', 'b3', '3', '5', '6'],
      ],
      ['?key=F%23&mode=minor&notes=blues&lang=vi', 'F♯ minor', presetDegrees('blues', 'minor')!],
    ];
    for (const [search, key, degrees] of cases) {
      expect(keyOf(search), search).toBe(key);
      expect(link(search)!.degrees, search).toEqual(degrees);
    }
  });
});

describe('settingsFromLink: partial', () => {
  it('a mode alone keeps the tonic and turns the preset over (root 3rd 5th → 1 ♭3 5)', () => {
    const s = link('?mode=minor')!;
    expect(format(s.key.tonic)).toBe('A');
    expect(s.degrees).toEqual(['1', 'b3', '5']);
  });

  it('a key alone keeps the mode and the notes', () => {
    const s = link('?key=D')!;
    expect(s.key).toEqual({ tonic: parseNote('D'), mode: 'major' });
    expect(s.degrees).toEqual(DEFAULT_SETTINGS.degrees);
  });

  it('nothing else changes', () => {
    const s = settingsFromLink('?key=E', { ...DEFAULT_SETTINGS, bpm: 120, drone: 'continuous' })!;
    expect(s).toMatchObject({ bpm: 120, drone: 'continuous' });
  });
});

describe('settingsFromLink: junk is ignored', () => {
  it('no link parameters: null (the stored settings stand)', () => {
    expect(link('')).toBeNull();
    expect(link('?lang=vi')).toBeNull();
    expect(link('?foo=bar')).toBeNull();
  });

  it('unknown values: each ignored on its own', () => {
    expect(link('?key=H&mode=dorian&notes=everything')).toBeNull();
    expect(link('?key=Cbbb')).toBeNull();
    expect(link('?notes=1')).toBeNull(); // one degree is not a quiz
    expect(link('?notes=1,x,9z')).toBeNull();
    expect(keyOf('?key=Q&mode=minor')).toBe('A minor');
    // A preset the mode does not offer: the notes stay.
    expect(link('?mode=minor&notes=major-pentatonic')!.degrees).toEqual(['1', 'b3', '5']);
  });
});
