/**
 * The neck every scene draws on: the shared Fretboard (shared/ui/Fretboard.tsx), sounding through
 * Theory's player. Scenes add their own SVG (lines, arcs) through `children`, drawn under the dots.
 */
import type { ComponentProps } from 'react';
import { Fretboard as SharedFretboard } from '@shared/ui/Fretboard';
import { useTheory } from './context';

export type { DotTone, FretDot, LabelMode } from '@shared/ui/Fretboard';

export function Fretboard(props: Omit<ComponentProps<typeof SharedFretboard>, 'play'>) {
  const { player } = useTheory();
  return <SharedFretboard {...props} play={(midi) => player.pluck(midi)} />;
}
