/**
 * The beginner levels (docs/ear-levels.md "The screens"): welcome → level map → level intro →
 * questions → end of round. One audio driver plays every screen's sounds; progress goes to the
 * store through `onRoundEffect` as the round runs, so a reload loses nothing.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Player } from '@shared/core/audio';
import { findLevel, type Level } from '../core/levels';
import { levelProgress, type Progress } from '../core/progress';
import type { RoundEffect } from '../core/round';
import { createEarAudio, type EarAudio } from '../audio/driver';
import { soundCheckPart, type KindSounds } from '../audio/levelSounds';
import type { Part } from '../audio/timeline';
import type { UiStrings } from '../i18n';
import { LevelIntro } from './LevelIntro';
import { LevelMap } from './LevelMap';
import { playable } from './levelWords';
import { Question } from './Question';
import { RoundEnd } from './RoundEnd';
import { useRound } from './useRound';
import { Welcome } from './Welcome';

type Screen =
  | { readonly name: 'welcome' }
  | { readonly name: 'map' }
  | { readonly name: 'intro'; readonly level: Level }
  | { readonly name: 'round' };

export function Levels({
  ui,
  player,
  sounds,
  welcomed,
  progress,
  onWelcomed,
  onRoundEffect,
}: {
  ui: UiStrings;
  player: Player;
  sounds: KindSounds;
  welcomed: boolean;
  progress: Progress;
  onWelcomed(): void;
  onRoundEffect(level: number, effect: RoundEffect): void;
}) {
  const [screen, setScreen] = useState<Screen>(() =>
    welcomed ? { name: 'map' } : { name: 'welcome' },
  );
  const [noAudio, setNoAudio] = useState(false);
  const audioRef = useRef<EarAudio | null>(null);
  const audio = useCallback(
    () =>
      (audioRef.current ??= createEarAudio(player, {
        onDone: () => {},
        onNoAudio: () => setNoAudio(true),
      })),
    [player],
  );
  const kindSounds = useCallback((level: Level) => sounds[level.kind], [sounds]);
  const round = useRound(audio, kindSounds, onRoundEffect);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const rootRef = useRef<HTMLDivElement>(null);

  /** A sound the learner asked for: the "no sound" message goes until the player says otherwise. */
  const play = useCallback(
    (part: Part) => {
      setNoAudio(false);
      audio().playPart(part);
    },
    [audio],
  );

  const startRound = useCallback(
    (level: Level) => {
      const p = levelProgress(progressRef.current, level.id);
      setNoAudio(false);
      setScreen({ name: 'round' });
      round.start(level, p.step, p.counts);
    },
    [round],
  );

  /** A level's first round opens with its intro; later ones go straight to the questions. */
  const open = useCallback(
    (level: Level) => {
      if (progressRef.current[level.id] === undefined) setScreen({ name: 'intro', level });
      else startRound(level);
    },
    [startRound],
  );

  const toMap = useCallback(() => {
    audio().cancel();
    setScreen({ name: 'map' });
  }, [audio]);

  // Leaving the page stops the sound; so does leaving the levels.
  useEffect(() => {
    const leave = () => audioRef.current?.cancel();
    window.addEventListener('pagehide', leave);
    return () => {
      window.removeEventListener('pagehide', leave);
      audioRef.current?.dispose();
    };
  }, []);

  // A new screen takes the focus to its heading, so a screen reader starts there.
  const phase = screen.name === 'round' ? round.state?.phase : null;
  useEffect(() => {
    const at = document.activeElement;
    if (at && at !== document.body && !rootRef.current?.contains(at)) return;
    if (phase === 'question' || phase === 'feedback') return;
    rootRef.current?.querySelector<HTMLElement>('h2')?.focus();
  }, [screen, phase]);

  const isPlayable = (level: Level) => playable(ui, sounds, level);
  const s = round.state;

  let body;
  if (screen.name === 'welcome') {
    body = (
      <Welcome
        ui={ui}
        noAudio={noAudio}
        onCheck={() => play(soundCheckPart())}
        onDone={() => {
          onWelcomed();
          setScreen({ name: 'map' });
        }}
      />
    );
  } else if (screen.name === 'map') {
    body = (
      <LevelMap
        ui={ui}
        progress={progress}
        playable={isPlayable}
        onOpen={open}
        onHow={(level) => setScreen({ name: 'intro', level })}
      />
    );
  } else if (screen.name === 'intro') {
    body = (
      <LevelIntro
        ui={ui}
        level={screen.level}
        step={levelProgress(progress, screen.level.id).step}
        sounds={sounds[screen.level.kind]!}
        play={play}
        onReady={() => startRound(screen.level)}
        onBack={toMap}
      />
    );
  } else if (s?.phase === 'demo') {
    body = (
      <LevelIntro
        ui={ui}
        level={s.level}
        step={s.step}
        sounds={sounds[s.level.kind]!}
        play={play}
        onReady={() => round.send({ type: 'next' })}
        onBack={toMap}
      />
    );
  } else if (s?.phase === 'done') {
    const next = findLevel(s.level.id + 1);
    body = (
      <RoundEnd
        ui={ui}
        state={s}
        results={round.results}
        next={next && isPlayable(next) ? next : null}
        onNext={open}
        onAgain={() => startRound(s.level)}
        onBack={toMap}
      />
    );
  } else if (s) {
    body = <Question ui={ui} round={round} state={s} noAudio={noAudio} onBack={toMap} />;
  }

  return (
    <div ref={rootRef} className="levels">
      {body}
    </div>
  );
}
