import { strumDelays } from '../core/rhythm';
import { useTheory } from './context';

/** A downstroke across a barre-chord voicing (low string first), `delay` seconds from now. */
export function useStrum() {
  const { player } = useTheory();
  return (view: { readonly notes: readonly { readonly midi: number }[] }, delay = 0) => {
    for (const s of strumDelays(view.notes, 'down', 0.018)) player.pluck(s.item.midi, delay + s.delay, 1.5);
  };
}
