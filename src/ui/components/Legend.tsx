import { theme } from '../theme';

export type LegendType = 'scaleNote' | 'tonic' | 'decoration' | 'chordTone' | 'target' | 'landing';

const SWATCH: Record<LegendType, { stroke: string; sw: number; dash?: string; fill?: string; fillOpacity?: number }> = {
  scaleNote: { stroke: theme.faintStroke, sw: 1.6 },
  tonic: { stroke: theme.accent, sw: 2.4 },
  decoration: { stroke: theme.faintStroke, sw: 1.6, dash: '2 2' },
  chordTone: { stroke: theme.accent, sw: 1.6, fill: theme.accent, fillOpacity: 0.22 },
  target: { stroke: theme.accent, sw: 1.6, fill: theme.accent, fillOpacity: 1 },
  landing: { stroke: theme.accent, sw: 1.6, dash: '3 3' },
};

/** Small swatch legend; only pass the entries relevant to the current section. */
export function Legend({ items }: { items: { type: LegendType; label: string }[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
      {items.map((it) => {
        const s = SWATCH[it.type];
        return (
          <div key={it.type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.muted }}>
            <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden="true">
              <circle
                cx={9}
                cy={9}
                r={6}
                fill={s.fill ?? 'none'}
                fillOpacity={s.fillOpacity}
                stroke={s.stroke}
                strokeWidth={s.sw}
                strokeDasharray={s.dash}
              />
            </svg>
            <span>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}
