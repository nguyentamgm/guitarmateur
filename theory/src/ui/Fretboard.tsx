/**
 * The neck every scene draws on: the shared Fretboard (shared/ui/Fretboard.tsx), sounding through
 * Theory's player. Scenes add their own SVG (lines, arcs) through `children`, drawn under the dots.
 */
import { useMemo, type ComponentProps } from 'react';
import { Fretboard as SharedFretboard } from '@shared/ui/Fretboard';
import { fill } from '../i18n';
import { useTheory } from './context';

export type { DotTone, FretDot, LabelMode } from '@shared/ui/Fretboard';

export function Fretboard(props: Omit<ComponentProps<typeof SharedFretboard>, 'play'>) {
  const { player, ui } = useTheory();
  const words = useMemo(
    () => ({ fret: (n: number) => fill(ui.dotFret, { n }), string: (n: number) => fill(ui.dotString, { n }), root: ui.dotRoot, tones: ui.dotTones }),
    [ui],
  );
  return <SharedFretboard {...props} words={words} play={(midi) => player.pluck(midi)} />;
}
