import { useEffect, useState } from 'react';
import { fill } from '../../i18n';
import type { Drill, DrillQuestion } from '../../sessions/drills';
import type { ListenCopy } from '../../sessions/types';
import { useTheory } from '../context';
import { Button } from '../controls';
import { playSound } from './playSound';

const ROUND = 8;

export function ListenDrill({ drill, copy }: { drill: Drill; copy: ListenCopy }) {
  const { player, ui } = useTheory();

  const [question, setQuestion] = useState<DrillQuestion | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [rightCount, setRightCount] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isDone, setIsDone] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    return () => {
      player.cancel();
    };
  }, [player]);

  const startRound = () => {
    const firstQ = drill.next(Math.random);
    setQuestion(firstQ);
    setQuestionNumber(1);
    setRightCount(0);
    setPicked(null);
    setIsDone(false);
    setFeedback('');
    playSound(player, firstQ.sound);
  };

  const handleAnswer = (id: string) => {
    if (picked !== null || !question) return;

    setPicked(id);
    const answerLabel = copy.answers[question.answer] ?? question.answer;
    const detail = question.detail ?? '';

    if (id === question.answer) {
      setRightCount((c) => c + 1);
      setFeedback(fill(copy.right, { answer: answerLabel, detail }));
    } else {
      if (question.compare) {
        playSound(player, question.compare);
      }
      setFeedback(fill(copy.wrong, { answer: answerLabel, detail }));
    }
  };

  const advance = () => {
    if (questionNumber < ROUND) {
      const nextQ = drill.next(Math.random, question ?? undefined);
      setQuestion(nextQ);
      setQuestionNumber((n) => n + 1);
      setPicked(null);
      setFeedback('');
      playSound(player, nextQ.sound);
    } else {
      setIsDone(true);
      player.cancel();
    }
  };

  if (!question) {
    return (
      <div className="board">
        <div className="quiz">
          <Button onClick={startRound}>{ui.session.start}</Button>
        </div>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="board">
        <p className="caption good" aria-live="polite">
          {fill(ui.session.roundScore, { right: rightCount, total: ROUND })}
        </p>
        <div className="quiz">
          <Button onClick={startRound}>{ui.session.again}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="board">
      <div className="quiz">
        <span className="question">{copy.ask}</span>
        <Button onClick={() => playSound(player, question.sound)}>{ui.session.playAgain}</Button>
        {picked !== null && (
          <Button onClick={advance} ghost>
            {ui.session.next}
          </Button>
        )}
        <span className="muted small">{fill(ui.session.questionOf, { n: questionNumber, total: ROUND })}</span>
      </div>
      <div className="degrees answers" role="group" aria-label={copy.ask}>
        {drill.answers.map((id) => {
          const isPicked = picked === id;
          const isRight = id === question.answer;
          const className = isPicked ? (isRight ? 'tried right' : 'tried away') : undefined;
          return (
            <button
              key={id}
              type="button"
              className={className}
              aria-pressed={isPicked}
              disabled={picked !== null}
              onClick={() => handleAnswer(id)}
            >
              <span>{copy.answers[id] ?? id}</span>
            </button>
          );
        })}
      </div>
      <p className={picked ? (picked === question.answer ? 'caption good' : 'caption') : 'caption'} aria-live="polite">
        {feedback}
      </p>
    </div>
  );
}
