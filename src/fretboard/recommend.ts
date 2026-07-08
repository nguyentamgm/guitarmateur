import type { Position } from './positions';

/**
 * v1 heuristic: recommend the classic "box 1" — the position that starts on the tonic degree
 * (index 0). Kept as a function so smarter heuristics (user level, practice history) can replace
 * it without touching the UI. Returns a position `index`.
 */
export function recommendedPosition(positions: Position[]): number {
  const tonicBox = positions.find((p) => p.index === 0) ?? positions[0];
  return tonicBox!.index;
}
