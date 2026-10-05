/** Draws one step of any lesson. Add a case here when a lesson is added to theory/src/lessons. */
import type * as Fretboard from '../../lessons/fretboard';
import type * as MajorScale from '../../lessons/major-scale';
import type * as PentatonicMap from '../../lessons/pentatonic-map';
import type * as Rhythm from '../../lessons/rhythm';
import { FretboardScene } from './FretboardScene';
import { MajorScaleScene } from './MajorScaleScene';
import { PentatonicMapScene } from './PentatonicMapScene';
import { RhythmScene } from './RhythmScene';

export function LessonScene({ slug, step, copy }: { slug: string; step: string; copy: unknown }) {
  switch (slug) {
    case 'fretboard':
      return <FretboardScene step={step as Fretboard.StepId} copy={copy as Fretboard.SceneCopy} />;
    case 'rhythm':
      return <RhythmScene step={step as Rhythm.StepId} copy={copy as Rhythm.SceneCopy} />;
    case 'major-scale':
      return <MajorScaleScene step={step as MajorScale.StepId} copy={copy as MajorScale.SceneCopy} />;
    case 'pentatonic-map':
      return <PentatonicMapScene step={step as PentatonicMap.StepId} copy={copy as PentatonicMap.SceneCopy} />;
    default:
      return null;
  }
}
