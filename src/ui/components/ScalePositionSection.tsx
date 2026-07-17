import { useMemo } from 'react';
import { format, SCALE_IDS, SCALES, TONICS, type NoteName } from '../../music';
import { mergedBox, positions, recommendedPosition, TUNINGS, type TuningId } from '../../fretboard';
import type { Action, AppState } from '../../state';
import { font, theme } from '../theme';
import { Panel, PillButton, SectionKicker } from './primitives';
import { FretboardDiagram } from './FretboardDiagram';
import { Legend } from './Legend';

const sameNote = (a: NoteName, b: NoteName) => a.letter === b.letter && a.alter === b.alter;

/** Step 1 — pick key, scale, and position(s); see spelled notes on the fretboard. */
export function ScalePositionSection({ state, dispatch }: { state: AppState; dispatch: (action: Action) => void }) {
  const { key } = state;
  const pos = useMemo(() => positions(TUNINGS[state.tuningId], key), [state.tuningId, key]);
  const rec = useMemo(() => recommendedPosition(pos), [pos]);
  const box = useMemo(() => mergedBox(pos, state.positions), [pos, state.positions]);
  const scaleName = SCALES[key.scaleId].name;
  const combined = state.positions.length > 1;
  const title = `${format(key.tonic)} ${scaleName}${combined ? ` — frets ${box.minFret}–${box.maxFret} (combined)` : ''}`;

  return (
    <section style={{ marginBottom: 34 }}>
      <SectionKicker style={{ marginBottom: 12 }}>Step 1 · Scale &amp; Position</SectionKicker>
      <Panel>
        {/* Tuning picker */}
        <Label style={{ marginTop: 0 }}>Tuning</Label>
        <Row>
          {(Object.entries(TUNINGS) as [string, { id: string; name: string }][]).map(([, t]) => (
            <PillButton key={t.id} selected={t.id === state.tuningId} onClick={() => dispatch({ type: 'setTuning', tuningId: t.id as TuningId })}>
              {t.name}
            </PillButton>
          ))}
        </Row>

        {/* Key picker */}
        <Label style={{ marginTop: 16 }}>Key</Label>
        <Row>
          {TONICS.map((t) => (
            <PillButton key={format(t)} selected={sameNote(t, key.tonic)} onClick={() => dispatch({ type: 'setKey', tonic: t })}>
              {format(t)}
            </PillButton>
          ))}
        </Row>

        {/* Scale picker — driven by the registry */}
        <Label style={{ marginTop: 16 }}>Scale</Label>
        <Row>
          {SCALE_IDS.map((id) => (
            <PillButton key={id} selected={id === key.scaleId} wide onClick={() => dispatch({ type: 'setScale', scaleId: id })}>
              {SCALES[id].name}
            </PillButton>
          ))}
        </Row>

        {/* Position cards */}
        <Label style={{ marginTop: 18 }}>Positions</Label>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
          {pos.map((p) => (
            <PositionCard
              key={p.index}
              index={p.index}
              range={`frets ${p.minFret}–${p.maxFret}`}
              recommended={p.index === rec}
              selected={state.positions.includes(p.index)}
              onClick={() => dispatch({ type: 'togglePosition', index: p.index })}
              box={{ notes: p.notes, minFret: p.minFret, maxFret: p.maxFret }}
            />
          ))}
        </div>

        {/* Merged / selected diagram */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: theme.text, marginBottom: 10 }}>{title}</div>
          <Legend
            items={[
              { type: 'tonic', label: 'root' },
              { type: 'scaleNote', label: 'scale note' },
              ...(key.scaleId === 'blues' ? [{ type: 'decoration' as const, label: '♭5 (blue note)' }] : []),
            ]}
          />
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <FretboardDiagram box={box} title={title} />
          </div>
        </div>
      </Panel>
    </section>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 12, color: theme.muted, marginBottom: 8, fontFamily: font.mono, ...style }}>{children}</div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>;
}

function PositionCard({
  index,
  range,
  recommended,
  selected,
  onClick,
  box,
}: {
  index: number;
  range: string;
  recommended: boolean;
  selected: boolean;
  onClick: () => void;
  box: { notes: import('../../fretboard').FretNote[]; minFret: number; maxFret: number };
}) {
  const count = box.maxFret - box.minFret + 1;
  const width = Math.round((7 + count * 15 + 7) * 1.9) + 20;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{
        flexShrink: 0,
        width,
        textAlign: 'left',
        display: 'block',
        border: `1px solid ${selected ? theme.accent : theme.border}`,
        background: selected ? theme.accentTint : theme.card,
        borderRadius: 11,
        padding: 10,
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Position {index + 1}</span>
        {recommended && (
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', color: theme.accent, fontFamily: font.mono }}>REC</span>
        )}
      </div>
      <FretboardDiagram box={box} mini title={`Position ${index + 1}, ${range}`} />
      <div style={{ fontSize: 11, color: theme.muted, marginTop: 6, fontFamily: font.mono }}>{range}</div>
    </button>
  );
}
