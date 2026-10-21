import { useMemo } from 'react';
import { format, SCALE_IDS, SCALES, TONICS } from '../../music';
import { homeFret, mergedBox, positions, recommendedPosition, TUNINGS, type TuningId } from '../../fretboard';
import type { Action, AppState } from '../../state';
import { font, theme } from '../theme';
import { Panel, PillButton, StepHead, StepHints } from './primitives';
import { Fretboard, type LabelMode } from '@shared/ui/Fretboard';
import { PositionFrame } from '@shared/ui/PositionFrame';
import { useNeckGeometry } from '@shared/ui/useNeckGeometry';
import { ChipGroup, KeyPicker, RadioGroup } from '@shared/ui/controls';
import { boxDots, dotWords, tuningNames } from '../neck';
import { notePlayer } from '../notePlayer';
import { Legend } from './Legend';
import { intervalLabel } from '../labels';
import { useT } from '../useT';

/** The ear trainer's level for a scale it teaches (docs/ear.md "Links"): 12 the minor pentatonic, 13 the blues scale. */
const EAR_LEVELS: Readonly<Partial<Record<string, number>>> = { minorPentatonic: 12, blues: 13 };

/** Step 1 — pick key, scale, and position(s); see spelled notes on the fretboard. */
export function ScalePositionSection({
  state,
  dispatch,
  labels = 'degree',
  onLabels = () => {},
}: {
  state: AppState;
  dispatch: (action: Action) => void;
  /** What the neck's dots show: degrees or note names (shared with the lick cards). */
  labels?: LabelMode;
  onLabels?: (mode: LabelMode) => void;
}) {
  const t = useT(state.language);
  const words = useMemo(() => dotWords(t), [t]);
  const { key } = state;
  const pos = useMemo(() => positions(TUNINGS[state.tuningId], key), [state.tuningId, key]);
  const rec = useMemo(() => recommendedPosition(pos), [pos]);
  const box = useMemo(() => mergedBox(pos, state.positions), [pos, state.positions]);
  // "A minor pentatonic": each scale's own phrase, since word order and case differ by scale.
  const name = t(`scaleTitle.${key.scaleId}`, { tonic: format(key.tonic) });
  const title = state.positions.length > 1 ? t('scalebox.titleCombined', { name, min: box.minFret, max: box.maxFret }) : name;
  const tuning = TUNINGS[state.tuningId];
  const names = useMemo(() => tuningNames(tuning), [tuning]);
  // Up to the highest box, at least 12 frets, as Theory draws the whole neck.
  const geometry = useNeckGeometry(Math.max(12, ...pos.map((p) => p.maxFret)), { fretWidth: 46 });
  const dots = useMemo(() => boxDots(box, key), [box, key]);

  return (
    <section style={{ marginBottom: 34 }}>
      <StepHead language={state.language} step="scalebox" />
      <Panel>
        {/* Tuning picker */}
        <Label style={{ marginTop: 0 }}>{t('scalebox.tuning')}</Label>
        <Row label={t('scalebox.tuning')}>
          {(Object.keys(TUNINGS) as TuningId[]).map((tuningId) => (
            <PillButton key={tuningId} radio selected={tuningId === state.tuningId} wide onClick={() => dispatch({ type: 'setTuning', tuningId })}>
              {t(`tuning.${tuningId}`)}
            </PillButton>
          ))}
        </Row>

        {/* Key picker: each key with its fret on the lowest string, where the hand goes */}
        <Label style={{ marginTop: 16 }}>{t('scalebox.key')}</Label>
        <KeyPicker
          label={t('scalebox.key')}
          keys={TONICS}
          name={format}
          fret={(tonic) => homeFret(tuning, tonic)}
          value={key.tonic}
          onChange={(tonic) => dispatch({ type: 'setKey', tonic })}
        />

        {/* Scale picker — driven by the registry */}
        <Label style={{ marginTop: 16 }}>{t('scalebox.scale')}</Label>
        <Row label={t('scalebox.scale')}>
          {SCALE_IDS.map((id) => (
            <PillButton key={id} radio selected={id === key.scaleId} wide onClick={() => dispatch({ type: 'setScale', scaleId: id })}>
              {t(`scale.${id}`)}
            </PillButton>
          ))}
        </Row>

        {/* The same notes, by ear: the ear trainer's level for this scale (#261), a plain link. */}
        {EAR_LEVELS[key.scaleId] !== undefined && (
          <div style={{ marginTop: 10, fontSize: 14 }}>
            <a href={`/ear?level=${EAR_LEVELS[key.scaleId]}&lang=${state.language}`}>{t('scalebox.earLink')}</a>
          </div>
        )}

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
                <span style={{ marginLeft: 6, fontWeight: 700 }}>{t('scalebox.recommended')}</span>
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
              words={words}
              play={notePlayer(state.noteGain)}
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
        <StepHints language={state.language} step="scalebox" />
      </Panel>
    </section>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 13, color: theme.muted, fontWeight: 600, marginBottom: 8, ...style }}>{children}</div>
  );
}

const ROW: React.CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 8 };

/** A row of chips; with `label`, a radio group (one choice) named by it. */
function Row({ children, label }: { children: React.ReactNode; label?: string }) {
  return label ? (
    <RadioGroup label={label} style={ROW}>
      {children}
    </RadioGroup>
  ) : (
    <div style={ROW}>{children}</div>
  );
}
