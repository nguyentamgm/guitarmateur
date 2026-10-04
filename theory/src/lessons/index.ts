/** Every lesson, in contents order. Add a lesson here and give it scenes in theory/src/ui. */
import type { Lesson } from './types';
import { fretboard } from './fretboard';
import { pentatonicMap } from './pentatonic-map';
import { rhythm } from './rhythm';

export * from './types';
export { fretboard } from './fretboard';
export { pentatonicMap } from './pentatonic-map';
export { rhythm } from './rhythm';

export const LESSONS: readonly Lesson[] = [fretboard as Lesson, rhythm as Lesson, pentatonicMap as Lesson];

export const findLesson = (slug: string): Lesson | undefined => LESSONS.find((l) => l.slug === slug);
