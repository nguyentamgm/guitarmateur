import { useCallback, useRef, useState } from 'react';
import { finishRound, isRoundEnd, loadTempo, saveTempo, type DrillId, type DrillTempo, type PlayerId } from './tempos';

export interface StoredTempo {
  readonly bpm: number;
  /** The learner's choice: shown and remembered. */
  setBpm(bpm: number): void;
  /** An automatic change (speed-up): shown, not remembered as the learner's tempo. */
  nudge(change: (bpm: number) => number): void;
  /** Fastest tempo of a finished round, 0 before the first. */
  readonly best: number;
  /** Call from the clock with each step, the loop length and the step length in seconds. */
  step(i: number, steps: number, stepSec: number): void;
}

/**
 * A drill's tempo, remembered under `theory.tempo`: the last one the learner set, and the best.
 * The id and fallback are read once; each drill scene passes constants.
 */
export function useStoredTempo(id: DrillId, fallback: number): StoredTempo {
  const [tempo, setTempo] = useState<DrillTempo>(() => loadTempo(id, fallback));
  const live = useRef(tempo.last);
  live.current = tempo.last;
  /** The previous step: its index, the loop length and when it came. */
  const prev = useRef<{ i: number; steps: number; at: number } | null>(null);
  /** Slowest tempo heard in the round so far: a late jump of the slider is not a faster round. */
  const roundMin = useRef(Infinity);

  const setBpm = useCallback(
    (bpm: number) => {
      live.current = bpm;
      const last = saveTempo(id, (s) => ({ ...s, last: bpm }), fallback).last;
      setTempo((t) => ({ ...t, last }));
    },
    [id, fallback],
  );
  const nudge = useCallback((change: (bpm: number) => number) => {
    live.current = change(live.current);
    const bpm = live.current;
    setTempo((t) => ({ ...t, last: bpm }));
  }, []);
  const step = useCallback(
    (i: number, steps: number, stepSec: number) => {
      const now = performance.now();
      const p = prev.current;
      // A real wrap comes one step after the last one, in the same loop; a restart does not.
      const wrapped = p !== null && p.steps === steps && isRoundEnd(p.i, i, steps) && now - p.at < stepSec * 2000 + 250;
      if (wrapped) {
        const best = saveTempo(id, (t) => finishRound(t, roundMin.current), fallback).best;
        setTempo((t) => ({ ...t, best }));
      }
      if (i === 0) roundMin.current = Infinity;
      roundMin.current = Math.min(roundMin.current, live.current);
      prev.current = { i, steps, at: now };
    },
    [id, fallback],
  );
  return { bpm: tempo.last, setBpm, nudge, best: tempo.best, step };
}

/**
 * The tempo of a scene that plays in time, remembered under `theory.tempo` when the learner sets it.
 * Like `useState`, but the id and fallback are read once.
 */
export function useLastTempo(id: PlayerId, fallback: number): [number, (bpm: number) => void] {
  const [bpm, setLocal] = useState(() => loadTempo(id, fallback).last);
  const set = useCallback(
    (next: number) => {
      setLocal(saveTempo(id, (t) => ({ ...t, last: next }), fallback).last);
    },
    [id, fallback],
  );
  return [bpm, set];
}
