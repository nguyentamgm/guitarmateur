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

    if (event.midis && event.midis.length > 0) {
      if (event.strum) {
        for (const s of strumDelays(event.midis, 'down', strumSpread)) {
          player.pluck(s.item, delay + s.delay, lengthSec);
        }
      } else {
        for (const m of event.midis) {
          player.pluck(m, delay, lengthSec);
        }
      }
    }
  }
}
