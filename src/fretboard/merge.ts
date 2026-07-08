import type { FretNote } from './neck';
import type { Position } from './positions';

export interface Box {
  notes: FretNote[];
  minFret: number;
  maxFret: number;
}

/** Union of the selected positions' notes, deduped by (string, fret); span across the selection. */
export function mergedBox(positions: Position[], selected: number[]): Box {
  const sel = positions.filter((p) => selected.includes(p.index));
  const byCell = new Map<string, FretNote>();
  for (const p of sel) {
    for (const n of p.notes) {
      const key = `${n.string}:${n.fret}`;
      // Prefer a base note over a decoration if both land on the same cell across positions.
      const existing = byCell.get(key);
      if (!existing || (existing.isDecoration && !n.isDecoration)) byCell.set(key, n);
    }
  }
  const minFret = Math.min(...sel.map((p) => p.minFret));
  const maxFret = Math.max(...sel.map((p) => p.maxFret));
  return { notes: [...byCell.values()], minFret, maxFret };
}

/**
 * Whether two positions (by `index`) are neighbors in display (minFret-sorted) order — the UI's
 * rule for which pairs may be combined. Kept here so it's testable without React.
 */
export function areAdjacent(positions: Position[], a: number, b: number): boolean {
  const order = [...positions].sort((x, y) => x.minFret - y.minFret);
  const ia = order.findIndex((p) => p.index === a);
  const ib = order.findIndex((p) => p.index === b);
  if (ia === -1 || ib === -1) return false;
  return Math.abs(ia - ib) === 1;
}
