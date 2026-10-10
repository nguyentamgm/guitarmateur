/** An outline around a box or position on the neck, its number in the top-left corner; `on` = selected. */
import { boxSpan, upright, type NeckGeometry } from './geometry';

export interface FramedSpan {
  readonly index: number;
  readonly minFret: number;
  readonly maxFret: number;
}

/** `leftHanded`: the neck is mirrored, so the number is kept upright. */
export function PositionFrame({ g, span, on = false, leftHanded = false }: { g: NeckGeometry; span: FramedSpan; on?: boolean; leftHanded?: boolean }) {
  const { left, right } = boxSpan(g, span.minFret, span.maxFret);
  return (
    <g className={on ? 'boxghost on' : 'boxghost'}>
      <rect x={left + 2} y={g.top - 12} width={right - left - 4} height={5 * g.stringGap + 24} rx={7} />
      <text x={left + 5} y={g.top - 5} transform={upright(left + 5, leftHanded)} textAnchor={leftHanded ? 'end' : undefined}>
        {span.index}
      </text>
    </g>
  );
}
