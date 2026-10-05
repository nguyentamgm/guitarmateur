/** Every lesson, in contents order. Add a lesson here and give it scenes in theory/src/ui. */
import type { Lesson } from './types';
import { blues } from './blues';
import { chords } from './chords';
import { electric } from './electric';
import { fretboard } from './fretboard';
import { majorScale } from './major-scale';
import { pentatonic } from './pentatonic';
import { pentatonicMap } from './pentatonic-map';
import { rhythm } from './rhythm';

export * from './types';
export { blues } from './blues';
export { chords } from './chords';
export { electric } from './electric';
export { fretboard } from './fretboard';
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
];

export const findLesson = (slug: string): Lesson | undefined => LESSONS.find((l) => l.slug === slug);
