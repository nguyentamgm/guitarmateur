import { describe, expect, it, vi, beforeEach } from 'vitest';

const plucks: number[] = [];
const noteOut = { gain: { value: 1 } };
vi.mock('../audio', () => ({
  isAudioSupported: () => true,
  createEngine: () => ({ ctx: { state: 'running', currentTime: 0 }, noteBus: {}, noteOut }),
  pluck: (_ctx: unknown, _dest: unknown, _when: number, midi: number) => plucks.push(midi),
}));

const { notePlayer } = await import('./notePlayer');
const { peekEngine, resetEngineForTests } = await import('./audioEngine');

describe('notePlayer (notes clicked on a neck)', () => {
  beforeEach(() => {
    plucks.length = 0;
    resetEngineForTests();
  });

  it('is silent while the sound toggle is off', () => {
    expect(notePlayer(false, 0.9)).toBeUndefined();
  });

  it("plays through the page's one engine at the Notes slider's level", () => {
    expect(peekEngine()).toBeNull();
    notePlayer(true, 0.4)!(57);
    expect(plucks).toEqual([57]);
    expect(peekEngine()).not.toBeNull();
    expect(noteOut.gain.value).toBe(0.4);
  });
});
