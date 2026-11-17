import { useEffect, useRef, useState } from 'react';
import { fill } from '../../i18n';
import { soundSeconds } from '../../sessions/sound';
import type { Drill, DrillQuestion } from '../../sessions/drills';
import type { ListenCopy } from '../../sessions/types';
import { useTheory } from '../context';
import { Button } from '../controls';
import { useReportPlaying } from '../playing';
import { playSound } from './playSound';
import { useSessionStrumSpeed } from './sessionSettingsContext';
import { STRUM_SPREADS } from './strumSpeed';

const ROUND = 8;

export function ListenDrill({ drill, copy }: { drill: Drill; copy: ListenCopy }) {
  const { player, ui } = useTheory();
  const strumSpeed = useSessionStrumSpeed();

  const [question, setQuestion] = useState<DrillQuestion | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [rightCount, setRightCount] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isDone, setIsDone] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [isPlaying, setIsPlaying] = useState(false);
  const playTimer = useRef<number | null>(null);
  const isInitialSpeed = useRef(true);

  useReportPlaying(isPlaying);

  const clearPlayTimer = () => {
    if (playTimer.current !== null) {
      window.clearTimeout(playTimer.current);
      playTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearPlayTimer();
      player.cancel();
    };
  }, [player]);

  const play = (sound: DrillQuestion['sound'], leadInSec = 0, speed = strumSpeed) => {
    clearPlayTimer();
    setIsPlaying(true);
    playSound(player, sound, {
      leadInSec,
      strumSpreadSec: STRUM_SPREADS[speed],
    });

    const durSec = leadInSec + soundSeconds(sound) + 0.3;
    playTimer.current = window.setTimeout(
      () => {
        setIsPlaying(false);
        playTimer.current = null;
      },
      Math.max(800, durSec * 1000),
    );
  };

  const stateRef = useRef({ question, picked, play });
  stateRef.current = { question, picked, play };

  useEffect(() => {
    if (isInitialSpeed.current) {
      isInitialSpeed.current = false;
      return;
    }
    const { question: q, picked: p, play: doPlay } = stateRef.current;
    if (q && p === null) {
      doPlay(q.sound, 0.2, strumSpeed);
    }
  }, [strumSpeed]);

  const startRound = () => {
    const firstQ = drill.next(Math.random);
    setQuestion(firstQ);
    setQuestionNumber(1);
    setRightCount(0);
    setPicked(null);
    setIsDone(false);
    setFeedback('');
    play(firstQ.sound, 0.6);
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
        play(question.compare, 0.3);
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
      play(nextQ.sound, 0.45);
    } else {
      clearPlayTimer();
      setIsPlaying(false);
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
        <Button onClick={() => play(question.sound, 0.15)}>{ui.session.playAgain}</Button>
        {isPlaying && (
          <span className="caption good" aria-live="polite">
            {ui.session.listening}
          </span>
        )}
        {picked !== null && (
          <Button onClick={advance} ghost>
            {ui.session.next}
          </Button>
        )}
        <span className="muted small">
          {fill(ui.session.questionOf, { n: questionNumber, total: ROUND })}
        </span>
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
      <p
        className={picked ? (picked === question.answer ? 'caption good' : 'caption') : 'caption'}
        aria-live="polite"
      >
        {feedback}
      </p>
    </div>
  );
}
