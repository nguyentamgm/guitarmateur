/** The five scenes of "Chords are stacked intervals". Every position comes from lessons/chords. */
import { useMemo, useState } from 'react';
import { STRINGS, midiAt, type FretPos } from '../../core/fretboard';
import { chordNotes, chordSymbol, format, sameNote, type ChordId, type IntervalName, type NoteName } from '../../core/music';
import { strumDelays } from '../../core/rhythm';
import { fill } from '../../i18n';
import {
  OPEN_CHORDS,
  QUALITIES,
  QUIZ_KINDS,
  ROOTS,
  STACK_FRETS,
  SUS_KINDS,
  buildQuestion,
  judgeBuild,
  openView,
  rootOnFive,
  stackView,
  toFind,
  type BuildQuestion,
  type ChordNote,
  type Gap,
  type SceneCopy,
  type StackView,
  type StepId,
} from '../../lessons/chords';
import { useTheory } from '../context';
import { useQuizScore } from '../useQuizScore';
import { Button, ChipGroup } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { neckGeometry, type NeckGeometry } from '../geometry';
import { degreeText, posKey } from '../keys';
import { useSequence } from '../useSequence';

export function ChordsScene({ step, copy }: { step: StepId; copy: SceneCopy }) {
  switch (step) {
    case 'stack':
      return <StackScene copy={copy} />;
    case 'qualities':
      return <QualitiesScene copy={copy} />;
    case 'sus':
      return <SusScene copy={copy} />;
    case 'open':
      return <OpenScene copy={copy} />;
    case 'build':
      return <BuildScene copy={copy} />;
  }
}

type Labels = 'degrees' | 'notes';

const nameOf = (copy: SceneCopy, n: IntervalName) =>
  fill(copy.interval.name, { quality: copy.interval.qualities[n.quality], number: copy.interval.numbers[n.number - 1]! });

const chordDot = (n: ChordNote, labels: Labels, extra: Partial<FretDot> = {}): FretDot => ({
  key: posKey(n),
  string: n.string,
  fret: n.fret,
  midi: n.midi,
  label: labels === 'degrees' ? degreeText(n.degree) : n.name,
  tone: n.degree === '1' ? 'home' : 'plain',
  ...extra,
});

function useStrum() {
  const { player } = useTheory();
  return (notes: readonly { midi: number }[], delay = 0, length = 1.5) => {
    for (const s of strumDelays(notes, 'down', 0.02)) player.pluck(s.item.midi, delay + s.delay, length);
  };
}

const rootItems = ROOTS.map((r) => ({ value: format(r), text: format(r) }));
const rootOf = (name: string): NoteName => ROOTS.find((r) => format(r) === name)!;

/** Lines from root to middle and middle to top, each with its interval name. */
function StackLines({ g, view, copy, reached = 3 }: { g: NeckGeometry; view: StackView; copy: SceneCopy; reached?: number }) {
  const line = (gp: Gap, i: number) => {
    const x1 = g.x(gp.from.fret);
    const y1 = g.y(gp.from.string);
    const x2 = g.x(gp.to.fret);
    const y2 = g.y(gp.to.string);
    return (
      <g key={i} className={reached > i + 1 ? 'olink' : 'olink outer'} style={{ opacity: reached > i + 1 ? 1 : 0.25 }}>
        <line x1={x1} x2={x2} y1={y1} y2={y2} />
        <text x={(x1 + x2) / 2 + 30} y={(y1 + y2) / 2}>
          {nameOf(copy, gp.name)}
        </text>
      </g>
    );
  };
  return <>{view.stack.map(line)}</>;
}

function Labeller({ copy, value, onChange }: { copy: SceneCopy; value: Labels; onChange(v: Labels): void }) {
  return (
    <ChipGroup<Labels>
      label={copy.labels}
      items={[
        { value: 'degrees', text: copy.degrees },
        { value: 'notes', text: copy.notes },
      ]}
      value={value}
      onChange={onChange}
    />
  );
}

// --- Step 1 ---

function StackScene({ copy }: { copy: SceneCopy }) {
  const { player } = useTheory();
  const strum = useStrum();
  const g = useMemo(() => neckGeometry(STACK_FRETS, { fretWidth: 42 }), []);
  const [root, setRoot] = useState('D');
  const [id, setId] = useState<ChordId>('major');
  const view = useMemo(() => stackView(rootOf(root), id), [root, id]);
  const seq = useSequence(3, 650, (i) => player.pluck(view.notes[i]!.midi, 0, 1.6));
  const reached = seq.current === null ? 3 : seq.current + 1;
  const caption = fill(copy.stack.caption, {
    symbol: view.symbol,
    lower: nameOf(copy, view.stack[0].name),
    upper: nameOf(copy, view.stack[1].name),
    outer: nameOf(copy, view.outer.name),
  });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<string> label={copy.root} items={rootItems} value={root} onChange={(r) => {
            seq.stop();
            setRoot(r);
          }} />
      </div>
      <div className="controls">
        <ChipGroup<ChordId>
          label={copy.qualities.quality}
          items={(['major', 'minor'] as const).map((k) => ({ value: k, text: copy.kinds[k] }))}
          value={id}
          onChange={(k) => {
            seq.stop();
            setId(k);
          }}
        />
        <Button onClick={seq.toggle}>{copy.arpeggio}</Button>
        <Button onClick={() => strum(view.notes)} ghost>
          {copy.together}
        </Button>
      </div>
      <Fretboard
        geometry={g}
        dots={view.notes.map((n, i) => chordDot(n, 'degrees', { dim: i >= reached }))}
        label={caption}
        active={seq.current === null ? [] : [posKey(view.notes[seq.current]!)]}
      >
        <StackLines g={g} view={view} copy={copy} reached={reached} />
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 2 ---

function QualitiesScene({ copy }: { copy: SceneCopy }) {
  const strum = useStrum();
  const g = useMemo(() => neckGeometry(STACK_FRETS, { fretWidth: 42 }), []);
  const [root, setRoot] = useState('A');
  const [id, setId] = useState<ChordId>('major');
  const [labels, setLabels] = useState<Labels>('degrees');
  const view = useMemo(() => stackView(rootOf(root), id), [root, id]);
  const choose = (k: ChordId) => {
    setId(k);
    strum(stackView(rootOf(root), k).notes);
  };
  const caption = fill(copy.qualities.caption, {
    symbol: view.symbol,
    formula: view.formula.map(degreeText).join(' '),
    notes: view.spelled.join(' '),
  });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<string> label={copy.root} items={rootItems} value={root} onChange={setRoot} />
      </div>
      <div className="controls">
        <ChipGroup<ChordId> label={copy.qualities.quality} items={QUALITIES.map((k) => ({ value: k, text: copy.kinds[k as keyof SceneCopy['kinds']] }))} value={id} onChange={choose} />
        <Labeller copy={copy} value={labels} onChange={setLabels} />
        <Button onClick={() => strum(view.notes)}>{copy.together}</Button>
      </div>
      <p className="power-symbol" aria-hidden="true">
        {view.symbol}
      </p>
      <Fretboard geometry={g} dots={view.notes.map((n) => chordDot(n, labels))} label={caption}>
        <StackLines g={g} view={view} copy={copy} />
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 3 ---

function SusScene({ copy }: { copy: SceneCopy }) {
  const strum = useStrum();
  const g = useMemo(() => neckGeometry(STACK_FRETS, { fretWidth: 42 }), []);
  const [root, setRoot] = useState('D');
  const [id, setId] = useState<ChordId>('sus4');
  const view = useMemo(() => stackView(rootOf(root), id), [root, id]);
  const choose = (k: ChordId) => {
    setId(k);
    strum(stackView(rootOf(root), k).notes);
  };
  const resolve = () => {
    strum(view.notes, 0, 1.1);
    strum(stackView(rootOf(root), 'major').notes, 1.2, 1.8);
  };
  const caption = fill(copy.sus.caption, {
    symbol: view.symbol,
    formula: view.formula.map(degreeText).join(' '),
    notes: view.spelled.join(' '),
    lower: nameOf(copy, view.stack[0].name),
    upper: nameOf(copy, view.stack[1].name),
  });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<string> label={copy.root} items={rootItems} value={root} onChange={setRoot} />
      </div>
      <div className="controls">
        <ChipGroup<ChordId> label={copy.sus.kind} items={SUS_KINDS.map((k) => ({ value: k, text: copy.kinds[k as keyof SceneCopy['kinds']] }))} value={id} onChange={choose} />
        {id !== 'major' && <Button onClick={resolve}>{copy.sus.resolve}</Button>}
      </div>
      <Fretboard geometry={g} dots={view.notes.map((n) => chordDot(n, 'degrees'))} label={caption}>
        <StackLines g={g} view={view} copy={copy} />
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 4 ---

const OPEN_FRETS = 4;

function OpenScene({ copy }: { copy: SceneCopy }) {
  const strum = useStrum();
  const g = useMemo(() => neckGeometry(OPEN_FRETS, { fretWidth: 72 }), []);
  const [index, setIndex] = useState(0);
  const [labels, setLabels] = useState<Labels>('degrees');
  const view = useMemo(() => openView(OPEN_CHORDS[index]!), [index]);
  const choose = (i: number) => {
    setIndex(i);
    strum(openView(OPEN_CHORDS[i]!).notes);
  };
  const partnerIndex = view.partner ? OPEN_CHORDS.findIndex((c) => c.id === view.partner!.id && sameNote(c.root, view.partner!.root)) : -1;
  const caption = fill(copy.open.caption, { symbol: view.symbol, degrees: view.notes.map((n) => degreeText(n.degree)).join(' ') });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<number> label={copy.open.chord} items={OPEN_CHORDS.map((c, i) => ({ value: i, text: chordSymbol(c) }))} value={index} onChange={choose} />
      </div>
      <div className="controls">
        <Labeller copy={copy} value={labels} onChange={setLabels} />
        <Button onClick={() => strum(view.notes)}>{copy.open.strum}</Button>
        {partnerIndex >= 0 && (
          <Button onClick={() => choose(partnerIndex)} ghost>
            {fill(copy.open.switchTo, { symbol: chordSymbol(view.partner!) })}
          </Button>
        )}
      </div>
      <Fretboard geometry={g} dots={view.notes.map((n) => chordDot(n, labels))} label={caption}>
        {view.muted.map((s) => (
          <text key={s} className="mutex" x={g.x(0)} y={g.y(s)}>
            {copy.open.mutedMark}
          </text>
        ))}
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 5 ---

type Pool = 'basic' | 'all';
const POOL_KINDS: Record<Pool, readonly ChordId[]> = { basic: ['major', 'minor'], all: QUIZ_KINDS };
/** Frets around the root offered as places to click. */
const WINDOW = { below: 5, above: 3 };

function BuildScene({ copy }: { copy: SceneCopy }) {
  const c = copy.build;
  const strum = useStrum();
  const g = useMemo(() => neckGeometry(STACK_FRETS, { fretWidth: 42 }), []);
  const [pool, setPool] = useState<Pool>('basic');
  const [q, setQ] = useState<BuildQuestion>(() => buildQuestion(Math.random, undefined, POOL_KINDS.basic));
  const [found, setFound] = useState<(FretPos & { degree: string })[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [missed, setMissed] = useState(false);
  const { score, settle } = useQuizScore('chords-build');

  const chord = { root: q.root, id: q.id };
  const symbol = chordSymbol(chord);
  const root = rootOnFive(q.root);
  const need = toFind(q);
  const have = new Set(found.map((f) => f.degree));
  const solved = need.every((d) => have.has(d));
  const formula = ['1', ...need].map(degreeText).join(' ');

  const lo = Math.max(0, root.fret - WINDOW.below);
  const hi = Math.min(STACK_FRETS, root.fret + WINDOW.above);
  const taken = new Set([posKey(root), ...found.map(posKey)]);
  const places: FretDot[] = STRINGS.flatMap((string) =>
    Array.from({ length: hi - lo + 1 }, (_, i): FretDot => {
      const pos = { string, fret: lo + i };
      return { key: posKey(pos), ...pos, midi: midiAt(pos), faint: true };
    }),
  ).filter((d) => !taken.has(d.key));
  const dots: FretDot[] = [
    ...places,
    { key: posKey(root), ...root, midi: midiAt(root), label: '1', tone: 'home' },
    ...found.map((f) => ({ key: posKey(f), string: f.string, fret: f.fret, midi: midiAt(f), label: degreeText(f.degree) })),
  ];

  const click = (d: FretDot) => {
    if (solved) return;
    const r = judgeBuild(q, d);
    if (r.kind === 'root') return setMessage(c.root);
    if (r.kind === 'miss') {
      setMissed(true);
      return setMessage(fill(c.miss, { semitones: r.semitones, symbol, formula }));
    }
    const next = [...found.filter((f) => f.degree !== r.degree), { string: d.string, fret: d.fret, degree: r.degree }];
    setFound(next);
    if (need.every((x) => next.some((f) => f.degree === x))) {
      strum([root, ...next].map((p) => ({ midi: midiAt(p) })).sort((a, b) => a.midi - b.midi));
      settle(!missed);
      setMessage(fill(c.solved, { symbol, notes: chordNotes(chord).map(format).join(' ') }));
    } else {
      setMessage(fill(c.found, { degree: degreeText(r.degree), symbol }));
    }
  };
  const next = (p: Pool = pool, skip = true) => {
    // Skipping an unsolved chord counts as a miss, so a streak means every chord was built.
    if (skip && !solved) settle(false);
    setQ((prev) => buildQuestion(Math.random, prev, POOL_KINDS[p]));
    setFound([]);
    setMessage(null);
    setMissed(false);
  };
  const choosePool = (p: Pool) => {
    setPool(p);
    next(p, false);
  };
  const question = fill(c.question, { symbol, fret: root.fret });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<Pool>
          label={c.pool}
          items={[
            { value: 'basic', text: c.basic },
            { value: 'all', text: c.all },
          ]}
          value={pool}
          onChange={choosePool}
        />
      </div>
      <div className="quiz">
        <span className="question">{question}</span>
        <Button onClick={() => next()} ghost>
          {c.next}
        </Button>
        <span className="muted small">{fill(c.score, score)}</span>
      </div>
      <Fretboard geometry={g} dots={dots} label={question} onDot={click} />
      <p className={solved ? 'caption good' : 'caption'} aria-live="polite">
        {message ?? ''}
      </p>
    </div>
  );
}
