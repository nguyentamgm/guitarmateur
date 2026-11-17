import { browserStorage, type KeyValue } from '../../platform/storage';

export type StrumSpeed = 'slow' | 'medium' | 'fast';

export const STRUM_SPEEDS: readonly StrumSpeed[] = ['slow', 'medium', 'fast'];

/** Delay between consecutive strings when strumming (spread), in seconds. */
export const STRUM_SPREADS: Readonly<Record<StrumSpeed, number>> = {
  slow: 0.08,
  medium: 0.04,
  fast: 0.018,
};

export const STRUM_SPEED_STORAGE_KEY = 'theory.strumSpeed';

export function loadStrumSpeed(storage: KeyValue | null = browserStorage()): StrumSpeed {
  try {
    const raw = storage?.getItem(STRUM_SPEED_STORAGE_KEY);
    if (raw === 'slow' || raw === 'medium' || raw === 'fast') return raw;
  } catch {
    // blocked or private mode
  }
  return 'medium';
}

export function saveStrumSpeed(
  speed: StrumSpeed,
  storage: KeyValue | null = browserStorage(),
): void {
  try {
    storage?.setItem(STRUM_SPEED_STORAGE_KEY, speed);
  } catch {
    // blocked or private mode
  }
}
