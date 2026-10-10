/**
 * Hearing one note when it is clicked on the neck, through Practice's own synth (src/audio). The
 * engine (an AudioContext) is created on the first click — a user gesture, as browsers require —
 * and shared by every neck on the page.
 */
import { createEngine, isAudioSupported, pluck, type AudioEngine } from '../audio';

let engine: AudioEngine | null = null;

/** Sound `midi` now, for about half a second. Does nothing where Web Audio is missing. */
export function playNote(midi: number): void {
  if (!isAudioSupported()) return;
  try {
    engine ??= createEngine();
    if (engine.ctx.state === 'suspended') void engine.ctx.resume();
    pluck(engine.ctx, engine.noteBus, engine.ctx.currentTime + 0.01, midi, 0.5);
  } catch {
    // No sound is not an error the learner can act on.
  }
}

/** The neck's `play` prop: the note player while sound is on, nothing while it is off. */
export const notePlayer = (soundOn: boolean): ((midi: number) => void) | undefined => (soundOn ? playNote : undefined);
