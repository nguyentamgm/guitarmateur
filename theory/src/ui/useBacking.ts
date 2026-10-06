import { EIGHTHS_PER_BAR, STYLE_SWINGS, backingAt, type BackingStyle } from '../core/audio';
import type { Chord } from '../core/music';
import { beatSeconds, strumDelays, swingDelay } from '../core/rhythm';
import { useTheory } from './context';
import { useClock, type Clock } from './useClock';

export interface Backing extends Clock {
  /** Bar being heard, or null when stopped. */
  readonly bar: number | null;
}

/**
 * A backing track over one chord per bar, in a style from core/audio, swung when the style swings
 * (K1.5). `onEighth(bar, eighth, delaySec, eighthSec)` runs on every eighth with the same swung
 * delay, so a melody played over the backing stays in time with it.
 */
export function useBacking(
  bars: readonly { readonly chord: Chord }[],
  style: BackingStyle,
  bpm: number,
  onEighth?: (bar: number, eighth: number, delaySec: number, eighthSec: number) => void,
): Backing {
  const { player } = useTheory();
  const eighthSec = beatSeconds(bpm) / 2;
  const swing = STYLE_SWINGS[style] ? 1 : 0;
  const clock = useClock(bars.length * EIGHTHS_PER_BAR, eighthSec, (i, delay) => {
    const bar = Math.floor(i / EIGHTHS_PER_BAR);
    const eighth = i % EIGHTHS_PER_BAR;
    const at = delay + swingDelay(eighth, swing, bpm);
    for (const hit of backingAt(bars[bar]!.chord, style, eighth)) {
      const length = hit.eighths * eighthSec * 0.9;
      if (hit.muted) for (const m of hit.midis) player.mute(m, at);
      else if (hit.stroke) for (const s of strumDelays(hit.midis, hit.stroke)) player.pluck(s.item, at + s.delay, length);
      else for (const m of hit.midis) player.pluck(m, at, length);
    }
    onEighth?.(bar, eighth, at, eighthSec);
  });
  const bar = clock.current === null ? null : Math.floor(clock.current / EIGHTHS_PER_BAR);
  return { ...clock, bar };
}
