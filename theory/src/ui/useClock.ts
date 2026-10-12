// The step clock is shared with the practice app (shared/ui/useClock.ts); Theory's reports its play
// state to the page's status region (PlayStatus.tsx).
import { useClock as useSharedClock, type Clock } from '@shared/ui/useClock';
import { useReportPlaying } from './playing';

export type { Clock };

export function useClock(...args: Parameters<typeof useSharedClock>): Clock {
  const clock = useSharedClock(...args);
  useReportPlaying(clock.playing);
  return clock;
}
