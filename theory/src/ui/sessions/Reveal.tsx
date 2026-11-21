import { useEffect, useState } from 'react';
import { stopCurrentClock } from '@shared/ui/useClock';
import { fill } from '../../i18n';
import type { Drill, DrillQuestion } from '../../sessions/drills';
import type { RevealCopy } from '../../sessions/types';
import { useTheory } from '../context';
import { Button } from '../controls';
import { ChordCard } from './ChordCards';
import { playSound } from './playSound';
import { useSessionStrumSpeed } from './sessionSettingsContext';
import { STRUM_SPREADS } from './strumSpeed';

export function Reveal({ drill, copy }: { drill: Drill; copy: RevealCopy }) {
  const { player, ui } = useTheory();
  const speed = useSessionStrumSpeed();

  const [question, setQuestion] = useState<DrillQuestion | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    return () => {
      player.cancel();
    };
  }, [player]);

  const spread = STRUM_SPREADS[speed];
  const play = (sound: DrillQuestion['sound'], leadInSec = 0) => {
    stopCurrentClock();
    playSound(player, sound, { leadInSec, strumSpreadSec: spread });
  };

  const start = () => {
    const q = drill.next(Math.random);
    setQuestion(q);
    setRevealed(false);
    play(q.sound, 0.5);
  };

  const next = () => {
    const nextQ = drill.next(Math.random, question ?? undefined);
    setQuestion(nextQ);
    setRevealed(false);
    play(nextQ.sound, 0.4);
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

  const vars = { ...question.vars, answer: question.answer, detail: question.detail ?? '' };
  const answerSound = question.revealSound;
  const replay = revealed && answerSound && !copy.replayAnswer ? answerSound : question.sound;
  return (
    <div className="board">
      <div className="quiz">
        <span className="question">{fill(copy.ask, vars)}</span>
        <Button onClick={() => play(replay, 0.15)}>
          {ui.session.playAgain}
        </Button>
        {revealed && answerSound && copy.replayAnswer && (
          <Button onClick={() => play(answerSound)} ghost>
            {copy.replayAnswer}
          </Button>
        )}
        {!revealed ? (
          <Button
            onClick={() => {
              setRevealed(true);
              if (answerSound) play(answerSound);
            }}
          >
            {ui.session.showAnswer}
          </Button>
        ) : (
          <Button onClick={next} ghost>
            {ui.session.next}
          </Button>
        )}
      </div>
      {revealed && (
        <>
          <p className="caption good" aria-live="polite">
            {fill(copy.answer, vars)}
          </p>
          {question.chord && <ChordCard chord={question.chord} />}
        </>
      )}
    </div>
  );
}
