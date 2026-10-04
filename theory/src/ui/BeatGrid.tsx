/**
 * One bar as a strip of equal cells (M1): time runs left to right, a note is a block as long as
 * the cells it lasts, a rest is an empty outline. Beat lines are heavier than cell lines, and the
 * cell being heard is shaded. Optional words under the cells (the count) light up with it.
 */
import type { KeyboardEvent, ReactNode } from 'react';

export type BlockTone = 'note' | 'accent' | 'rest' | 'ghost';

export interface Block {
  readonly key: string;
  readonly start: number;
  readonly length: number;
  readonly tone: BlockTone;
  /** Text inside the block (an arrow, a number). */
  readonly text?: ReactNode;
  readonly label: string;
  readonly onClick?: () => void;
}

interface Props {
  readonly cells: number;
  /** Cells per beat: every `perBeat`-th line is drawn as a beat line. */
  readonly perBeat: number;
  readonly blocks: readonly Block[];
  readonly label: string;
  /** Cell being heard. */
  readonly current?: number | null;
  /** One word per cell, shown under the grid. */
  readonly words?: readonly string[];
}

const CELL = 44;
const LEFT = 8;
const TOP = 8;
const ROW = 52;

export function BeatGrid({ cells, perBeat, blocks, label, current = null, words }: Props) {
  const cellW = Math.max(26, Math.min(CELL, Math.floor(704 / cells)));
  const width = LEFT * 2 + cells * cellW;
  const height = TOP + ROW + (words ? 34 : 10);
  const x = (c: number) => LEFT + c * cellW;
  const onKey = (e: KeyboardEvent, b: Block) => {
    if (b.onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      b.onClick();
    }
  };

  return (
    <div className="scroll">
      <svg
        className="beatgrid"
        viewBox={`0 0 ${width} ${height}`}
        style={{ minWidth: Math.round(width * 0.6), maxWidth: Math.round(width * 1.25) }}
        role="group"
        aria-label={label}
      >
        <rect className="lane" x={x(0)} y={TOP} width={cells * cellW} height={ROW} rx={6} />
        {current !== null && <rect className="now" x={x(current)} y={TOP} width={cellW} height={ROW} />}
        {Array.from({ length: cells + 1 }, (_, c) => (
          <line
            key={c}
            className={c % perBeat === 0 ? 'beatline' : 'cellline'}
            x1={x(c)}
            x2={x(c)}
            y1={TOP}
            y2={TOP + ROW}
          />
        ))}
        {blocks.map((b) => (
          <g
            key={b.key}
            className={['block', b.tone, b.onClick ? 'click' : '', current !== null && current >= b.start && current < b.start + b.length ? 'on' : '']
              .filter(Boolean)
              .join(' ')}
            role={b.onClick ? 'button' : 'img'}
            tabIndex={b.onClick ? 0 : undefined}
            aria-label={b.label}
            onClick={b.onClick}
            onKeyDown={(e) => onKey(e, b)}
          >
            <rect x={x(b.start) + 3} y={TOP + 6} width={b.length * cellW - 6} height={ROW - 12} rx={6} />
            {b.text !== undefined && (
              <text x={x(b.start) + (b.length * cellW) / 2} y={TOP + ROW / 2}>
                {b.text}
              </text>
            )}
          </g>
        ))}
        {words?.map((w, c) => (
          <text
            key={c}
            className={['word', c % perBeat === 0 ? 'beat' : '', current === c ? 'on' : ''].filter(Boolean).join(' ')}
            x={x(c) + cellW / 2}
            y={TOP + ROW + 22}
          >
            {w}
          </text>
        ))}
      </svg>
    </div>
  );
}
