/**
 * The backing player is shared with the practice app (shared/ui/useBacking.ts); Theory's hooks play
 * it on Theory's player, with the signatures the scenes use.
 */
import type { BackingStyle } from '../core/audio';
import type { Chord } from '../core/music';
import {
  STRUM_LOOP_BPM,
  useBacking as useSharedBacking,
  useStrumLoop as useSharedStrumLoop,
  type Backing,
  type BackingStep,
} from '@shared/ui/useBacking';
import { useTheory } from './context';

export { STRUM_LOOP_BPM, type Backing, type BackingStep };

export function useBacking(
  bars: readonly { readonly chord: Chord; readonly midis?: readonly number[] }[],
  style: BackingStyle,
  bpm: number,
  onEighth?: (step: BackingStep) => void,
  loop = true,
): Backing {
  const { player } = useTheory();
  return useSharedBacking(player, bars, style, bpm, onEighth, loop);
}

export function useStrumLoop(views: readonly { readonly chord: Chord; readonly notes: readonly { readonly midi: number }[] }[], bpm: number): Backing {
  const { player } = useTheory();
  return useSharedStrumLoop(player, views, bpm);
}
