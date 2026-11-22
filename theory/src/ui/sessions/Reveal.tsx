import { useEffect, useMemo, useState } from 'react';
import { stopCurrentClock } from '@shared/ui/useClock';
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

  const vars = { ...question.vars, answer: question.answer, detail: question.detail ?? '' };
  const answerText = fill(copy.answer, vars);
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
