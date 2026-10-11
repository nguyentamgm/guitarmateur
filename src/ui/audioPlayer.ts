/**
 * The page's one sound (the shared guitar, Theory's: `@shared/core/audio`), shared by lick playback
 * (`useTransport`) and the notes clicked on a neck (`notePlayer`), so the volume sliders and the
 * sound toggle reach both. The player creates its AudioContext on the first sound, which is always
 * a user gesture (a click), as browsers require; it lives as long as the page.
 */
import { createPlayer, type Player } from '@shared/core/audio';

let player: Player | null = null;

export function getPlayer(): Player {
  player ??= createPlayer();
  return player;
}

/** Test hook: forget the player. */
export function resetPlayerForTests(): void {
  player = null;
}
