import { describe, expect, it } from 'vitest';
import { minorPentatonicLink } from './practiceLink';

const decode = (href: string) => {
  const s = decodeURIComponent(new URL(href, 'https://x').searchParams.get('s')!);
  return JSON.parse(decodeURIComponent(atob(s.slice('v1:'.length)))) as Record<string, unknown>;
};

describe('level 12 → Practice', () => {
  it("opens A minor pentatonic, keeping Practice's own settings but not its box or language", () => {
    const saved = {
      tuningId: 'dropD',
      leftHanded: true,
      positions: [3],
      language: 'vi',
      key: { scaleId: 'major' },
    };
    const storage = { getItem: () => JSON.stringify(saved), setItem: () => {} };
    const href = minorPentatonicLink('en', storage);
    expect(href).toMatch(/^\/\?s=.+&lang=en$/);
    expect(decode(href)).toEqual({
      tuningId: 'dropD',
      leftHanded: true,
      key: { tonic: { letter: 'A', alter: 0 }, scaleId: 'minorPentatonic' },
    });
    expect(decode(minorPentatonicLink('vi', null)).key).toEqual({
      tonic: { letter: 'A', alter: 0 },
      scaleId: 'minorPentatonic',
    });
  });
});
