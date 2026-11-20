import type { Player } from '../../core/audio';
import { strumDelays } from '../../core/rhythm';
import type { Sound } from '../../sessions/sound';

export interface PlaySoundOptions {
  /** Optional silence before playback begins, in seconds. Defaults to 0. */
  readonly leadInSec?: number;
  /** Delay between consecutive strings when strumming, in seconds. Defaults to 0.02. */
  readonly strumSpreadSec?: number;
}

export function playSound(player: Player, sound: Sound, opts?: PlaySoundOptions): void {
  player.cancel();

  const secPerBeat = 60 / sound.bpm;
  const leadIn = opts?.leadInSec ?? 0;
  const strumSpread = opts?.strumSpreadSec ?? 0.02;

  for (const event of sound.events) {
    const delay = leadIn + event.at * secPerBeat;
    const lengthSec = (event.length ?? 1) * secPerBeat;

    if (event.click) {
      player.click(event.click === 'accent', delay);
    }

    const spread = event.strum ? strumSpread : 0;
    for (const note of strumDelays(event.midis ?? [], 'down', spread)) {
      const onset = delay + note.delay;
      if (event.mute) player.mute(note.item, onset);
      else player.pluck(note.item, onset, lengthSec, event.glide);
    }
  }
}
