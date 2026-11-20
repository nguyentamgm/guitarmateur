import { useEffect, useMemo, useState } from 'react';
import { parseNote } from '../../core/music';
import { soloWindow, type SoloNote } from '../../lessons/solo';
import { boxEchoQuestion, boxEchoSound, judgeBoxTap } from '../../sessions/boxEcho';
import type { Block, MelodyEchoCopy } from '../../sessions/types';
import { useTheory } from '../context';
import { Button } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { useNeckGeometry } from '../geometry';
import { degreeText, posKey } from '../keys';
import { playSound } from './playSound';

export function BoxEcho({
  block,
  copy,
}: {
  block: Extract<Block, { kind: 'boxEcho' }>;
  copy: MelodyEchoCopy;
}) {
  const { player, ui } = useTheory();
  const box = useMemo(
    () => soloWindow(parseNote(block.tonic), block.scale ?? 'minorPentatonic'),
    [block],
  );
  const geometry = useNeckGeometry(box.maxFret + 1, { from: Math.max(0, box.minFret - 1) });
  const [phrase, setPhrase] = useState<SoloNote[]>([]);
  const [found, setFound] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [feedback, setFeedback] = useState<'higher' | 'lower' | 'right' | null>(null);
  useEffect(() => () => player.cancel(), [player]);

  function next() {
    const notes = boxEchoQuestion(box, block.notes, Math.random, phrase);
    setPhrase(notes);
    setFound(block.giveFirst === false ? 0 : 1);
    setFeedback(null);
    playSound(player, boxEchoSound(notes));
  }
  function tap(dot: FretDot) {
    if (found >= phrase.length) return;
    const result = judgeBoxTap(phrase, found, dot.midi);
    setFeedback(result);
    if (result === 'right') {
      setFound(found + 1);
      if (found + 1 === phrase.length) setCompleted(completed + 1);
    }
  }

  const solved = phrase.length > 0 && found === phrase.length;
  const shown = phrase.slice(0, found);
  const dots = box.notes.map((n): FretDot => ({
    ...n,
    key: posKey(n),
    label: degreeText(n.degree),
    tone: shown.includes(n) ? 'home' : 'plain',
  }));

  return (
    <div className="board">
      <div className="quiz">
        <span className="question">{copy.ask}</span>
        {phrase.length === 0 ? (
          <Button onClick={next}>{ui.session.start}</Button>
        ) : (
          <Button onClick={() => playSound(player, boxEchoSound(phrase))}>
            {ui.session.playAgain}
          </Button>
        )}
        {solved && (
          <Button onClick={next} ghost>
            {ui.session.next}
          </Button>
        )}
      </div>
      <Fretboard geometry={geometry} box={box} label={copy.ask} dots={dots} onDot={tap} />
      <p className="caption" aria-live="polite">
        {solved && completed >= 4 ? copy.done : feedback && copy[feedback]}
      </p>
    </div>
  );
}
