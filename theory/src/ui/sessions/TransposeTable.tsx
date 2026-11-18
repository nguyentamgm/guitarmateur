import { useCallback, useMemo } from 'react';
import { format } from '../../core/music';
import { beatSeconds } from '../../core/rhythm';
import { fill } from '../../i18n';
import { capoRows, keyRows, type KeyRow } from '../../sessions/transposeTable';
import { defaultPattern, strumSteps } from '../../sessions/strum';
import type { Block, TransposeCopy } from '../../sessions/types';
import { chordShape, shapeMidis } from '../../sessions/voicing';
import { useTheory } from '../context';
import { Button } from '../controls';
import { useClock } from '../useClock';
import { playStrumStep } from './playStrumStep';
import { useSessionStrumSpeed } from './sessionSettingsContext';
import { STRUM_SPREADS } from './strumSpeed';

export type TransposeBlock = Extract<Block, { kind: 'transpose' }>;

function TransposeKeyRow({
  row,
  barsLength,
  spread,
}: {
  row: KeyRow;
  barsLength: number;
  spread: number;
}) {
  const { player, ui } = useTheory();
  const bpm = 90;
  const beatsPerBar = 4;
  const pattern = defaultPattern(beatsPerBar);
  const steps = useMemo(
    () => strumSteps(barsLength, beatsPerBar, pattern),
    [barsLength, beatsPerBar, pattern],
  );

  const barMidis = useMemo(
    () =>
      row.chords.map((chord) => {
        const shape = chordShape(chord.chord);
        return shapeMidis(shape);
      }),
    [row.chords],
  );

  const onStep = useCallback(
    (i: number, delay: number) => {
      const step = steps[i];
      if (!step) return;
      playStrumStep(player, step, barMidis[step.bar], delay, bpm, spread);
    },
    [barMidis, bpm, player, spread, steps],
  );

  const clock = useClock(steps.length, beatSeconds(bpm) / 2, onStep, false);
  const currentBar = clock.current !== null ? steps[clock.current]?.bar ?? null : null;

  return (
    <tr>
      <th scope="row">
        <div className="row-header">
          <span className="key-name">{fill(ui.session.keyOf, { key: format(row.tonic) })}</span>
          <Button onClick={clock.toggle}>
            {clock.playing ? ui.session.stop : ui.session.play}
          </Button>
        </div>
      </th>
      {row.chords.map((chord, barIdx) => (
        <td key={barIdx} className={currentBar === barIdx ? 'on' : undefined}>
          {chord.symbol}
        </td>
      ))}
    </tr>
  );
}

export function TransposeTable({
  block,
  copy,
}: {
  block: TransposeBlock;
  copy: TransposeCopy;
}) {
  const { ui } = useTheory();
  const speed = useSessionStrumSpeed();
  const spread = STRUM_SPREADS[speed];

  const rows = useMemo(() => keyRows(block.bars, block.tonics), [block.bars, block.tonics]);
  const numerals = useMemo(() => rows[0]?.chords.map((c) => c.roman) ?? [], [rows]);
  const capoList = useMemo(
    () => (block.capoShapes ? capoRows(block.capoShapes) : null),
    [block.capoShapes],
  );

  return (
    <div className="board transpose-block">
      <div className="scroll">
        <table className="transpose-table">
          <thead>
            <tr>
              <th scope="col" />
              {numerals.map((numeral, i) => (
                <th key={i} scope="col">
                  {numeral}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <TransposeKeyRow
                key={rowIdx}
                row={row}
                barsLength={block.bars.length}
                spread={spread}
              />
            ))}
          </tbody>
        </table>
      </div>

      {capoList && (
        <div className="scroll">
          <table className="capo-table">
            <thead>
              <tr>
                <th scope="col">{ui.session.capoFret}</th>
                <th scope="col">{ui.session.capoSounds}</th>
              </tr>
            </thead>
            <tbody>
              {capoList.map((entry) => (
                <tr key={entry.fret}>
                  <th scope="row">{entry.fret === 0 ? ui.session.noCapo : entry.fret}</th>
                  <td>{format(entry.sounds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {copy.caption && (
        <p className="caption" aria-live="polite">
          {copy.caption}
        </p>
      )}
    </div>
  );
}
