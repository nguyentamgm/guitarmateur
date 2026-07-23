import { useMemo, useState, useRef, useEffect } from 'react';
import { format, romanNumeral, chordLabel, type Chord } from '../../music';
import { mergedBox, positions, TUNINGS } from '../../fretboard';
import { licksForState } from '../../state';
import type { Action, AppState } from '../../state';
import { font, theme } from '../theme';
import { Panel, PillButton, SectionKicker, Toggle } from './primitives';
import { FretboardDiagram } from './FretboardDiagram';
import { Legend } from './Legend';
import { TabStaff } from './TabStaff';
import { PlaybackControls } from './PlaybackControls';
import { useTransport } from '../useTransport';
import { KeyboardShortcuts } from '../KeyboardShortcuts';

/** Step 3 — practice licks with controls per chord. */
export function PracticeSection({ state, dispatch }: { state: AppState; dispatch: (action: Action) => void }) {
  const licks = useMemo(() => licksForState(state), [state]);
  const transport = useTransport();
  const [countIn, setCountIn] = useState(true);
  const [loop, setLoop] = useState(true);
  const plainLicks = useMemo(() => licks.map((l) => l.lick), [licks]);
  const active = transport.position;

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (active?.entryIndex !== undefined && cardRefs.current[active.entryIndex]) {
      cardRefs.current[active.entryIndex]!.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [active?.entryIndex]);

  const box = useMemo(() => {
    const pos = positions(TUNINGS[state.tuningId], state.key);
    return mergedBox(pos, state.positions);
  }, [state.tuningId, state.key.tonic, state.key.scaleId, state.positions]);

  const stringLabels = TUNINGS[state.tuningId].strings.map((p) => p.letter);

  const chordMap = useMemo(() => {
    const m = new Map<string, (typeof state.progression)[number]>();
    for (const e of state.progression) m.set(e.id, e);
    return m;
  }, [state.progression]);

  const targetLabel = state.targetRole === 'R' ? 'Root' : state.targetRole === '3' ? '3rd' : state.targetRole === '5' ? '5th' : '7th';

  const levelDescriptions: Record<number, string> = {
    1: 'Quarter notes + half notes (easy)',
    2: 'Quarters + paired 8ths',
    3: 'Straight 8ths + shuffle feel',
    4: 'Syncopation with rests',
    5: '16th runs + advanced techniques',
  };

  return (
    <section style={{ marginBottom: 34 }}>
      <KeyboardShortcuts
        dispatch={dispatch}
        transport={transport}
        licks={plainLicks}
        tempoBpm={state.tempoBpm}
        countIn={countIn}
        loop={loop}
        swingEnabled={state.swingEnabled}
      />
      <SectionKicker style={{ marginBottom: 12 }}>Step 3 · Practice Licks</SectionKicker>
      <Panel>
        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-end', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: theme.muted, fontFamily: font.mono, marginBottom: 6 }}>Level</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {([1, 2, 3, 4, 5] as const).map((l) => (
                <PillButton key={l} selected={state.level === l} onClick={() => dispatch({ type: 'setLevel', level: l })} ariaLabel={`Level ${l}`}>
                  {l}
                </PillButton>
              ))}
            </div>
            <div style={{ fontSize: 10, color: theme.muted, fontFamily: font.mono, marginTop: 4 }}>
              {levelDescriptions[state.level]}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: theme.muted, fontFamily: font.mono, marginBottom: 6 }}>Target</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['R', '3', '5', '7'] as const).map((r) => (
                <PillButton key={r} selected={state.targetRole === r} onClick={() => dispatch({ type: 'setTargetRole', role: r })}>
                  {r === 'R' ? 'Root' : r === '3' ? '3rd' : r === '5' ? '5th' : '7th'}
                </PillButton>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: theme.muted, fontFamily: font.mono, marginBottom: 6 }}>&nbsp;</div>
            <Toggle
              checked={state.resolveToNext}
              onChange={(value) => dispatch({ type: 'setResolveToNext', value })}
              label="Land on next chord"
              ariaLabel="Land on next chord"
            />
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
            {/* Playback */}
            <PlaybackControls
              licks={plainLicks}
              tempoBpm={state.tempoBpm}
              onTempoChange={(bpm) => dispatch({ type: 'setTempo', bpm })}
              transport={transport}
              countIn={countIn}
              loop={loop}
              onCountInChange={setCountIn}
              onLoopChange={setLoop}
              swingEnabled={state.swingEnabled}
              onSwingChange={(v) => dispatch({ type: 'setSwing', value: v })}
              clickGain={state.clickGain}
              noteGain={state.noteGain}
              onClickGainChange={(gain) => dispatch({ type: 'setClickGain', gain })}
              onNoteGainChange={(gain) => dispatch({ type: 'setNoteGain', gain })}
            />

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
              {licks.map(({ entryId, lick }, i) => {
                const entry = chordMap.get(entryId);
                if (!entry) return null;
                const chord: Chord = { tonic: entry.chord.tonic, quality: entry.chord.quality };
                const targetTone = chordLabel(chord);
                const isActiveCard = active?.entryIndex === i;

                // Find landing note (last note of the lick)
                const lastNote = lick.notes.length > 0 ? lick.notes[lick.notes.length - 1] : undefined;

                return (
                  <div
                    key={entryId}
                    ref={(el) => { cardRefs.current[i] = el; }}
                    style={{
                      background: theme.card,
                      border: `1px solid ${isActiveCard ? theme.accent : theme.border}`,
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
                      stringLabels={stringLabels}
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
                    <TabStaff
                      lick={lick}
                      title={`Lick for ${targetTone}`}
                      activeNoteIndex={isActiveCard ? active?.noteIndex : undefined}
                      stringLabels={stringLabels}
                    />

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
