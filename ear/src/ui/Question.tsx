/**
 * The question screen, the same for every level (docs/ear-levels.md "Question screen"): the sound
 * plays by itself, Play again as often as wanted, then the answer buttons. Right: a tick and one
 * line, and the next question after a short pause. Wrong: an orange mark, what it was, and both
 * sounds again. After 4 wrong in a row it offers an easier step instead.
 */
import { useEffect, useRef } from 'react';
import { stepAnswers, type AnswerId, type LevelOf, type QuestionKind } from '../core/levels';
import type { RoundState } from '../core/round';
import { fill, type UiStrings } from '../i18n';
import { levelKeyOwnedByTarget, levelShortcut } from './keys';
import { answerWords, levelText, playText } from './levelWords';
import type { Round } from './useRound';

export function Question({
  ui,
  round,
  state,
  noAudio,
  onBack,
}: {
  ui: UiStrings;
  round: Round;
  state: RoundState;
  noAudio: boolean;
  onBack(): void;
}) {
  const { level, phase } = state;
  const q = state.questions.at(-1)!;
  // The buttons of the step the question was asked at: a step up applies from the next one.
  const answers: readonly AnswerId[] = stepAnswers(level as LevelOf<QuestionKind>, q.step);
  const answered = phase === 'feedback' ? state.answer : null;
  const right = answered !== null && round.results.at(-1) === true;
  const words = playText(ui, level);
  const n = state.questions.length;
  const total = state.rules.questions;
  const screenRef = useRef<HTMLElement>(null);
  const live = useRef({ phase, answers, round });
  live.current = { phase, answers, round };

  // The keyboard shortcuts (keys.ts `levelShortcut`), for the whole page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat || e.defaultPrevented) return;
      const { phase: now, answers: shown, round: r } = live.current;
      const s = levelShortcut(e, shown.length);
      if (!s || levelKeyOwnedByTarget(e.target, s)) return;
      if (s.type === 'replay' && (now === 'question' || now === 'feedback'))
        r.send({ type: 'replay' });
      else if (s.type === 'next' && now === 'feedback') r.send({ type: 'next' });
      else if (s.type === 'answer' && now === 'question')
        r.send({ type: 'answer', answer: shown[s.index]! });
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // A new question puts the focus on Play again; an answer puts it on Next. Unless it is elsewhere.
  useEffect(() => {
    const at = document.activeElement;
    if (at && at !== document.body && !screenRef.current?.contains(at)) return;
    screenRef.current
      ?.querySelector<HTMLButtonElement>(phase === 'feedback' ? '.lv-next' : '.lv-replay')
      ?.focus();
  }, [phase, n]);

  const rightWords = answerWords(ui, level, q.answer);

  return (
    <section ref={screenRef} className="board lv-screen lv-question" aria-labelledby="lv-q">
      <div className="lv-q-head">
        <h2 id="lv-q" tabIndex={-1}>
          {fill(ui.levelTitle, { n: level.id, name: levelText(ui, level).name })}
        </h2>
        <span
          className="lv-progress"
          role="img"
          aria-label={fill(ui.questionCountLabel, { n, total })}
        >
          <span className="lv-dots" aria-hidden="true">
            {Array.from({ length: total }, (_, i) => {
              const r = round.results[i];
              const cls = r === true ? 'right' : r === false ? 'wrong' : i === n - 1 ? 'now' : '';
              return <span key={i} className={`lv-dot ${cls}`} />;
            })}
          </span>
          <span aria-hidden="true">{fill(ui.questionCount, { n, total })}</span>
        </span>
      </div>

      {noAudio && <p className="lv-warn">{ui.levelsNoAudio}</p>}

      {phase === 'stuck' ? (
        <div className="lv-stuck">
          <p className="lv-big" aria-live="polite">
            {ui.stuck}
          </p>
          <div className="lv-actions">
            <button
              type="button"
              className="btn lv-main"
              onClick={() => round.send({ type: 'easier' })}
            >
              {ui.easier}
            </button>
            <button
              type="button"
              className="btn ghost lv-main"
              onClick={() => round.send({ type: 'keepGoing' })}
            >
              {ui.keepGoing}
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="btn ghost lv-main lv-replay"
            onClick={() => round.send({ type: 'replay' })}
          >
            ▶ {ui.playAgain}
          </button>
          <p className="lv-big">{words.question}</p>
          <div
            className={`lv-answers n${answers.length}`}
            role="group"
            aria-label={ui.answersLabel}
          >
            {answers.map((a) => {
              const w = answerWords(ui, level, a);
              const mark =
                answered === null
                  ? ''
                  : a === q.answer
                    ? 'right'
                    : a === answered
                      ? 'wrong'
                      : 'other';
              return (
                <button
                  key={String(a)}
                  type="button"
                  className={`lv-answer ${mark}`}
                  aria-disabled={answered !== null}
                  onClick={() => round.send({ type: 'answer', answer: a })}
                >
                  {w.icon && <span aria-hidden="true">{w.icon} </span>}
                  {w.label}
                </button>
              );
            })}
          </div>
          <div className="lv-feedback" aria-live="polite">
            {answered !== null &&
              (right ? (
                <p className="lv-right">
                  <span aria-hidden="true">✓ </span>
                  {fill(ui.rightLine, { heard: rightWords.heard })}
                </p>
              ) : (
                <p className="lv-wrong">
                  <span aria-hidden="true">● </span>
                  {fill(ui.wrongLine, { heard: rightWords.heard })}
                </p>
              ))}
          </div>
          {answered !== null && (
            <div className="lv-actions">
              {!right && (
                <button type="button" className="btn ghost" onClick={round.listenBoth}>
                  {ui.listenBoth}
                </button>
              )}
              <button
                type="button"
                className="btn lv-main lv-next"
                onClick={() => round.send({ type: 'next' })}
              >
                {ui.next} ▶
              </button>
            </div>
          )}
          <p className="lv-muted">{words.tip}</p>
        </>
      )}

      <div className="lv-foot">
        <button type="button" className="btn ghost" onClick={onBack}>
          {ui.backToMap}
        </button>
        <span className="lv-muted lv-keys">{fill(ui.levelKeys, { n: answers.length })}</span>
      </div>
    </section>
  );
}
