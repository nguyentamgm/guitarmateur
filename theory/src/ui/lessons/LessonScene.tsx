/** Draws one step of any lesson. Add a case here when a lesson is added to theory/src/lessons. */
import type * as Fretboard from '../../lessons/fretboard';
import type * as PentatonicMap from '../../lessons/pentatonic-map';
import { FretboardScene } from './FretboardScene';
import { PentatonicMapScene } from './PentatonicMapScene';

export function LessonScene({ slug, step, copy }: { slug: string; step: string; copy: unknown }) {
  switch (slug) {
    case 'fretboard':
      return <FretboardScene step={step as Fretboard.StepId} copy={copy as Fretboard.SceneCopy} />;
    case 'pentatonic-map':
      return <PentatonicMapScene step={step as PentatonicMap.StepId} copy={copy as PentatonicMap.SceneCopy} />;
    default:
      return null;
  }
}
