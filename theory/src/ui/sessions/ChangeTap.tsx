import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { beatSeconds } from '../../core/rhythm';
import { fill } from '../../i18n';
import { changeBars, changePlan, judgeTaps, type TapScore } from '../../sessions/changes';
import { chordIn } from '../../sessions/chordSpec';
import { defaultPattern, strumSteps } from '../../sessions/strum';
import type { Block, ChangeTapCopy, ChordSpec } from '../../sessions/types';
import { chordShape, shapeMidis } from '../../sessions/voicing';
import { BarGrid, type BarMark } from '../BarGrid';
import { useTheory } from '../context';
import { Button } from '../controls';
import { useClock } from '../useClock';
import { playStrumStep } from './playStrumStep';
import { useSessionStrumSpeed } from './sessionSettingsContext';
import { STRUM_SPREADS } from './strumSpeed';

export type ChangeTapBlock = Extract<Block, { kind: 'changeTap' }>;

interface BarChordInfo {
  readonly roman: string;
  readonly symbol: string;
  readonly midis: readonly number[];
}

export function ChangeTap({ block, copy }: { block: ChangeTapBlock; copy: ChangeTapCopy }) {
  const { player, ui } = useTheory();
  const speed = useSessionStrumSpeed();
  const spread = STRUM_SPREADS[speed];

  const [plan, setPlan] = useState<readonly ChordSpec[] | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState<TapScore | null>(null);

  const planRef = useRef<readonly ChordSpec[] | null>(null);
  const barChordsRef = useRef<readonly BarChordInfo[]>([]);
  const startRef = useRef<number | null>(null);
  const tapsRef = useRef<number[]>([]);

  // 4 beats per bar, standard strumming pattern (D-D-D-D-)
  const steps = useMemo(() => strumSteps(block.bars, 4, defaultPattern(4)), [block.bars]);

  const onStep = useCallback(
    (i: number, delay: number) => {
      if (i === 0) {
        startRef.current = performance.now() + delay * 1000;
      }
      const step = steps[i];
      if (!step) return;

      const chord = barChordsRef.current[step.bar];
      playStrumStep(player, step, chord?.midis, delay, block.bpm, spread);
    },
    [block.bpm, player, spread, steps],
  );

  const clock = useClock(steps.length, beatSeconds(block.bpm) / 2, onStep, false);

  // Watch for clock transition from playing to stopped
  const prevPlaying = useRef(clock.playing);
  useEffect(() => {
    if (prevPlaying.current && !clock.playing && planRef.current) {
      const currentPlan = planRef.current;
      const changeIndices = changeBars(currentPlan);
      const changes = changeIndices.map((b) => b * 4);
      const resultScore = judgeTaps(changes, tapsRef.current);
      setScore(resultScore);
      setFinished(true);
    }
    prevPlaying.current = clock.playing;
  }, [clock.playing]);

  // Reset when block key changes
  useEffect(() => {
    setPlan(null);
    setFinished(false);
    setScore(null);
    planRef.current = null;
    barChordsRef.current = [];
    startRef.current = null;
    tapsRef.current = [];
    clock.stop();
  }, [block.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const startRound = useCallback(() => {
    const newPlan = changePlan(Math.random, block.pool, block.bars, block.holds);
    planRef.current = newPlan;
    setPlan(newPlan);

    const key = block.in;
    const newBarChords: BarChordInfo[] = newPlan.map((spec) => {
      const specChord = chordIn(key, spec);
      const shape = chordShape(specChord.chord);
      const midis = shapeMidis(shape);
      return {
        roman: specChord.roman,
        symbol: specChord.symbol,
        midis,
      };
    });
    barChordsRef.current = newBarChords;
    tapsRef.current = [];
    startRef.current = null;
    setFinished(false);
    setScore(null);

    clock.toggle();
  }, [block.bars, block.holds, block.in, block.pool, clock]);

  const onTap = useCallback(() => {
    if (startRef.current === null) return;
    const elapsedSec = (performance.now() - startRef.current) / 1000;
    const beats = elapsedSec / beatSeconds(block.bpm);
    tapsRef.current.push(beats);
  }, [block.bpm]);

  const currentBar = clock.current !== null ? steps[clock.current]?.bar ?? null : null;

  const barCells = useMemo(() => {
    if (!finished || !plan) {
      return Array.from({ length: block.bars }, () => ({ degree: '', symbol: '?' }));
    }
    return barChordsRef.current.map((c) => ({ degree: c.roman, symbol: c.symbol }));
  }, [block.bars, finished, plan]);

  const marks = useMemo(() => {
    if (!finished || !plan || !score) return undefined;
    const changeIndices = changeBars(plan);
    const markMap = new Map<number, BarMark>();
    changeIndices.forEach((barIdx, i) => {
      const good = score.caught[i] ?? false;
      markMap.set(barIdx, {
        text: good ? '✓' : '✗',
        good,
        description: good ? ui.session.changeCaught : ui.session.changeMissed,
      });
    });
    return Array.from({ length: block.bars }, (_, idx) => markMap.get(idx) ?? null);
  }, [block.bars, finished, plan, score, ui.session.changeCaught, ui.session.changeMissed]);

  const label = useMemo(() => {
    if (!finished || !plan) return `${block.bars} bars`;
    return barChordsRef.current.map((c) => c.roman).join('–');
  }, [block.bars, finished, plan]);

  return (
    <div className="board">
      <div className="controls">
        {!clock.playing && !finished && (
          <Button onClick={startRound}>{ui.session.start}</Button>
        )}
        {clock.playing && (
          <button type="button" className="btn change-tap-btn" onClick={onTap}>
            {copy.ask}
          </button>
        )}
        {finished && score && (
          <Button onClick={startRound}>{ui.session.again}</Button>
        )}
      </div>
      <BarGrid label={label} bars={barCells} current={currentBar} marks={marks} />
      {finished && score && (
        <p className="caption good" aria-live="polite">
          {fill(copy.result, {
            caught: score.caught.filter(Boolean).length,
            total: score.caught.length,
            extra: score.extra,
          })}
        </p>
      )}
    </div>
  );
}
