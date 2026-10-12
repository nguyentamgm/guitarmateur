/**
 * Controls both apps use, styled by shared/ui/controls.css on the shared tokens. Text comes from
 * the caller (each app has its own i18n), so nothing here holds copy.
 */
import { useId, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';

const ARROW_STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * Arrow keys move to the next / previous radio of the group (wrapping) and check it, as native
 * radios do; with `manual` (a quiz's answers) they only move the focus, Space / Enter chooses.
 */
function radioKeys(e: KeyboardEvent<HTMLElement>, manual: boolean) {
  const step = ARROW_STEP[e.key];
  if (step === undefined) return;
  const radios = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')];
  const i = radios.indexOf(e.target as HTMLElement);
  if (i < 0) return;
  e.preventDefault();
  const next = radios[(i + step + radios.length) % radios.length]!;
  next.focus();
  if (!manual) next.click();
}

/**
 * A single-choice row: `role="radiogroup"` around radios (a `Chip` with `radio`, or any
 * `role="radio"` button). Tab reaches the checked one only (the first while none is); the arrow
 * keys change the choice (or, `manual`, only move to one).
 */
export function RadioGroup({
  label,
  className,
  style,
  manual = false,
  children,
}: {
  label: string;
  className?: string;
  style?: CSSProperties;
  manual?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={className} style={style} role="radiogroup" aria-label={label} onKeyDown={(e) => radioKeys(e, manual)}>
      {children}
    </div>
  );
}

/**
 * One option of a segmented control. `words`: the option is text, not a short value (body font).
 * `radio`: one choice of a `RadioGroup` (`aria-checked`, one Tab stop); otherwise a toggle (`aria-pressed`).
 */
export function Chip({
  pressed,
  onClick,
  children,
  words,
  ariaLabel,
  radio,
  tabStop,
}: {
  pressed: boolean;
  onClick(): void;
  children: ReactNode;
  words?: boolean;
  ariaLabel?: string;
  radio?: boolean;
  /** A radio that takes Tab though unchecked: the first one, while none is checked. */
  tabStop?: boolean;
}) {
  const state = radio ? { role: 'radio', 'aria-checked': pressed, tabIndex: pressed || tabStop ? 0 : -1 } : { 'aria-pressed': pressed };
  return (
    <button type="button" className={words ? 'chip text' : 'chip'} {...state} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  );
}

/** A labelled row of chips, one checked: the segmented control, a radio group. */
export function ChipGroup<T extends string | number>({
  label,
  items,
  value,
  onChange,
  manual,
}: {
  label: string;
  items: readonly { value: T; text: ReactNode }[];
  value: T;
  onChange(v: T): void;
  /** Arrow keys only move the focus; Space / Enter chooses (a quiz's answers). */
  manual?: boolean;
}) {
  const none = !items.some((it) => it.value === value);
  return (
    <RadioGroup className="group" label={label} manual={manual}>
      <span aria-hidden="true">{label}</span>
      {items.map((it, i) => (
        <Chip key={it.value} radio pressed={it.value === value} tabStop={none && i === 0} onClick={() => onChange(it.value)}>
          {it.text}
        </Chip>
      ))}
    </RadioGroup>
  );
}

/** Two chips, off and on. */
export function OnOff({ label, on, off, value, onChange }: { label: string; on: string; off: string; value: boolean; onChange(v: boolean): void }) {
  return (
    <ChipGroup<'on' | 'off'>
      label={label}
      items={[
        { value: 'off', text: off },
        { value: 'on', text: on },
      ]}
      value={value ? 'on' : 'off'}
      onChange={(v) => onChange(v === 'on')}
    />
  );
}

/**
 * One button per key: its name, then the fret where that note sits on the lowest string ("A 5",
 * "C 8"), which tells the player where to put their hand. The caller spells each key (B♭, not A♯)
 * and finds its fret, so this works for any key type and tuning.
 */
export function KeyPicker<K>({
  label,
  keys,
  name,
  fret,
  value,
  onChange,
}: {
  label: string;
  keys: readonly K[];
  name(k: K): string;
  fret(k: K): number;
  value: K;
  onChange(k: K): void;
}) {
  const current = name(value);
  const none = !keys.some((k) => name(k) === current);
  return (
    <RadioGroup className="finder" label={label}>
      {keys.map((k, i) => (
        <button
          key={name(k)}
          type="button"
          role="radio"
          aria-checked={name(k) === current}
          tabIndex={name(k) === current || (none && i === 0) ? 0 : -1}
          onClick={() => onChange(k)}
        >
          <b>{name(k)}</b> {fret(k)}
        </button>
      ))}
    </RadioGroup>
  );
}

/** The "Takeaway / Try it" hint panel that ends a step (`.takeaways`): a label and its text per row. */
export function Takeaways({
  rows,
  className,
  style,
}: {
  rows: readonly { label: ReactNode; text: ReactNode }[];
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <dl className={className ? `takeaways ${className}` : 'takeaways'} style={style}>
      {rows.map(({ label, text }, i) => (
        <div key={i}>
          <dt>{label}</dt>
          <dd>{text}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Button({ onClick, children, ghost }: { onClick(): void; children: ReactNode; ghost?: boolean }) {
  return (
    <button type="button" className={ghost ? 'btn ghost' : 'btn'} onClick={onClick}>
      {children}
    </button>
  );
}

/** A labelled range with its value shown after it (`text`); `children` follow, e.g. a badge. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  text,
  onChange,
  children,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  text: ReactNode;
  onChange(value: number): void;
  children?: ReactNode;
}) {
  // Named by its label only: the shown value and a badge are not part of the range's name.
  const labelId = useId();
  return (
    <label className="slider">
      <span id={labelId}>{label}</span>
      <input
        type="range"
        aria-labelledby={labelId}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <output>{text}</output>
      {children}
    </label>
  );
}
