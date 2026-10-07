import { homeFret } from '../core/fretboard';
import { format, sameNote, type NoteName } from '../core/music';
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

/** A tempo slider, in whole BPM within the range the lessons offer, with an optional best-tempo badge. */
export function Tempo({ label, text, bpm, onChange, best }: { label: string; text: string; bpm: number; onChange(bpm: number): void; best?: string }) {
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
      {best !== undefined && <span className="best">{best}</span>}
    </label>
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

/** One button per key, with its home fret on string 6 beside the name (K0.7). */
export function KeyFinder({ keys, label, value, onChange }: { keys: readonly NoteName[]; label: string; value: NoteName; onChange(k: NoteName): void }) {
  return (
    <div className="finder" role="group" aria-label={label}>
      {keys.map((k) => (
        <button key={format(k)} type="button" aria-pressed={sameNote(k, value)} onClick={() => onChange(k)}>
          <b>{format(k)}</b> {homeFret(k)}
        </button>
      ))}
    </div>
  );
}
