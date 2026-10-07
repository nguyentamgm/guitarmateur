import { DRILLS, PLAYERS, TEMPO_STORAGE_KEY, finishRound, isRoundEnd, loadTempo, saveTempo } from './tempos';

function memory(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return { data, getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v) };
}

describe('drill tempos', () => {
  it('starts from the fallback with no best', () => {
    expect(loadTempo('rhythm-fingers', 70, memory())).toEqual({ last: 70, best: 0 });
  });

  it('remembers the last tempo and keeps other drills and unknown entries', () => {
    const store = memory({ [TEMPO_STORAGE_KEY]: JSON.stringify({ 'future-drill': { last: 99, best: 99 } }) });
    saveTempo('pentatonic-sequences', (t) => ({ ...t, last: 84 }), 60, store);
    saveTempo('three-per-string-triplets', (t) => ({ ...t, last: 72 }), 60, store);
    expect(loadTempo('pentatonic-sequences', 60, store)).toEqual({ last: 84, best: 0 });
    expect(JSON.parse(store.data[TEMPO_STORAGE_KEY]!)['future-drill']).toEqual({ last: 99, best: 99 });
  });

  it('remembers a scene tempo beside the drills, under ids that never clash', () => {
    const store = memory();
    saveTempo('solo-jazz', (t) => ({ ...t, last: 120 }), 104, store);
    saveTempo('rhythm-fingers', (t) => ({ ...t, last: 66 }), 60, store);
    expect(loadTempo('solo-jazz', 104, store)).toEqual({ last: 120, best: 0 });
    expect(loadTempo('solo-pop', 92, store)).toEqual({ last: 92, best: 0 });
    expect(new Set([...DRILLS, ...PLAYERS]).size).toBe(DRILLS.length + PLAYERS.length);
  });

  it('raises the best on a finished round, never lowers it', () => {
    expect(finishRound({ last: 60, best: 80 }, 72)).toEqual({ last: 60, best: 80 });
    expect(finishRound({ last: 90, best: 80 }, 90)).toEqual({ last: 90, best: 90 });
  });

  it('counts a round only when step 0 follows the last step', () => {
    expect(isRoundEnd(15, 0, 16)).toBe(true);
    expect(isRoundEnd(null, 0, 16)).toBe(false); // the first step of a fresh start
    expect(isRoundEnd(7, 0, 16)).toBe(false); // stopped mid-round, started again
    expect(isRoundEnd(15, 1, 16)).toBe(false);
  });

  it('ignores impossible tempos and garbage, and never throws', () => {
    const store = memory({ [TEMPO_STORAGE_KEY]: JSON.stringify({ 'rhythm-fingers': { last: 9999, best: 'fast' } }) });
    expect(loadTempo('rhythm-fingers', 70, store)).toEqual({ last: 70, best: 0 });
    expect(loadTempo('rhythm-fingers', 70, memory({ [TEMPO_STORAGE_KEY]: '{' }))).toEqual({ last: 70, best: 0 });
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('full');
      },
    };
    expect(saveTempo('rhythm-fingers', (t) => ({ ...t, last: 80 }), 70, broken)).toEqual({ last: 80, best: 0 });
  });
});
