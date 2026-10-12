import { CHORD_QUALITIES, TONICS, chordLabel, format, romanNumeral, suggestedChords, type QualityId } from '../../music';
import { homeFret, TUNINGS } from '../../fretboard';
import type { Action, AppState } from '../../state';
import { font, theme } from '../theme';
import { Panel, PillButton, SectionKicker, StepIntro, Takeaways, TextButton } from './primitives';
import { useT } from '../useT';
import { BarGrid, type BarCell } from '@shared/ui/BarGrid';
import { KeyPicker } from '@shared/ui/controls';

/** Step 2 — build the chord progression licks are generated against, shown as a bar grid. */
export function ProgressionSection({
  state,
  dispatch,
  currentBar = null,
}: {
  state: AppState;
  dispatch: (action: Action) => void;
  /** The bar being heard (Step 3's playback), lit on the grid; null when idle. */
  currentBar?: number | null;
}) {
  const t = useT(state.language);
  // One cell per bar, as Theory draws a form: a 2-bar chord fills two.
  const bars: BarCell[] = state.progression.flatMap((entry) =>
    Array.from({ length: entry.bars }, () => ({ degree: romanNumeral(state.key, entry.chord), symbol: chordLabel(entry.chord) })),
  );
  const suggestions = suggestedChords(state.key);
  const { advancedOpen, advRoot, advQuality } = state.ui;
  const previewChord = { tonic: advRoot, quality: advQuality };

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    dispatch({ type: 'dragStart', index });
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = state.ui.dragIndex;
    if (fromIndex !== null && fromIndex !== toIndex) {
      const fromId = state.progression[fromIndex]?.id;
      if (fromId) dispatch({ type: 'reorderChord', fromId, toIndex });
    }
    dispatch({ type: 'dragEnd' });
  };

  return (
    <section style={{ marginBottom: 34 }}>
      <SectionKicker style={{ marginBottom: 6 }}>{t('progression.stepKicker')}</SectionKicker>
      <StepIntro>{t('progression.intro')}</StepIntro>
      <Panel>
        <Label>{t('progression.suggestions')}</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {suggestions.map((s, i) => (
            <button
              key={`${chordLabel(s.chord)}-${i}`}
              type="button"
              onClick={() => dispatch({ type: 'addChord', chord: s.chord })}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '7px 12px',
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: 'transparent',
                color: theme.text,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>{t('progression.suggestionLabel', { chord: s.label })}</span>
              <span style={{ fontSize: 10, color: theme.muted, fontFamily: font.mono }}>{s.roman}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <TextButton onClick={() => dispatch({ type: 'toggleAdvanced' })} ariaLabel={t('progression.advancedToggleAria')}>
            {advancedOpen ? t('progression.advancedHide') : t('progression.advancedShow')}
          </TextButton>
        </div>

        {advancedOpen && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.border}` }}>
            {/* The shared key picker: each root with its fret on the lowest string */}
            <Label>{t('progression.root')}</Label>
            <KeyPicker
              label={t('progression.root')}
              keys={TONICS}
              name={format}
              fret={(tonic) => homeFret(TUNINGS[state.tuningId], tonic)}
              value={advRoot}
              onChange={(tonic) => dispatch({ type: 'setAdvRoot', tonic })}
            />

            <Label style={{ marginTop: 14 }}>{t('progression.quality')}</Label>
            <Row>
              {(Object.keys(CHORD_QUALITIES) as QualityId[]).map((id) => (
                <PillButton key={id} selected={id === advQuality} wide onClick={() => dispatch({ type: 'setAdvQuality', quality: id })}>
                  {t(`quality.${id}`)}
                </PillButton>
              ))}
            </Row>

            <button
              type="button"
              onClick={() => dispatch({ type: 'addChord', chord: previewChord })}
              style={{
                marginTop: 14,
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: theme.accent,
                color: theme.accentText,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {t('progression.addChord', { chord: chordLabel(previewChord) })}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 }}>
          <Label style={{ marginBottom: 0 }}>{t('progression.progression')}</Label>
          <div style={{ display: 'flex', gap: 14 }}>
            <TextButton onClick={() => dispatch({ type: 'resetProgression' })}>{t('progression.resetDefault')}</TextButton>
            <TextButton onClick={() => dispatch({ type: 'clearProgression' })}>{t('progression.clearAll')}</TextButton>
          </div>
        </div>

        {state.progression.length === 0 ? (
          <div
            style={{
              border: `1px dashed ${theme.border}`,
              borderRadius: 10,
              padding: 20,
              textAlign: 'center',
              color: theme.muted,
              fontSize: 13,
            }}
          >
            {t('progression.empty')}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {state.progression.map((entry, i) => (
              <div
                key={entry.id}
                draggable
                onDragStart={handleDragStart(i)}
                onDragOver={handleDragOver}
                onDrop={handleDrop(i)}
                onDragEnd={() => dispatch({ type: 'dragEnd' })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 9,
                  border: `1px solid ${theme.border}`,
                  background: theme.card,
                  opacity: state.ui.dragIndex === i ? 0.5 : 1,
                  cursor: 'grab',
                }}
              >
                <span style={{ fontSize: 10, color: theme.subtle, fontFamily: font.mono }}>{i + 1}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{chordLabel(entry.chord)}</span>
                  <span style={{ fontSize: 10, color: theme.muted, fontFamily: font.mono }}>{romanNumeral(state.key, entry.chord)}</span>
                </div>
                <button
                  type="button"
                  aria-label={t('progression.barsToggle', {
                    chord: chordLabel(entry.chord),
                    bars: t('progression.bars', { count: entry.bars }),
                  })}
                  title={t('progression.bars', { count: entry.bars })}
                  onClick={() => dispatch({ type: 'setBars', id: entry.id, bars: entry.bars === 1 ? 2 : 1 })}
                  style={{
                    background: entry.bars === 2 ? theme.accentTint : 'transparent',
                    border: `1px solid ${theme.border}`,
                    borderRadius: 6,
                    color: entry.bars === 2 ? theme.accent : theme.muted,
                    fontSize: 10,
                    fontFamily: font.mono,
                    cursor: 'pointer',
                    padding: '3px 6px',
                    lineHeight: 1,
                  }}
                >
                  ×{entry.bars}
                </button>
                <button
                  type="button"
                  aria-label={t('progression.removeChord', { chord: chordLabel(entry.chord) })}
                  onClick={() => dispatch({ type: 'removeChord', id: entry.id })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: theme.subtle,
                    fontSize: 15,
                    cursor: 'pointer',
                    padding: '0 2px',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {bars.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <BarGrid label={t('progression.grid')} bars={bars} current={currentBar} />
          </div>
        )}
        <Takeaways
          rows={[
            { label: t('common.takeaway'), text: t('progression.takeaway') },
            { label: t('common.tryIt'), text: t('progression.tryIt') },
          ]}
        />
      </Panel>
    </section>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontSize: 13, color: theme.muted, fontWeight: 600, marginBottom: 8, ...style }}>{children}</div>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>;
}
