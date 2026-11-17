import { strumDelays } from '../core/rhythm';
import { useTheory } from './context';
import { useSessionStrumSpeed } from './sessions/sessionSettingsContext';
import { STRUM_SPREADS } from './sessions/strumSpeed';

/** A downstroke across a chord voicing (low string first), `delay` seconds from now. */
export function useStrum() {
  const { player } = useTheory();
  const speed = useSessionStrumSpeed();
  const spread = STRUM_SPREADS[speed];
  return (view: { readonly notes: readonly { readonly midi: number }[] }, delay = 0) => {
    for (const s of strumDelays(view.notes, 'down', spread))
      player.pluck(s.item.midi, delay + s.delay, 1.5);
  };
}
