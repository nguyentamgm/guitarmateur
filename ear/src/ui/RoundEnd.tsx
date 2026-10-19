/**
 * The end of a round (docs/ear-levels.md "End of a round"): the score and the ten dots, then "Level
 * done!" with the next level, or "almost" with another round. Passing the last level finishes the
 * path, with a link back to Practice.
 */
import type { Level } from '../core/levels';
import { passes, type RoundState } from '../core/round';
import { fill, type UiStrings } from '../i18n';
import { levelText, playText } from './levelWords';

export function RoundEnd({
  ui,
  state,
  results,
  next,
  onNext,
  onAgain,
  onBack,
  practiceHref = null,
  finishedHref = null,
}: {
  ui: UiStrings;
  state: RoundState;
  results: readonly boolean[];
  /** The level after this one, when it can be played. */
  next: Level | null;
  onNext(level: Level): void;
  onAgain(): void;
  onBack(): void;
  /** Where Practice opens on the scale this level taught, when it links there once passed. */
  practiceHref?: string | null;
  /** On the last level: Practice, where passing it sends the learner, every level done. */
  finishedHref?: string | null;
}) {
  const { level, right } = state;
  const total = state.rules.questions;
  const passed = passes(state);
  return (
    <section className="board lv-screen lv-end" aria-labelledby="lv-end">
      <p className="lv-muted">
        {fill(ui.levelTitle, { n: level.id, name: levelText(ui, level).name })}
      </p>
      <h2 id="lv-end" tabIndex={-1}>
        {fill(ui.roundScore, { right, total })}
      </h2>
      <span
        className="lv-dots big"
        role="img"
        aria-label={fill(ui.roundDotsLabel, { right, wrong: results.length - right })}
      >
        {results.map((r, i) => (
          <span key={i} className={`lv-dot ${r ? 'right' : 'wrong'}`} />
        ))}
      </span>
      <p className="lv-big">
        {passed
          ? fill(ui.passed, { learned: playText(ui, level).learned })
          : fill(ui.notYet, { right, total })}
      </p>
      {passed && practiceHref && (
        <p>
          {ui.practiceNudge} <a href={practiceHref}>{ui.practiceLink}</a>
        </p>
      )}
      {passed && finishedHref && (
        <>
          <p className="lv-big lv-finished">{ui.allDone}</p>
          <p>
            {ui.allDoneNudge} <a href={finishedHref}>{ui.allDoneLink}</a>
          </p>
        </>
      )}
      {passed && !next && !finishedHref && <p className="lv-muted">{ui.moreSoon}</p>}
      <div className="lv-actions">
        {passed && next && (
          <button type="button" className="btn lv-main" onClick={() => onNext(next)}>
            {ui.nextLevel} ▶
          </button>
        )}
        <button
          type="button"
          className={passed && next ? 'btn ghost lv-main' : 'btn lv-main'}
          onClick={onAgain}
        >
          {ui.roundAgain}
        </button>
        {!(passed && next) && (
          <button type="button" className="btn ghost lv-main" onClick={onBack}>
            {ui.backToMap}
          </button>
        )}
      </div>
    </section>
  );
}
