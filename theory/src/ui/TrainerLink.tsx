/** "Practise this in the trainer": opens the practice app on a key and progression, or shows nothing. */
import { useMemo } from 'react';
import { chordSymbol, type Chord } from '../core/music';
import { fill } from '../i18n';
import { useTheory } from './context';
import { readPracticeState, trainerLink, vamp, type TrainerKey } from './trainerLink';

/** `progressionKey` names the progression (key, id…), so the link is built once per progression. */
export function TrainerLink({
  trainerKey,
  chords,
  tempoBpm,
  boxes,
  swing,
  progressionKey,
  label,
}: {
  trainerKey: TrainerKey;
  chords: readonly Chord[];
  tempoBpm?: number;
  /** Boxes to open on, numbered as the lessons do (1–5). */
  boxes?: readonly number[];
  swing?: boolean;
  progressionKey: string;
  /** The link's text; "practise licks over this" by default. */
  label?: string;
}) {
  const { ui, lang } = useTheory();
  const boxKey = boxes?.join(' ');
  const href = useMemo(
    () => trainerLink(trainerKey, chords, { saved: readPracticeState(), tempoBpm, boxes, swing, lang }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rebuilt when the progression, tempo, boxes, swing or language change
    [progressionKey, tempoBpm, boxKey, swing, lang],
  );
  // A different app: a plain link that loads it, not client-side navigation.
  return href ? (
    <a className="trainer" href={href}>
      {label ?? ui.trainerLink}
    </a>
  ) : null;
}

/** For a lesson with no progression of its own: practise the key's scale, in its box, over a short vamp. */
export function VampLink({ trainerKey, boxes }: { trainerKey: TrainerKey; boxes?: readonly number[] }) {
  const { ui } = useTheory();
  const chords = vamp(trainerKey);
  // "Am7–Dm7": the vamp's two chords, each held for two bars.
  const names = [chords[0]!, chords[2]!].map(chordSymbol).join('–');
  return (
    <TrainerLink
      trainerKey={trainerKey}
      chords={chords}
      boxes={boxes}
      progressionKey={`${names} ${trainerKey.scale}`}
      label={fill(ui.trainerVamp, { chords: names })}
    />
  );
}
