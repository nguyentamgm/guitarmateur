import { useEffect, useState } from 'react';
import { fill } from '../../i18n';
import type { Drill, DrillQuestion } from '../../sessions/drills';
import type { RevealCopy } from '../../sessions/types';
import { useTheory } from '../context';
import { Button } from '../controls';
import { ChordCard } from './ChordCards';
import { playSound } from './playSound';

export function Reveal({ drill, copy }: { drill: Drill; copy: RevealCopy }) {
  const { player, ui } = useTheory();

  const [question, setQuestion] = useState<DrillQuestion | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    return () => {
      player.cancel();
    };
  }, [player]);

  const start = () => {
    const q = drill.next(Math.random);
    setQuestion(q);
    setRevealed(false);
    playSound(player, q.sound);
  };

  const next = () => {
    const nextQ = drill.next(Math.random, question ?? undefined);
    setQuestion(nextQ);
    setRevealed(false);
    playSound(player, nextQ.sound);
  };

  if (!question) {
    return (
      <div className="board">
        <div className="quiz">
          <Button onClick={start}>{ui.session.start}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="board">
      <div className="quiz">
        <span className="question">{copy.ask}</span>
        <Button onClick={() => playSound(player, question.sound)}>{ui.session.playAgain}</Button>
        {!revealed ? (
          <Button onClick={() => setRevealed(true)}>{ui.session.showAnswer}</Button>
        ) : (
          <Button onClick={next} ghost>
            {ui.session.next}
          </Button>
        )}
      </div>
      {revealed && (
        <>
          <p className="caption good" aria-live="polite">
            {fill(copy.answer, { answer: question.answer, detail: question.detail ?? '' })}
          </p>
          {question.chord && <ChordCard chord={question.chord} />}
        </>
      )}
    </div>
  );
}
