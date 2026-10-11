import { describe, expect, it, vi, beforeEach } from 'vitest';

const plucks: number[] = [];
const levels: object[] = [];
vi.mock('@shared/core/audio', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@shared/core/audio')>()),
  isAudioSupported: () => true,
}));
vi.mock('./audioPlayer', () => ({
  getPlayer: () => ({
    setLevels: (l: object) => levels.push(l),
    pluck: (midi: number) => plucks.push(midi),
  }),
}));

const { notePlayer } = await import('./notePlayer');

describe('notePlayer (notes clicked on a neck)', () => {
  beforeEach(() => {
    plucks.length = 0;
    levels.length = 0;
  });

  it('is silent while the sound toggle is off', () => {
    expect(notePlayer(false, 0.9)).toBeUndefined();
  });

  it("plays through the page's one player at the Notes slider's level", () => {
    notePlayer(true, 0.4)!(57);
    expect(plucks).toEqual([57]);
    expect(levels).toEqual([{ note: 0.4 }]);
  });
});
