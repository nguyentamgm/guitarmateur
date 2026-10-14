/**
 * The trainer's wiring: the session reducer (core/session.ts) steps once per event, outside React's
 * render, its effects go to the audio driver (audio/driver.ts), and the driver's `audioDone` comes
 * back as the next event. A first answer is handed to `onScore` for the stats.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Player } from '@shared/core/audio';
import { initialSession, step, type SessionEvent, type SessionState } from '../core/session';
import type { Answer } from '../core/stats';
import { createEarAudio, type EarAudio } from '../audio/driver';
import type { EarSettings } from '../store/settings';

/** A fresh seed per visit: each session asks its own questions. */
const newSeed = () => Math.floor(Math.random() * 0x100000000);

export interface Trainer {
  readonly state: SessionState;
  /** Audio could not start: the page says so instead of running a silent quiz. */
  readonly noAudio: boolean;
  send(event: SessionEvent): void;
}

export function useTrainer(
  player: Player,
  settings: EarSettings,
  onScore: (answer: Answer) => void,
): Trainer {
  const stateRef = useRef<SessionState | null>(null);
  stateRef.current ??= initialSession(settings, newSeed());
  const [state, setState] = useState(stateRef.current);
  const [noAudio, setNoAudio] = useState(false);
  const settingsRef = useRef(settings);
  const onScoreRef = useRef(onScore);
  onScoreRef.current = onScore;
  const driverRef = useRef<EarAudio | null>(null);

  const send = useCallback(
    (event: SessionEvent) => {
      const { state: next, effects } = step(stateRef.current!, event);
      stateRef.current = next;
      setState(next);
      for (const e of effects) {
        if (e.type === 'score')
          onScoreRef.current({
            mode: e.question.key.mode,
            degree: e.question.degree,
            answer: e.answer,
          });
      }
      // With nothing to play, the driver (once there is one) still takes new sound settings.
      if (effects.length === 0 && !driverRef.current) return;
      driverRef.current ??= createEarAudio(player, {
        onDone: (phase) => send({ type: 'audioDone', phase }),
        onNoAudio: () => {
          setNoAudio(true);
          send({ type: 'stop' });
        },
      });
      const { bpm, sound, cadenceForm, droneLevel } = settingsRef.current;
      driverRef.current.run(effects, { bpm, sound, cadenceForm, droneLevel });
    },
    [player],
  );

  // New settings (this tab's or another's) reach the session: it drops a question they rule out.
  useEffect(() => {
    if (settingsRef.current === settings) return;
    settingsRef.current = settings;
    send({ type: 'settingsChanged', settings });
  }, [settings, send]);

  // Leaving the page silences everything, the drone included.
  useEffect(() => {
    const leave = () => send({ type: 'stop' });
    window.addEventListener('pagehide', leave);
    return () => {
      window.removeEventListener('pagehide', leave);
      driverRef.current?.dispose();
      driverRef.current = null;
    };
  }, [send]);

  const sendStart = useCallback(
    (event: SessionEvent) => {
      if (event.type === 'start') setNoAudio(false);
      send(event);
    },
    [send],
  );

  return { state, noAudio, send: sendStart };
}
