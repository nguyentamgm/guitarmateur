/**
 * Notes on the neck as lessons draw them: a position with its sound, its spelled name in the
 * scale and its degree over the tonic. One shape for every scene, so no lesson redefines it.
 */
import { degreeOf, format, pc, scaleNotes, type DegreeLabel, type NoteName, type ScaleId } from '../music';
import { allPositions, midiAt, pitchAtPos, type FretPos } from './neck';

export interface NeckNote extends FretPos {
  readonly midi: number;
  /** Spelled in the scale's context: 'B♭' in F major, 'E♯' in F♯ major. */
  readonly name: string;
  /** Degree over the tonic: '1', 'b3'… */
  readonly degree: DegreeLabel;
  readonly isTonic: boolean;
}

/** The note at `pos`, spelled with the letters of `context` (the scale's notes). */
export function neckNote(pos: FretPos, tonic: NoteName, context: readonly NoteName[]): NeckNote {
  const pitch = pitchAtPos(pos, context);
  return { ...pos, midi: midiAt(pos), name: format(pitch), degree: degreeOf(tonic, pitch), isTonic: pc(pitch) === pc(tonic) };
}

/** Every note of a scale from fret 0 to `maxFret` on every string, grouped by degree (all the 1s, then the next…). */
export function scaleNeck(tonic: NoteName, scale: ScaleId, maxFret: number): NeckNote[] {
  const context = scaleNotes(tonic, scale);
  return context.flatMap((n) => allPositions(n, maxFret)).map((pos) => neckNote(pos, tonic, context));
}
