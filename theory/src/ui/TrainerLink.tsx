/** "Practise this in the trainer": opens the practice app on a key and progression, or shows nothing. */
import { useMemo } from 'react';
import type { Chord } from '../core/music';
import { useTheory } from './context';
import { readPracticeState, trainerLink, type TrainerKey } from './trainerLink';

/** `progressionKey` names the progression (key, id…), so the link is built once per progression. */
export function TrainerLink({ trainerKey, chords, tempoBpm, progressionKey }: { trainerKey: TrainerKey; chords: readonly Chord[]; tempoBpm?: number; progressionKey: string }) {
  const { ui, lang } = useTheory();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- rebuilt when the progression, tempo or language change
  const href = useMemo(() => trainerLink(trainerKey, chords, { saved: readPracticeState(), tempoBpm, lang }), [progressionKey, tempoBpm, lang]);
  // A different app: a plain link that loads it, not client-side navigation.
  return href ? (
    <a className="trainer" href={href}>
      {ui.trainerLink}
    </a>
  ) : null;
}
