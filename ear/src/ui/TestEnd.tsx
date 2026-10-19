/**
 * The end of a stage's test (docs/ear-levels.md "Skipping ahead"): the score and the ten dots,
 * then "Well done! You skipped Stage n." and on to the next level, or "Good try!" with the stage's
 * first level, the test again, or the map. Nothing is lost either way.
 */
import type { Stage } from '../core/levels';
import { passes, type RoundState } from '../core/round';
import { fill, type UiStrings } from '../i18n';

export function TestEnd({
  ui,
  state,
  stage,
  results,
  onContinue,
  onFirstLevel,
  onAgain,
  onBack,
}: {
  ui: UiStrings;
  state: RoundState;
  stage: Stage;
  results: readonly boolean[];
  /** Passed: the next level not done. */
  onContinue(): void;
  /** Not passed: the stage's first level. */
  onFirstLevel(): void;
  onAgain(): void;
  onBack(): void;
}) {
  const { right } = state;
  const total = state.rules.questions;
  const passed = passes(state);
  return (
    <section className="board lv-screen lv-end" aria-labelledby="lv-end">
      <p className="lv-muted">{fill(ui.testTitle, { n: stage, name: ui.stages[stage] })}</p>
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
      <p className="lv-big">{passed ? fill(ui.testPassed, { n: stage }) : ui.testFailed}</p>
      <div className="lv-actions">
        {passed ? (
          <button type="button" className="btn lv-main" onClick={onContinue}>
            {ui.continue} ▶
          </button>
        ) : (
          <>
            <button type="button" className="btn lv-main" onClick={onFirstLevel}>
              {ui.testFirstLevel} ▶
            </button>
            <button type="button" className="btn ghost lv-main" onClick={onAgain}>
              {ui.testAgain}
            </button>
          </>
        )}
        <button type="button" className="btn ghost lv-main" onClick={onBack}>
          {ui.backToMap}
        </button>
      </div>
    </section>
  );
}
