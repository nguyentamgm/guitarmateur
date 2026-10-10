import type { DotTone } from '@shared/ui/Fretboard';
import { theme } from '../theme';

export type LegendType = 'scaleNote' | 'tonic' | 'decoration' | 'chordTone' | 'target' | 'landing';

/** Each entry drawn with the neck's own dot styles (shared/ui/fretboard.css), so they always match. */
const TONE: Record<Exclude<LegendType, 'landing'>, DotTone> = {
  scaleNote: 'plain',
  tonic: 'home',
  decoration: 'blue',
  chordTone: 'chord',
  target: 'target',
};

/** Small swatch legend; only pass the entries relevant to the current section. */
export function Legend({ items }: { items: { type: LegendType; label: string }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
      {items.map((it) => (
        <div key={it.type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: theme.muted }}>
          <svg width={22} height={22} viewBox="0 0 22 22" aria-hidden="true" style={{ overflow: 'visible' }}>
            {it.type === 'landing' ? (
              <circle className="halo" cx={11} cy={11} r={9} />
            ) : (
              <g className={TONE[it.type] === 'plain' ? 'dot' : `dot ${TONE[it.type]}`} style={{ cursor: 'default' }}>
                <circle cx={11} cy={11} r={7} />
              </g>
            )}
          </svg>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}
