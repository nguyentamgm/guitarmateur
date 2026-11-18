import type { Player } from '../../core/audio';
import { beatSeconds, strumDelays } from '../../core/rhythm';
import type { StrumStep } from '../../sessions/strum';

/**
 * Plays one step of a strumming pattern: metronome click if due, and chord strum if due.
 * `spread` is the gap between consecutive strings in seconds (no default; caller passes the setting).
 */
export function playStrumStep(
  player: Player,
  step: StrumStep,
  midis: readonly number[] | undefined,
  delay: number,
  bpm: number,
  spread: number,
): void {
  if (step.click) {
    player.click(step.click === 'accent', delay);
  }

  if (step.stroke && midis && midis.length > 0) {
    const strokeMidis = step.stroke === 'down' ? midis : midis.slice(-4);
    for (const s of strumDelays(strokeMidis, step.stroke, spread)) {
      player.pluck(s.item, delay + s.delay, beatSeconds(bpm));
    }
  }
}
