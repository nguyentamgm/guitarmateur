import { useEffect, useRef, useState } from 'react';
import type { Lick } from '../../lick';
import type { LocaleId } from '../../i18n';
import { MIN_BPM, MAX_BPM } from '../../state';
import { font, theme } from '../theme';
import { PillButton } from './primitives';
import { useT } from '../useT';
import type { UseTransport } from '../useTransport';

/** Playback controls bar: transport, tempo, count-in / loop toggles, and click / note mix. */
export function PlaybackControls({
  licks,
  tempoBpm,
  onTempoChange,
  transport,
  countIn,
  loop,
  onCountInChange,
  onLoopChange,
  swingEnabled,
  onSwingChange,
  clickGain,
  noteGain,
  onClickGainChange,
  onNoteGainChange,
  language,
}: {
  licks: Lick[];
  tempoBpm: number;
  onTempoChange: (bpm: number) => void;
  transport: UseTransport;
  countIn: boolean;
  loop: boolean;
  onCountInChange: (v: boolean) => void;
  onLoopChange: (v: boolean) => void;
  swingEnabled: boolean;
  onSwingChange: (v: boolean) => void;
  clickGain: number;
  noteGain: number;
  onClickGainChange: (gain: number) => void;
  onNoteGainChange: (gain: number) => void;
  language: LocaleId;
}) {
  const t = useT(language);

  const tapTimes = useRef<number[]>([]);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleTap = () => {
    const now = performance.now();
    tapTimes.current.push(now);
    if (tapTimes.current.length > 4) tapTimes.current.shift();
    if (tapTimer.current !== null) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapTimes.current = []; }, 2000);
    if (tapTimes.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimes.current.length; i++) {
        intervals.push(tapTimes.current[i]! - tapTimes.current[i - 1]!);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      if (avg > 0) {
        const bpm = Math.round(60000 / avg);
        onTempoChange(Math.max(MIN_BPM, Math.min(MAX_BPM, bpm)));
      }
    }
  };

  if (!transport.supported) {
    return (
      <div style={{ fontSize: 12.5, color: theme.subtle, marginBottom: 16 }}>
        {t('playback.audioUnavailable')}
      </div>
    );
  }

  const canPlay = licks.some((l) => l.notes.length > 0);

  const togglePlay = () => {
    if (transport.isPlaying) {
      transport.stop();
    } else {
      transport.play(licks, { tempoBpm, countIn, loop, metronome: true, swing: swingEnabled ? 1 : 0, clickGain, noteGain });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 18,
        alignItems: 'center',
        padding: '12px 14px',
        marginBottom: 18,
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 10,
      }}
    >
      {/* Play / stop */}
      <button
        type="button"
        onClick={togglePlay}
        disabled={!canPlay}
        aria-label={transport.isPlaying ? t('playback.stop') : t('playback.play')}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          border: 'none',
          background: canPlay ? theme.accent : theme.border,
          color: theme.accentText,
          fontSize: 16,
          cursor: canPlay ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
          flex: '0 0 auto',
        }}
      >
        {transport.isPlaying ? '■' : '▶'}
      </button>

      {/* Tempo */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: theme.muted, fontFamily: font.mono }}>{t('playback.tempo')}</span>
        <input
          type="range"
          min={MIN_BPM}
          max={MAX_BPM}
          value={tempoBpm}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          aria-label={t('playback.tempoBpmAria')}
          style={{ accentColor: theme.accent, width: 120 }}
        />
        <TempoField
          value={tempoBpm}
          onCommit={onTempoChange}
          ariaLabel={t('playback.tempoBpmValueAria')}
        />
        <span style={{ fontSize: 11, color: theme.subtle, fontFamily: font.mono }}>{t('playback.bpm')}</span>
      </label>

      {/* Count-in / loop */}
      <div style={{ display: 'flex', gap: 6 }}>
        <PillButton selected={countIn} onClick={() => onCountInChange(!countIn)} wide ariaLabel={t('playback.countInAria')}>
          {t('playback.countIn')}
        </PillButton>
        <PillButton selected={swingEnabled} onClick={() => onSwingChange(!swingEnabled)} wide ariaLabel={t('playback.swingAria')}>
          {t('playback.swing')}
        </PillButton>
        <PillButton selected={loop} onClick={() => onLoopChange(!loop)} wide ariaLabel={t('playback.loopAria')}>
          {t('playback.loop')}
        </PillButton>
        <PillButton selected={false} onClick={handleTap} wide ariaLabel={t('playback.tapAria')}>
          {t('playback.tap')}
        </PillButton>
      </div>

      {/* Mix */}
      <div style={{ display: 'flex', gap: 14 }}>
        <MixSlider
          label={t('playback.click')}
          ariaLabel={t('playback.mixVolumeAria', { label: t('playback.click') })}
          value={clickGain}
          onChange={(v) => { transport.setClickGain(v); onClickGainChange(v); }}
        />
        <MixSlider
          label={t('playback.notes')}
          ariaLabel={t('playback.mixVolumeAria', { label: t('playback.notes') })}
          value={noteGain}
          onChange={(v) => { transport.setNoteGain(v); onNoteGainChange(v); }}
        />
      </div>
    </div>
  );
}

/**
 * Tempo entry box. Keeps a local draft string while the user types and only commits values that
 * are already inside [MIN_BPM, MAX_BPM] — committing every keystroke would let `setTempo`'s clamp
 * rewrite partial entries ("1" → 40), making a value like 150 impossible to type.
 */
function TempoField({
  value,
  onCommit,
  ariaLabel,
}: {
  value: number;
  onCommit: (bpm: number) => void;
  ariaLabel: string;
}) {
  const [draft, setDraft] = useState(String(value));
  // Re-sync when the tempo changes elsewhere: slider, tap tempo, or an imported state.
  useEffect(() => { setDraft(String(value)); }, [value]);

  return (
    <input
      type="number"
      min={MIN_BPM}
      max={MAX_BPM}
      value={draft}
      onChange={(e) => {
        const text = e.target.value;
        setDraft(text);
        const n = Number(text);
        if (text.trim() !== '' && Number.isFinite(n) && n >= MIN_BPM && n <= MAX_BPM) onCommit(n);
      }}
      onBlur={() => setDraft(String(value))}
      aria-label={ariaLabel}
      style={{
        width: 52,
        padding: '4px 6px',
        borderRadius: 6,
        border: `1px solid ${theme.border}`,
        background: theme.panel,
        color: theme.text,
        fontSize: 12,
        fontFamily: font.mono,
      }}
    />
  );
}

function MixSlider({
  label,
  ariaLabel,
  value,
  onChange,
}: {
  label: string;
  ariaLabel: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, color: theme.muted, fontFamily: font.mono }}>{label}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={ariaLabel}
        style={{ accentColor: theme.accent, width: 70 }}
      />
    </label>
  );
}
