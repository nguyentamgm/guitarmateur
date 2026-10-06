/** The index finger across the strings of a barre shape, drawn under the dots; nothing at fret 0 or without a shape. */
import type { BarreShape } from '../core/fretboard';
import type { NeckGeometry } from './geometry';

export function BarreBar({ g, view, faint = false }: { g: NeckGeometry; view: { readonly shape: BarreShape | null; readonly fret: number }; faint?: boolean }) {
  if (view.fret === 0 || view.shape === null) return null;
  const top = g.y(1) - 13;
  const bottom = g.y(view.shape === 'E' ? 6 : 5) + 13;
  return <rect className={faint ? 'barrebar faint' : 'barrebar'} x={g.x(view.fret) - 13} y={top} width={26} height={bottom - top} rx={13} />;
}
