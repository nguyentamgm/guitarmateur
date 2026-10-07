/** The four scenes of "Three Notes per String". Every position comes from lessons/three-per-string. */
import { useMemo, useState } from 'react';
import { bassMidi } from '../../core/audio';
import { SEQUENCE_IDS, scaleNeck, upAndDown, type Direction, type SequenceId } from '../../core/fretboard';
import { format, type NoteName } from '../../core/music';
import { beatSeconds, cellSeconds } from '../../core/rhythm';
import { fill } from '../../i18n';
import {
  DRILL_BPM,
  DRONE_BPM,
  DRONE_CELLS,
  EXAMPLE_TONIC,
  MAJOR_KEYS,
  NECK_FRETS,
  NOTES_PER_BEAT,
  TRIPLET_CELLS,
  SHAPE_GAPS,
  STRING_SHAPES,
  barStarts,
  countAt,
  crossRun,
  drillRun,
  fingerMap,
  keyView,
  loopSteps,
  positionPair,
  renumber,
  rootRun,
  sevenPositions,
  stringRows,
  type Mode,
  type NeckNote,
  type SceneCopy,
  type StepId,
} from '../../lessons/three-per-string';
import { useTheory } from '../context';
import { PositionFrame } from '../PositionFrame';
import { Button, ChipGroup, KeyFinder, Tempo } from '../controls';
import { Fretboard, type DotTone, type FretDot } from '../Fretboard';
import { boxSpan, neckGeometry } from '../geometry';
import { degreeText, posKey, signed } from '../keys';
import { Tab, type TabNote } from '../Tab';
import { useClock } from '../useClock';
import { useStoredTempo } from '../useStoredTempo';
import { useSequence } from '../useSequence';

export function ThreePerStringScene({ step, copy }: { step: StepId; copy: SceneCopy }) {
  switch (step) {
    case 'strings':
      return <StringsScene copy={copy.strings} />;
    case 'tile':
      return <TileScene copy={copy.tile} />;
    case 'triplets':
      return <TripletsScene copy={copy.triplets} />;
    case 'keys':
      return <KeysScene copy={copy.keys} />;
  }
}

const dotOf = (n: NeckNote, label: string, tone: DotTone = 'plain', dim = false): FretDot => ({
  key: posKey(n),
  string: n.string,
  fret: n.fret,
  midi: n.midi,
  label,
  tone,
  dim,
});

// --- Step 1 ---

type Labels = 'degrees' | 'notes' | 'fingers';
/** Step 1 shows position 1 alone, so a short neck is enough. */
const STRINGS_FRETS = 12;
/** Room for a '+2 +1' tag in 12px mono, plus padding. */
const TAG_WIDTH = 46;

function StringsScene({ copy }: { copy: SceneCopy['strings'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(STRINGS_FRETS, { fretWidth: 50 }), []);
  const pos = useMemo(() => sevenPositions()[0]!, []);
  const rows = useMemo(() => stringRows(pos), [pos]);
  const fingers = useMemo(() => fingerMap(pos), [pos]);
  const [labels, setLabels] = useState<Labels>('degrees');
  const order = useMemo(() => upAndDown(pos.notes), [pos]);
  const seq = useSequence(order.length, 220, (i) => player.pluck(order[i]!.midi));

  const text = (n: NeckNote) =>
    labels === 'degrees' ? degreeText(n.degree) : labels === 'notes' ? n.name : String(fingers.get(posKey(n)));
  const dots = pos.notes.map((n) => dotOf(n, text(n), n.isTonic ? 'home' : 'plain'));
  const caption = fill(copy.caption, { key: format(EXAMPLE_TONIC), min: pos.minFret, max: pos.maxFret });
  const tagX = boxSpan(g, pos.minFret, pos.maxFret).right + 12;

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<Labels>
          label={copy.labels}
          items={[
            { value: 'degrees', text: copy.degrees },
            { value: 'notes', text: copy.notes },
            { value: 'fingers', text: copy.fingers },
          ]}
          value={labels}
          onChange={setLabels}
        />
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.play}</Button>
      </div>
      <div className="legend">
        <span>{copy.gaps}</span>
        {STRING_SHAPES.map((s) => (
          <span key={s}>
            <b className="gaps">{SHAPE_GAPS[s].map(signed).join(' ')}</b> {copy.shapes[s]}
          </span>
        ))}
      </div>
      <Fretboard geometry={g} dots={dots} label={caption} box={pos} active={seq.current === null ? [] : [posKey(order[seq.current]!)]}>
        <g className="gaptag">
          {rows.map((r) => (
            <g key={r.string}>
              <rect x={tagX - 5} y={g.y(r.string) - 9} width={TAG_WIDTH} height={18} rx={4} />
              <text x={tagX} y={g.y(r.string)}>
                {r.gaps.map(signed).join(' ')}
              </text>
            </g>
          ))}
        </g>
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 2 ---

function TileScene({ copy }: { copy: SceneCopy['tile'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(NECK_FRETS, { fretWidth: 46 }), []);
  const all = useMemo(() => sevenPositions(), []);
  const neck = useMemo(() => scaleNeck(EXAMPLE_TONIC, 'major', NECK_FRETS), []);
  const [k, setK] = useState(1);
  const pair = useMemo(() => positionPair(k), [k]);
  const run = useMemo(() => crossRun(pair), [pair]);
  const seq = useSequence(run.length, 200, (i) => player.pluck(run[i]!.midi));

  const lit = new Set([...pair.from.notes, ...pair.to.notes].map(posKey));
  const dots = neck.map((n) => dotOf(n, degreeText(n.degree), n.isTonic ? 'home' : 'plain', !lit.has(posKey(n))));
  const choose = (next: number) => {
    seq.stop();
    setK(next);
  };
  const vars = {
    n: pair.from.index,
    next: pair.to.index,
    min: pair.from.minFret,
    max: pair.from.maxFret,
    degree: degreeText(pair.from.notes[0]!.degree),
    count: pair.shared.length,
  };
  const caption = fill(copy.caption, vars);

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup label={copy.position} items={all.map((p) => ({ value: p.index, text: p.index }))} value={k} onChange={choose} />
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.cross}</Button>
      </div>
      <Fretboard geometry={g} dots={dots} label={caption} box={pair.from} active={seq.current === null ? [] : [posKey(run[seq.current]!)]}>
        <PositionFrame g={g} span={pair.from} on />
        <PositionFrame g={g} span={pair.to} on />
        {pair.shared.map((n) => (
          <circle key={posKey(n)} className="shared" cx={g.x(n.fret)} cy={g.y(n.string)} r={15} />
        ))}
      </Fretboard>
      <p className="caption" aria-live="polite">
        {seq.playing ? fill(copy.playing, vars) : caption}
      </p>
    </div>
  );
}

// --- Step 3 ---

function TripletsScene({ copy }: { copy: SceneCopy['triplets'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(NECK_FRETS, { fretWidth: 46 }), []);
  const all = useMemo(() => sevenPositions(), []);
  const [index, setIndex] = useState(1);
  const [pattern, setPattern] = useState<SequenceId>('straight');
  const [direction, setDirection] = useState<Direction>('up');
  const { bpm, setBpm, best, step } = useStoredTempo('three-per-string-triplets', DRILL_BPM);
  const pos = all[index - 1]!;
  const drill = useMemo(() => drillRun(pos, pattern, direction), [pos, pattern, direction]);
  const cell = cellSeconds(bpm, NOTES_PER_BEAT);
  const steps = loopSteps(drill.length, TRIPLET_CELLS);
  const clock = useClock(steps, cell, (i, delay) => {
    step(i, steps, cell);
    if (countAt(i).kind === 'beat') player.click(i % TRIPLET_CELLS === 0, delay);
    const n = drill[i];
    if (n) player.pluck(n.midi, delay, cell * 0.9);
  });
  const change = (fn: () => void) => {
    clock.stop();
    fn();
  };

  const now = clock.current === null ? null : drill[clock.current];
  const active = now ? [posKey(now)] : [];
  const dots = pos.notes.map((n) => dotOf(n, degreeText(n.degree), n.isTonic ? 'home' : 'plain'));
  const columns = drill.map((n): TabNote[] => [{ key: posKey(n), string: n.string, fret: n.fret, midi: n.midi }]);
  const counts = drill.map((_, i) => {
    const s = countAt(i);
    return s.kind === 'beat' ? String(s.n) : copy[s.kind];
  });
  const idle = fill(copy.idle, { pattern: copy.patterns[pattern], n: index, count: drill.length });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup label={copy.position} items={all.map((p) => ({ value: p.index, text: p.index }))} value={index} onChange={(i) => change(() => setIndex(i))} />
        <ChipGroup<SequenceId>
          label={copy.pattern}
          items={SEQUENCE_IDS.map((id) => ({ value: id, text: copy.patterns[id] }))}
          value={pattern}
          onChange={(p) => change(() => setPattern(p))}
        />
        <ChipGroup<Direction>
          label={copy.direction}
          items={[
            { value: 'up', text: copy.up },
            { value: 'down', text: copy.down },
          ]}
          value={direction}
          onChange={(d) => change(() => setDirection(d))}
        />
      </div>
      <div className="controls">
        <Button onClick={clock.toggle}>{clock.playing ? copy.stop : copy.start}</Button>
        <Tempo label={copy.tempo} text={fill(copy.bpm, { bpm })} bpm={bpm} onChange={setBpm} best={best} />
      </div>
      <Tab columns={columns} counts={counts} barLines={barStarts(drill.length)} label={copy.tab} active={active} column={now ? clock.current : null} />
      <Fretboard geometry={g} dots={dots} label={idle} box={pos} active={active} />
      <p className="caption" aria-live="polite">
        {clock.playing ? fill(copy.playing, { bpm }) : idle}
      </p>
    </div>
  );
}

// --- Step 4 ---

function KeysScene({ copy }: { copy: SceneCopy['keys'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(NECK_FRETS, { fretWidth: 46 }), []);
  const [tonic, setTonic] = useState<NoteName>(EXAMPLE_TONIC);
  const [mode, setMode] = useState<Mode>('major');
  /** The chosen position in major numbering, so switching scale keeps the same frets. */
  const [majorIndex, setMajorIndex] = useState(1);
  const view = useMemo(() => keyView(tonic, mode), [tonic, mode]);
  const index = mode === 'major' ? majorIndex : renumber(majorIndex, 'major');
  const pos = view.positions[index - 1]!;
  const root = mode === 'major' ? view.tonic : view.relativeMinor;
  const run = useMemo(() => rootRun(pos), [pos]);
  const cell = cellSeconds(DRONE_BPM, 2);
  const clock = useClock(loopSteps(run.length, DRONE_CELLS), cell, (i, delay) => {
    if (i % DRONE_CELLS === 0) player.pluck(bassMidi(root), delay, beatSeconds(DRONE_BPM) * 4 * 0.95);
    const n = run[i];
    if (n) player.pluck(n.midi, delay, cell * 1.6);
  });
  const change = (fn: () => void) => {
    clock.stop();
    fn();
  };

  const rootTone: DotTone = mode === 'major' ? 'homeMajor' : 'home';
  const members = new Set(pos.notes.map(posKey));
  const dots = view.neck.map((n) => dotOf(n, degreeText(n.degree), n.isTonic ? rootTone : 'plain', !members.has(posKey(n))));
  const majorName = fill(copy.major, { key: format(view.tonic) });
  const minorName = fill(copy.minor, { key: format(view.relativeMinor) });
  const scale = mode === 'major' ? majorName : minorName;
  const caption = fill(copy.caption, {
    scale,
    n: index,
    min: pos.minFret,
    max: pos.maxFret,
    other: mode === 'major' ? minorName : majorName,
    m: renumber(index, mode),
  });
  const now = clock.current === null ? null : run[clock.current];

  return (
    <div className="board">
      <KeyFinder keys={MAJOR_KEYS} label={copy.key} value={tonic} onChange={(k) => change(() => setTonic(k))} />
      <div className="controls">
        <ChipGroup<Mode>
          label={copy.scale}
          items={[
            { value: 'major', text: majorName },
            { value: 'minor', text: minorName },
          ]}
          value={mode}
          onChange={(m) => change(() => setMode(m))}
        />
        <ChipGroup
          label={copy.position}
          items={view.positions.map((p) => ({ value: p.index, text: p.index }))}
          value={index}
          onChange={(i) => change(() => setMajorIndex(mode === 'major' ? i : renumber(i, 'minor')))}
        />
        <Button onClick={clock.toggle}>{clock.playing ? copy.stop : copy.play}</Button>
      </div>
      <div className="legend">
        <span>
          <i className={`swatch ${rootTone}`} />
          {copy.legendRoot}
        </span>
      </div>
      <Fretboard geometry={g} dots={dots} label={caption} box={pos} active={now ? [posKey(now)] : []} />
      <p className="caption" aria-live="polite">
        {clock.playing ? fill(copy.playing, { scale, root: format(root) }) : caption}
      </p>
    </div>
  );
}
