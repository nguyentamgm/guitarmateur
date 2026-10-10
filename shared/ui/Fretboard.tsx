/**
 * The neck both apps draw: wood, frets, strings, optional box frame, and note dots you can click
 * to hear. Callers add their own SVG (lines, arcs) through `children`, drawn under the dots.
 * Styled by shared/ui/fretboard.css. Sound is the caller's (`play`), so this holds no audio.
 */
import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import { STANDARD_STRING_NAMES, STRINGS, type StringNames, type StringNumber } from '../core/neck';
import { DOUBLE_INLAYS, INLAYS, boxSpan, stringName, upright as uprightAt, type NeckGeometry } from './geometry';

/**
 * How a dot is drawn. `home`/`homeMajor`: the root (blue / amber); `blue`: a blue note (♭5);
 * `soft`: a quiet chord note; `chord`: a tone of the chord being played (ring + tint);
 * `target`: the note to aim for (filled accent).
 */
export type DotTone = 'plain' | 'home' | 'homeMajor' | 'blue' | 'soft' | 'chord' | 'target';

/** What a dot shows when it has no explicit `label`: its degree (1, ♭3, 5…) or its note name. */
export type LabelMode = 'degree' | 'name';

export interface FretDot {
  readonly key: string;
  readonly string: StringNumber;
  readonly fret: number;
  readonly midi: number;
  /** Shown as is; wins over `degree`/`name`. */
  readonly label?: string;
  readonly degree?: string;
  readonly name?: string;
  readonly tone?: DotTone;
  readonly dim?: boolean;
  /** Drawn small and pale but still clickable: a place to click, not a note of the picture. */
  readonly faint?: boolean;
  /** A dashed ring around the dot: where a phrase lands (the next chord's target). */
  readonly halo?: boolean;
  /** A small mark at the dot's top right, e.g. the chord role (R, 3, 5, 7). */
  readonly mark?: string;
}

interface Props {
  readonly geometry: NeckGeometry;
  readonly dots: readonly FretDot[];
  /** Accessible name of the whole picture. */
  readonly label: string;
  readonly box?: { readonly minFret: number; readonly maxFret: number } | null;
  /** Dots to light up (e.g. the notes a sequence is playing). */
  readonly active?: readonly string[];
  /** Sound a dot's note (click or keyboard). Without it, dots still flash but stay silent. */
  readonly play?: (midi: number) => void;
  /** Called after a dot is played by click or keyboard. */
  readonly onDot?: (dot: FretDot) => void;
  /** What unlabelled dots show. Default: degrees. */
  readonly labels?: LabelMode;
  /** String names in the current tuning (Drop D: string 6 is D). Default: standard. */
  readonly stringNames?: StringNames;
  /** Mirror the neck for a left-handed player: nut on the right; text stays readable. */
  readonly leftHanded?: boolean;
  readonly children?: ReactNode;
}

const STRING_WIDTH: Record<StringNumber, number> = { 1: 1, 2: 1.2, 3: 1.5, 4: 1.9, 5: 2.3, 6: 2.7 };

export function Fretboard({
  geometry: g,
  dots,
  label,
  box,
  active,
  play: sound,
  onDot,
  labels = 'degree',
  stringNames = STANDARD_STRING_NAMES,
  leftHanded = false,
  children,
}: Props) {
  const [flash, setFlash] = useState<string | null>(null);
  useEffect(() => {
    if (flash === null) return;
    const t = setTimeout(() => setFlash(null), 220);
    return () => clearTimeout(t);
  }, [flash]);

  const play = (d: FretDot) => {
    sound?.(d.midi);
    setFlash(d.key);
    onDot?.(d);
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
  const span = box ? boxSpan(g, box.minFret, box.maxFret) : { left: 0, right: 0 };
  // Left-handed: the neck is mirrored as a whole, and each text is mirrored back around its own x
  // (text a caller draws in `children` uses `upright` from geometry.ts the same way).
  const mirror = leftHanded ? `translate(${g.width} 0) scale(-1 1)` : undefined;
  const upright = (x: number) => uprightAt(x, leftHanded);

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
        <g transform={mirror}>
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
              <text className="fnum" x={g.x(f)} y={g.y(6) + 32} transform={upright(g.x(f))}>
                {f}
              </text>
            </g>
          ))}
          <rect className="nutbar" x={g.nutX - 5} y={woodTop} width={6} height={woodHeight} />
          {STRINGS.map((s) => (
            <g key={s}>
              <line className="str" x1={g.nutX - 2} x2={g.wireX(g.frets)} y1={g.y(s)} y2={g.y(s)} strokeWidth={STRING_WIDTH[s]} />
              {/* Left-handed: anchored at its end, so mirrored back it reads from the right edge in. */}
              <text className="sname" x={4} y={g.y(s)} textAnchor={leftHanded ? 'end' : undefined} transform={upright(4)}>
                {stringName(s, stringNames)}
              </text>
            </g>
          ))}
          {box && (
            <rect
              className="boxrect"
              x={0}
              y={woodTop + 2}
              width={span.right - span.left}
              height={woodHeight - 4}
              rx={8}
              style={{ transform: `translateX(${span.left}px)` }}
            />
          )}
          {children}
          {dots.map((d) => {
            const text = d.label ?? (labels === 'name' ? d.name : d.degree);
            const cls = ['dot', d.tone && d.tone !== 'plain' ? d.tone : '', d.dim ? 'dim' : '', d.faint ? 'faint' : '', active?.includes(d.key) || d.key === flash ? 'hit' : '']
              .filter(Boolean)
              .join(' ');
            const cx = g.x(d.fret);
            const cy = g.y(d.string);
            // The mark sits at the dot's top right as seen, so on a mirrored neck it is drawn left.
            const markX = leftHanded ? cx - 11 : cx + 11;
            return [
              // The landing halo is not part of the dot's look (tone, faint, hit): drawn on its own.
              d.halo && <circle key={`${d.key}-halo`} className="halo" cx={cx} cy={cy} r={16} />,
              <g
                key={d.key}
                className={cls}
                role="button"
                tabIndex={d.dim ? -1 : 0}
                aria-label={`${text ?? ''} ${stringName(d.string, stringNames)}/${d.fret}`.trim()}
                onClick={() => play(d)}
                onKeyDown={(e) => onKey(e, d)}
              >
                <circle cx={cx} cy={cy} r={11} />
                {text !== undefined && (
                  <text x={cx} y={cy} transform={upright(cx)}>
                    {text}
                  </text>
                )}
                {d.mark !== undefined && (
                  <text className="mark" x={markX} y={cy - 9} transform={upright(markX)}>
                    {d.mark}
                  </text>
                )}
              </g>,
            ];
          })}
        </g>
      </svg>
    </div>
  );
}
