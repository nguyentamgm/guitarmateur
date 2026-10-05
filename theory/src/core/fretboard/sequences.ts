/**
 * Practice sequences over any ordered run of notes (K3.6): straight, groups of 3, groups of 4,
 * and skip-one ("1-3, 2-4…"). They return indexes into the run, lowest pitch = 0, so the same
 * patterns work on a pentatonic box, a three-notes-per-string position or one string. No tab is
 * typed by hand.
 */

export type SequenceId = 'straight' | 'threes' | 'fours' | 'skip';
export const SEQUENCE_IDS: readonly SequenceId[] = ['straight', 'threes', 'fours', 'skip'];

export type Direction = 'up' | 'down';

/** Each group as offsets from its first note. */
const GROUPS: Readonly<Record<SequenceId, readonly number[]>> = {
  straight: [0],
  threes: [0, 1, 2],
  fours: [0, 1, 2, 3],
  skip: [0, 2],
};

/**
 * The order to play `count` notes in. Up starts each group one note higher (1-2-3, 2-3-4…) and
 * stops when the last group reaches the top note; down is the same pattern mirrored from the top
 * (12-11-10, 11-10-9…). A run shorter than one group gives nothing.
 */
export function sequence(count: number, id: SequenceId, direction: Direction): number[] {
  const group = GROUPS[id];
  const span = group[group.length - 1]!;
  const out: number[] = [];
  for (let start = 0; start + span < count; start++) for (const g of group) out.push(start + g);
  return direction === 'up' ? out : out.map((i) => count - 1 - i);
}
