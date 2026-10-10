import { useMemo } from 'react';
import { format, SCALE_IDS, SCALES, TONICS, type NoteName } from '../../music';
import { mergedBox, positions, recommendedPosition, TUNINGS, type TuningId } from '../../fretboard';
import type { Action, AppState } from '../../state';
import { font, theme } from '../theme';
import { Panel, PillButton, SectionKicker } from './primitives';
import { Fretboard, type LabelMode } from '@shared/ui/Fretboard';
import { PositionFrame } from '@shared/ui/PositionFrame';
import { neckGeometry } from '@shared/ui/geometry';
import { ChipGroup } from '@shared/ui/controls';
import { boxDots, tuningNames } from '../neck';
import { notePlayer } from '../notePlayer';
import { Legend } from './Legend';
import { intervalLabel } from '../labels';
import { useT } from '../useT';

const sameNote = (a: NoteName, b: NoteName) => a.letter === b.letter && a.alter === b.alter;

/** Step 1 — pick key, scale, and position(s); see spelled notes on the fretboard. */
export function ScalePositionSection({
  state,
  dispatch,
  soundOn = true,
  labels = 'degree',
  onLabels = () => {},
}: {
  state: AppState;
  dispatch: (action: Action) => void;
  /** The header's sound toggle: notes clicked on the neck sound only while it is on. */
  soundOn?: boolean;
  /** What the neck's dots show: degrees or note names (shared with the lick cards). */
  labels?: LabelMode;
  onLabels?: (mode: LabelMode) => void;
}) {
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
  const tuning = TUNINGS[state.tuningId];
  const names = useMemo(() => tuningNames(tuning), [tuning]);
  // Up to the highest box, at least 12 frets, as Theory draws the whole neck.
  const geometry = useMemo(() => neckGeometry(Math.max(12, ...pos.map((p) => p.maxFret)), { fretWidth: 46 }), [pos]);
  const dots = useMemo(() => boxDots(box, key), [box, key]);

  return (
    <section style={{ marginBottom: 34 }}>
      <SectionKicker style={{ marginBottom: 12 }}>{t('scalebox.stepKicker')}</SectionKicker>
      <Panel>
        {/* Tuning picker */}
        <Label style={{ marginTop: 0 }}>{t('scalebox.tuning')}</Label>
        <Row>
          {(Object.keys(TUNINGS) as TuningId[]).map((tuningId) => (
            <PillButton key={tuningId} selected={tuningId === state.tuningId} wide onClick={() => dispatch({ type: 'setTuning', tuningId })}>
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

        {/* Boxes: one chip per position, on the neck as numbered frames */}
        <Label style={{ marginTop: 18 }}>{t('scalebox.boxes')}</Label>
        <Row>
          {pos.map((p, i) => (
            <button
              key={p.index}
              type="button"
              className="chip text"
              aria-pressed={state.positions.includes(p.index)}
              onClick={() => dispatch({ type: 'togglePosition', index: p.index })}
            >
              {t('scalebox.boxLabel', { n: i + 1 })}{' '}
              <span style={{ fontFamily: font.mono, opacity: 0.75 }}>{t('scalebox.fretRange', { min: p.minFret, max: p.maxFret })}</span>
              {p.index === rec && (
                <span style={{ marginLeft: 6, fontWeight: 700, color: 'var(--accent)' }} title={t('scalebox.recommendedAria')}>
                  {t('scalebox.recommended')}
                </span>
              )}
            </button>
          ))}
        </Row>

        {/* The whole neck: every box framed, the selected one(s) highlighted with their notes */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 18px', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{title}</div>
            <ChipGroup<LabelMode>
              label={t('scalebox.labels')}
              items={[
                { value: 'degree', text: t('scalebox.labelDegrees') },
                { value: 'name', text: t('scalebox.labelNames') },
              ]}
              value={labels}
              onChange={onLabels}
            />
          </div>
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
          <div style={{ marginTop: 12 }}>
            <Fretboard
              geometry={geometry}
              dots={dots}
              label={title}
              box={box}
              labels={labels}
              stringNames={names}
              leftHanded={state.leftHanded}
              play={notePlayer(soundOn)}
            >
              {pos.map((p, i) => (
                <PositionFrame
                  key={p.index}
                  g={geometry}
                  span={{ index: i + 1, minFret: p.minFret, maxFret: p.maxFret }}
                  on={state.positions.includes(p.index)}
                  leftHanded={state.leftHanded}
                />
              ))}
            </Fretboard>
          </div>
        </div>
      </Panel>
    </section>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 13, color: theme.muted, fontWeight: 600, marginBottom: 8, ...style }}>{children}</div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>;
}
