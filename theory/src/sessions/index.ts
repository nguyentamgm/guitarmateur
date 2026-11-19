import { beatAndBar } from './beat-and-bar';
import { changeKey } from './change-key';
import { chordChanges } from './chord-changes';
import { chordFamily } from './chord-family';
import { findTheRoot } from './find-the-root';
import { firstSong } from './first-song';
import { majorOrMinor } from './major-or-minor';
import { melodyByEar } from './melody-by-ear';
import { minorKeys } from './minor-keys';
import { oneFourFive } from './one-four-five';
import { seventhChords } from './seventh-chords';
import { theSixChord } from './the-six-chord';
import { threeFour } from './three-four';
import type { PathId, Session, StageId } from './types';

export * from './types';
export * from './changes';
export * from './chordSpec';
export * from './echo';
export * from './fill';
export * from './songs';
export * from './strum';
export * from './transposeTable';
export { beatAndBar } from './beat-and-bar';
export { changeKey } from './change-key';
export { chordChanges } from './chord-changes';
export { chordFamily } from './chord-family';
export { findTheRoot } from './find-the-root';
export { firstSong } from './first-song';
export { majorOrMinor } from './major-or-minor';
export { melodyByEar } from './melody-by-ear';
export { minorKeys } from './minor-keys';
export { oneFourFive } from './one-four-five';
export { seventhChords } from './seventh-chords';
export { theSixChord } from './the-six-chord';
export { threeFour } from './three-four';

export const SESSIONS: readonly Session[] = [
  majorOrMinor,
  beatAndBar,
  findTheRoot,
  melodyByEar,
  chordFamily,
  chordChanges,
  oneFourFive,
  firstSong,
  changeKey,
  theSixChord,
  minorKeys,
  seventhChords,
  threeFour,
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
