/** "Practise this in the trainer": opens the practice app on a key and progression, or shows nothing. */
import type { Chord } from '../core/music';
import { useTheory } from './context';
import { trainerLink, type TrainerKey } from './trainerLink';

export function TrainerLink({ trainerKey, chords }: { trainerKey: TrainerKey; chords: readonly Chord[] }) {
  const { ui } = useTheory();
  const href = trainerLink(trainerKey, chords);
  // A different app: a plain link that loads it, not client-side navigation.
  return href ? (
    <a className="trainer" href={href}>
      {ui.trainerLink}
    </a>
  ) : null;
}
