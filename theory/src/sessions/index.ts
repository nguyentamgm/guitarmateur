import { beatAndBar } from './beat-and-bar';
import { chordChanges } from './chord-changes';
import { chordFamily } from './chord-family';
import { findTheRoot } from './find-the-root';
import { majorOrMinor } from './major-or-minor';
import { melodyByEar } from './melody-by-ear';
import type { PathId, Session, StageId } from './types';

export * from './types';
export * from './changes';
export * from './chordSpec';
export * from './echo';
export * from './strum';
export { beatAndBar } from './beat-and-bar';
export { chordChanges } from './chord-changes';
export { chordFamily } from './chord-family';
export { findTheRoot } from './find-the-root';
export { majorOrMinor } from './major-or-minor';
export { melodyByEar } from './melody-by-ear';

export const SESSIONS: readonly Session[] = [
  majorOrMinor,
  beatAndBar,
  findTheRoot,
  melodyByEar,
  chordFamily,
  chordChanges,
];

export const STAGES: readonly StageId[] = ['A', 'B', 'C', 'D'];

export const findSession = (slug: string): Session | undefined => SESSIONS.find((s) => s.slug === slug);

export function sessionNeighbours(slug: string): { prev?: Session; next?: Session } {
  const i = SESSIONS.findIndex((s) => s.slug === slug);
  if (i < 0) return {};
  return { prev: SESSIONS[i - 1], next: SESSIONS[i + 1] };
}

export function sessionsOf(path: PathId, stage?: StageId): readonly Session[] {
  return SESSIONS.filter((s) => s.path === path && (stage === undefined || s.stage === stage));
}
