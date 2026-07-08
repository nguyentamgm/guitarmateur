import { theme } from '../theme';

export type LegendType = 'scaleNote' | 'tonic' | 'decoration';

const SWATCH: Record<LegendType, { stroke: string; sw: number; dash?: string }> = {
  scaleNote: { stroke: theme.faintStroke, sw: 1.6 },
  tonic: { stroke: theme.accent, sw: 2.4 },
  decoration: { stroke: theme.faintStroke, sw: 1.6, dash: '2 2' },
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
              <circle cx={9} cy={9} r={6} fill="none" stroke={s.stroke} strokeWidth={s.sw} strokeDasharray={s.dash} />
            </svg>
            <span>{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}
