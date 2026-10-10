import { homeFret } from '../core/fretboard';
import { fill } from '../i18n';
import { useTheory } from './context';
import { format, sameNote, type NoteName } from '../core/music';
import { MAX_BPM, MIN_BPM, clampBpm } from '../core/rhythm';
import { Slider } from '@shared/ui/controls';

// The generic controls are shared with the practice app; Theory adds its tempo slider and key finder.
export { Button, Chip, ChipGroup, OnOff, Slider } from '@shared/ui/controls';

/** A tempo slider, in whole BPM within the range the lessons offer; `best` (a remembered drill best) shows as a badge. */
export function Tempo({ label, text, bpm, onChange, best = 0 }: { label: string; text: string; bpm: number; onChange(bpm: number): void; best?: number }) {
  const { ui } = useTheory();
  return (
    <Slider label={label} value={bpm} min={MIN_BPM} max={MAX_BPM} text={text} onChange={(v) => onChange(clampBpm(v))}>
      {best > 0 && <span className="best">{fill(ui.tempoBest, { bpm: best })}</span>}
    </Slider>
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
