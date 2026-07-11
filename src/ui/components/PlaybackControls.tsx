import { useState } from 'react';
import type { Lick } from '../../lick';
import { MIN_BPM, MAX_BPM } from '../../state';
import { font, theme } from '../theme';
import { PillButton } from './primitives';
import type { UseTransport } from '../useTransport';

/** Playback controls bar: transport, tempo, count-in / loop toggles, and click / note mix. */
export function PlaybackControls({
  licks,
  tempoBpm,
  onTempoChange,
  transport,
}: {
  licks: Lick[];
  tempoBpm: number;
  onTempoChange: (bpm: number) => void;
  transport: UseTransport;
}) {
  const [countIn, setCountIn] = useState(true);
  const [loop, setLoop] = useState(true);

  if (!transport.supported) {
    return (
      <div style={{ fontSize: 12.5, color: theme.subtle, marginBottom: 16 }}>
        Audio isn’t available in this browser — the tab and fretboard still work.
      </div>
    );
  }

  const canPlay = licks.some((l) => l.notes.length > 0);

  const togglePlay = () => {
    if (transport.isPlaying) {
      transport.stop();
    } else {
      transport.play(licks, { tempoBpm, countIn, loop, metronome: true });
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
        aria-label={transport.isPlaying ? 'Stop playback' : 'Play progression'}
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
        <span style={{ fontSize: 11, color: theme.muted, fontFamily: font.mono }}>Tempo</span>
        <input
          type="range"
          min={MIN_BPM}
          max={MAX_BPM}
          value={tempoBpm}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          aria-label="Tempo (BPM)"
          style={{ accentColor: theme.accent, width: 120 }}
        />
        <input
          type="number"
          min={MIN_BPM}
          max={MAX_BPM}
          value={tempoBpm}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          aria-label="Tempo BPM value"
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
        <span style={{ fontSize: 11, color: theme.subtle, fontFamily: font.mono }}>BPM</span>
      </label>

      {/* Count-in / loop */}
      <div style={{ display: 'flex', gap: 6 }}>
        <PillButton selected={countIn} onClick={() => setCountIn((v) => !v)} wide ariaLabel="Toggle count-in">
          Count-in
        </PillButton>
        <PillButton selected={loop} onClick={() => setLoop((v) => !v)} wide ariaLabel="Toggle loop">
          Loop
        </PillButton>
      </div>

      {/* Mix */}
      <div style={{ display: 'flex', gap: 14 }}>
        <MixSlider label="Click" onChange={transport.setClickGain} defaultValue={0.6} />
        <MixSlider label="Notes" onChange={transport.setNoteGain} defaultValue={0.9} />
      </div>
    </div>
  );
}

function MixSlider({
  label,
  defaultValue,
  onChange,
}: {
  label: string;
  defaultValue: number;
  onChange: (value: number) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, color: theme.muted, fontFamily: font.mono }}>{label}</span>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          setValue(v);
          onChange(v);
        }}
        aria-label={`${label} volume`}
        style={{ accentColor: theme.accent, width: 70 }}
      />
    </label>
  );
}
