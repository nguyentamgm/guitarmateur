import { CHORD_QUALITIES, TONICS, chordLabel, format, romanNumeral, suggestedChords, type NoteName, type QualityId } from '../../music';
import type { Action, AppState } from '../../state';
import { font, theme } from '../theme';
import { Panel, PillButton, SectionKicker, TextButton } from './primitives';

const sameNote = (a: NoteName, b: NoteName) => a.letter === b.letter && a.alter === b.alter;

/** Step 2 — build the chord progression licks are generated against. */
export function ProgressionSection({ state, dispatch }: { state: AppState; dispatch: (action: Action) => void }) {
  const suggestions = suggestedChords(state.key);
  const { advancedOpen, advRoot, advQuality } = state.ui;
  const previewChord = { tonic: advRoot, quality: advQuality };

  const handleDragStart = (index: number) => (e: React.DragEvent) => {
    dispatch({ type: 'dragStart', index });
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
      <SectionKicker style={{ marginBottom: 12 }}>Step 2 · Chord Progression</SectionKicker>
      <Panel>
        <Label>Suggestions</Label>
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
              <span style={{ fontSize: 13, fontWeight: 600 }}>+ {s.label}</span>
              <span style={{ fontSize: 10, color: theme.muted, fontFamily: font.mono }}>{s.roman}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 14 }}>
          <TextButton onClick={() => dispatch({ type: 'toggleAdvanced' })} ariaLabel="Toggle advanced chord adder">
            {advancedOpen ? 'Hide advanced adder' : 'Advanced: pick any chord'}
          </TextButton>
        </div>

        {advancedOpen && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${theme.border}` }}>
            <Label>Root</Label>
            <Row>
              {TONICS.map((t) => (
                <PillButton key={format(t)} selected={sameNote(t, advRoot)} onClick={() => dispatch({ type: 'setAdvRoot', tonic: t })}>
                  {format(t)}
                </PillButton>
              ))}
            </Row>

            <Label style={{ marginTop: 14 }}>Quality</Label>
            <Row>
              {(Object.entries(CHORD_QUALITIES) as [QualityId, { name: string }][]).map(([id, q]) => (
                <PillButton key={id} selected={id === advQuality} wide onClick={() => dispatch({ type: 'setAdvQuality', quality: id })}>
                  {q.name}
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
              Add {chordLabel(previewChord)}
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 }}>
          <Label style={{ marginBottom: 0 }}>Progression</Label>
          <div style={{ display: 'flex', gap: 14 }}>
            <TextButton onClick={() => dispatch({ type: 'resetProgression' })}>Reset to default</TextButton>
            <TextButton onClick={() => dispatch({ type: 'clearProgression' })}>Clear all</TextButton>
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
            No chords yet — tap a suggestion above to build your progression.
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
                  aria-label={`Remove ${chordLabel(entry.chord)}`}
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
      </Panel>
    </section>
  );
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontSize: 12, color: theme.muted, marginBottom: 8, fontFamily: font.mono, ...style }}>{children}</div>;
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{children}</div>;
}
