/**
 * The level map (docs/ear-levels.md "Level map"): the five stages in a column, each level a large
 * card that is locked, ready or done, and one main button, Continue. A level not built yet shows
 * as coming soon. "Test me" under a locked stage comes with #264.
 */
import { LEVELS, type Level, type Stage } from '../core/levels';
import { currentLevel, isUnlocked, levelProgress, type Progress } from '../core/progress';
import { ROUND_QUESTIONS } from '../core/round';
import { fill, type UiStrings } from '../i18n';
import { levelText } from './levelWords';

const STAGES: readonly Stage[] = [1, 2, 3, 4, 5];

type CardState = 'locked' | 'ready' | 'done' | 'soon';

export function LevelMap({
  ui,
  progress,
  playable,
  onOpen,
  onHow,
}: {
  ui: UiStrings;
  progress: Progress;
  playable(level: Level): boolean;
  onOpen(level: Level): void;
  onHow(level: Level): void;
}) {
  const current = LEVELS.find((l) => l.id === currentLevel(progress))!;
  const cardState = (level: Level): CardState => {
    if (!isUnlocked(progress, level.id)) return 'locked';
    if (!playable(level)) return 'soon';
    return levelProgress(progress, level.id).done ? 'done' : 'ready';
  };

  return (
    <section className="lv-screen lv-map" aria-labelledby="lv-map">
      <div className="lv-map-head">
        <h2 id="lv-map" tabIndex={-1}>
          {ui.mapTitle}
        </h2>
        {playable(current) && isUnlocked(progress, current.id) ? (
          <button
            type="button"
            className="btn lv-main"
            aria-label={fill(ui.continueLabel, {
              n: current.id,
              name: levelText(ui, current).name,
            })}
            onClick={() => onOpen(current)}
          >
            {ui.continue} ▶
          </button>
        ) : (
          <p className="lv-muted">{ui.moreSoon}</p>
        )}
      </div>
      {STAGES.map((stage) => (
        <section key={stage} className="lv-stage" aria-labelledby={`lv-stage-${stage}`}>
          <h3 id={`lv-stage-${stage}`}>
            {fill(ui.stageTitle, { n: stage, name: ui.stages[stage] })}
          </h3>
          <ul className="lv-cards">
            {LEVELS.filter((l) => l.stage === stage).map((level) => {
              const state = cardState(level);
              const text = levelText(ui, level);
              const open = state === 'ready' || state === 'done';
              const inside = (
                <>
                  <span className="lv-card-num">{fill(ui.levelNumber, { n: level.id })}</span>
                  <span className="lv-card-name">{text.name}</span>
                  <span className="lv-card-learn">{text.learn}</span>
                  <span className="lv-card-state">
                    <span aria-hidden="true">
                      {{ locked: '🔒', ready: '▶', done: '✓', soon: '·' }[state]}{' '}
                    </span>
                    {fill(ui.levelState[state], {
                      best: levelProgress(progress, level.id).best,
                      total: ROUND_QUESTIONS,
                    })}
                  </span>
                </>
              );
              return (
                <li key={level.id} className={`lv-card ${state}`} data-level={level.id}>
                  {open ? (
                    <button type="button" className="lv-open" onClick={() => onOpen(level)}>
                      {inside}
                    </button>
                  ) : (
                    <div className="lv-open">{inside}</div>
                  )}
                  {open && (
                    <button
                      type="button"
                      className="lv-how"
                      aria-label={fill(ui.howItWorksLabel, { n: level.id, name: text.name })}
                      onClick={() => onHow(level)}
                    >
                      {ui.howItWorks}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </section>
  );
}
