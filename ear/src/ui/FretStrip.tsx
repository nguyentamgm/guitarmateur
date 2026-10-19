/**
 * Level 15's answers (#263): the thickest string, frets 0–12, each a large button with its number
 * and, under it, the guitar's fret markers (3, 5, 7, 9, and two at 12) to find it by. The learner
 * plays along on their own guitar, then taps the fret that sounded like home. Styles: the answer
 * strip's `.strip`, `.cell` in ear.css, thirteen cells wide (`.strip.frets13`).
 */
import { DOUBLE_INLAYS, INLAYS } from '@shared/ui/geometry';
import { fill, type UiStrings } from '../i18n';

const marker = (fret: number) =>
  DOUBLE_INLAYS.includes(fret) ? '••' : INLAYS.includes(fret) ? '•' : '';

export function FretStrip({
  ui,
  frets,
  answer,
  onAnswer,
}: {
  ui: UiStrings;
  frets: readonly number[];
  /** Once answered: whether a fret is right (for E, both 0 and 12 are), and the one picked. */
  answer: { readonly right: (fret: number) => boolean; readonly picked: number } | null;
  onAnswer(fret: number): void;
}) {
  return (
    <div className="strip frets13" role="group" aria-label={ui.fretStripLabel}>
      {frets.map((fret) => {
        const right = answer !== null && answer.right(fret);
        const picked = answer !== null && fret === answer.picked && !right;
        const cls = ['cell', 'in', right ? 'right' : '', picked ? 'picked' : '']
          .filter(Boolean)
          .join(' ');
        return (
          <button
            key={fret}
            type="button"
            className={cls}
            data-fret={fret}
            data-marker={marker(fret)}
            aria-disabled={answer !== null}
            aria-label={fill(ui.fretCellLabel, { fret })}
            onClick={() => onAnswer(fret)}
          >
            <span className="cell-dot">{fret}</span>
          </button>
        );
      })}
    </div>
  );
}
