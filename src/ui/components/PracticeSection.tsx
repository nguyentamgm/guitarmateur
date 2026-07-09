import { useMemo } from 'react';
import { format, romanNumeral, chordLabel, type Chord } from '../../music';
import { mergedBox, positions, TUNINGS } from '../../fretboard';
import { licksForState } from '../../state';
import type { Action, AppState } from '../../state';
import { font, theme } from '../theme';
import { Panel, PillButton, SectionKicker } from './primitives';
import { FretboardDiagram } from './FretboardDiagram';
import { Legend } from './Legend';
import { TabStaff } from './TabStaff';

/** Step 3 — practice licks with controls per chord. */
export function PracticeSection({ state, dispatch }: { state: AppState; dispatch: (action: Action) => void }) {
  const licks = useMemo(() => licksForState(state), [state]);
  const box = useMemo(() => {
    const pos = positions(TUNINGS[state.tuningId], state.key);
    return mergedBox(pos, state.positions);
  }, [state.tuningId, state.key.tonic, state.key.scaleId, state.positions]);

  const chordMap = useMemo(() => {
    const m = new Map<string, (typeof state.progression)[number]>();
    for (const e of state.progression) m.set(e.id, e);
    return m;
  }, [state.progression]);

  const targetLabel = state.targetRole === 'R' ? 'Root' : state.targetRole === '3' ? '3rd' : '5th';

  return (
    <section style={{ marginBottom: 34 }}>
      <SectionKicker style={{ marginBottom: 12 }}>Step 3 · Practice Licks</SectionKicker>
      <Panel>
        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-end', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: theme.muted, fontFamily: font.mono, marginBottom: 6 }}>Level</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {([1, 2, 3, 4, 5] as const).map((l) => (
                <PillButton key={l} selected={state.level === l} onClick={() => dispatch({ type: 'setLevel', level: l })} ariaLabel={`Level ${l}${l > 3 ? ' (coming soon)' : ''}`}>
                  <span style={{ opacity: l > 3 ? 0.4 : 1, position: 'relative' }}>
                    {l}
                    {l > 3 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -14,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: 8,
                          color: theme.muted,
                          whiteSpace: 'nowrap',
                          fontFamily: font.mono,
                        }}
                      >
                        soon
                      </span>
                    )}
                  </span>
                </PillButton>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: theme.muted, fontFamily: font.mono, marginBottom: 6 }}>Target</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['R', '3', '5'] as const).map((r) => (
                <PillButton key={r} selected={state.targetRole === r} onClick={() => dispatch({ type: 'setTargetRole', role: r })}>
                  {r === 'R' ? 'Root' : r === '3' ? '3rd' : '5th'}
                </PillButton>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'rerollAll' })}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              background: 'transparent',
              color: theme.text,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            ↻ Regenerate
          </button>
        </div>

        {/* Empty state */}
        {state.progression.length === 0 ? (
          <div
            style={{
              border: `1px dashed ${theme.border}`,
              borderRadius: 10,
              padding: 30,
              textAlign: 'center',
              color: theme.muted,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            Add some chords in Step 2 to generate practice licks.
          </div>
        ) : (
          <>
            {/* Legend */}
            <div style={{ marginBottom: 14 }}>
              <Legend
                items={[
                  { type: 'scaleNote', label: 'scale note' },
                  { type: 'tonic', label: 'root' },
                  { type: 'chordTone', label: 'chord tone' },
                  { type: 'target', label: `target · ${targetLabel}` },
                  { type: 'landing', label: 'landing note' },
                ]}
              />
            </div>

            {/* Cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {licks.map(({ entryId, lick }) => {
                const entry = chordMap.get(entryId);
                if (!entry) return null;
                const chord: Chord = { tonic: entry.chord.tonic, quality: entry.chord.quality };
                const targetTone = chordLabel(chord);

                // Find landing note (last note of the lick)
                const lastNote = lick.notes.length > 0 ? lick.notes[lick.notes.length - 1] : undefined;

                return (
                  <div
                    key={entryId}
                    style={{
                      background: theme.card,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    {/* Chord label + roman */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: theme.text }}>{targetTone}</span>
                      <span style={{ fontSize: 11, color: theme.muted, fontFamily: font.mono }}>{romanNumeral(state.key, chord)}</span>
                    </div>

                    {/* Target badge */}
                    <div
                      style={{
                        display: 'inline-block',
                        fontSize: 10,
                        fontFamily: font.mono,
                        color: theme.accent,
                        background: 'rgba(195,240,75,0.1)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        marginBottom: 10,
                      }}
                    >
                      target · {targetLabel} ({format(chord.tonic)})
                    </div>

                    {/* Fretboard with chord highlighting + landing */}
                    <FretboardDiagram
                      box={box}
                      highlight={{ chord, targetRole: state.targetRole }}
                      landing={lastNote ? { string: lastNote.string, fret: lastNote.fret } : undefined}
                      title={`${targetTone} — ${targetLabel} highlighting`}
                    />

                    {/* Lick header */}
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: font.mono,
                        color: theme.muted,
                        letterSpacing: '.15em',
                        textTransform: 'uppercase',
                        margin: '14px 0 6px',
                      }}
                    >
                      Lick
                    </div>

                    {/* Tab staff */}
                    <TabStaff lick={lick} title={`Lick for ${targetTone}`} />

                    {/* Per-card regenerate */}
                    <div style={{ marginTop: 10, textAlign: 'right' }}>
                      <button
                        type="button"
                        aria-label={`Regenerate lick for ${targetTone}`}
                        onClick={() => dispatch({ type: 'rerollLick', id: entryId })}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.muted,
                          fontSize: 12,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        ↻
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Panel>
    </section>
  );
}
