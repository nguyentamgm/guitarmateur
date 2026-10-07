import { useCallback, useRef, useState } from 'react';
import { finishRound, isRoundEnd, loadTempo, saveTempo, type DrillId, type DrillTempo } from './tempos';

export interface StoredTempo {
  readonly bpm: number;
  setBpm(bpm: number | ((b: number) => number)): void;
  /** Fastest tempo of a finished round, 0 before the first. */
  readonly best: number;
  /**
   * Call from the clock with each step and the loop length: step 0 right after the last step
   * means a whole round was played, at the tempo current then.
   */
  step(i: number, steps: number): void;
}

/** A drill's tempo, remembered under `theory.tempo`: the last one set and the best. */
export function useStoredTempo(id: DrillId, fallback: number): StoredTempo {
  const [tempo, setTempo] = useState<DrillTempo>(() => loadTempo(id, fallback));
  const live = useRef(tempo.last);
  live.current = tempo.last;
  const last = useRef<number | null>(null);

  const setBpm = useCallback(
    (bpm: number | ((b: number) => number)) => {
      const value = typeof bpm === 'function' ? bpm(live.current) : bpm;
      live.current = value;
      setTempo(saveTempo(id, (t) => ({ ...t, last: value }), fallback));
    },
    [id, fallback],
  );
  const step = useCallback(
    (i: number, steps: number) => {
      if (isRoundEnd(last.current, i, steps)) setTempo(saveTempo(id, (t) => finishRound(t, live.current), fallback));
      last.current = i;
    },
    [id, fallback],
  );
  return { bpm: tempo.last, setBpm, best: tempo.best, step };
}
