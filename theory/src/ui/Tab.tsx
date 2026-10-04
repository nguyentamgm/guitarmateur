/**
 * Six-line tab, string 1 on top (K0.3). Each number is a button that plays its note. Columns read
 * left to right; notes in one column sound together. Positions come from the lesson's scenes.
 */
import type { KeyboardEvent } from 'react';
import { STRINGS, type StringNumber } from '../core/fretboard';
import { useTheory } from './context';
import { stringName } from './geometry';

export interface TabNote {
  /** Shared with the neck's dot for the same position, so both light up together. */
  readonly key: string;
  readonly string: StringNumber;
  readonly fret: number;
  readonly midi: number;
}

interface Props {
  readonly columns: readonly (readonly TabNote[])[];
  readonly label: string;
  /** Keys of the notes to highlight. */
  readonly active?: readonly string[];
  /** Index of the column being played, if any. */
  readonly column?: number | null;
  readonly onNote?: (note: TabNote, column: number) => void;
}

const LEFT = 30;
const COL = 46;
const TOP = 16;
const GAP = 20;

export function Tab({ columns, label, active = [], column = null, onNote }: Props) {
  const { player } = useTheory();
  const width = LEFT + columns.length * COL + 12;
  const height = TOP * 2 + 5 * GAP;
  const y = (s: StringNumber) => TOP + (s - 1) * GAP;
  const x = (i: number) => LEFT + (i + 0.5) * COL;

  const play = (n: TabNote, i: number) => {
    player.pluck(n.midi);
    onNote?.(n, i);
  };
  const onKey = (e: KeyboardEvent, n: TabNote, i: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      play(n, i);
    }
  };

  return (
    <div className="scroll">
      <svg
        className="tab"
        viewBox={`0 0 ${width} ${height}`}
        style={{ minWidth: Math.round(width * 0.7), maxWidth: Math.round(width * 1.3) }}
        role="group"
        aria-label={label}
      >
        {column !== null && (
          <rect className="tabcol" x={x(column) - COL / 2 + 4} y={4} width={COL - 8} height={height - 8} rx={6} />
        )}
        {STRINGS.map((s) => (
          <g key={s}>
            <line className="tabline" x1={LEFT - 6} x2={width - 6} y1={y(s)} y2={y(s)} />
            <text className="tabname" x={6} y={y(s)}>
              {stringName(s)}
            </text>
          </g>
        ))}
        {columns.flatMap((notes, i) =>
          notes.map((n) => (
            <g
              key={`${i}-${n.key}`}
              className={active.includes(n.key) ? 'tabnum on' : 'tabnum'}
              role="button"
              tabIndex={0}
              aria-label={`${stringName(n.string)}/${n.fret}`}
              onClick={() => play(n, i)}
              onKeyDown={(e) => onKey(e, n, i)}
            >
              <rect x={x(i) - 10} y={y(n.string) - 9} width={20} height={18} rx={4} />
              <text x={x(i)} y={y(n.string)}>
                {n.fret}
              </text>
            </g>
          )),
        )}
      </svg>
    </div>
  );
}
