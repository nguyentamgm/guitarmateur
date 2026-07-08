import { pitch, type Pitch } from '../music';

export interface Tuning {
  id: string;
  name: string;
  /** Open-string pitches, index 0 = lowest-pitched string. */
  strings: Pitch[];
}

/**
 * v1 UI exposes only `standard`; `dropD` exists from day one so every engine function stays
 * honestly tuning-parameterized (and is exercised in tests). String count is `strings.length` —
 * never a literal 6.
 */
export const TUNINGS = {
  standard: {
    id: 'standard',
    name: 'Standard',
    strings: [pitch('E', 0, 2), pitch('A', 0, 2), pitch('D', 0, 3), pitch('G', 0, 3), pitch('B', 0, 3), pitch('E', 0, 4)],
  },
  dropD: {
    id: 'dropD',
    name: 'Drop D',
    strings: [pitch('D', 0, 2), pitch('A', 0, 2), pitch('D', 0, 3), pitch('G', 0, 3), pitch('B', 0, 3), pitch('E', 0, 4)],
  },
} satisfies Record<string, Tuning>;

export type TuningId = keyof typeof TUNINGS;
