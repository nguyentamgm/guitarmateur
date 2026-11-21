import { beatAndBar } from './beat-and-bar';
import { bendsAndVibrato } from './bends-and-vibrato';
import { changeKey } from './change-key';
import { chordChanges } from './chord-changes';
import { chordFamily } from './chord-family';
import { chordTonesInTheBox } from './chord-tones-in-the-box';
import { doubleStopsAndBoogie } from './double-stops-and-boogie';
import { findTheRoot } from './find-the-root';
import { firstBluesLicks } from './first-blues-licks';
import { fiveBoxesAndSequences } from './five-boxes-and-sequences';
import { firstSong } from './first-song';
import { guideTones } from './guide-tones';
import { legatoAndSlides } from './legato-and-slides';
import { majorOrMinor } from './major-or-minor';
import { melodyByEar } from './melody-by-ear';
import { minorPentatonicBox } from './minor-pentatonic-box';
import { pentatonicKeysAndModes } from './pentatonic-keys-and-modes';
import { powerChordsAndPalmMute } from './power-chords-and-palm-mute';
import { octaveShapes } from './octave-shapes';
import { minorKeys } from './minor-keys';
import { oneFourFive } from './one-four-five';
import { seventhChords } from './seventh-chords';
import { shuffleAndTwelveBar } from './shuffle-and-twelve-bar';
import { theBlueNote } from './the-blue-note';
import { theSixChord } from './the-six-chord';
import { threeFour } from './three-four';
import { barreChords } from './barre-chords';
import { newSong } from './new-song';
import { outsideChords } from './outside-chords';
import type { PathId, Session, StageId } from './types';

export * from './types';
export { standardBlues12 } from './blues';
export * from './changes';
export * from './chordSpec';
export * from './echo';
export * from './fill';
export * from './songs';
export * from './strum';
export * from './transposeTable';
export { barreChords } from './barre-chords';
export { beatAndBar } from './beat-and-bar';
export { bendsAndVibrato } from './bends-and-vibrato';
export { changeKey } from './change-key';
export { chordChanges } from './chord-changes';
export { chordFamily } from './chord-family';
export { chordTonesInTheBox } from './chord-tones-in-the-box';
export { doubleStopsAndBoogie } from './double-stops-and-boogie';
export { findTheRoot } from './find-the-root';
export { firstBluesLicks } from './first-blues-licks';
export { fiveBoxesAndSequences } from './five-boxes-and-sequences';
export { firstSong } from './first-song';
export { guideTones } from './guide-tones';
export { legatoAndSlides } from './legato-and-slides';
export { majorOrMinor } from './major-or-minor';
export { melodyByEar } from './melody-by-ear';
export { minorKeys } from './minor-keys';
export { minorPentatonicBox } from './minor-pentatonic-box';
export { newSong } from './new-song';
export { oneFourFive } from './one-four-five';
export { outsideChords } from './outside-chords';
export { pentatonicKeysAndModes } from './pentatonic-keys-and-modes';
export { powerChordsAndPalmMute } from './power-chords-and-palm-mute';
export { octaveShapes } from './octave-shapes';
export { seventhChords } from './seventh-chords';
export { shuffleAndTwelveBar } from './shuffle-and-twelve-bar';
export { theBlueNote } from './the-blue-note';
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
  barreChords,
  outsideChords,
  newSong,
  minorPentatonicBox,
  pentatonicKeysAndModes,
  octaveShapes,
  fiveBoxesAndSequences,
  shuffleAndTwelveBar,
  theBlueNote,
  bendsAndVibrato,
  legatoAndSlides,
  firstBluesLicks,
  powerChordsAndPalmMute,
  doubleStopsAndBoogie,
  chordTonesInTheBox,
  guideTones,
];

export const PATH_STAGES: Readonly<Record<PathId, readonly StageId[]>> = {
  accompany: ['A', 'B', 'C', 'D'],
  lead: ['E', 'F', 'G', 'H'],
};

export const STAGES: readonly StageId[] = [...PATH_STAGES.accompany, ...PATH_STAGES.lead];

export const findSession = (slug: string): Session | undefined => SESSIONS.find((s) => s.slug === slug);

export function sessionNeighbours(slug: string): { prev?: Session; next?: Session } {
  const i = SESSIONS.findIndex((s) => s.slug === slug);
  if (i < 0) return {};
  return { prev: SESSIONS[i - 1], next: SESSIONS[i + 1] };
}

export function sessionsOf(path: PathId, stage?: StageId): readonly Session[] {
  return SESSIONS.filter((s) => s.path === path && (stage === undefined || s.stage === stage));
}
