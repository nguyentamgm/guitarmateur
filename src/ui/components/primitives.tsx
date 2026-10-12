import type { CSSProperties, ReactNode } from 'react';
import { Chip, Takeaways } from '@shared/ui/controls';
import type { LocaleId } from '../../i18n';
import { useT } from '../useT';
import { WHY, lessonHref, type PracticeStep } from '../lessonLinks';
import { font, theme } from '../theme';

/**
 * A step's head: its kicker ("Step 1 · Scale and box"), with "Why?" links on the same line to the
 * Theory lessons that explain it, then one line saying why the step is there, as Theory opens a
 * lesson step. Text from the catalog's `<step>.stepKicker` and `<step>.intro`.
 */
export function StepHead({ language, step }: { language: LocaleId; step: PracticeStep }) {
  const t = useT(language);
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '4px 16px',
          marginBottom: 6,
          fontFamily: font.sans,
        }}
      >
        <div style={{ fontSize: 14, color: theme.muted, fontWeight: 600 }}>
          {t(`${step}.stepKicker`)}
        </div>
        {/* Another app: plain links that load it. */}
        <div style={{ fontSize: 13, color: theme.muted }}>
          {t('why.label')}{' '}
          {WHY[step].map((link, i) => (
            <span key={lessonHref(link, language)}>
              {i > 0 && ' · '}
              <a href={lessonHref(link, language)}>{t(`lesson.${link.slug}`)}</a>
            </span>
          ))}
        </div>
      </div>
      <p
        style={{
          margin: '0 0 14px',
          color: theme.muted,
          fontSize: 15,
          lineHeight: 1.5,
          maxWidth: '66ch',
        }}
      >
        {t(`${step}.intro`)}
      </p>
    </>
  );
}

/**
 * The shared "Takeaway / Try it" panel that ends each of Practice's steps, as Theory ends a lesson
 * step; `step` is the catalog namespace holding its `takeaway` and `tryIt`.
 */
export function StepHints({ language, step }: { language: LocaleId; step: PracticeStep }) {
  const t = useT(language);
  return (
    <Takeaways
      style={{
        marginTop: 20,
        paddingTop: 16,
        borderTop: `1px solid ${theme.border}`,
        maxWidth: '66ch',
      }}
      rows={[
        { label: t('common.takeaway'), text: t(`${step}.takeaway`) },
        { label: t('common.tryIt'), text: t(`${step}.tryIt`) },
      ]}
    />
  );
}

/** Panel card: the shared card (`.board` in shared/ui/controls.css). */
export function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="board" style={{ display: 'block', padding: 18, ...style }}>
      {children}
    </div>
  );
}

/**
 * One option of a segmented control: the shared `Chip`. `wide` is for words (sans); short values stay mono.
 * `radio`: one choice of a shared `RadioGroup`; otherwise an on/off toggle.
 */
export function PillButton({
  selected,
  onClick,
  children,
  wide,
  ariaLabel,
  radio,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  wide?: boolean;
  ariaLabel?: string;
  radio?: boolean;
}) {
  return (
    <Chip pressed={selected} onClick={onClick} words={wide} ariaLabel={ariaLabel} radio={radio}>
      {children}
    </Chip>
  );
}

/** Boolean on/off switch, e.g. "Lead into the next chord". Track + thumb: `.toggle` in shared/ui/controls.css. */
export function Toggle({
  checked,
  onChange,
  label,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: ReactNode;
  ariaLabel?: string;
}) {
  return (
    // The label is the tap target (a click on it presses the switch): `.hit` gives it the 40px.
    <label className="hit" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        onClick={() => onChange(!checked)}
        className={`toggle${checked ? ' toggle--on' : ''}`}
      >
        <span className="toggle__thumb" />
      </button>
      {label !== undefined && <span style={{ fontSize: 14, color: theme.text }}>{label}</span>}
    </label>
  );
}

/** Underlined muted text button, e.g. "Reset to default" / "Clear all". */
export function TextButton({
  onClick,
  children,
  expanded,
}: {
  onClick: () => void;
  children: ReactNode;
  /** It shows or hides a panel: open or not (`aria-expanded`). */
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      onClick={onClick}
      className="hit"
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        color: theme.muted,
        fontSize: 13,
        textDecoration: 'underline',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}
