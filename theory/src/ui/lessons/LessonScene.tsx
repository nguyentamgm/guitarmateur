/** Draws one step of any lesson. Add a case here when a lesson is added to theory/src/lessons. */
import type * as Blues from '../../lessons/blues';
import type * as Electric from '../../lessons/electric';
import type * as Fretboard from '../../lessons/fretboard';
import type * as MajorScale from '../../lessons/major-scale';
import type * as Pentatonic from '../../lessons/pentatonic';
import type * as PentatonicMap from '../../lessons/pentatonic-map';
import type * as Rhythm from '../../lessons/rhythm';
import { BluesScene } from './BluesScene';
import { ElectricScene } from './ElectricScene';
import { FretboardScene } from './FretboardScene';
import { MajorScaleScene } from './MajorScaleScene';
import { PentatonicMapScene } from './PentatonicMapScene';
import { PentatonicScene } from './PentatonicScene';
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
    case 'pentatonic':
      return <PentatonicScene step={step as Pentatonic.StepId} copy={copy as Pentatonic.SceneCopy} />;
    case 'blues':
      return <BluesScene step={step as Blues.StepId} copy={copy as Blues.SceneCopy} />;
    case 'electric':
      return <ElectricScene step={step as Electric.StepId} copy={copy as Electric.SceneCopy} />;
    default:
      return null;
  }
}
