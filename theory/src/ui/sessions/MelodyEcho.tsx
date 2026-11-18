import { useCallback, useEffect, useMemo, useState } from 'react';
import { midiAt } from '../../core/fretboard';
import { ECHO_BPM, echoFrets, judgeTap, phraseSound, randomPhrase } from '../../sessions/echo';
import type { SoundEvent } from '../../sessions/sound';
import type { Block, MelodyEchoCopy } from '../../sessions/types';
import { useTheory } from '../context';
import { Button } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { useNeckGeometry } from '../geometry';
import { posKey } from '../keys';
import { playSound } from './playSound';

export type MelodyEchoBlock = Extract<Block, { kind: 'melodyEcho' }>;

export function MelodyEcho({ block, copy }: { block: MelodyEchoBlock; copy: MelodyEchoCopy }) {
  const { player, ui } = useTheory();
  const g = useNeckGeometry(12, { fretWidth: 52 });

  const frets = useMemo(() => echoFrets(block.tonic, block.string), [block.tonic, block.string]);

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phrase, setPhrase] = useState<readonly number[]>(() =>
    block.phrases ? block.phrases[0]! : randomPhrase(Math.random, block.notes ?? 3),
  );
  const [found, setFound] = useState(1);
  const [started, setStarted] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [caption, setCaption] = useState('');

  useEffect(() => {
    return () => {
      player.cancel();
    };
  }, [player]);

  useEffect(() => {
    setPhraseIndex(0);
    setPhrase(block.phrases ? block.phrases[0]! : randomPhrase(Math.random, block.notes ?? 3));
    setFound(1);
    setStarted(false);
    setIsDone(false);
    setCaption('');
  }, [block]);

  const isPhraseComplete = found >= phrase.length;

  const playCurrent = useCallback(() => {
    if (isDone && block.phrases) {
      let at = 0;
      const events: SoundEvent[] = [];
      for (const ph of block.phrases) {
        for (const deg of ph) {
          events.push({
            at,
            midis: [midiAt({ string: block.string, fret: frets[deg - 1]! })],
            length: 1,
          });
          at += 1;
        }
        at += 1;
      }
      playSound(player, { bpm: ECHO_BPM, events });
    } else {
      playSound(player, phraseSound(block.tonic, block.string, phrase, ECHO_BPM));
    }
  }, [block.phrases, block.string, block.tonic, frets, isDone, phrase, player]);

  const start = useCallback(() => {
    setStarted(true);
    playSound(player, phraseSound(block.tonic, block.string, phrase, ECHO_BPM));
  }, [block.string, block.tonic, phrase, player]);

  const next = useCallback(() => {
    if (block.phrases !== null) {
      const nextIdx = phraseIndex + 1;
      if (nextIdx >= block.phrases.length) {
        setIsDone(true);
        setCaption(copy.done);
        player.cancel();
        return;
      }
      const nextPhrase = block.phrases[nextIdx]!;
      setPhraseIndex(nextIdx);
      setPhrase(nextPhrase);
      setFound(1);
      setCaption('');
      playSound(player, phraseSound(block.tonic, block.string, nextPhrase, ECHO_BPM));
    } else {
      const nextPhrase = randomPhrase(Math.random, block.notes ?? 3, phrase);
      setPhrase(nextPhrase);
      setFound(1);
      setCaption('');
      playSound(player, phraseSound(block.tonic, block.string, nextPhrase, ECHO_BPM));
    }
  }, [block.notes, block.phrases, block.string, block.tonic, copy.done, phrase, phraseIndex, player]);

  const onDot = useCallback(
    (d: FretDot) => {
      if (!started || isPhraseComplete || isDone) return;
      const tappedDegree = frets.indexOf(d.fret) + 1;
      if (tappedDegree < 1) return;

      const wantedDegree = phrase[found];
      if (wantedDegree === undefined) return;

      const result = judgeTap(wantedDegree, tappedDegree);
      if (result === 'right') {
        const nextFound = found + 1;
        setFound(nextFound);
        if (nextFound >= phrase.length) {
          setCaption(copy.right);
        } else {
          setCaption('');
        }
      } else {
        setCaption(result === 'higher' ? copy.higher : copy.lower);
      }
    },
    [copy.higher, copy.lower, copy.right, found, frets, isDone, isPhraseComplete, phrase, started],
  );

  const shownFrets = useMemo(() => {
    if (isDone && block.phrases) {
      return new Set(phrase.map((deg) => frets[deg - 1]!));
    }
    return new Set(phrase.slice(0, found).map((deg) => frets[deg - 1]!));
  }, [block.phrases, found, frets, isDone, phrase]);

  const dots = useMemo(
    (): FretDot[] =>
      frets.map((fret) => {
        const isLit = shownFrets.has(fret);
        return {
          key: posKey({ string: block.string, fret }),
          string: block.string,
          fret,
          midi: midiAt({ string: block.string, fret }),
          faint: !isLit,
          tone: 'plain',
        };
      }),
    [block.string, frets, shownFrets],
  );

  return (
    <div className="board">
      <div className="quiz">
        <span className="question">{copy.ask}</span>
        {!started ? (
          <Button onClick={start}>{ui.session.start}</Button>
        ) : (
          <Button onClick={playCurrent}>{ui.session.playAgain}</Button>
        )}
        {isPhraseComplete && !isDone && (
          <Button onClick={next} ghost>
            {ui.session.next}
          </Button>
        )}
      </div>
      <Fretboard geometry={g} dots={dots} label={copy.ask} onDot={onDot} />
      <p
        className={isPhraseComplete || isDone ? 'caption good' : 'caption'}
        aria-live="polite"
      >
        {caption}
      </p>
    </div>
  );
}
