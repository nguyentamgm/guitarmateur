import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { beatSeconds } from '../../core/rhythm';
import { fill } from '../../i18n';
import { chordIn } from '../../sessions/chordSpec';
import { fillPlan, fixedFillPlan, judgeFill } from '../../sessions/fill';
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
  const fixed = typeof block.bars === 'number' ? null : block.bars;
  const barCount = typeof block.bars === 'number' ? block.bars : block.bars.plan.length;
  const blanks = useMemo(
    () =>
      fixed
        ? fixed.blanks.map((bar) => bar - 1)
        : Array.from({ length: barCount - 1 }, (_, i) => i + 1),
    [barCount, fixed],
  );
  const writtenPlan = useMemo(
    () => fixed && fixedFillPlan(block.pool, fixed.plan),
    [block.pool, fixed],
  );

  const [tonic, setTonic] = useState(block.in.tonic);
  useEffect(() => {
    setTonic(block.in.tonic);
  }, [block.in.tonic]);

  const [plan, setPlan] = useState<readonly number[] | null>(null);
  const [picks, setPicks] = useState<readonly (number | null)[]>(() => Array(barCount).fill(null));
  const [heard, setHeard] = useState(false);
  const [checked, setChecked] = useState(false);
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
  const steps = useMemo(() => strumSteps(barCount, 4, defaultPattern(4)), [barCount]);

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

  const clock = useClock(
    steps.length,
    beatSeconds(block.bpm) / 2,
    onStep,
    false,
    fixed ? () => setHeard(true) : undefined,
  );

  // Reset when block key changes
  useEffect(() => {
    setPlan(null);
    planRef.current = null;
    setPicks(Array(barCount).fill(null));
    setHeard(false);
    setChecked(false);
    setRightRounds(0);
    setTotalRounds(0);
    clock.stop();
    player.cancel();
  }, [barCount, block.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const startOrNextRound = useCallback(() => {
    const newPlan =
      writtenPlan ??
      fillPlan(Math.random, block.pool.length, barCount, planRef.current ?? undefined);
    planRef.current = newPlan;
    setPlan(newPlan);
    setPicks(Array(barCount).fill(null));
    setHeard(false);
    setChecked(false);

    if (clock.playing) {
      clock.stop();
    }
    clock.toggle();
  }, [barCount, block.pool.length, clock, writtenPlan]);

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

  const canPick = !fixed || (heard && !clock.playing);
  const allPicked = blanks.every((bar) => picks[bar] != null);

  const onCheck = useCallback(() => {
    if (!plan || !canPick || !allPicked) return;
    setChecked(true);
    setTotalRounds((t) => t + 1);
    if (judgeFill(plan, picks, blanks).every(Boolean)) {
      setRightRounds((r) => r + 1);
    }
  }, [allPicked, blanks, canPick, picks, plan]);

  const currentBar = clock.current !== null ? (steps[clock.current]?.bar ?? null) : null;

  const barCells: BarCell[] = Array.from({ length: barCount }, (_, bar) => {
    if ((checked && plan) || !blanks.includes(bar)) {
      const index = (plan ?? writtenPlan)?.[bar] ?? 0;
      const chord = poolChords[index]!;
      return { degree: chord.roman, symbol: chord.symbol };
    }
    const pick = picks[bar];
    return { degree: pick == null ? '?' : poolChords[pick]!.roman, symbol: '' };
  });
  const gridLabel = checked
    ? barCells.map((bar) => bar.degree).join('–')
    : fixed
      ? copy.ask
      : `${barCount} bars`;
  const judged = checked && plan ? judgeFill(plan, picks, blanks) : null;
  const marks: (BarMark | null)[] | undefined = judged?.map((good, bar) => {
    if (fixed && !blanks.includes(bar)) return null;
    return {
      text: good ? '✓' : '✗',
      good,
      description: good ? ui.session.checkRight : ui.session.checkWrong,
    };
  });
  const allRight = judged?.every(Boolean);

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
            {fixed && clock.playing ? (
              <Button
                onClick={() => {
                  clock.stop();
                  player.cancel();
                }}
              >
                {ui.session.stop}
              </Button>
            ) : (
              <button type="button" className="btn" disabled={clock.playing} onClick={playAgain}>
                {ui.session.playAgain}
              </button>
            )}
            {!checked ? (
              <button
                type="button"
                className="btn"
                disabled={!canPick || !allPicked || clock.playing}
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

      {plan && canPick && (
        <div
          className="controls"
          style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}
        >
          {fixed && <p className="prose">{copy.ask}</p>}
          {blanks.map((barIndex) => {
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

      {judged && (
        <p className={allRight ? 'caption good' : 'caption'} aria-live="polite">
          {allRight ? copy.allRight : copy.someWrong}
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
