import { useTheory } from './context';
import { useAnyPlaying } from './playing';

/**
 * A polite status region: "Playing" while any clock plays, else "Stopped". It is there from the
 * first render, so only a change is read out, not the page load.
 */
export function PlayStatus() {
  const { ui } = useTheory();
  const any = useAnyPlaying();
  return (
    <p className="sr-only" role="status">
      {any ? ui.playStatus.playing : ui.playStatus.stopped}
    </p>
  );
}
