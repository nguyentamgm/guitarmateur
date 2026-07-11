import { generateLick, type Lick } from '../lick';
import { TUNINGS, mergedBox, positions } from '../fretboard';
import type { AppState } from './appState';

export interface EntryLick {
  entryId: string;
  lick: Lick;
}

let cache: { inputKey: string; result: EntryLick[] } | null = null;

/** Derives one `Lick` per progression entry. Licks are never stored — only the seeds are — so this
 *  is the single place licks come from. Memoized on a JSON key of the relevant state slice: same
 *  inputs return the same array reference without recomputation. */
export function licksForState(state: AppState): EntryLick[] {
  const inputKey = JSON.stringify({
    tuningId: state.tuningId,
    key: state.key,
    positions: state.positions,
    progression: state.progression,
    level: state.level,
    targetRole: state.targetRole,
    resolveToNext: state.resolveToNext,
  });
  if (cache && cache.inputKey === inputKey) return cache.result;

  const pos = positions(TUNINGS[state.tuningId], state.key);
  const box = mergedBox(pos, state.positions);
  const entries = state.progression;

  const result: EntryLick[] = entries.map((entry, i) => {
    const next =
      state.resolveToNext && entries.length > 1 ? entries[(i + 1) % entries.length]!.chord : null;
    const lick = generateLick(box, entry.chord, next, {
      level: state.level,
      targetRole: state.targetRole,
      resolveToNext: state.resolveToNext,
      seed: entry.lickSeed,
      bars: entry.bars,
    });
    return { entryId: entry.id, lick };
  });

  cache = { inputKey, result };
  return result;
}
