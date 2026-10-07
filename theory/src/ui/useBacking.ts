import { useMemo } from 'react';
import { EIGHTHS_PER_BAR, STYLE_SWINGS, backingAt, type BackingStyle } from '../core/audio';
import type { Chord } from '../core/music';
import { beatSeconds, strumDelays, swingDelay, swingOnset } from '../core/rhythm';
import { useTheory } from './context';
import { useClock, type Clock } from './useClock';

export interface Backing extends Clock {
  /** Bar being heard, or null when stopped. */
  readonly bar: number | null;
}

/** One eighth of a backing, as handed to `onEighth`. */
export interface BackingStep {
  /** Index over the whole form: bar × 8 + eighth. */
  readonly step: number;
  readonly bar: number;
  readonly eighth: number;
  /** Seconds from now to the eighth's straight place: what `useClock` gives. */
  readonly delay: number;
  /** Seconds from now to where the eighth sounds, swung when the style swings. */
  readonly at: number;
  /** How long `eighths` eighths last from this one, in seconds, swung when the style swings. */
  seconds(eighths: number): number;
}

/** Sounding part of a note's length: a little short, so repeated notes do not run together. */
const RING = 0.85;

/**
 * A backing track over one chord per bar, in a style from core/audio, swung when the style swings
 * (K1.5). `onEighth` runs on every eighth with the same timing, so a melody over the backing stays
 * in time with it and swings with it. With `loop` false it plays the form once and stops. A bar's
 * `midis` (low to high) is the voicing a strum or comp plays, so the sound matches a shape on the neck.
 */
export function useBacking(
  bars: readonly { readonly chord: Chord; readonly midis?: readonly number[] }[],
  style: BackingStyle,
  bpm: number,
  onEighth?: (step: BackingStep) => void,
  loop = true,
): Backing {
  const { player } = useTheory();
  const swing = STYLE_SWINGS[style] ? 1 : 0;
  const clock = useClock(bars.length * EIGHTHS_PER_BAR, beatSeconds(bpm) / 2, (step, delay) => {
    const bar = Math.floor(step / EIGHTHS_PER_BAR);
    const eighth = step % EIGHTHS_PER_BAR;
    const at = delay + swingDelay(eighth, swing, bpm);
    const seconds = (n: number) => (swingOnset(eighth + n, swing) - swingOnset(eighth, swing)) * beatSeconds(bpm);
    const { chord, midis } = bars[bar]!;
    for (const hit of backingAt(chord, style, eighth, midis)) {
      const length = seconds(hit.eighths) * RING;
      if (hit.muted) for (const m of hit.midis) player.mute(m, at);
      else if (hit.stroke) for (const s of strumDelays(hit.midis, hit.stroke)) player.pluck(s.item, at + s.delay, length);
      else for (const m of hit.midis) player.pluck(m, at, length);
    }
    onEighth?.({ step, bar, eighth, delay, at, seconds });
  }, loop);
  const bar = clock.current === null ? null : Math.floor(clock.current / EIGHTHS_PER_BAR);
  return { ...clock, bar };
}

/** Tempo a chord loop starts at: a relaxed pop strum. */
export const STRUM_LOOP_BPM = 92;

/** A loop of chord shapes, one bar each, strummed D . D U . U D U as drawn on the neck. `bar` is the chord heard. */
export function useStrumLoop(views: readonly { readonly chord: Chord; readonly notes: readonly { readonly midi: number }[] }[], bpm: number): Backing {
  const bars = useMemo(() => views.map((v) => ({ chord: v.chord, midis: v.notes.map((n) => n.midi) })), [views]);
  return useBacking(bars, 'strum', bpm);
}
