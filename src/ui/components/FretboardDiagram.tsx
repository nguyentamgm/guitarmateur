import { format } from '../../music';
import type { Box } from '../../fretboard';
import { font, theme } from '../theme';

/** Standard-tuning string labels, index 0 = lowest-pitched (low E). */
const STANDARD_LABELS = ['E', 'A', 'D', 'G', 'B', 'E'];
const MARKER_FRETS = [3, 5, 7, 9, 12, 15, 17, 21];

export interface FretboardDiagramProps {
  box: Box;
  /** Compact card version (no labels, thin lines). */
  mini?: boolean;
  labels?: 'names' | 'none';
  /** Accessible description, e.g. "A minor pentatonic, frets 5–8". */
  title?: string;
  /** String labels low→high; defaults to standard tuning. */
  stringLabels?: string[];
}

/**
 * Pure presentational fretboard renderer. Geometry and note styling are ported from the mockup's
 * `fb()` — pixels, not logic. Note *states* (M2): tonic = accent ring, decoration (♭5) = dashed
 * faint ring, other scale notes = faint ring. Chord highlighting/landing arrive with M3/M4.
 */
export function FretboardDiagram({
  box,
  mini = false,
  labels = 'names',
  title,
  stringLabels = STANDARD_LABELS,
}: FretboardDiagramProps) {
  const numStrings = stringLabels.length;
  const rowGap = mini ? 9 : 24;
  const colW = mini ? 15 : 44;
  const padL = mini ? 7 : 30;
  const padTop = mini ? 7 : 16;
  const padBot = mini ? 7 : 22;
  const padR = mini ? 7 : 14;

  const count = box.maxFret - box.minFret + 1;
  const W = padL + count * colW + padR;
  const H = padTop + (numStrings - 1) * rowGap + padBot;
  const y = (row: number) => padTop + row * rowGap;
  const bx = (fret: number) => padL + (fret - box.minFret + 0.5) * colW;
  /** Visual row for a string index (0 = lowest). Low string renders at the bottom. */
  const rowOf = (string: number) => numStrings - 1 - string;

  const els: React.ReactNode[] = [];

  // Fret-marker dots (full mode only).
  if (!mini) {
    for (const f of MARKER_FRETS) {
      if (f < box.minFret || f > box.maxFret) continue;
      const cx = bx(f);
      if (f % 12 === 0) {
        els.push(<circle key={`ma${f}`} cx={cx} cy={y(1) + rowGap / 2} r={3} fill={theme.faintStroke} fillOpacity={0.5} />);
        els.push(<circle key={`mb${f}`} cx={cx} cy={y(numStrings - 2) - rowGap / 2} r={3} fill={theme.faintStroke} fillOpacity={0.5} />);
      } else {
        els.push(<circle key={`m${f}`} cx={cx} cy={(y(0) + y(numStrings - 1)) / 2} r={3} fill={theme.faintStroke} fillOpacity={0.5} />);
      }
    }
  }

  // String lines + labels.
  for (let row = 0; row < numStrings; row++) {
    els.push(
      <line key={`s${row}`} x1={padL} y1={y(row)} x2={padL + count * colW} y2={y(row)} stroke={theme.line} strokeWidth={mini ? 0.6 : 1} />,
    );
    if (!mini) {
      els.push(
        <text key={`sl${row}`} x={padL - 9} y={y(row) + 4} fontSize={11} fill={theme.muted} textAnchor="end" fontFamily="'JetBrains Mono', monospace">
          {stringLabels[numStrings - 1 - row]}
        </text>,
      );
    }
  }

  // Fret lines (thick nut at open position) + fret numbers.
  for (let i = 0; i <= count; i++) {
    const x = padL + i * colW;
    const nut = box.minFret === 0 && i === 0;
    els.push(
      <line key={`f${i}`} x1={x} y1={y(0)} x2={x} y2={y(numStrings - 1)} stroke={nut ? theme.text : theme.line} strokeWidth={nut ? 3 : mini ? 0.6 : 1} />,
    );
  }
  if (!mini) {
    for (let i = 0; i < count; i++) {
      els.push(
        <text key={`fn${i}`} x={padL + (i + 0.5) * colW} y={H - 6} fontSize={10} fill={theme.muted} textAnchor="middle" fontFamily="'JetBrains Mono', monospace">
          {box.minFret + i}
        </text>,
      );
    }
  }

  // Notes.
  const r = mini ? 4 : 11;
  box.notes.forEach((n, idx) => {
    let fill: string = 'none';
    let stroke: string = theme.faintStroke;
    let txt: string = theme.muted;
    let sw = 1.4;
    let dash: string | undefined;

    if (n.isTonic) {
      stroke = theme.accent;
      sw = 2.4;
      txt = theme.accent;
      if (mini) {
        fill = theme.accent;
        txt = theme.accentText;
      }
    } else if (n.isDecoration) {
      dash = '2 2';
    }

    els.push(
      <circle key={`n${idx}`} cx={bx(n.fret)} cy={y(rowOf(n.string))} r={r} fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={dash} />,
    );
    if (!mini && labels === 'names') {
      els.push(
        <text key={`t${idx}`} x={bx(n.fret)} y={y(rowOf(n.string)) + 3.5} fontSize={9.5} fill={txt} textAnchor="middle" fontFamily={font.sans} fontWeight={n.isTonic ? 700 : 500}>
          {format(n.pitch)}
        </text>,
      );
    }
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={mini ? '100%' : W} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} role="img" aria-label={title}>
      {title && <title>{title}</title>}
      {els}
    </svg>
  );
}
