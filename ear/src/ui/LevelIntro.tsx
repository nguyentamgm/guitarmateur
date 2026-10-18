/**
 * A level's intro (docs/ear-levels.md "Level intro"): what to listen for, then the demo, each
 * example with its answer and a Play button, then "I'm ready". The same screen replays the demo
 * after "Yes, easier", at the easier step.
 */
import type { Level } from '../core/levels';
import type { LevelSounds } from '../audio/levelSounds';
import type { Part } from '../audio/timeline';
import { fill, type UiStrings } from '../i18n';
import { answerWords, levelText, playText } from './levelWords';

export function LevelIntro({
  ui,
  level,
  step,
  sounds,
  play,
  onReady,
  onBack,
}: {
  ui: UiStrings;
  level: Level;
  /** The difficulty step the examples are played at. */
  step: number;
  sounds: LevelSounds;
  play(part: Part): void;
  onReady(): void;
  onBack(): void;
}) {
  const examples = sounds.demo(level, step);
  return (
    <section className="board lv-screen" aria-labelledby="lv-intro">
      <h2 id="lv-intro" tabIndex={-1}>
        {fill(ui.levelTitle, { n: level.id, name: levelText(ui, level).name })}
      </h2>
      <p>{playText(ui, level).intro}</p>
      <h3>{ui.listenFirst}</h3>
      <ul className="lv-demo">
        {examples.map((ex, i) => {
          const { heard } = answerWords(ui, level, ex.answer);
          return (
            <li key={i}>
              <button
                type="button"
                className="btn ghost"
                aria-label={fill(ui.playExampleLabel, { heard })}
                onClick={() => play(ex.part)}
              >
                ▶ {ui.playExample}
              </button>
              <span>{fill(ui.example, { heard })}</span>
            </li>
          );
        })}
      </ul>
      <div className="lv-actions">
        <button type="button" className="btn lv-main" onClick={onReady}>
          {ui.ready}
        </button>
        <button type="button" className="btn ghost" onClick={onBack}>
          {ui.backToMap}
        </button>
      </div>
    </section>
  );
}
