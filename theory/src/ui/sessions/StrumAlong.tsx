import { useCallback, useEffect, useMemo, useState } from 'react';
import { beatSeconds, strumDelays } from '../../core/rhythm';
import { chordIn } from '../../sessions/chordSpec';
import { defaultPattern, strumSteps } from '../../sessions/strum';
import type { Block } from '../../sessions/types';
import { chordShape, shapeMidis } from '../../sessions/voicing';
import { BarGrid } from '../BarGrid';
import { useTheory } from '../context';
import { Button, ChipGroup, Tempo } from '../controls';
import { useClock } from '../useClock';

export type StrumAlongBlock = Extract<Block, { kind: 'strumAlong' }>;

export function StrumAlong({ block }: { block: StrumAlongBlock }) {
  const { player, ui } = useTheory();
  const [tonic, setTonic] = useState(block.in.tonic);
  const [bpm, setBpm] = useState(block.bpm);

  useEffect(() => {
    setTonic(block.in.tonic);
  }, [block.in.tonic]);

  useEffect(() => {
    setBpm(block.bpm);
  }, [block.bpm]);

  const beatsPerBar = block.beatsPerBar ?? 4;
  const pattern = block.pattern ?? defaultPattern(beatsPerBar);

  const steps = useMemo(
    () => strumSteps(block.bars.length, beatsPerBar, pattern),
    [block.bars.length, beatsPerBar, pattern],
  );

  const barChords = useMemo(() => {
    const key = { tonic, mode: block.in.mode };
    return block.bars.map((spec) => {
      const specChord = chordIn(key, spec);
      const shape = chordShape(specChord.chord);
      const midis = shapeMidis(shape);
      return {
        roman: specChord.roman,
        symbol: block.numeralsOnly ? '' : specChord.symbol,
        midis,
      };
    });
  }, [block.bars, block.in.mode, block.numeralsOnly, tonic]);

  const onStep = useCallback(
    (i: number, delay: number) => {
      const step = steps[i];
      if (!step) return;

      if (step.click) {
        player.click(step.click === 'accent', delay);
      }

      if (step.stroke) {
        const chord = barChords[step.bar];
        if (chord && chord.midis.length > 0) {
          const strokeMidis = step.stroke === 'down' ? chord.midis : chord.midis.slice(-4);
          for (const s of strumDelays(strokeMidis, step.stroke)) {
            player.pluck(s.item, delay + s.delay, beatSeconds(bpm));
          }
        }
      }
    },
    [barChords, bpm, player, steps],
  );

  const clock = useClock(steps.length, beatSeconds(bpm) / 2, onStep);

  const barCells = useMemo(
    () => barChords.map((c) => ({ degree: c.roman, symbol: c.symbol })),
    [barChords],
  );

  const currentBar = clock.current !== null ? steps[clock.current]?.bar ?? null : null;
  const currentBeat = clock.current !== null ? steps[clock.current]?.beat ?? null : null;
  const label = useMemo(() => barChords.map((c) => c.roman).join('–'), [barChords]);

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
        <Button onClick={clock.toggle}>{clock.playing ? ui.session.stop : ui.session.play}</Button>
        <Tempo bpm={bpm} onChange={setBpm} />
      </div>
      <BarGrid label={label} bars={barCells} current={currentBar} />
      <div
        className="count-line"
        aria-hidden="true"
        style={{ display: 'flex', gap: '8px', alignItems: 'center', fontFamily: 'var(--f-mono)' }}
      >
        <span style={{ fontSize: 'var(--t-label)', color: 'var(--muted)', textTransform: 'uppercase' }}>
          {ui.session.countLabel}
        </span>
        {Array.from({ length: beatsPerBar }, (_, i) => (
          <span
            key={i}
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontWeight: currentBeat === i ? 700 : 400,
              background: currentBeat === i ? 'var(--accent)' : 'transparent',
              color: currentBeat === i ? 'var(--accent-ink)' : 'var(--muted)',
            }}
          >
            {i + 1}
          </span>
        ))}
      </div>
    </div>
  );
}
