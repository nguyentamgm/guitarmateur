/**
 * Controls both apps use, styled by shared/ui/controls.css on the shared tokens. Text comes from
 * the caller (each app has its own i18n), so nothing here holds copy.
 */
import { useId, type ReactNode } from 'react';

/** One option of a segmented control. `words`: the option is text, not a short value (body font). */
export function Chip({
  pressed,
  onClick,
  children,
  words,
  ariaLabel,
}: {
  pressed: boolean;
  onClick(): void;
  children: ReactNode;
  words?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button type="button" className={words ? 'chip text' : 'chip'} aria-pressed={pressed} aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  );
}

/** A labelled row of chips, one pressed: the segmented control. */
export function ChipGroup<T extends string | number>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: readonly { value: T; text: ReactNode }[];
  value: T;
  onChange(v: T): void;
}) {
  return (
    <div className="group" role="group" aria-label={label}>
      <span aria-hidden="true">{label}</span>
      {items.map((it) => (
        <Chip key={it.value} pressed={it.value === value} onClick={() => onChange(it.value)}>
          {it.text}
        </Chip>
      ))}
    </div>
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
  return (
    <div className="finder" role="group" aria-label={label}>
      {keys.map((k) => (
        <button key={name(k)} type="button" aria-pressed={name(k) === current} onClick={() => onChange(k)}>
          <b>{name(k)}</b> {fret(k)}
        </button>
      ))}
    </div>
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
