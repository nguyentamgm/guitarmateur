/**
 * The trainer card (#220): Start → the cadence → the note → an answer on the strip → feedback →
 * Next. The session (core/session.ts) decides what happens; this card shows it and sends events.
 */
import { useEffect, useRef } from 'react';
import type { Player } from '@shared/core/audio';
import type { DegreeLabel } from '@shared/core/music';
import { DEGREES, degreeId, diatonicDegrees } from '../core/degrees';
import type { SessionState } from '../core/session';
import type { Answer } from '../core/stats';
import { fill, type UiStrings } from '../i18n';
import type { EarSettings } from '../store/settings';
import { ownedByTarget, shortcut } from './keys';
import { answerText, degreeInKey, degreesText, keyText, noteText } from './labels';
import { useTrainer } from './useTrainer';

const RUNNING_PHASES = ['context', 'prompt', 'waiting', 'answered', 'resolving', 'review'];

/** What the status line says in each phase. */
function status(ui: UiStrings, s: SessionState): string {
  const q = s.question;
  switch (s.phase) {
    case 'idle':
      return ui.intro;
    case 'context':
      return ui.hearingKey;
    case 'prompt':
      return ui.listening;
    case 'waiting':
      return ui.question;
    default: {
      if (!q || !s.answer) return '';
      const degree = degreeInKey(q.key, q.degree);
      const note = noteText(q.key, q.degree);
      if (s.answer === degreeId(q.degree))
        return fill(ui.right, { degree, note, key: keyText(ui, q.key) });
      return fill(ui.wrong, {
        picked: degreeInKey(q.key, s.answer),
        pickedNote: noteText(q.key, s.answer),
        degree,
        note,
      });
    }
  }
}

export function Trainer({
  ui,
  player,
  settings,
  onScore,
}: {
  ui: UiStrings;
  player: Player;
  settings: EarSettings;
  onScore(answer: Answer): void;
}) {
  const { state, noAudio, send } = useTrainer(player, settings, onScore);
  const q = state.question;
  const running = RUNNING_PHASES.includes(state.phase);
  const canReplay = state.phase === 'waiting' || state.phase === 'review';
  const key = q?.key ?? settings.key;
  const wrong = q && state.answer && state.answer !== degreeId(q.degree) ? state.answer : null;
  const cardRef = useRef<HTMLElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const live = useRef({ state, send, active: settings.degrees });
  live.current = { state, send, active: settings.degrees };

  /** Answer, keeping the focus on the strip: on the cell answered. */
  const answer = (degree: DegreeLabel) => {
    send({ type: 'answer', degree });
    cardRef.current?.querySelector<HTMLButtonElement>(`.cell[data-degree="${degree}"]`)?.focus();
  };
  /**
   * Start, moving the focus to the card: left on the button, which now reads Stop, the next Space
   * would stop the session instead of going to Next.
   */
  const start = () => {
    send({ type: 'start' });
    cardRef.current?.focus();
  };
  const answerRef = useRef(answer);
  answerRef.current = answer;
  const startRef = useRef(start);
  startRef.current = start;

  // The keyboard shortcuts (keys.ts), for the whole page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat || e.defaultPrevented) return;
      const s = shortcut(e);
      if (!s || ownedByTarget(e.target, s)) return;
      const { state: now, send: go, active } = live.current;
      if (s.type === 'primary') {
        if (now.phase !== 'idle' && now.phase !== 'review') return;
        e.preventDefault();
        if (now.phase === 'idle') startRef.current();
        else go({ type: 'next' });
      } else if (s.type === 'answer') {
        if (!active.map(degreeId).includes(s.degree)) return;
        e.preventDefault();
        answerRef.current(s.degree);
      } else {
        e.preventDefault();
        go({ type: s.type });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // When the question is done, the focus moves to Next, unless it is somewhere else on the page.
  useEffect(() => {
    if (state.phase !== 'review') return;
    const at = document.activeElement;
    if (!at || at === document.body || cardRef.current?.contains(at)) nextRef.current?.focus();
  }, [state.phase]);

  return (
    <section ref={cardRef} className="board trainer" aria-labelledby="trainer-title" tabIndex={-1}>
      <div className="trainer-head">
        <h2 id="trainer-title">{ui.trainerTitle}</h2>
        <span className="trainer-key">
          {keyText(ui, key)} · {degreesText(ui, key, settings.degrees)}
        </span>
      </div>

      <div className="controls" role="group" aria-label={ui.controlsLabel}>
        {running ? (
          <button type="button" className="btn ghost" onClick={() => send({ type: 'stop' })}>
            {ui.stop}
          </button>
        ) : (
          <button type="button" className="btn" onClick={start}>
            {ui.start}
          </button>
        )}
        <button
          type="button"
          className="btn ghost"
          aria-disabled={!canReplay}
          onClick={() => send({ type: 'replayContext' })}
        >
          {ui.hearKey}
        </button>
        <button
          type="button"
          className="btn ghost"
          aria-disabled={!canReplay}
          onClick={() => send({ type: 'replayNote' })}
        >
          {ui.replayNote}
        </button>
        <button
          type="button"
          className="btn ghost"
          aria-disabled={!canReplay}
          onClick={() => send({ type: 'playTonic' })}
        >
          {ui.playRoot}
        </button>
      </div>

      <p className="trainer-status" aria-live="polite">
        {noAudio ? ui.noAudio : status(ui, state)}
      </p>

      <AnswerStrip ui={ui} state={state} active={settings.degrees} onAnswer={answer} />

      {state.phase === 'review' && q && (
        <p className="trainer-compare">
          {wrong && (
            <>
              <button
                type="button"
                className="btn ghost"
                onClick={() => send({ type: 'answer', degree: wrong })}
              >
                {fill(ui.hearPicked, { picked: degreeInKey(q.key, wrong) })}
              </button>{' '}
              <button
                type="button"
                className="btn ghost"
                onClick={() => send({ type: 'replayNote' })}
              >
                {fill(ui.hearAnswer, { degree: degreeInKey(q.key, q.degree) })}
              </button>{' '}
            </>
          )}
          <span>{ui.compare}</span>
        </p>
      )}

      <div className="trainer-foot">
        <span className="trainer-score">
          {fill(ui.score, {
            right: state.score.right,
            total: state.score.asked,
            streak: state.score.streak,
          })}
        </span>
        <button
          ref={nextRef}
          type="button"
          className="btn"
          aria-disabled={state.phase !== 'review'}
          onClick={() => send({ type: 'next' })}
        >
          {ui.next} ▶
        </button>
      </div>

      <details className="trainer-keys">
        <summary>{ui.keysTitle}</summary>
        <dl>
          {(
            [
              [ui.keyNames.primary, ui.keys.primary],
              ['R', ui.keys.replayNote],
              ['K', ui.keys.replayContext],
              ['T', ui.keys.playTonic],
              [ui.keyNames.degrees, ui.keys.degrees],
              [ui.keyNames.lowered, ui.keys.lowered],
            ] as const
          ).map(([k, what]) => (
            <div key={k}>
              <dt>
                <kbd>{k}</kbd>
              </dt>
              <dd>{what}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}

/**
 * The answers as one string from the root: fret 0 is 1, fret 3 is ♭3, fret 7 is 5… Degrees that
 * are off are dimmed and disabled (and hidden at phone width); the mode's scale notes are dots.
 */
function AnswerStrip({
  ui,
  state,
  active,
  onAnswer,
}: {
  ui: UiStrings;
  state: SessionState;
  active: readonly DegreeLabel[];
  onAnswer(degree: DegreeLabel): void;
}) {
  const q = state.question;
  const key = q?.key ?? state.settings.key;
  const on = new Set(active.map(degreeId));
  const scale = new Set(diatonicDegrees(key.mode).map(degreeId));
  const answered = state.answer !== null && q !== null;
  return (
    <div className="strip" role="group" aria-label={ui.stripLabel}>
      {DEGREES.map(({ label }, fret) => {
        const isOn = on.has(label);
        const right = answered && label === degreeId(q.degree);
        const picked = answered && label === state.answer && !right;
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
            disabled={!isOn}
            aria-label={fill(ui.cellLabel, {
              shown: answerText(label),
              spoken: ui.spoken[label as keyof UiStrings['spoken']],
              fret,
            })}
            onClick={() => onAnswer(label)}
          >
            <span className="cell-dot">{answerText(label)}</span>
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
