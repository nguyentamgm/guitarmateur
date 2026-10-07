export interface BarCell {
  /** Roman numeral: 'I', 'IV', 'V'. */
  readonly degree: string;
  /** Chord symbol: 'A7', 'D5'. */
  readonly symbol: string;
}

/** A small mark in a bar's corner: '✓ 3' or '✗', good or not, with a spoken description. */
export interface BarMark {
  readonly text: string;
  readonly good: boolean;
  readonly description: string;
}

/**
 * A chord form as lines of four bars (K5.4): the degree above, the chord below, the bar being
 * heard filled, and an optional mark per bar. Pure drawing; the bars come from a lesson.
 */
export function BarGrid({ label, bars, current, marks }: { label: string; bars: readonly BarCell[]; current: number | null; marks?: readonly (BarMark | null)[] }) {
  const W = 132;
  const H = 62;
  const GAP = 8;
  const rows = Math.ceil(bars.length / 4);
  return (
    <div className="scroll">
      <svg className="bars" viewBox={`0 0 ${4 * W + 3 * GAP} ${rows * H + (rows - 1) * GAP}`} style={{ minWidth: 300, maxWidth: 720 }} role="img" aria-label={label}>
        {bars.map((b, i) => {
          const x = (i % 4) * (W + GAP);
          const y = Math.floor(i / 4) * (H + GAP);
          return (
            <g key={i} className={current === i ? 'bar on' : 'bar'}>
              <rect x={x} y={y} width={W} height={H} rx={8} />
              <text className="deg" x={x + W / 2} y={y + 20}>
                {b.degree}
              </text>
              <text className="sym" x={x + W / 2} y={y + 43}>
                {b.symbol}
              </text>
              {marks?.[i] && (
                <text className={marks[i]!.good ? 'mark good' : 'mark bad'} x={x + W - 8} y={y + 16}>
                  <title>{marks[i]!.description}</title>
                  {marks[i]!.text}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
