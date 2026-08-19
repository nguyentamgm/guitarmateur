import { useMemo } from 'react';
import { format, SCALE_IDS, SCALES, TONICS, type NoteName } from '../../music';
import { mergedBox, positions, recommendedPosition, TUNINGS, type TuningId } from '../../fretboard';
import type { LocaleId } from '../../i18n';
import type { Action, AppState } from '../../state';
import { font, theme } from '../theme';
import { Panel, PillButton, SectionKicker } from './primitives';
import { FretboardDiagram } from './FretboardDiagram';
import { Legend } from './Legend';
import { intervalLabel } from '../labels';
import { useT } from '../useT';

const sameNote = (a: NoteName, b: NoteName) => a.letter === b.letter && a.alter === b.alter;

/** Step 1 — pick key, scale, and position(s); see spelled notes on the fretboard. */
export function ScalePositionSection({ state, dispatch }: { state: AppState; dispatch: (action: Action) => void }) {
  const t = useT(state.language);
  const { key } = state;
  const pos = useMemo(() => positions(TUNINGS[state.tuningId], key), [state.tuningId, key]);
  const rec = useMemo(() => recommendedPosition(pos), [pos]);
  const box = useMemo(() => mergedBox(pos, state.positions), [pos, state.positions]);
  const scaleName = t(`scale.${key.scaleId}`);
  const combined = state.positions.length > 1;
  const title = combined
    ? t('scalebox.titleCombined', { tonic: format(key.tonic), scale: scaleName, min: box.minFret, max: box.maxFret })
    : t('scalebox.title', { tonic: format(key.tonic), scale: scaleName });
  const stringLabels = TUNINGS[state.tuningId].strings.map((p) => p.letter);

  return (
    <section style={{ marginBottom: 34 }}>
      <SectionKicker style={{ marginBottom: 12 }}>{t('scalebox.stepKicker')}</SectionKicker>
      <Panel>
        {/* Tuning picker */}
        <Label style={{ marginTop: 0 }}>{t('scalebox.tuning')}</Label>
        <Row>
          {(Object.keys(TUNINGS) as TuningId[]).map((tuningId) => (
            <PillButton key={tuningId} selected={tuningId === state.tuningId} onClick={() => dispatch({ type: 'setTuning', tuningId })}>
              {t(`tuning.${tuningId}`)}
            </PillButton>
          ))}
        </Row>

        {/* Key picker */}
        <Label style={{ marginTop: 16 }}>{t('scalebox.key')}</Label>
        <Row>
          {TONICS.map((tonic) => (
            <PillButton key={format(tonic)} selected={sameNote(tonic, key.tonic)} onClick={() => dispatch({ type: 'setKey', tonic })}>
              {format(tonic)}
            </PillButton>
          ))}
        </Row>

        {/* Scale picker — driven by the registry */}
        <Label style={{ marginTop: 16 }}>{t('scalebox.scale')}</Label>
        <Row>
          {SCALE_IDS.map((id) => (
            <PillButton key={id} selected={id === key.scaleId} wide onClick={() => dispatch({ type: 'setScale', scaleId: id })}>
              {t(`scale.${id}`)}
            </PillButton>
          ))}
        </Row>

        {/* Position cards */}
        <Label style={{ marginTop: 18 }}>{t('scalebox.boxes')}</Label>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
          {pos.map((p, i) => (
            <PositionCard
              key={p.index}
              displayNumber={i + 1}
              range={t('scalebox.fretRange', { min: p.minFret, max: p.maxFret })}
              language={state.language}
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
              { type: 'tonic', label: t('legend.root') },
              { type: 'scaleNote', label: t('legend.scaleNote') },
              ...(SCALES[key.scaleId].decoration?.addedIntervals.map((iv) => ({
                type: 'decoration' as const,
                label: t('legend.blueNote', { interval: intervalLabel(iv) }),
              })) ?? []),
            ]}
          />
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <FretboardDiagram box={box} title={title} stringLabels={stringLabels} leftHanded={state.leftHanded} />
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
  displayNumber,
  range,
  recommended,
  selected,
  onClick,
  box,
  language,
}: {
  displayNumber: number;
  range: string;
  recommended: boolean;
  selected: boolean;
  onClick: () => void;
  box: { notes: import('../../fretboard').FretNote[]; minFret: number; maxFret: number };
  language: LocaleId;
}) {
  const t = useT(language);
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
        <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{t('scalebox.boxLabel', { n: displayNumber })}</span>
        {recommended && (
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.1em', color: theme.accent, fontFamily: font.mono }}>{t('scalebox.recommended')}</span>
        )}
      </div>
      <FretboardDiagram box={box} mini title={t('scalebox.boxTitle', { n: displayNumber, range })} />
      <div style={{ fontSize: 11, color: theme.muted, marginTop: 6, fontFamily: font.mono }}>{range}</div>
    </button>
  );
}
