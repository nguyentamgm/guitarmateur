/**
 * The stats card, "Your ear" (#223): per mode, the totals, accuracy per degree, the mix-ups heard
 * most (each with a button to practise that pair), the last 14 days, "practise weak notes" and a
 * reset with a confirm step. The numbers come from the store (core/stats.ts does the math).
 */
import { useState } from 'react';
import type { DegreeLabel, Mode } from '@shared/core/music';
import { ChipGroup, OnOff } from '@shared/ui/controls';
import { DEGREES } from '../core/degrees';
import {
  accuracy,
  lastDays,
  localDay,
  topMixups,
  totals,
  type Stats as AllStats,
} from '../core/stats';
import { fill, type Lang, type UiStrings } from '../i18n';
import { degreeText } from './labels';

/** Days of history drawn. */
export const DAYS_SHOWN = 14;

/** The bar's colour band: accent from 80%, amber from 50%, muted below. The number is always written. */
const band = (acc: number): string => (acc >= 0.8 ? 'good' : acc >= 0.5 ? 'mid' : 'weak');

export function Stats({
  ui,
  lang,
  stats,
  mode: initialMode,
  weakNotes,
  onWeakNotes,
  onPractise,
  onReset,
  now = Date.now,
}: {
  ui: UiStrings;
  lang: Lang;
  stats: AllStats;
  /** The tab shown first: the current key's mode. */
  mode: Mode;
  weakNotes: boolean;
  onWeakNotes(on: boolean): void;
  /** Set the active degrees to these (1 plus a mixed-up pair). */
  onPractise(degrees: DegreeLabel[]): void;
  onReset(): void;
  now?: () => number;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [confirming, setConfirming] = useState(false);
  const s = stats[mode];
  const total = totals(s);
  const asked = DEGREES.filter(({ label }) => (s.degrees[label]?.asked ?? 0) > 0);
  const mixups = topMixups(s);
  const days = lastDays(s, localDay(now()), DAYS_SHOWN);
  const busiest = Math.max(1, ...days.map((d) => d.asked));
  const dayName = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short' });
  const dateOf = (day: string) => {
    const [y, m, d] = day.split('-').map(Number);
    return dayName.format(new Date(y!, m! - 1, d!));
  };
  const anyStats = totals(stats.major).asked + totals(stats.minor).asked > 0;

  return (
    <section className="board stats" aria-labelledby="stats-title">
      <div className="trainer-head">
        <h2 id="stats-title">{ui.statsTitle}</h2>
        <ChipGroup<Mode>
          label={ui.modeLabel}
          items={(['major', 'minor'] as const).map((m) => ({ value: m, text: ui.modeChip[m] }))}
          value={mode}
          onChange={setMode}
        />
      </div>

      {total.asked === 0 ? (
        <p className="stats-empty">{fill(ui.statsEmpty, { mode: ui.modeName[mode] })}</p>
      ) : (
        <>
          <p className="stats-totals">
            {fill(ui.statsTotals, {
              asked: total.asked,
              right: total.right,
              pct: Math.round((100 * total.right) / total.asked),
              best: s.bestStreak,
            })}
          </p>

          <h3>{ui.accuracyTitle}</h3>
          <ul className="bars-acc">
            {asked.map(({ label }) => {
              const c = s.degrees[label]!;
              const acc = accuracy(c)!;
              const text = fill(ui.accuracyRow, {
                degree: degreeText(label),
                pct: Math.round(acc * 100),
                n: c.asked,
              });
              return (
                <li key={label}>
                  <span className="acc-label">{text}</span>
                  <span className="acc-track" aria-hidden="true">
                    <span
                      className={`acc-bar ${band(acc)}`}
                      style={{ width: `${Math.max(2, acc * 100)}%` }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>

          <h3>{ui.mixupsTitle}</h3>
          {mixups.length === 0 ? (
            <p className="stats-note">{ui.mixupsNone}</p>
          ) : (
            <ul className="mixups">
              {mixups.map((m) => {
                // 1 and the pair, once each, in chromatic order.
                const degrees = DEGREES.map((d) => d.label).filter(
                  (l) => l === '1' || l === m.degree || l === m.heardAs,
                );
                return (
                  <li key={`${m.degree}-${m.heardAs}`}>
                    <span>
                      {fill(ui.mixupRow, {
                        degree: degreeText(m.degree),
                        heard: degreeText(m.heardAs),
                        n: m.count,
                      })}
                    </span>{' '}
                    <button
                      type="button"
                      className="btn ghost"
                      aria-label={fill(ui.practiseLabel, {
                        degrees: degrees.map(degreeText).join(', '),
                      })}
                      onClick={() => onPractise(degrees)}
                    >
                      {ui.practise}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <h3>{ui.daysTitle}</h3>
          <ol className="days" aria-label={ui.daysTitle}>
            {days.map((d) => (
              <li
                key={d.day}
                aria-label={fill(ui.dayRow, { date: dateOf(d.day), n: d.asked, right: d.right })}
              >
                <span className="day-bar" style={{ height: `${(100 * d.asked) / busiest}%` }} />
              </li>
            ))}
          </ol>
        </>
      )}

      <div className="settings-row controls">
        <OnOff
          label={ui.weakNotesLabel}
          on={ui.on}
          off={ui.off}
          value={weakNotes}
          onChange={onWeakNotes}
        />
        {anyStats &&
          (confirming ? (
            <span className="stats-confirm" role="group" aria-label={ui.resetConfirm}>
              <span>{ui.resetConfirm}</span>{' '}
              <button
                type="button"
                className="btn"
                onClick={() => {
                  onReset();
                  setConfirming(false);
                }}
              >
                {ui.resetYes}
              </button>{' '}
              <button type="button" className="btn ghost" onClick={() => setConfirming(false)}>
                {ui.resetNo}
              </button>
            </span>
          ) : (
            <button type="button" className="btn ghost" onClick={() => setConfirming(true)}>
              {ui.reset}
            </button>
          ))}
      </div>
    </section>
  );
}
