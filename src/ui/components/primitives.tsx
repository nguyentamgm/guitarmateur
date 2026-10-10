import type { CSSProperties, ReactNode } from 'react';
import { font, theme } from '../theme';

/** Label above a section: the shared sans font (mono stays for numbers), readable with accents. */
export function SectionKicker({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        fontSize: 14,
        color: theme.muted,
        fontWeight: 600,
        fontFamily: font.sans,
        ...style,
      }}
    >
      {children}
    </div>
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
 * One option of a segmented control: the shared chip (shared/ui/controls.css), pressed = ink.
 * `wide` is for words (sans, padded); short values (notes, numbers) stay mono.
 */
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
      className={wide ? 'chip text' : 'chip'}
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/** Boolean on/off switch, e.g. "Land on next chord". Track + thumb: `.toggle` in shared/ui/controls.css. */
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
      {label !== undefined && <span style={{ fontSize: 14, color: theme.text }}>{label}</span>}
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

/** A line globe in the current text colour, marking the language switcher. Decorative only. */
export function GlobeIcon({ size = 14, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className="globe"
      style={style}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.5 4 5.6 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.6-4-9s1.4-6.5 4-9z" />
    </svg>
  );
}
