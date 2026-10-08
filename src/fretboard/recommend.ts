import type { Position } from './positions';

/**
 * Recommend the classic "box 1" — the position that starts on the tonic degree (index 0).
 * Returns a position `index`.
 */
export function recommendedPosition(positions: Position[]): number {
  const tonicBox = positions.find((p) => p.index === 0) ?? positions[0];
  return tonicBox!.index;
}
