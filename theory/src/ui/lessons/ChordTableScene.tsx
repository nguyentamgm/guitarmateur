/** The five scenes of "The chord formula table". Every note comes from lessons/chord-table. */
import { useMemo, useState } from 'react';
import { chordSymbol, format, type ChordId, type IntervalName, type NoteName } from '../../core/music';
import { strumDelays } from '../../core/rhythm';
import { fill } from '../../i18n';
import {
  GROUPS,
  INVERSION_CHORDS,
  LADDERS,
  MOVABLE,
  OPEN_SEVENTHS,
  ROOTS,
  SEVENTHS,
  STACK_FRETS,
  TABLE,
  TABLE_FRETS,
  WALKDOWN,
  bassOptions,
  baseTriadView,
  chordMidis,
  inversionView,
  ladder,
  movableView,
  openView,
  roleOf,
  stackView,
  tableView,
  type ChordNote,
  type Group,
  type Role,
  type SceneCopy,
  type StepId,
  type VoicingView,
} from '../../lessons/chord-table';
import { useTheory } from '../context';
import { Button, ChipGroup } from '../controls';
import { Fretboard, type DotTone, type FretDot } from '../Fretboard';
import { neckGeometry, type NeckGeometry } from '../geometry';
import { degreeText, posKey } from '../keys';
import { useSequence } from '../useSequence';

export function ChordTableScene({ step, copy }: { step: StepId; copy: SceneCopy }) {
  switch (step) {
    case 'sevenths':
      return <SeventhsScene copy={copy} />;
    case 'table':
      return <TableScene copy={copy} />;
    case 'openSevenths':
      return <OpenSeventhsScene copy={copy} />;
    case 'inversions':
      return <InversionsScene copy={copy} />;
    case 'simplify':
      return <SimplifyScene copy={copy} />;
  }
}

type Labels = 'degrees' | 'notes';

const ROLE_TONE: Readonly<Record<Role, DotTone>> = { root: 'home', third: 'plain', fifth: 'soft', seventh: 'homeMajor', colour: 'blue' };
const ROLES: readonly Role[] = ['root', 'third', 'fifth', 'seventh', 'colour'];

const nameOf = (copy: SceneCopy, n: IntervalName) =>
  fill(copy.interval.name, { quality: copy.interval.qualities[n.quality], number: copy.interval.numbers[n.number - 1]! });

const noteDot = (n: ChordNote, labels: Labels = 'degrees', extra: Partial<FretDot> = {}): FretDot => ({
  key: posKey(n),
  string: n.string,
  fret: n.fret,
  midi: n.midi,
  label: labels === 'degrees' ? degreeText(n.degree) : n.name,
  tone: ROLE_TONE[roleOf(n.degree)],
  ...extra,
});

function usePlay() {
  const { player } = useTheory();
  return {
    strum(midis: readonly number[], delay = 0) {
      for (const s of strumDelays(midis, 'down', 0.02)) player.pluck(s.item, delay + s.delay, 1.6);
    },
    arpeggio(midis: readonly number[]) {
      midis.forEach((m, i) => player.pluck(m, i * 0.28, 1.2));
      for (const s of strumDelays(midis, 'down', 0.02)) player.pluck(s.item, midis.length * 0.28 + 0.2 + s.delay, 1.6);
    },
  };
}

const rootItems = ROOTS.map((r) => ({ value: format(r), text: format(r) }));
const rootOf = (name: string): NoteName => ROOTS.find((r) => format(r) === name)!;

function Legend({ copy }: { copy: SceneCopy }) {
  return (
    <div className="legend">
      {ROLES.map((r) => (
        <span key={r}>
          <i className={`swatch ${ROLE_TONE[r]}`} />
          {copy.table.roles[r]}
        </span>
      ))}
    </div>
  );
}

function MutedMarks({ g, view, mark }: { g: NeckGeometry; view: VoicingView; mark: string }) {
  return (
    <>
      {view.muted.map((s) => (
        <text key={s} className="mutex" x={g.x(view.fret)} y={g.y(s)}>
          {mark}
        </text>
      ))}
    </>
  );
}

// --- Step 1 ---

function SeventhsScene({ copy }: { copy: SceneCopy }) {
  const play = usePlay();
  const g = useMemo(() => neckGeometry(STACK_FRETS, { fretWidth: 42 }), []);
  const [root, setRoot] = useState('G');
  const [id, setId] = useState<ChordId>('maj7');
  const view = useMemo(() => stackView(rootOf(root), id), [root, id]);
  const pick = (next: ChordId) => {
    setId(next);
    play.arpeggio(stackView(rootOf(root), next).notes.map((n) => n.midi));
  };
  const caption = fill(copy.sevenths.caption, {
    symbol: view.symbol,
    formula: view.formula.map(degreeText).join(' '),
    notes: view.spelled.join(' '),
    gaps: view.gaps.map((gp) => nameOf(copy, gp.name)).join(' + '),
  });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<string> label={copy.root} items={rootItems} value={root} onChange={setRoot} />
      </div>
      <div className="controls">
        <ChipGroup<ChordId> label={copy.chord} items={SEVENTHS.map((k) => ({ value: k, text: chordSymbol({ root: rootOf(root), id: k }) }))} value={id} onChange={pick} />
        <Button onClick={() => play.arpeggio(view.notes.map((n) => n.midi))}>{copy.arpeggio}</Button>
      </div>
      <Fretboard geometry={g} dots={view.notes.map((n) => noteDot(n))} label={caption}>
        {view.gaps.map((gp, i) => (
          <g key={i} className="olink">
            <line x1={g.x(gp.from.fret)} x2={g.x(gp.to.fret)} y1={g.y(gp.from.string)} y2={g.y(gp.to.string)} />
            <text x={(g.x(gp.from.fret) + g.x(gp.to.fret)) / 2 + 34} y={(g.y(gp.from.string) + g.y(gp.to.string)) / 2}>
              {nameOf(copy, gp.name)}
            </text>
          </g>
        ))}
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 2 ---

function TableScene({ copy }: { copy: SceneCopy }) {
  const play = usePlay();
  const g = useMemo(() => neckGeometry(TABLE_FRETS, { fretWidth: 48 }), []);
  const [root, setRoot] = useState('D');
  const [group, setGroup] = useState<Group>('sevenths');
  const [id, setId] = useState<ChordId>('m7');
  const [labels, setLabels] = useState<Labels>('degrees');
  const view = useMemo(() => tableView(rootOf(root), id), [root, id]);
  const chooseGroup = (next: Group) => {
    setGroup(next);
    setId(TABLE[next][0]!);
  };
  const caption = fill(copy.table.caption, { symbol: view.symbol, formula: view.formula.map(degreeText).join(' '), notes: view.spelled.join(' ') });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<string> label={copy.root} items={rootItems} value={root} onChange={setRoot} />
      </div>
      <div className="controls">
        <ChipGroup<Group> label={copy.table.group} items={GROUPS.map((x) => ({ value: x, text: copy.table.groups[x] }))} value={group} onChange={chooseGroup} />
      </div>
      <div className="controls">
        <ChipGroup<ChordId>
          label={copy.chord}
          items={TABLE[group].map((k) => ({ value: k, text: chordSymbol({ root: rootOf(root), id: k }) }))}
          value={id}
          onChange={(k) => {
            setId(k);
            play.arpeggio(chordMidis({ root: rootOf(root), id: k }));
          }}
        />
        <ChipGroup<Labels>
          label={copy.labels}
          items={[
            { value: 'degrees', text: copy.degrees },
            { value: 'notes', text: copy.notes },
          ]}
          value={labels}
          onChange={setLabels}
        />
        <Button onClick={() => play.arpeggio(chordMidis(view.chord))}>{copy.play}</Button>
      </div>
      <div className="formula-row" aria-hidden="true">
        {view.formula.map((d, i) => (
          <span key={d}>
            {`${degreeText(d)} · ${view.spelled[i]}`}
          </span>
        ))}
      </div>
      <Legend copy={copy} />
      <Fretboard geometry={g} dots={view.neck.map((n) => noteDot(n, labels))} label={caption} />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 3 ---

function OpenSeventhsScene({ copy }: { copy: SceneCopy }) {
  const c = copy.openSevenths;
  const play = usePlay();
  const g = useMemo(() => neckGeometry(4, { fretWidth: 72 }), []);
  const gm = useMemo(() => neckGeometry(15, { fretWidth: 46 }), []);
  const [index, setIndex] = useState(0);
  const [compare, setCompare] = useState(false);
  const [kind, setKind] = useState<ChordId>('m11');
  const [root, setRoot] = useState('D');
  const chord = OPEN_SEVENTHS[index]!;
  const view = useMemo(() => openView(chord), [chord]);
  const base = useMemo(() => baseTriadView(chord), [chord]);
  const shown = compare && base ? base : view;
  const other = shown === view ? base : view;
  const moved = other ? shown.notes.filter((n) => other.notes.find((m) => m.string === n.string)?.fret !== n.fret) : [];
  const movable = useMemo(() => movableView(rootOf(root), kind), [root, kind]);

  const pick = (i: number) => {
    setIndex(i);
    setCompare(false);
    play.strum(openView(OPEN_SEVENTHS[i]!).notes.map((n) => n.midi));
  };
  const toggle = () => {
    const next = !compare;
    setCompare(next);
    play.strum((next && base ? base : view).notes.map((n) => n.midi));
  };
  const caption = fill(c.caption, { symbol: shown.symbol, degrees: shown.notes.map((n) => degreeText(n.degree)).join(' ') });
  const changed = other && moved.length > 0 ? fill(c.changed, { base: other.symbol, moved: moved.map((n) => degreeText(n.degree)).join(', ') }) : '';
  const movableCaption = fill(c.movableCaption, { symbol: movable.symbol, fret: movable.fret, degrees: movable.notes.map((n) => degreeText(n.degree)).join(' ') });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<number> label={copy.chord} items={OPEN_SEVENTHS.map((ch, i) => ({ value: i, text: chordSymbol(ch) }))} value={index} onChange={pick} />
      </div>
      <div className="controls">
        <Button onClick={() => play.strum(shown.notes.map((n) => n.midi))}>{copy.together}</Button>
        {base && (
          <Button onClick={toggle} ghost>
            {fill(c.compare, { symbol: (compare ? view : base).symbol })}
          </Button>
        )}
      </div>
      <Legend copy={copy} />
      <Fretboard geometry={g} dots={shown.notes.map((n) => noteDot(n))} label={caption} active={moved.map(posKey)}>
        <MutedMarks g={g} view={shown} mark={copy.mutedMark} />
      </Fretboard>
      <p className="caption" aria-live="polite">
        {`${caption} ${changed}`.trim()}
      </p>
      <div className="subquiz">
        <h3>{c.movable}</h3>
        <div className="controls">
          <ChipGroup<ChordId> label={c.kind} items={MOVABLE.map((k) => ({ value: k, text: chordSymbol({ root: rootOf(root), id: k }) }))} value={kind} onChange={setKind} />
        </div>
        <div className="controls">
          <ChipGroup<string> label={copy.root} items={rootItems} value={root} onChange={setRoot} />
          <Button onClick={() => play.strum(movable.notes.map((n) => n.midi))}>{copy.together}</Button>
        </div>
        <Fretboard geometry={gm} dots={movable.notes.map((n) => noteDot(n))} label={movableCaption}>
          <rect className="barrebar" x={gm.x(movable.fret) - 13} y={gm.y(1) - 13} width={26} height={gm.y(5) - gm.y(1) + 26} rx={13} />
          <MutedMarks g={gm} view={movable} mark={copy.mutedMark} />
        </Fretboard>
        <p className="caption" aria-live="polite">
          {movableCaption}
        </p>
      </div>
    </div>
  );
}

// --- Step 4 ---

function InversionsScene({ copy }: { copy: SceneCopy }) {
  const c = copy.inversions;
  const play = usePlay();
  const g = useMemo(() => neckGeometry(4, { fretWidth: 72 }), []);
  const [index, setIndex] = useState(0);
  const [bass, setBass] = useState('3');
  const chord = INVERSION_CHORDS[index]!;
  const options = useMemo(() => bassOptions(chord), [chord]);
  const safeBass = options.includes(bass) ? bass : options[0]!;
  const view = useMemo(() => inversionView(chord, safeBass), [chord, safeBass]);
  const walk = useMemo(() => WALKDOWN.map((w) => inversionView(w.chord, w.bass)), []);
  const seq = useSequence(walk.length, 1100, (i) => play.strum(walk[i]!.notes.map((n) => n.midi)));
  const shown = seq.current === null ? view : walk[seq.current]!;
  const bassNote = shown.notes[0]!;

  const pickChord = (i: number) => {
    seq.stop();
    setIndex(i);
  };
  const pickBass = (b: string) => {
    seq.stop();
    setBass(b);
    play.strum(inversionView(chord, b).notes.map((n) => n.midi));
  };
  const caption =
    seq.current === null
      ? fill(c.caption, { symbol: view.symbol, bass: bassNote.name, degree: degreeText(bassNote.degree) })
      : fill(c.walkCaption, { chords: walk.map((v) => v.symbol).join(' → '), basses: walk.map((v) => v.notes[0]!.name).join(' ') });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<number> label={copy.chord} items={INVERSION_CHORDS.map((ch, i) => ({ value: i, text: chordSymbol(ch) }))} value={index} onChange={pickChord} />
      </div>
      <div className="controls">
        <ChipGroup<string>
          label={c.bass}
          items={options.map((d) => ({ value: d, text: fill(c.bassItem, { note: inversionView(chord, d).notes[0]!.name, degree: degreeText(d) }) }))}
          value={safeBass}
          onChange={pickBass}
        />
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : c.walk}</Button>
      </div>
      <p className="power-symbol" aria-hidden="true">
        {shown.symbol}
      </p>
      <Fretboard geometry={g} dots={shown.notes.map((n, i) => noteDot(n, 'degrees', i === 0 ? { tone: 'homeMajor' } : {}))} label={caption}>
        <MutedMarks g={g} view={shown} mark={copy.mutedMark} />
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 5 ---

function SimplifyScene({ copy }: { copy: SceneCopy }) {
  const c = copy.simplify;
  const play = usePlay();
  const g = useMemo(() => neckGeometry(12, { fretWidth: 52 }), []);
  const [index, setIndex] = useState(0);
  const [rung, setRung] = useState(0);
  const rungs = useMemo(() => ladder(LADDERS[index]!), [index]);
  const now = rungs[rung]!;
  const neck = useMemo(() => tableView(now.chord.root, now.chord.id).neck.filter((n) => n.fret <= 12), [now]);

  const pick = (i: number) => {
    setIndex(i);
    setRung(0);
    play.arpeggio(ladder(LADDERS[i]!)[0]!.midis);
  };
  const simpler = () => {
    const next = Math.min(rung + 1, rungs.length - 1);
    setRung(next);
    play.arpeggio(rungs[next]!.midis);
  };
  const caption = fill(c.caption, { symbol: now.symbol, formula: now.formula.map(degreeText).join(' '), notes: now.spelled.join(' ') });
  const dropped = now.dropped ? fill(c.dropped, { from: rungs[rung - 1]!.symbol, to: now.symbol, degree: degreeText(now.dropped) }) : '';

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<number> label={copy.chord} items={LADDERS.map((ch, i) => ({ value: i, text: chordSymbol(ch) }))} value={index} onChange={pick} />
      </div>
      <ol className="chordpath">
        {rungs.map((r, i) => (
          <li key={r.symbol} className={i === rung ? 'on' : undefined}>
            {r.symbol}
          </li>
        ))}
      </ol>
      <div className="controls">
        <Button onClick={() => play.arpeggio(now.midis)}>{copy.play}</Button>
        <Button onClick={simpler} ghost>
          {c.simpler}
        </Button>
        <Button onClick={() => setRung(0)} ghost>
          {c.reset}
        </Button>
      </div>
      <Legend copy={copy} />
      <Fretboard geometry={g} dots={neck.map((n) => noteDot(n))} label={caption} />
      <p className="caption" aria-live="polite">
        {`${caption}. ${dropped}`.trim()}
      </p>
    </div>
  );
}

