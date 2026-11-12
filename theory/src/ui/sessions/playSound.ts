import type { Player } from '../../core/audio';
import { strumDelays } from '../../core/rhythm';
import type { Sound } from '../../sessions/sound';

export function playSound(player: Player, sound: Sound): void {
  player.cancel();

  const secPerBeat = 60 / sound.bpm;

  for (const event of sound.events) {
    const delay = event.at * secPerBeat;
    const lengthSec = (event.length ?? 1) * secPerBeat;

    if (event.click) {
      player.click(event.click === 'accent', delay);
    }

    if (event.midis && event.midis.length > 0) {
      if (event.strum) {
        for (const s of strumDelays(event.midis, 'down', 0.02)) {
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
