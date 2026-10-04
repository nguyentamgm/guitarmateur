/** Draws one step of any lesson. Add a case here when a lesson is added to theory/src/lessons. */
import type { SceneCopy, StepId } from '../../lessons/pentatonic-map';
import { PentatonicMapScene } from './PentatonicMapScene';

export function LessonScene({ slug, step, copy }: { slug: string; step: string; copy: unknown }) {
  switch (slug) {
    case 'pentatonic-map':
      return <PentatonicMapScene step={step as StepId} copy={copy as SceneCopy} />;
    default:
      return null;
  }
}
