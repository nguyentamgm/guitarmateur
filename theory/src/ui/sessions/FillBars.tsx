import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { beatSeconds } from '../../core/rhythm';
import { fill } from '../../i18n';
import { chordIn } from '../../sessions/chordSpec';
import { fillPlan, judgeFill } from '../../sessions/fill';
import { strummed } from '../../sessions/sound';
import { defaultPattern, strumSteps } from '../../sessions/strum';
import type { Block, FillBarsCopy } from '../../sessions/types';
import { chordShape, shapeMidis } from '../../sessions/voicing';
import { BarGrid, type BarCell, type BarMark } from '../BarGrid';
import { useTheory } from '../context';
import { Button, ChipGroup } from '../controls';
import { useClock } from '../useClock';
import { playSound } from './playSound';
import { playStrumStep } from './playStrumStep';
import { useSessionStrumSpeed } from './sessionSettingsContext';
import { STRUM_SPREADS } from './strumSpeed';

export type FillBarsBlock = Extract<Block, { kind: 'fillBars' }>;

interface PoolChordInfo {
  readonly roman: string;
  readonly symbol: string;
  readonly midis: readonly number[];
}

export function FillBars({ block, copy }: { block: FillBarsBlock; copy: FillBarsCopy }) {
  const { player, ui } = useTheory();
  const speed = useSessionStrumSpeed();
  const spread = STRUM_SPREADS[speed];

  const [tonic, setTonic] = useState(block.in.tonic);
  useEffect(() => {
    setTonic(block.in.tonic);
  }, [block.in.tonic]);

  const [plan, setPlan] = useState<readonly number[] | null>(null);
  const [picks, setPicks] = useState<readonly (number | null)[]>(() =>
    Array(block.bars).fill(null),
  );
  const [checked, setChecked] = useState(false);
  const [marks, setMarks] = useState<readonly (BarMark | null)[] | undefined>(undefined);
  const [caption, setCaption] = useState('');
  const [rightRounds, setRightRounds] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);

  const planRef = useRef<readonly number[] | null>(null);

  const currentKey = useMemo(() => ({ tonic, mode: block.in.mode }), [tonic, block.in.mode]);

  const poolChords = useMemo((): readonly PoolChordInfo[] => {
    return block.pool.map((spec) => {
      const specChord = chordIn(currentKey, spec);
      const shape = chordShape(specChord.chord);
      const midis = shapeMidis(shape);
      return {
        roman: specChord.roman,
        symbol: specChord.symbol,
        midis,
      };
    });
  }, [block.pool, currentKey]);

  const poolChordsRef = useRef(poolChords);
  poolChordsRef.current = poolChords;

  // 4 beats per bar, standard down strums on beats with click
  const steps = useMemo(() => strumSteps(block.bars, 4, defaultPattern(4)), [block.bars]);

  const onStep = useCallback(
    (i: number, delay: number) => {
      const step = steps[i];
      if (!step) return;

      const planIndex = planRef.current ? planRef.current[step.bar] : undefined;
      const chord = planIndex !== undefined ? poolChordsRef.current[planIndex] : undefined;
      playStrumStep(player, step, chord?.midis, delay, block.bpm, spread);
    },
    [block.bpm, player, spread, steps],
  );

  const clock = useClock(steps.length, beatSeconds(block.bpm) / 2, onStep, false);

  // Reset when block key changes
  useEffect(() => {
    setPlan(null);
    planRef.current = null;
    setPicks(Array(block.bars).fill(null));
    setChecked(false);
    setMarks(undefined);
    setCaption('');
    setRightRounds(0);
    setTotalRounds(0);
    clock.stop();
    player.cancel();
  }, [block.bars, block.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const startOrNextRound = useCallback(() => {
    const newPlan = fillPlan(
      Math.random,
      block.pool.length,
      block.bars,
      planRef.current ?? undefined,
    );
    planRef.current = newPlan;
    setPlan(newPlan);
    setPicks([0, ...Array(block.bars - 1).fill(null)]);
    setChecked(false);
    setMarks(undefined);
    setCaption('');

    if (clock.playing) {
      clock.stop();
    }
    clock.toggle();
  }, [block.bars, block.pool.length, clock]);

  const playAgain = useCallback(() => {
    if (clock.playing) return;
    clock.toggle();
  }, [clock]);

  const onPick = useCallback(
    (barIndex: number, poolIndex: number) => {
      // Strum chord with current strum speed
      const chord = poolChordsRef.current[poolIndex];
      if (chord) {
        playSound(
          player,
          {
            bpm: block.bpm,
            events: [strummed(chord.midis, 0, 2)],
          },
          { strumSpreadSec: spread },
        );
      }

      if (!checked) {
        setPicks((prev) => {
          const next = [...prev];
          next[barIndex] = poolIndex;
          return next;
        });
      }
    },
    [block.bpm, checked, player, spread],
  );

  const allPicked = useMemo(
    () =>
      picks.length === block.bars &&
      picks.slice(1).every((p) => p !== null && p !== undefined),
    [block.bars, picks],
  );

  const onCheck = useCallback(() => {
    if (!planRef.current || !allPicked) return;
    const currentPlan = planRef.current;
    const judged = judgeFill(currentPlan, picks);
    const isAllRight = judged.every(Boolean);

    const newMarks: readonly (BarMark | null)[] = judged.map((good) => ({
      text: good ? '✓' : '✗',
      good,
      description: good ? ui.session.checkRight : ui.session.checkWrong,
    }));

    setChecked(true);
    setMarks(newMarks);
    setCaption(isAllRight ? copy.allRight : copy.someWrong);
    setTotalRounds((t) => t + 1);
    if (isAllRight) {
      setRightRounds((r) => r + 1);
    }
  }, [allPicked, copy.allRight, copy.someWrong, picks, ui.session.checkRight, ui.session.checkWrong]);

  const currentBar = clock.current !== null ? steps[clock.current]?.bar ?? null : null;

  const barCells = useMemo((): readonly BarCell[] => {
    const given = poolChords[0];
    const bar0Cell: BarCell = {
      degree: given?.roman ?? '',
      symbol: given?.symbol ?? '',
    };

    if (checked && plan) {
      return plan.map((poolIdx) => {
        const chord = poolChords[poolIdx];
        return {
          degree: chord?.roman ?? '',
          symbol: chord?.symbol ?? '',
        };
      });
    }

    const cells: BarCell[] = [bar0Cell];
    for (let bar = 1; bar < block.bars; bar++) {
      const pick = picks[bar];
      if (pick !== null && pick !== undefined && poolChords[pick]) {
        cells.push({
          degree: poolChords[pick].roman,
          symbol: '',
        });
      } else {
        cells.push({
          degree: '?',
          symbol: '',
        });
      }
    }
    return cells;
  }, [block.bars, checked, picks, plan, poolChords]);

  const gridLabel = useMemo(() => {
    if (!checked || !plan) return `${block.bars} bars`;
    return plan.map((idx) => poolChords[idx]?.roman ?? '').join('–');
  }, [block.bars, checked, plan, poolChords]);

  return (
    <div className="board">
      {block.keys && (
        <div className="controls">
          <ChipGroup<string>
            label={ui.session.key}
            items={block.keys.map((k) => ({ value: k, text: k }))}
            value={tonic}
            onChange={setTonic}
          />
        </div>
      )}

      <div className="controls">
        {!plan ? (
          <Button onClick={startOrNextRound}>{ui.session.start}</Button>
        ) : (
          <>
            <button
              type="button"
              className="btn"
              disabled={clock.playing}
              onClick={playAgain}
            >
              {ui.session.playAgain}
            </button>
            {!checked ? (
              <button
                type="button"
                className="btn"
                disabled={!allPicked || clock.playing}
                onClick={onCheck}
              >
                {ui.session.check}
              </button>
            ) : (
              <Button onClick={startOrNextRound} ghost>
                {ui.session.next}
              </Button>
            )}
          </>
        )}
      </div>

      <BarGrid label={gridLabel} bars={barCells} current={currentBar} marks={marks} />

      {plan && (
        <div
          className="controls"
          style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}
        >
          {Array.from({ length: block.bars - 1 }, (_, idx) => {
            const barIndex = idx + 1;
            const barNum = barIndex + 1;
            return (
              <ChipGroup<number>
                key={barIndex}
                label={fill(ui.session.barLabel, { n: barNum })}
                items={poolChords.map((c, poolIdx) => ({
                  value: poolIdx,
                  text: c.roman,
                }))}
                value={picks[barIndex] ?? -1}
                onChange={(poolIdx) => onPick(barIndex, poolIdx)}
              />
            );
          })}
        </div>
      )}

      {caption && (
        <p className={marks?.every((m) => m?.good) ? 'caption good' : 'caption'} aria-live="polite">
          {caption}
        </p>
      )}

      {totalRounds > 0 && (
        <p className="muted small">
          {fill(ui.session.roundsRight, { right: rightRounds, total: totalRounds })}
        </p>
      )}
    </div>
  );
}
