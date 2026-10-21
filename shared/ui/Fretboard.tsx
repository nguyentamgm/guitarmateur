/**
 * The neck both apps draw: wood, frets, strings, optional box frame, and note dots you can click
 * to hear. Callers add their own SVG (lines, arcs) through `children`, drawn under the dots.
 * Styled by shared/ui/fretboard.css. Sound is the caller's (`play`), so this holds no audio.
 */
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { STANDARD_STRING_NAMES, STRINGS, type StringNames, type StringNumber } from '../core/neck';
import { DOUBLE_INLAYS, INLAYS, TAP_REACH_PX, boxSpan, nearestDot, stringName, upright as uprightAt, type NeckGeometry } from './geometry';
import { dotName, type DotWords } from './dotName';

/**
 * How a dot is drawn. `home`/`homeMajor`: the root (blue / amber); `blue`: a blue note (♭5);
 * `soft`: a quiet chord note; `chord`: a tone of the chord being played (ring + tint);
 * `target`: the note to aim for (filled amber, apart from the root).
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

/**
 * The dot an arrow key moves to: along the string (Left / Right, as drawn, so mirrored when
 * left-handed), or to the nearest fret on the next string up / down the picture that has a dot.
 */
function neighbour(dots: readonly FretDot[], from: FretDot, key: string, g: NeckGeometry, leftHanded: boolean): FretDot | undefined {
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    const up = (key === 'ArrowRight') !== leftHanded;
    const row = dots.filter((d) => d.string === from.string && (up ? d.fret > from.fret : d.fret < from.fret));
    return row.sort((a, b) => (up ? a.fret - b.fret : b.fret - a.fret))[0];
  }
  if (key !== 'ArrowUp' && key !== 'ArrowDown') return undefined;
  const sign = key === 'ArrowUp' ? -1 : 1;
  const ahead = dots.filter((d) => sign * (g.y(d.string) - g.y(from.string)) > 0);
  if (ahead.length === 0) return undefined;
  const gap = Math.min(...ahead.map((d) => Math.abs(g.y(d.string) - g.y(from.string))));
  const row = ahead.filter((d) => Math.abs(g.y(d.string) - g.y(from.string)) === gap);
  return row.sort((a, b) => Math.abs(a.fret - from.fret) - Math.abs(b.fret - from.fret) || a.fret - b.fret)[0];
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
  /** Words for each dot's accessible name (`dotName`). Without them: its text and string/fret. */
  readonly words?: DotWords;
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
  words,
  children,
}: Props) {
  const [flash, setFlash] = useState<string | null>(null);
  // One Tab stop for the whole neck (the dot last focused, else the first lit one); the arrow keys
  // move between dots, so every dot, dimmed ones too, is reachable without a Tab stop each.
  const [focused, setFocused] = useState<string | null>(null);
  const nodes = useRef(new Map<string, SVGGElement>());
  const stop = (dots.find((d) => d.key === focused) ?? dots.find((d) => !d.dim) ?? dots[0])?.key;
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
  // A tap beside a dot plays the nearest one within TAP_REACH_PX: on a phone the dots are drawn
  // 14–22px wide, so each takes the room around it, up to a 40px target, where its neighbours allow.
  const onNeckClick = (e: MouseEvent<SVGSVGElement>) => {
    if (e.target instanceof Element && e.target.closest('.dot')) return;
    const box = e.currentTarget.getBoundingClientRect();
    if (box.width === 0) return;
    const scale = box.width / g.width;
    const x = (e.clientX - box.left) / scale;
    const d = nearestDot(g, dots, leftHanded ? g.width - x : x, (e.clientY - box.top) / scale, TAP_REACH_PX / scale);
    if (d) play(d);
  };
  const onKey = (e: KeyboardEvent, d: FretDot) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      play(d);
      return;
    }
    const next = neighbour(dots, d, e.key, g, leftHanded);
    if (next) {
      e.preventDefault();
      nodes.current.get(next.key)?.focus();
    }
  };

  const r = g.dotRadius;
  const woodTop = g.top - r - 3;
  const woodHeight = 5 * g.stringGap + 2 * (r + 3);
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
        // Shrink to scroll no further than `minScale` (~60%; for touch, as far as a 40px tap
        // allows), grow no further than ~120%: a short neck must not blow up to fill a wide
        // column. Its text grows with its dots (fretboard.css).
        style={
          {
            minWidth: Math.round(g.width * g.minScale),
            maxWidth: Math.round(g.width * Math.max(1.2, g.minScale)),
            '--neck-text': g.textScale,
          } as CSSProperties
        }
        role="group"
        aria-label={label}
        onClick={onNeckClick}
      >
        <g transform={mirror}>
          <rect className="wood" x={g.nutX} y={woodTop} width={(g.frets - g.from) * g.fretWidth} height={woodHeight} rx={3} />
          {INLAYS.filter((f) => f > g.from && f <= g.frets).map((f) => (
            <circle key={f} className="inlay" cx={g.x(f)} cy={mid(3, 4)} r={6} />
          ))}
          {DOUBLE_INLAYS.filter((f) => f > g.from && f <= g.frets).flatMap((f) => [
            <circle key={`${f}a`} className="inlay" cx={g.x(f)} cy={mid(2, 3)} r={6} />,
            <circle key={`${f}b`} className="inlay" cx={g.x(f)} cy={mid(4, 5)} r={6} />,
          ])}
          {Array.from({ length: g.frets - g.from }, (_, i) => g.from + i + 1).map((f) => (
            <g key={f}>
              <line className="fretline" x1={g.wireX(f)} x2={g.wireX(f)} y1={woodTop} y2={woodTop + woodHeight} />
              <text className="fnum" x={g.x(f)} y={g.y(6) + r + 21} transform={upright(g.x(f))}>
                {f}
              </text>
            </g>
          ))}
          {/* The nut, or on a window of the neck the wire it starts at. */}
          {g.from === 0 ? (
            <rect className="nutbar" x={g.nutX - 5} y={woodTop} width={6} height={woodHeight} />
          ) : (
            <line className="fretline" x1={g.nutX} x2={g.nutX} y1={woodTop} y2={woodTop + woodHeight} />
          )}
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
            const markX = leftHanded ? cx - r : cx + r;
            return [
              // The landing halo is not part of the dot's look (tone, faint, hit): drawn on its own.
              d.halo && <circle key={`${d.key}-halo`} className="halo" cx={cx} cy={cy} r={r + 5} />,
              <g
                key={d.key}
                ref={(el) => {
                  if (el) nodes.current.set(d.key, el);
                  else nodes.current.delete(d.key);
                }}
                className={cls}
                role="button"
                tabIndex={d.key === stop ? 0 : -1}
                aria-label={words ? dotName(d, text, words) : `${text ?? ''} ${stringName(d.string, stringNames)}/${d.fret}`.trim()}
                onClick={() => play(d)}
                onKeyDown={(e) => onKey(e, d)}
                onFocus={() => setFocused(d.key)}
              >
                <circle cx={cx} cy={cy} r={r} />
                {text !== undefined && (
                  <text x={cx} y={cy} transform={upright(cx)}>
                    {text}
                  </text>
                )}
              </g>,
              // Beside the button, not in it: its visible text stays the label, which leads the
              // name; the mark is said in the name after the tone ("chord tone 3").
              d.mark !== undefined && (
                <text key={`${d.key}-mark`} className="mark" x={markX} y={cy - r + 2} transform={upright(markX)}>
                  {d.mark}
                </text>
              ),
            ];
          })}
        </g>
      </svg>
    </div>
  );
}
