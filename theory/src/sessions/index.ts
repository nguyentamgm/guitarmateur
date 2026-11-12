import { majorOrMinor } from './major-or-minor';
import type { PathId, Session, StageId } from './types';

export * from './types';
export * from './chordSpec';
export * from './strum';
export { majorOrMinor } from './major-or-minor';

export const SESSIONS: readonly Session[] = [majorOrMinor];

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
