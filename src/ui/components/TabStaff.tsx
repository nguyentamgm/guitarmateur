import { useRef, type KeyboardEvent } from 'react';
import { tabBoxWidth, useKeepInView } from '@shared/ui/tab';
import { midi } from '../../music';
import type { Lick, LickNote } from '../../lick';
import { durationGlyph, tabText } from '../labels';

const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'E'];

export interface TabStaffProps {
  lick: Lick;
  title?: string;
  /** Index of the currently-sounding note (in `lick.notes` order) to highlight during playback. */
  activeNoteIndex?: number;
  /** Per-string letter labels from low to high (e.g. ['D','A','D','G','B','E'] for Drop-D).
   *  Defaults to standard tuning when omitted. */
  stringLabels?: string[];
  /** Mirror the tab horizontally for left-handed players. */
  leftHanded?: boolean;
  /** Accessible name for a lick with no notes, used when `title` is absent. */
  emptyLabel?: string;
  /** Sounds a clicked note (its MIDI number); without it the numbers are not buttons. */
  play?: (midi: number) => void;
  /** A number button's accessible name, from its string (1 = thinnest) and its tab text. */
  noteLabel?: (stringNumber: number, text: string) => string;
}

const LEFT = 30;
const RIGHT = 14;
const TOP = 30;
const GAP = 20;
/** Room under the staff for the chord-tone row, then the duration row. */
const ROW = 18;
/** Space left between two neighbouring number boxes. */
const BOX_GAP = 4;
/** The staff is at least this wide, as the old tab was: a sparse lick fits a phone card. */
const MIN_STAGE = 260;
/** Where the first beat sits after the string names. */
const LEAD = 12;

/**
 * Tab for a lick, in Theory's look (shared/ui/fretboard.css, `.tab`): string lines with their
 * names, each note a number box (technique text in it), placed by its start beat with beat numbers
 * on top and bar lines. Under the staff, readable rows: the note's chord tone, then its length in
 * beats. The sounding note is filled; with `play`, a number is a button that plays it.
 */
export function TabStaff({
  lick,
  title,
  activeNoteIndex,
  stringLabels: stringLabelsProp,
  leftHanded = false,
  emptyLabel,
  play,
  noteLabel = (n, text) => `${n} ${text}`,
}: TabStaffProps) {
  const labels = stringLabelsProp ?? STRING_LABELS;
  const numStrings = labels.length;
  const beats = Math.max(lick.lengthBeats, 1);
  // Note order matches `lick.notes` (already ascending by startBeat), so the index lines up with
  // the transport's `noteIndex` for highlighting the currently-sounding note.
  const notes = [...lick.notes].sort((a, b) => a.startBeat - b.startBeat);

  const texts = notes.map((n, i) => tabText(n, notes[i - 1]));
  const boxes = texts.map(tabBoxWidth);

  // Wide enough that no two neighbouring boxes touch, whatever their text ('10b12' is wide).
  let stageW = MIN_STAGE;
  for (let i = 1; i < notes.length; i++) {
    const d = notes[i]!.startBeat - notes[i - 1]!.startBeat;
    const room = (boxes[i - 1]! + boxes[i]!) / 2 + BOX_GAP;
    if (d > 0) stageW = Math.max(stageW, (room * beats) / d + LEAD);
  }
  const width = LEFT + stageW + RIGHT;
  const staffBottom = TOP + (numStrings - 1) * GAP;
  const hasRoles = notes.some((n) => n.role);
  const roleY = staffBottom + ROW;
  const durY = roleY + (hasRoles ? ROW : 0);
  const height = durY + 12;

  const y = (string: number) => TOP + (numStrings - 1 - string) * GAP;
  const x = (beat: number) => LEFT + LEAD + (beat / beats) * (stageW - LEAD);
  /** Un-mirror a text glyph around its own x so the left-handed flip keeps it readable. */
  const unmirror = (cx: number): string | undefined => (leftHanded ? `translate(${cx} 0) scale(-1 1) translate(${-cx} 0)` : undefined);

  // A long tab scrolls sideways: keep the note being played in view.
  const scroller = useRef<HTMLDivElement>(null);
  const activeNote = activeNoteIndex === undefined ? undefined : notes[activeNoteIndex];
  const activeX = activeNote && x(activeNote.startBeat);
  const activeW = activeNoteIndex === undefined ? 0 : (boxes[activeNoteIndex] ?? 0) + 12;
  useKeepInView(scroller, activeX === undefined ? null : [activeX - activeW / 2, activeX + activeW / 2], width);

  // Shrinks a little at most, so the numbers stay readable: a dense lick scrolls sideways instead.
  const svgStyle = { minWidth: Math.round(width * 0.9), maxWidth: Math.round(width * 1.3) };
  const flip = leftHanded ? { transform: 'scaleX(-1)' } : undefined;

  if (notes.length === 0) {
    return (
      <div className="scroll" style={flip}>
        <svg className="tab" viewBox={`0 0 ${width} ${height}`} style={svgStyle} role="img" aria-label={title ?? emptyLabel}>
          {title && <title>{title}</title>}
          <text className="tabcount" x={width / 2} y={height / 2} transform={unmirror(width / 2)}>
            —
          </text>
        </svg>
      </div>
    );
  }

  const onKey = (e: KeyboardEvent, n: LickNote) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      play?.(midi(n.pitch));
    }
  };

  return (
    <div className="scroll" ref={scroller} style={flip}>
      <svg className="tab" viewBox={`0 0 ${width} ${height}`} style={svgStyle} role={play ? 'group' : 'img'} aria-label={title}>
        {title && <title>{title}</title>}
        {activeX !== undefined && <rect className="tabcol" x={activeX - activeW / 2} y={TOP - 14} width={activeW} height={staffBottom - TOP + 28} rx={6} />}
        {Array.from({ length: Math.floor(beats) + 1 }, (_, b) => {
          const bx = x(b);
          // A bar line every 4 beats (and the closing one); a faint tick on the other beats.
          const bar = b % 4 === 0;
          return (
            <g key={`b${b}`}>
              <line className={bar ? 'tabbar' : 'tabbeat'} x1={bx} x2={bx} y1={TOP} y2={staffBottom} />
              {/* The final tick (b === beats) is the closing barline, not a beat start, so it is not numbered. */}
              {b < Math.floor(beats) && (
                <text className="tabbeatnum" x={bx} y={TOP - 18} transform={unmirror(bx)}>
                  {b + 1}
                </text>
              )}
            </g>
          );
        })}
        {labels.map((name, s) => (
          <g key={`s${s}`}>
            <line className="tabline" x1={LEFT - 6} x2={width - RIGHT + 6} y1={y(s)} y2={y(s)} />
            <text className="tabname" x={6} y={y(s)} transform={unmirror(6)} style={leftHanded ? { textAnchor: 'end' } : undefined}>
              {name}
            </text>
          </g>
        ))}
        {notes.map((n, i) => {
          const cx = x(n.startBeat);
          const text = texts[i]!;
          const w = boxes[i]!;
          return (
            <g
              key={`n${i}`}
              className={i === activeNoteIndex ? 'tabnum on' : 'tabnum'}
              {...(play && {
                role: 'button',
                tabIndex: 0,
                'aria-label': noteLabel(numStrings - n.string, text),
                onClick: () => play(midi(n.pitch)),
                onKeyDown: (e: KeyboardEvent) => onKey(e, n),
              })}
              style={play ? undefined : { cursor: 'default' }}
            >
              <rect x={cx - w / 2} y={y(n.string) - 9} width={w} height={18} rx={4} />
              <text x={cx} y={y(n.string)} transform={unmirror(cx)}>
                {text}
              </text>
            </g>
          );
        })}
        {hasRoles &&
          notes.map((n, i) =>
            n.role ? (
              <text key={`r${i}`} className="tabrole" x={x(n.startBeat)} y={roleY} transform={unmirror(x(n.startBeat))}>
                {n.role}
              </text>
            ) : null,
          )}
        {notes.map((n, i) => (
          <text key={`d${i}`} className="tabcount" x={x(n.startBeat)} y={durY} transform={unmirror(x(n.startBeat))}>
            {durationGlyph(n.durationBeats)}
          </text>
        ))}
      </svg>
    </div>
  );
}
