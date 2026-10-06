/** Every lesson, in contents order. Add a lesson here and give it scenes in theory/src/ui. */
import type { Lesson } from './types';
import { barre } from './barre';
import { blues } from './blues';
import { chordTable } from './chord-table';
import { chords } from './chords';
import { electric } from './electric';
import { fretboard } from './fretboard';
import { keys } from './keys';
import { majorScale } from './major-scale';
import { pentatonic } from './pentatonic';
import { pentatonicMap } from './pentatonic-map';
import { rhythm } from './rhythm';

export * from './types';
export { barre } from './barre';
export { blues } from './blues';
export { chordTable } from './chord-table';
export { chords } from './chords';
export { electric } from './electric';
export { fretboard } from './fretboard';
export { keys } from './keys';
export { majorScale } from './major-scale';
export { pentatonic } from './pentatonic';
export { pentatonicMap } from './pentatonic-map';
export { rhythm } from './rhythm';

export const LESSONS: readonly Lesson[] = [
  fretboard as Lesson,
  rhythm as Lesson,
  majorScale as Lesson,
  pentatonicMap as Lesson,
  pentatonic as Lesson,
  blues as Lesson,
  electric as Lesson,
  chords as Lesson,
  barre as Lesson,
  chordTable as Lesson,
  keys as Lesson,
];

export const findLesson = (slug: string): Lesson | undefined => LESSONS.find((l) => l.slug === slug);
