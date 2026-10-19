/**
 * A beginner level's round, wired (docs/ear.md "Rounds"): the round reducer (core/round.ts) steps
 * once per event, outside React's render; each effect is handed to `onEffect` for the store and
 * carried out on the audio driver with the level kind's sounds (audio/levelSounds.ts). A round
 * starts from a click, never from a render or a mount, so its first sound comes from a user gesture.
 */
import { useCallback, useRef, useState } from 'react';
import type { Level } from '../core/levels';
import {
  startRound,
  stepRound,
  type AnswerCounts,
  type RoundEffect,
  type RoundEvent,
  type RoundState,
} from '../core/round';
import type { EarAudio } from '../audio/driver';
import { rightPausePart, type LevelSounds } from '../audio/levelSounds';

/** A fresh seed per round: each round asks its own questions. */
const newSeed = () => Math.floor(Math.random() * 0x100000000);

export interface Round {
  /** Null until the first round starts. */
  readonly state: RoundState | null;
  /** Right first try, one per question answered this round, in order. */
  readonly results: readonly boolean[];
  start(level: Level, step: number, counts: AnswerCounts): void;
  send(event: RoundEvent): void;
  /** After a wrong answer: the pick, then what it was, again. */
  listenBoth(): void;
}

export function useRound(
  audio: () => EarAudio,
  sounds: (level: Level) => LevelSounds | undefined,
  onEffect: (level: number, effect: RoundEffect) => void,
): Round {
  const stateRef = useRef<RoundState | null>(null);
  const resultsRef = useRef<boolean[]>([]);
  const [state, setState] = useState<RoundState | null>(null);
  const [results, setResults] = useState<readonly boolean[]>([]);
  const onEffectRef = useRef(onEffect);
  onEffectRef.current = onEffect;

  const compare = useCallback(
    (s: RoundState) => {
      const q = s.questions.at(-1);
      const kind = sounds(s.level);
      if (q && s.answer !== null && kind) audio().playPart(kind.compare(s.level, q, s.answer));
    },
    [audio, sounds],
  );

  // `send` and `run` call each other (a right answer's pause ends in `next`), so both go through refs.
  const sendRef = useRef<(event: RoundEvent) => void>(() => {});

  const run = useCallback(
    (s: RoundState, effects: readonly RoundEffect[]) => {
      const kind = sounds(s.level);
      for (const e of effects) {
        onEffectRef.current(s.level.id, e);
        switch (e.type) {
          case 'ask':
          case 'replay':
            if (kind) audio().playPart(kind.question(s.level, e.question));
            break;
          case 'score':
            resultsRef.current = [...resultsRef.current, e.right];
            setResults(resultsRef.current);
            // Right: a short pause, then the next question; on the neck (levels 14–15) it waits for
            // Next, so the neck window can be looked at. Wrong: the pick, then what it was.
            if (!e.right) compare(s);
            else if (s.level.answerOn === 'buttons')
              audio().playPart(rightPausePart(), () => sendRef.current({ type: 'next' }));
            break;
          case 'playDemo':
          case 'offerEasier':
          case 'end':
            audio().cancel();
            break;
          default:
            break;
        }
      }
    },
    [audio, sounds, compare],
  );

  const send = useCallback(
    (event: RoundEvent) => {
      const now = stateRef.current;
      if (!now) return;
      const { state: next, effects } = stepRound(now, event);
      stateRef.current = next;
      setState(next);
      run(next, effects);
    },
    [run],
  );
  sendRef.current = send;

  const start = useCallback(
    (level: Level, step: number, counts: AnswerCounts) => {
      const { state: first, effects } = startRound(level, step, newSeed(), counts);
      stateRef.current = first;
      resultsRef.current = [];
      setState(first);
      setResults([]);
      run(first, effects);
    },
    [run],
  );

  const listenBoth = useCallback(() => {
    if (stateRef.current) compare(stateRef.current);
  }, [compare]);

  return { state, results, start, send, listenBoth };
}
