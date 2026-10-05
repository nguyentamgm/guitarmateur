/**
 * Pitch over time (K6.3, K6.4): time runs left to right, semitones go up. Faint lines mark each
 * semitone, a dashed line the target pitch of a bend. The curve is sampled from the same glide the
 * player sounds, and draws itself in step with the sound when `run` changes.
 */
import { semisAt, type Glide } from '../core/audio';

interface Props {
  readonly glide: Glide;
  /** Length of the picture, in the glide's time unit. */
  readonly length: number;
  readonly label: string;
  /** Semitones of the target line, if any. */
  readonly target?: number;
  readonly targetLabel?: string;
  /** Seconds the drawing takes; it restarts whenever `run` changes. */
  readonly seconds?: number;
  readonly run?: number;
  /** Seconds before the drawing starts, to wait for the sound. */
  readonly delay?: number;
}

const W = 560;
/** Height per semitone, and the least height of the picture. */
const PER_SEMI = 16;
const MIN_H = 150;
const PAD = { left: 34, right: 12, top: 14, bottom: 14 };
const SAMPLES = 160;

export function PitchCurve({ glide, length, label, target, targetLabel, seconds = 1, run = 0, delay = 0 }: Props) {
  const values = Array.from({ length: SAMPLES + 1 }, (_, i) => semisAt(glide, (i / SAMPLES) * length));
  const lo = Math.floor(Math.min(0, ...values, target ?? 0)) - 1;
  const hi = Math.ceil(Math.max(0, ...values, target ?? 0)) + 1;
  const H = Math.max(MIN_H, (hi - lo) * PER_SEMI + PAD.top + PAD.bottom);
  // Label every semitone on a short range, every other one on a long range (0 always).
  const every = hi - lo > 8 ? 2 : 1;
  const x = (t: number) => PAD.left + (t / length) * (W - PAD.left - PAD.right);
  const y = (s: number) => PAD.top + ((hi - s) / (hi - lo)) * (H - PAD.top - PAD.bottom);
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x((i / SAMPLES) * length).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');

  return (
    <div className="scroll">
      <svg className="pitchcurve" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 320, maxWidth: W * 1.2 }} role="img" aria-label={label}>
        {Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).map((s) => (
          <g key={s} className={s === 0 ? 'semi zero' : 'semi'}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(s)} y2={y(s)} />
            {s % every === 0 && (
              <text x={PAD.left - 6} y={y(s)}>
                {s > 0 ? `+${s}` : s < 0 ? `−${-s}` : '0'}
              </text>
            )}
          </g>
        ))}
        {target !== undefined && (
          <g className="target">
            <line x1={PAD.left} x2={W - PAD.right} y1={y(target)} y2={y(target)} />
            {targetLabel && (
              <text x={W - PAD.right - 4} y={y(target) - 6}>
                {targetLabel}
              </text>
            )}
          </g>
        )}
        <path className="curve ghost" d={d} />
        <path key={run} className={run > 0 ? 'curve draw' : 'curve'} d={d} pathLength={1} style={{ animationDuration: `${seconds}s`, animationDelay: `${delay}s` }} />
      </svg>
    </div>
  );
}
