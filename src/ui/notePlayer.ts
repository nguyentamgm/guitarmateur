/**
 * Hearing one note when it is clicked on the neck, through Practice's own synth (src/audio) and
 * the page's one engine (`audioEngine.ts`): the Notes slider sets its level, the sound toggle
 * mutes it.
 */
import { isAudioSupported, pluck } from '../audio';
import { getEngine } from './audioEngine';

/** Sound `midi` now, for about half a second, at the Notes slider's level (0–1). */
export function playNote(midi: number, noteGain: number): void {
  if (!isAudioSupported()) return;
  try {
    const engine = getEngine();
    if (engine.ctx.state === 'suspended') void engine.ctx.resume();
    engine.noteOut.gain.value = Math.min(1, Math.max(0, noteGain));
    pluck(engine.ctx, engine.noteBus, engine.ctx.currentTime + 0.01, midi, 0.5);
  } catch {
    // No sound is not an error the learner can act on.
  }
}

/** The neck's `play` prop: the note player while sound is on, nothing while it is off. */
export const notePlayer = (soundOn: boolean, noteGain: number): ((midi: number) => void) | undefined =>
  soundOn ? (midi) => playNote(midi, noteGain) : undefined;
