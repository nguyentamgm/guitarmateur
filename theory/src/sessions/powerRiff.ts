import { homeFret } from '../core/fretboard';
import { interval, type NoteName } from '../core/music';
import { powerView } from '../lessons/electric';

export const POWER_RIFF_BPM = 96;
export const POWER_CHORD_LENGTH = 0.45; // beats

/** Two eighth-note attacks per chord on beats 1–3. Beat 4 is a rest. */
export function powerRiff(tonic: NoteName) {
  const start = homeFret(tonic, 6);
  return ['1', 'b3', '4'].flatMap((degree, beat) => {
    const { symbol, notes } = powerView(
      { string: 6, fret: start + interval(degree).semitones },
      false,
    );
    const midis = notes.map((note) => note.midi);
    return [0, 1].map((eighth) => ({ cell: beat * 2 + eighth, symbol, midis }));
  });
}
