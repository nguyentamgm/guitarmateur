import type { DrillId } from '../types';
import { bendPitch } from './bendPitch';
import { callAndResponse } from './callAndResponse';
import { chordCount } from './chordCount';
import { finished } from './finished';
import { fourOrFive } from './fourOrFive';
import { hasBlueNote } from './hasBlueNote';
import { keyMode } from './keyMode';
import { minorBar } from './minorBar';
import { moves } from './moves';
import { oddChord } from './oddChord';
import { onBeat } from './onBeat';
import { pentatonicOrMajor } from './pentatonicOrMajor';
import { pentaMode } from './pentaMode';
import { pickOrLegato } from './pickOrLegato';
import { quality } from './quality';
import { rootNote } from './rootNote';
import { octaveOrFifth } from './octaveOrFifth';
import { rootAcrossStrings } from './rootAcrossStrings';
import { sameChord } from './sameChord';
import { sequenceKind } from './sequenceKind';
import { seventh } from './seventh';
import { straightOrShuffle } from './straightOrShuffle';
import { meter } from './meter';
import type { Drill } from './types';

export * from './types';
export { bendPitch } from './bendPitch';
export { callAndResponse } from './callAndResponse';
export { chordCount } from './chordCount';
export { finished } from './finished';
export { fourOrFive } from './fourOrFive';
export { hasBlueNote } from './hasBlueNote';
export { keyMode } from './keyMode';
export { meter } from './meter';
export { minorBar } from './minorBar';
export { moves } from './moves';
export { oddChord } from './oddChord';
export { onBeat } from './onBeat';
export { pentatonicOrMajor } from './pentatonicOrMajor';
export { pentaMode } from './pentaMode';
export { pickOrLegato } from './pickOrLegato';
export { quality } from './quality';
export { rootNote } from './rootNote';
export { octaveOrFifth } from './octaveOrFifth';
export { rootAcrossStrings } from './rootAcrossStrings';
export { sameChord } from './sameChord';
export { sequenceKind } from './sequenceKind';
export { seventh } from './seventh';
export { straightOrShuffle } from './straightOrShuffle';

export const DRILLS: Partial<Record<DrillId, Drill>> = {
  pentatonicOrMajor,
  pentaMode,
  quality,
  onBeat,
  finished,
  rootNote,
  octaveOrFifth,
  rootAcrossStrings,
  sequenceKind,
  straightOrShuffle,
  hasBlueNote,
  bendPitch,
  pickOrLegato,
  callAndResponse,
  moves,
  chordCount,
  fourOrFive,
  minorBar,
  keyMode,
  seventh,
  meter,
  sameChord,
  oddChord,
};

