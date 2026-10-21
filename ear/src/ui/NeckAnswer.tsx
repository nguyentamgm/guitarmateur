/**
 * The answer on the neck (#224): after each answer, a five-fret window with the root on string 6
 * or 5, the active degrees, and the note heard as the target, so the sound meets the fingers.
 * Clicking a dot plays it. Level 14 shows it after each answer (#262).
 */
import type { Player } from '@shared/core/audio';
import { Fretboard, type FretDot } from '@shared/ui/Fretboard';
import { useNeckGeometry } from '@shared/ui/useNeckGeometry';
import type { DotWords } from '@shared/ui/dotName';
import { neckWindow } from '../core/position';
import type { Question } from '../core/questions';
import { fill, type UiStrings } from '../i18n';
import type { DegreeLabel } from '@shared/core/music';
import { degreeInKey, keyText, noteText } from './labels';

/**
 * Wider apart than the shared neck's strings (26): a box holds a dot on every string, and at phone
 * width the window is drawn a little under full size, so each dot still keeps 40px to tap (#262).
 * The dots are near twice the shared neck's (radius 11), so their labels, the fret numbers and the
 * string names reach the beginner screens' 18px (#283); the frets are a little narrower (48, not
 * 52) so that the window is drawn at full size on a phone.
 */
const SIZES = { stringGap: 46, dotRadius: 20, fretWidth: 48 };

export function NeckAnswer({
  ui,
  question: q,
  active,
  player,
}: {
  ui: UiStrings;
  question: Question;
  active: readonly DegreeLabel[];
  player: Player;
}) {
  const w = neckWindow(q.key, q, active);
  // Fret 0 needs the nut; higher up, the drawing starts at the wire before the window's first fret.
  const geometry = useNeckGeometry(w.hi, { ...SIZES, from: w.lo === 0 ? 0 : w.lo - 1 });
  const dots: FretDot[] = w.dots.map((d) => ({
    key: `${d.string}-${d.fret}`,
    string: d.string,
    fret: d.fret,
    midi: d.midi,
    label: degreeInKey(q.key, d.degree),
    degree: degreeInKey(q.key, d.degree),
    name: noteText(q.key, d.degree),
    tone: d.role === 'target' ? 'target' : d.role === 'root' || d.degree === '1' ? 'home' : 'soft',
    halo: d.role === 'target',
  }));
  const words: DotWords = {
    fret: (n) => fill(ui.neckWords.fret, { n }),
    string: (n) => fill(ui.neckWords.string, { n }),
    root: ui.neckWords.root,
    tones: { target: ui.neckWords.target },
  };
  return (
    <div className="neck-answer">
      <Fretboard
        geometry={geometry}
        dots={dots}
        label={fill(ui.neckLabel, {
          degree: degreeInKey(q.key, q.degree),
          note: noteText(q.key, q.degree),
          key: keyText(ui, q.key),
          string: w.root.string,
        })}
        words={words}
        play={(midi) => player.pluck(midi, 0, 1)}
      />
    </div>
  );
}
