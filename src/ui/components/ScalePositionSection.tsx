import { useMemo, useState } from 'react';
import { format, SCALE_IDS, SCALES, TONICS, type Key, type NoteName, type ScaleId } from '../../music';
import { areAdjacent, mergedBox, positions, recommendedPosition, TUNINGS } from '../../fretboard';
import { font, theme } from '../theme';
import { Panel, PillButton, SectionKicker } from './primitives';
import { FretboardDiagram } from './FretboardDiagram';
import { Legend } from './Legend';

const sameNote = (a: NoteName, b: NoteName) => a.letter === b.letter && a.alter === b.alter;

/** Step 1 — pick key, scale, and position(s); see spelled notes on the fretboard. */
export function ScalePositionSection() {
  const [tonic, setTonic] = useState<NoteName>(TONICS[0]!);
  const [scaleId, setScaleId] = useState<ScaleId>('minorPentatonic');

  const key: Key = useMemo(() => ({ tonic, scaleId }), [tonic, scaleId]);
  const pos = useMemo(() => positions(TUNINGS.standard, key), [key]);
  const rec = useMemo(() => recommendedPosition(pos), [pos]);

  const [selected, setSelected] = useState<number[]>([rec]);

  // Reset selection to the recommended box whenever key/scale (and thus positions) change.
  const changeKey = (next: Partial<{ tonic: NoteName; scaleId: ScaleId }>) => {
    const nextKey: Key = { tonic: next.tonic ?? tonic, scaleId: next.scaleId ?? scaleId };
    if (next.tonic) setTonic(next.tonic);
    if (next.scaleId) setScaleId(next.scaleId);
    const nextPos = positions(TUNINGS.standard, nextKey);
    setSelected([recommendedPosition(nextPos)]);
  };

  // Toggle: min 1 selected, max 2, and a pair must be adjacent (else it replaces).
  const togglePosition = (i: number) => {
    setSelected((cur) => {
      if (cur.includes(i)) return cur.length > 1 ? cur.filter((x) => x !== i) : cur;
      if (cur.length === 1 && areAdjacent(pos, cur[0]!, i)) return [cur[0]!, i].sort((a, b) => a - b);
      return [i];
    });
  };

  const box = useMemo(() => mergedBox(pos, selected), [pos, selected]);
  const scaleName = SCALES[scaleId].name;
  const combined = selected.length > 1;
  const title = `${format(tonic)} ${scaleName}${combined ? ` — frets ${box.minFret}–${box.maxFret} (combined)` : ''}`;

  return (
    <section style={{ marginBottom: 34 }}>
      <SectionKicker style={{ marginBottom: 12 }}>Step 1 · Scale &amp; Position</SectionKicker>
      <Panel>
        {/* Key picker */}
        <Label>Key</Label>
        <Row>
          {TONICS.map((t) => (
            <PillButton key={format(t)} selected={sameNote(t, tonic)} onClick={() => changeKey({ tonic: t })}>
              {format(t)}
            </PillButton>
          ))}
        </Row>

        {/* Scale picker — driven by the registry */}
        <Label style={{ marginTop: 16 }}>Scale</Label>
        <Row>
          {SCALE_IDS.map((id) => (
            <PillButton key={id} selected={id === scaleId} wide onClick={() => changeKey({ scaleId: id })}>
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
              selected={selected.includes(p.index)}
              onClick={() => togglePosition(p.index)}
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
              ...(scaleId === 'blues' ? [{ type: 'decoration' as const, label: '♭5 (blue note)' }] : []),
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
