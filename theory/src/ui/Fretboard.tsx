/**
 * The neck every scene draws on: wood, frets, strings, optional box frame, and note dots you can
 * click to hear. Scenes add their own SVG (lines, arcs) through `children`, drawn under the dots.
 */
import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import { STRINGS, type StringNumber } from '../core/fretboard';
import { useTheory } from './context';
import { DOUBLE_INLAYS, INLAYS, stringName, type NeckGeometry } from './geometry';

export type DotTone = 'plain' | 'home' | 'homeMajor';

export interface FretDot {
  readonly key: string;
  readonly string: StringNumber;
  readonly fret: number;
  readonly midi: number;
  readonly label?: string;
  readonly tone?: DotTone;
  readonly dim?: boolean;
}

interface Props {
  readonly geometry: NeckGeometry;
  readonly dots: readonly FretDot[];
  /** Accessible name of the whole picture. */
  readonly label: string;
  readonly box?: { readonly minFret: number; readonly maxFret: number } | null;
  /** Dots to light up (e.g. the notes a sequence is playing). */
  readonly active?: readonly string[];
  readonly children?: ReactNode;
}

const STRING_WIDTH: Record<StringNumber, number> = { 1: 1, 2: 1.2, 3: 1.5, 4: 1.9, 5: 2.3, 6: 2.7 };

export function Fretboard({ geometry: g, dots, label, box, active, children }: Props) {
  const { player } = useTheory();
  const [flash, setFlash] = useState<string | null>(null);
  useEffect(() => {
    if (flash === null) return;
    const t = setTimeout(() => setFlash(null), 220);
    return () => clearTimeout(t);
  }, [flash]);

  const play = (d: FretDot) => {
    player.pluck(d.midi);
    setFlash(d.key);
  };
  const onKey = (e: KeyboardEvent, d: FretDot) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      play(d);
    }
  };

  const woodTop = g.top - 14;
  const woodHeight = 5 * g.stringGap + 28;
  const mid = (a: StringNumber, b: StringNumber) => (g.y(a) + g.y(b)) / 2;
  const boxLeft = box ? (box.minFret === 0 ? g.nutX - 36 : g.wireX(box.minFret - 1)) : 0;
  const boxRight = box ? g.wireX(box.maxFret) : 0;

  return (
    <div className="scroll">
      <svg
        viewBox={`0 0 ${g.width} ${g.height}`}
        // Shrink to scroll no further than ~60%, grow no further than ~120%: a short neck must
        // not blow up to fill a wide column.
        style={{ minWidth: Math.round(g.width * 0.62), maxWidth: Math.round(g.width * 1.2) }}
        role="group"
        aria-label={label}
      >
        <rect className="wood" x={g.nutX} y={woodTop} width={g.frets * g.fretWidth} height={woodHeight} rx={3} />
        {INLAYS.filter((f) => f <= g.frets).map((f) => (
          <circle key={f} className="inlay" cx={g.x(f)} cy={mid(3, 4)} r={6} />
        ))}
        {DOUBLE_INLAYS.filter((f) => f <= g.frets).flatMap((f) => [
          <circle key={`${f}a`} className="inlay" cx={g.x(f)} cy={mid(2, 3)} r={6} />,
          <circle key={`${f}b`} className="inlay" cx={g.x(f)} cy={mid(4, 5)} r={6} />,
        ])}
        {Array.from({ length: g.frets }, (_, i) => i + 1).map((f) => (
          <g key={f}>
            <line className="fretline" x1={g.wireX(f)} x2={g.wireX(f)} y1={woodTop} y2={woodTop + woodHeight} />
            <text className="fnum" x={g.x(f)} y={g.y(6) + 32}>
              {f}
            </text>
          </g>
        ))}
        <rect className="nutbar" x={g.nutX - 5} y={woodTop} width={6} height={woodHeight} />
        {STRINGS.map((s) => (
          <g key={s}>
            <line className="str" x1={g.nutX - 2} x2={g.wireX(g.frets)} y1={g.y(s)} y2={g.y(s)} strokeWidth={STRING_WIDTH[s]} />
            <text className="sname" x={4} y={g.y(s)}>
              {stringName(s)}
            </text>
          </g>
        ))}
        {box && (
          <rect
            className="boxrect"
            x={0}
            y={woodTop + 2}
            width={boxRight - boxLeft}
            height={woodHeight - 4}
            rx={8}
            style={{ transform: `translateX(${boxLeft}px)` }}
          />
        )}
        {children}
        {dots.map((d) => {
          const cls = ['dot', d.tone && d.tone !== 'plain' ? d.tone : '', d.dim ? 'dim' : '', active?.includes(d.key) || d.key === flash ? 'hit' : '']
            .filter(Boolean)
            .join(' ');
          return (
            <g
              key={d.key}
              className={cls}
              role="button"
              tabIndex={d.dim ? -1 : 0}
              aria-label={`${d.label ?? ''} ${stringName(d.string)}/${d.fret}`.trim()}
              onClick={() => play(d)}
              onKeyDown={(e) => onKey(e, d)}
            >
              <circle cx={g.x(d.fret)} cy={g.y(d.string)} r={11} />
              {d.label !== undefined && (
                <text x={g.x(d.fret)} y={g.y(d.string)}>
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
