/**
 * Level 14's answers as one string from the root (#262): fret 0 is 1, fret 3 is ♭3, fret 7 is 5…
 * each degree as the key spells it (♭5 in a minor key). Degrees that are off are dimmed and disabled
 * (and hidden at phone width); the mode's scale notes are dots. Styles: `.strip`, `.cell` in ear.css.
 */
import type { DegreeLabel, Key } from '@shared/core/music';
import { DEGREES, degreeId, diatonicDegrees } from '../core/degrees';
import { fill, type UiStrings } from '../i18n';
import { degreeInKey } from './labels';

export function AnswerStrip({
  ui,
  musicKey,
  active,
  answer,
  onAnswer,
}: {
  ui: UiStrings;
  musicKey: Key;
  active: readonly DegreeLabel[];
  /** Once answered: the right degree, and the one picked. */
  answer: { readonly right: DegreeLabel; readonly picked: DegreeLabel } | null;
  onAnswer(degree: DegreeLabel): void;
}) {
  const on = new Set(active.map(degreeId));
  const scale = new Set(diatonicDegrees(musicKey.mode).map(degreeId));
  return (
    <div className="strip" role="group" aria-label={ui.stripLabel}>
      {DEGREES.map(({ label }, fret) => {
        const isOn = on.has(label);
        const right = answer !== null && label === degreeId(answer.right);
        const picked = answer !== null && label === degreeId(answer.picked) && !right;
        const cls = [
          'cell',
          scale.has(label) ? 'in' : 'out',
          isOn ? '' : 'off',
          right ? 'right' : '',
          picked ? 'picked' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <button
            key={label}
            type="button"
            className={cls}
            data-degree={label}
            data-fret={fret}
            disabled={!isOn}
            aria-disabled={answer !== null}
            aria-label={fill(ui.cellLabel, {
              shown: degreeInKey(musicKey, label),
              spoken: ui.spoken[label as keyof UiStrings['spoken']],
              fret,
            })}
            onClick={() => onAnswer(label)}
          >
            <span className="cell-dot">{degreeInKey(musicKey, label)}</span>
          </button>
        );
      })}
      {/* Fret numbers in a row of their own: inside a button they would run into its label. */}
      <div className="frets" aria-hidden="true">
        {DEGREES.map(({ label }, fret) => (
          <span key={label} className={on.has(label) ? '' : 'off'}>
            {fret}
          </span>
        ))}
      </div>
    </div>
  );
}
