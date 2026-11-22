import { useEffect, useMemo, useState } from 'react';
import { midiAt } from '../../core/fretboard';
import { format } from '../../core/music';
import { fill } from '../../i18n';
import { naturalAt } from '../../lessons/fretboard';
import type { Drill, DrillQuestion } from '../../sessions/drills';
import type { RevealCopy } from '../../sessions/types';
import { useTheory } from '../context';
import { Button } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { useNeckGeometry } from '../geometry';
import { posKey } from '../keys';
import { ChordCard } from './ChordCards';
import { playSound } from './playSound';
import { useSessionStrumSpeed } from './sessionSettingsContext';
import { STRUM_SPREADS } from './strumSpeed';

export function Reveal({ drill, copy }: { drill: Drill; copy: RevealCopy }) {
  const { player, ui } = useTheory();
  const speed = useSessionStrumSpeed();
  const g = useNeckGeometry(12, { fretWidth: 52 });

  const [question, setQuestion] = useState<DrillQuestion | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    return () => {
      player.cancel();
    };
  }, [player]);

  const spread = STRUM_SPREADS[speed];

  const start = () => {
    const q = drill.next(Math.random);
    setQuestion(q);
    setRevealed(false);
    playSound(player, q.sound, { leadInSec: 0.5, strumSpreadSec: spread });
  };

  const next = () => {
    const nextQ = drill.next(Math.random, question ?? undefined);
    setQuestion(nextQ);
    setRevealed(false);
    playSound(player, nextQ.sound, { leadInSec: 0.4, strumSpreadSec: spread });
  };

  const posDots = useMemo((): FretDot[] => {
    const target = question?.pos;
    if (!target) return [];
    return Array.from({ length: 13 }, (_, fret): FretDot => {
      const pos = { string: target.string, fret };
      const natural = naturalAt(pos);
      const isTarget = fret === target.fret;
      return {
        key: posKey(pos),
        string: target.string,
        fret,
        midi: midiAt(pos),
        label: revealed && natural ? format(natural) : undefined,
        tone: revealed && isTarget ? 'home' : 'plain',
        faint: !revealed,
      };
    });
  }, [question?.pos, revealed]);

  if (!question) {
    return (
      <div className="board">
        <div className="quiz">
          <Button onClick={start}>{ui.session.start}</Button>
        </div>
      </div>
    );
  }

  const answerText = fill(copy.answer, { answer: question.answer, detail: question.detail ?? '' });

  return (
    <div className="board">
      <div className="quiz">
        <span className="question">{copy.ask}</span>
        <Button
          onClick={() =>
            playSound(player, question.sound, { leadInSec: 0.15, strumSpreadSec: spread })
          }
        >
          {ui.session.playAgain}
        </Button>
        {!revealed ? (
          <Button onClick={() => setRevealed(true)}>{ui.session.showAnswer}</Button>
        ) : (
          <Button onClick={next} ghost>
            {ui.session.next}
          </Button>
        )}
      </div>
      {question.pos && (
        <Fretboard
          geometry={g}
          dots={posDots}
          label={revealed ? answerText : copy.ask}
          active={revealed ? [posKey(question.pos)] : []}
        />
      )}
      {revealed && (
        <>
          <p className="caption good" aria-live="polite">
            {answerText}
          </p>
          {question.chord && <ChordCard chord={question.chord} />}
        </>
      )}
    </div>
  );
}
