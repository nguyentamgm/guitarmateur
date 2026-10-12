/**
 * Whether anything on the page is playing, told to screen readers in one place: every Theory clock
 * and sequence reports here (useClock, useSequence, useBacking), the App draws `PlayStatus`.
 */
import { useEffect, useId, useSyncExternalStore } from 'react';

const playing = new Set<string>();
const listeners = new Set<() => void>();

function report(id: string, on: boolean) {
  const before = playing.size > 0;
  if (on) playing.add(id);
  else playing.delete(id);
  if (before !== playing.size > 0) for (const l of listeners) l();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Report a clock's play state; it stops counting when the component unmounts. */
export function useReportPlaying(on: boolean): void {
  const id = useId();
  useEffect(() => {
    report(id, on);
    return () => report(id, false);
  }, [id, on]);
}

/** True while any reported clock plays. */
export const useAnyPlaying = (): boolean => useSyncExternalStore(subscribe, () => playing.size > 0);
