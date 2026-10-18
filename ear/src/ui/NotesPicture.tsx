/**
 * A Stage 1 wrong answer's picture (docs/ear-levels.md "Stage 1"): the notes as dots that go up
 * and down with the pitch (levels 1–3), or, for level 4, the two notes on one string of the neck,
 * so the gap is seen as well as heard.
 */
import type { Player } from '@shared/core/audio';
import { Fretboard, type FretDot } from '@shared/ui/Fretboard';
import { neckGeometry } from '@shared/ui/geometry';
import type { Level } from '../core/levels';
import { onOneString } from '../core/stage1';
import { fill, type UiStrings } from '../i18n';

const W = 220;
const H = 90;
const R = 9;

export function NotesPicture({
  ui,
  level,
  notes,
  label,
  player,
}: {
  ui: UiStrings;
  level: Level;
  notes: readonly number[];
  /** What the picture shows, in words: the right answer's line. */
  label: string;
  player: Player;
}) {
  if (level.kind === 'distance') {
    const { string, frets } = onOneString(notes);
    const lo = Math.min(...frets);
    const hi = Math.max(...frets);
    // Narrow frets, so a 12-fret gap still fits a phone (the shared neck keeps 62% of its width).
    const fretWidth = 34;
    const geometry =
      lo === 0
        ? neckGeometry(Math.max(hi, 3), { fretWidth })
        : neckGeometry(hi, { from: lo - 1, fretWidth });
    const dots: FretDot[] = frets.map((fret, i) => ({
      key: `${i}`,
      string,
      fret,
      midi: notes[i]!,
      label: String(i + 1),
      ...(i === 1 ? { tone: 'target' as const } : {}),
    }));
    return (
      <div className="lv-picture">
        <Fretboard
          geometry={geometry}
          dots={dots}
          label={fill(ui.gapLabel, { n: hi - lo })}
          words={{
            fret: (n) => fill(ui.neckWords.fret, { n }),
            string: (n) => fill(ui.neckWords.string, { n }),
            root: ui.neckWords.root,
            tones: { target: ui.neckWords.target },
          }}
          play={(midi) => player.pluck(midi, 0, 1)}
        />
      </div>
    );
  }
  // Dots spread across, each as high as its note: the line between them is the way the tune went.
  const low = Math.min(...notes);
  const span = Math.max(Math.max(...notes) - low, 12);
  const at = (i: number) => ({
    x: R + ((W - 2 * R) * i) / Math.max(1, notes.length - 1),
    y: H - R - ((H - 2 * R) * (notes[i]! - low)) / span,
  });
  const points = notes.map((_, i) => at(i));
  return (
    <svg className="lv-picture lv-shape" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <polyline points={points.map((p) => `${p.x},${p.y}`).join(' ')} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={R} />
      ))}
    </svg>
  );
}
