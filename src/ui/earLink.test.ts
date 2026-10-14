import { describe, expect, it } from 'vitest';
import { SCALE_IDS, TONICS, format, note } from '../music';
import { EAR_NOTES, earHref } from './earLink';

describe('earHref', () => {
  it.each([
    ['minorPentatonic', '/ear?key=A&mode=minor&notes=minor-pentatonic&lang=en'],
    ['majorPentatonic', '/ear?key=A&mode=major&notes=major-pentatonic&lang=en'],
    ['blues', '/ear?key=A&mode=minor&notes=blues&lang=en'],
    ['major', '/ear?key=A&mode=major&notes=scale&lang=en'],
    ['natural-minor', '/ear?key=A&mode=minor&notes=scale&lang=en'],
    ['dorian', '/ear?key=A&mode=minor&notes=1%2C2%2Cb3%2C4%2C5%2C6%2Cb7&lang=en'],
    ['mixolydian', '/ear?key=A&mode=major&notes=1%2C2%2C3%2C4%2C5%2C6%2Cb7&lang=en'],
    ['major-blues', '/ear?key=A&mode=major&notes=1%2C2%2Cb3%2C3%2C5%2C6&lang=en'],
  ] as const)('%s in A', (scaleId, href) => {
    expect(earHref({ tonic: note('A'), scaleId }, 'en')).toBe(href);
  });

  it('maps every scale Practice offers', () => {
    expect(Object.keys(EAR_NOTES).sort()).toEqual([...SCALE_IDS].sort());
  });

  it('writes sharps so the address keeps them, and carries the language', () => {
    expect(earHref({ tonic: note('F', 1), scaleId: 'blues' }, 'vi')).toBe('/ear?key=F%23&mode=minor&notes=blues&lang=vi');
    expect(earHref({ tonic: note('B', -1), scaleId: 'major' }, 'en')).toBe('/ear?key=Bb&mode=major&notes=scale&lang=en');
    for (const tonic of TONICS) {
      const url = new URL(earHref({ tonic, scaleId: 'minorPentatonic' }, 'en'), 'https://x');
      // The key survives the address: '#' is encoded, not taken for a fragment.
      expect(url.searchParams.get('key')!.replace('#', '♯').replace('b', '♭')).toBe(format(tonic));
    }
  });
});
