import { useMemo, useState, useRef, useEffect } from 'react';
import { chordLabel, romanNumeral, SCALES, type Chord } from '../../music';
import { mergedBox, positions, TUNINGS } from '../../fretboard';
import { licksForState } from '../../state';
import type { Action, AppState } from '../../state';
import { font, theme } from '../theme';
import { Panel, PillButton, SectionKicker, Toggle } from './primitives';
import { Fretboard, type LabelMode } from '@shared/ui/Fretboard';
import { neckGeometry } from '@shared/ui/geometry';
import { boxDots, stringNumber, tuningNames } from '../neck';
import { notePlayer } from '../notePlayer';
import { Legend } from './Legend';
import { TabStaff } from './TabStaff';
import { PlaybackControls } from './PlaybackControls';
import { useTransport } from '../useTransport';
import { KeyboardShortcuts } from '../KeyboardShortcuts';
import { intervalLabel, targetBadgeText } from '../labels';
import { useT } from '../useT';

/** Step 3 — practice licks with controls per chord. `soundOn` is the header's sound toggle. */
export function PracticeSection({
  state,
  dispatch,
  soundOn = true,
  onPlay,
  labels = 'degree',
}: {
  state: AppState;
  dispatch: (action: Action) => void;
  soundOn?: boolean;
  /** Called when playback starts. */
  onPlay?: () => void;
  /** What the necks' dots show: degrees or note names (chosen in Step 1). */
  labels?: LabelMode;
}) {
  const t = useT(state.language);
  const licks = useMemo(() => licksForState(state), [state]);
  const transport = useTransport(!soundOn);
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

  const { isPlaying } = transport;
  useEffect(() => {
    if (isPlaying) onPlay?.();
  }, [isPlaying, onPlay]);

  const { stop } = transport;
  useEffect(() => {
    if (state.progression.length === 0) {
      stop();
    }
  }, [state.progression.length, stop]);

  const { key: stateKey, progression: stateProgression } = state;
  const box = useMemo(() => {
    const pos = positions(TUNINGS[state.tuningId], stateKey);
    return mergedBox(pos, state.positions);
  }, [state.tuningId, stateKey, state.positions]);

  const names = useMemo(() => tuningNames(TUNINGS[state.tuningId]), [state.tuningId]);
  // The tab names its strings as the neck does (low → high here): one source, 'e' for the thinnest.
  const stringLabels = TUNINGS[state.tuningId].strings.map((_, i) => names[stringNumber(i)]);
  // Each card shows just the box's frets: a window of the neck (with the nut when the box starts at 0).
  const cardGeometry = useMemo(
    () => neckGeometry(box.maxFret, { from: box.minFret > 0 ? box.minFret - 1 : 0, fretWidth: 50 }),
    [box.minFret, box.maxFret],
  );

  const chordMap = useMemo(() => {
    const m = new Map<string, (typeof stateProgression)[number]>();
    for (const e of stateProgression) m.set(e.id, e);
    return m;
  }, [stateProgression]);

  const targetLabel = t(`role.${state.targetRole}`);

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
        clickGain={state.clickGain}
        noteGain={state.noteGain}
      />
      <SectionKicker style={{ marginBottom: 12 }}>{t('practice.stepKicker')}</SectionKicker>
      <Panel>
        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'flex-end', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 13, color: theme.muted, fontWeight: 600, marginBottom: 6 }}>{t('practice.level')}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {([1, 2, 3, 4, 5] as const).map((l) => (
                <PillButton key={l} selected={state.level === l} onClick={() => dispatch({ type: 'setLevel', level: l })} ariaLabel={t('practice.levelAria', { n: l })}>
                  {l}
                </PillButton>
              ))}
            </div>
            <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>
              {t(`practice.level.${state.level}`)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: theme.muted, fontWeight: 600, marginBottom: 6 }}>{t('practice.target')}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['R', '3', '5', '7'] as const).map((r) => (
                <PillButton key={r} selected={state.targetRole === r} wide onClick={() => dispatch({ type: 'setTargetRole', role: r })}>
                  {t(`role.${r}`)}
                </PillButton>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, marginBottom: 6 }}>&nbsp;</div>
            <Toggle
              checked={state.resolveToNext}
              onChange={(value) => dispatch({ type: 'setResolveToNext', value })}
              label={t('practice.landOnNextChord')}
              ariaLabel={t('practice.landOnNextChord')}
            />
          </div>
          <button
            type="button"
            className="btn ghost"
            onClick={() => dispatch({ type: 'rerollAll' })}
          >
            {t('practice.regenerate')}
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
            {t('practice.empty')}
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
              language={state.language}
            />

            {/* Legend */}
            <div style={{ marginBottom: 14 }}>
              <Legend
                items={[
                  { type: 'scaleNote', label: t('legend.scaleNote') },
                  { type: 'tonic', label: t('legend.root') },
                  { type: 'chordTone', label: t('legend.chordTone') },
                  { type: 'target', label: t('legend.target', { role: targetLabel }) },
                  { type: 'landing', label: t('legend.landingNote') },
                  ...(SCALES[state.key.scaleId].decoration?.addedIntervals.map((iv) => ({
                    type: 'decoration' as const,
                    label: t('legend.blueNote', { interval: intervalLabel(iv) }),
                  })) ?? []),
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
                        fontSize: 12,
                        fontWeight: 600,
                        color: theme.accent,
                        background: theme.accentTint,
                        padding: '2px 8px',
                        borderRadius: 4,
                        marginBottom: 10,
                      }}
                    >
                      {targetBadgeText(t, state.targetRole, lastNote, chord.tonic)}
                    </div>

                    {/* Fretboard with chord highlighting + landing */}
                    <Fretboard
                      geometry={cardGeometry}
                      dots={boxDots(box, state.key, {
                        highlight: { chord, targetRole: state.targetRole },
                        landing: lastNote ? { string: lastNote.string, fret: lastNote.fret } : undefined,
                        from: cardGeometry.from,
                      })}
                      label={t('practice.diagramTitle', { chord: targetTone, role: targetLabel })}
                      labels={labels}
                      stringNames={names}
                      leftHanded={state.leftHanded}
                      play={notePlayer(soundOn, state.noteGain)}
                    />

                    {/* Lick header */}
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: theme.muted,
                        margin: '14px 0 6px',
                      }}
                    >
                      {t('practice.lickHeader')}
                    </div>

                    {/* Tab staff */}
                    <TabStaff
                      lick={lick}
                      title={t('practice.lickTitle', { chord: targetTone })}
                      emptyLabel={t('tab.emptyLick')}
                      activeNoteIndex={isActiveCard ? active?.noteIndex : undefined}
                      stringLabels={stringLabels}
                      leftHanded={state.leftHanded}
                    />

                    {/* Per-card regenerate */}
                    <div style={{ marginTop: 10, textAlign: 'right' }}>
                      <button
                        type="button"
                        aria-label={t('practice.rerollAria', { chord: targetTone })}
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
