import { MAX_BPM, MIN_BPM, clampBpm } from '../core/rhythm';
import type { ReactNode } from 'react';

export function Chip({ pressed, onClick, children }: { pressed: boolean; onClick(): void; children: ReactNode }) {
  return (
    <button type="button" className="chip" aria-pressed={pressed} onClick={onClick}>
      {children}
    </button>
  );
}

/** A labelled row of chips, one pressed. */
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

export function Button({ onClick, children, ghost }: { onClick(): void; children: ReactNode; ghost?: boolean }) {
  return (
    <button type="button" className={ghost ? 'btn ghost' : 'btn'} onClick={onClick}>
      {children}
    </button>
  );
}

/** A tempo slider, in whole BPM within the range the lessons offer. */
export function Tempo({ label, text, bpm, onChange }: { label: string; text: string; bpm: number; onChange(bpm: number): void }) {
  return (
    <label className="tempo">
      <span>{label}</span>
      <input
        type="range"
        min={MIN_BPM}
        max={MAX_BPM}
        step={1}
        value={bpm}
        onChange={(e) => onChange(clampBpm(Number(e.target.value)))}
      />
      <output>{text}</output>
    </label>
  );
}
