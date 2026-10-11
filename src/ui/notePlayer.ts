/**
 * Hearing one note when it is clicked on the neck, through the page's one player
 * (`audioPlayer.ts`, the shared guitar sound): the Notes slider sets its level, the sound toggle
 * mutes it.
 */
import { isAudioSupported } from '@shared/core/audio';
import { getPlayer } from './audioPlayer';

/** Sound `midi` now, for about half a second, at the Notes slider's level (0–1). */
export function playNote(midi: number, noteGain: number): void {
  if (!isAudioSupported()) return;
  const player = getPlayer();
  player.setLevels({ note: noteGain });
  player.pluck(midi, 0.01, 0.5);
}

/** The neck's `play` prop: the note player while sound is on, nothing while it is off. */
export const notePlayer = (soundOn: boolean, noteGain: number): ((midi: number) => void) | undefined =>
  soundOn ? (midi) => playNote(midi, noteGain) : undefined;
