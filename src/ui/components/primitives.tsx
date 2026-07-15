import type { CSSProperties, ReactNode } from 'react';
import { font, theme } from '../theme';

/** Uppercase, letter-spaced mono label used above sections and cards. */
export function SectionKicker({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 12,
        letterSpacing: '.18em',
        textTransform: 'uppercase',
        color: theme.muted,
        fontWeight: 600,
        fontFamily: font.mono,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Panel card: panel bg, 1px border, 14px radius, 18px padding. */
export function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: theme.panel,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        padding: 18,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Pill/segmented button. Selected = accent bg + dark text; unselected = bordered transparent. */
export function PillButton({
  selected,
  onClick,
  children,
  wide,
  ariaLabel,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  wide?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        padding: wide ? '8px 14px' : '7px 0',
        minWidth: wide ? undefined : 40,
        textAlign: 'center',
        borderRadius: 8,
        border: `1px solid ${selected ? theme.accent : theme.border}`,
        background: selected ? theme.accent : 'transparent',
        color: selected ? theme.accentText : theme.text,
        fontSize: 13,
        fontWeight: selected ? 700 : 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}

/** Boolean on/off switch, e.g. "Land on next chord". Track + thumb, styled via `.toggle` in global.css. */
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
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
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
      {label !== undefined && <span style={{ fontSize: 13, color: theme.text }}>{label}</span>}
    </label>
  );
}

/** Underlined muted text button, e.g. "Reset to default" / "Clear all". */
export function TextButton({
  onClick,
  children,
  ariaLabel,
}: {
  onClick: () => void;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        color: theme.muted,
        fontSize: 12.5,
        textDecoration: 'underline',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}
