import type { Lick } from '../../lick';
import type { Technique } from '../../lick';
import { font, theme } from '../theme';

const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'E'];

/**
 * Duration glyphs as compact beat-fraction text (1 = quarter, ½ = eighth, 2 = half, ¼ = sixteenth)
 * rather than musical noteheads — legible at 11px across platforms/fonts.
 */
function durationGlyph(beats: number): string {
  const table: Record<string, string> = { '2': '2', '1.5': '1½', '1': '1', '0.5': '½', '0.25': '¼' };
  return table[String(beats)] ?? String(beats);
}

/** Standard tab articulation glyphs, prefixed before the fret number (e.g. "h7"). */
const TECHNIQUE_GLYPHS: Record<Technique, string> = {
  hammer: 'h',
  pull: 'p',
  slide: '/',
  bendHalf: '½',
  bendFull: 'b',
};

export interface TabStaffProps {
  lick: Lick;
  title?: string;
  /** Index of the currently-sounding note (in `lick.notes` order) to highlight during playback. */
  activeNoteIndex?: number;
  /** Per-string letter labels from low to high (e.g. ['D','A','D','G','B','E'] for Drop-D).
   *  Defaults to standard tuning when omitted. */
  stringLabels?: string[];
}

/** SVG tab notation for a lick: fret numbers on string lines, positioned proportional to
 *  `startBeat`, with beat ticks along the top and duration glyphs underneath. */
export function TabStaff({ lick, title, activeNoteIndex, stringLabels: stringLabelsProp }: TabStaffProps) {
  const labels = stringLabelsProp ?? STRING_LABELS;
  const numStrings = labels.length;
  const rowGap = 20;
  const padL = 26;
  const padTop = 22;
  const padBot = 34;
  const padR = 16;
  const stageW = 260;
  const beats = Math.max(lick.lengthBeats, 1);

  const W = padL + stageW + padR;
  const H = padTop + (numStrings - 1) * rowGap + padBot;

  const y = (row: number) => padTop + row * rowGap;
  const x = (beat: number) => padL + (beat / beats) * stageW;
  const rowOf = (string: number) => numStrings - 1 - string;

  if (lick.notes.length === 0) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: '100%', height: 'auto', display: 'block' }} role="img" aria-label={title ?? 'empty lick'}>
        {title && <title>{title}</title>}
        <text x={W / 2} y={H / 2} fontSize={18} fill={theme.subtle} textAnchor="middle" dominantBaseline="middle">
          —
        </text>
      </svg>
    );
  }

  const els: React.ReactNode[] = [];

  for (let row = 0; row < numStrings; row++) {
    els.push(<line key={`s${row}`} x1={padL} y1={y(row)} x2={padL + stageW} y2={y(row)} stroke={theme.line} strokeWidth={1} />);
    els.push(
      <text key={`sl${row}`} x={padL - 8} y={y(row) + 3.5} fontSize={10} fill={theme.muted} textAnchor="end" fontFamily={font.mono}>
        {labels[numStrings - 1 - row]}
      </text>,
    );
  }

  for (let b = 0; b <= Math.floor(beats); b++) {
    const bx = x(b);
    els.push(
      <line key={`bt${b}`} x1={bx} y1={padTop - 6} x2={bx} y2={y(numStrings - 1)} stroke={theme.line} strokeWidth={0.5} strokeDasharray="1 3" />,
    );
    els.push(
      <text key={`bn${b}`} x={bx} y={padTop - 10} fontSize={9} fill={theme.subtle} textAnchor="middle" fontFamily={font.mono}>
        {b + 1}
      </text>,
    );
  }

  // Note order matches `lick.notes` (already ascending by startBeat), so the index lines up with
  // the transport's `noteIndex` for highlighting the currently-sounding note.
  const sorted = [...lick.notes].sort((a, b) => a.startBeat - b.startBeat);
  sorted.forEach((n, i) => {
    const cx = x(n.startBeat);
    const cy = y(rowOf(n.string));
    const active = i === activeNoteIndex;
    els.push(
      <g key={`n${i}`}>
        <rect
          x={cx - 9}
          y={cy - 8}
          width={18}
          height={n.role ? 20 : 16}
          rx={3}
          fill={active ? theme.accent : theme.card}
          stroke={active ? theme.accent : theme.faintStroke}
          strokeWidth={1}
        />
        {n.technique && (
          <text
            x={cx - 6}
            y={cy + 4}
            fontSize={9}
            fill={theme.muted}
            textAnchor="end"
            fontFamily={font.mono}
          >
            {TECHNIQUE_GLYPHS[n.technique]}
          </text>
        )}
        <text x={cx} y={cy + 4} fontSize={10.5} fill={active ? theme.accentText : theme.text} textAnchor="middle" fontFamily={font.mono} fontWeight={600}>
          {n.fret}
        </text>
        {n.role && (
          <text x={cx} y={cy + 11} fontSize={7} fill={theme.muted} textAnchor="middle" fontFamily={font.mono}>
            {n.role}
          </text>
        )}
      </g>,
    );
  });

  const durY = y(numStrings - 1) + 22;
  sorted.forEach((n, i) => {
    const cx = x(n.startBeat);
    els.push(
      <text key={`d${i}`} x={cx} y={durY} fontSize={11} fill={theme.subtle} textAnchor="middle" fontFamily={font.mono}>
        {durationGlyph(n.durationBeats)}
      </text>,
    );
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: '100%', height: 'auto', display: 'block' }} role="img" aria-label={title}>
      {title && <title>{title}</title>}
      {els}
    </svg>
  );
}
