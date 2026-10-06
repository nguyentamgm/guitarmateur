/** The five scenes of "Barre chords". Every voicing comes from lessons/barre. */
import { useMemo, useState } from 'react';
import { midiAt, type BarreShape } from '../../core/fretboard';
import { chordSymbol, format, type ChordId, type NoteName } from '../../core/music';
import { strumDelays } from '../../core/rhythm';
import { fill } from '../../i18n';
import {
  BARRE_FRETS,
  PROGRESSION_KEYS,
  PROGRESSION_TONIC,
  ROOTS,
  VARIANTS,
  barreView,
  chordPath,
  findQuestion,
  judgeFind,
  movedStrings,
  progressionChords,
  slideView,
  travel,
  type BarreView,
  type FindQuestion,
  type FindResult,
  type PathMode,
  type SceneCopy,
  type StepId,
} from '../../lessons/barre';
import { BarreBar } from '../BarreBar';
import { useTheory } from '../context';
import { Button, ChipGroup, KeyFinder } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { neckGeometry, type NeckGeometry } from '../geometry';
import { degreeText, posKey } from '../keys';
import { useSequence } from '../useSequence';

export function BarreScene({ step, copy }: { step: StepId; copy: SceneCopy }) {
  switch (step) {
    case 'slide':
      return <SlideScene copy={copy} />;
    case 'eShape':
      return <ShapeScene copy={copy} shape="E" defaultRoot="G" />;
    case 'aShape':
      return <ShapeScene copy={copy} shape="A" defaultRoot="C" />;
    case 'find':
      return <FindScene copy={copy} />;
    case 'changes':
      return <ChangesScene copy={copy} />;
  }
}

type Labels = 'degrees' | 'notes';

function useStrum() {
  const { player } = useTheory();
  return (view: BarreView, delay = 0) => {
    for (const s of strumDelays(view.notes, 'down', 0.018)) player.pluck(s.item.midi, delay + s.delay, 1.5);
  };
}

const chordDots = (view: BarreView, labels: Labels, extra: Partial<FretDot> = {}): FretDot[] =>
  view.notes.map((n) => ({
    key: posKey(n),
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: labels === 'degrees' ? degreeText(n.degree) : n.name,
    tone: n.degree === '1' ? 'home' : 'plain',
    ...extra,
  }));

function MutedMarks({ g, view }: { g: NeckGeometry; view: BarreView }) {
  return (
    <>
      {view.muted.map((s) => (
        <line key={s} className="mutedline" x1={g.x(view.fret) - 8} x2={g.x(view.fret) + 8} y1={g.y(s)} y2={g.y(s)} />
      ))}
    </>
  );
}

const rootItems = ROOTS.map((r) => ({ value: format(r), text: format(r) }));
const rootOf = (name: string): NoteName => ROOTS.find((r) => format(r) === name)!;
const kindOf = (copy: SceneCopy, id: ChordId) => copy.kinds[id as keyof SceneCopy['kinds']];

// --- Step 1 ---

function SlideScene({ copy }: { copy: SceneCopy }) {
  const strum = useStrum();
  const g = useMemo(() => neckGeometry(BARRE_FRETS, { fretWidth: 46 }), []);
  const [fret, setFret] = useState(1);
  const view = useMemo(() => slideView(fret), [fret]);
  const caption = fret === 0 ? fill(copy.slide.open, { symbol: view.symbol }) : fill(copy.slide.caption, { symbol: view.symbol, fret });

  return (
    <div className="board">
      <div className="controls">
        <label className="tempo">
          <span>{copy.slide.fret}</span>
          <input type="range" min={0} max={12} step={1} value={fret} onChange={(e) => setFret(Number(e.target.value))} />
          <output>{fret}</output>
        </label>
        <Button onClick={() => strum(view)}>{copy.strum}</Button>
      </div>
      <p className="power-symbol" aria-hidden="true">
        {view.symbol}
      </p>
      <Fretboard geometry={g} dots={chordDots(view, 'degrees')} label={caption}>
        <BarreBar g={g} view={view} />
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Steps 2 and 3 ---

function ShapeScene({ copy, shape, defaultRoot }: { copy: SceneCopy; shape: BarreShape; defaultRoot: string }) {
  const strum = useStrum();
  const g = useMemo(() => neckGeometry(BARRE_FRETS, { fretWidth: 46 }), []);
  const [root, setRoot] = useState(defaultRoot);
  const [id, setId] = useState<ChordId>('major');
  const [labels, setLabels] = useState<Labels>('degrees');
  const view = useMemo(() => barreView({ root: rootOf(root), id }, shape)!, [root, id, shape]);
  const base = useMemo(() => barreView({ root: rootOf(root), id: 'major' }, shape)!, [root, shape]);
  const moved = movedStrings(base, view).map((s) => degreeText(view.notes.find((n) => n.string === s)!.degree));

  const pick = (next: ChordId) => {
    setId(next);
    strum(barreView({ root: rootOf(root), id: next }, shape)!);
  };
  const caption = fill(copy.shape.caption, {
    symbol: view.symbol,
    shape,
    fret: view.fret,
    degrees: view.notes.map((n) => degreeText(n.degree)).join(' '),
  });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<string> label={copy.root} items={rootItems} value={root} onChange={setRoot} />
      </div>
      <div className="controls">
        <ChipGroup<ChordId> label={copy.shape.variant} items={VARIANTS.map((v) => ({ value: v, text: kindOf(copy, v) }))} value={id} onChange={pick} />
        <ChipGroup<Labels>
          label={copy.labels}
          items={[
            { value: 'degrees', text: copy.degrees },
            { value: 'notes', text: copy.notes },
          ]}
          value={labels}
          onChange={setLabels}
        />
        <Button onClick={() => strum(view)}>{copy.strum}</Button>
      </div>
      <p className="power-symbol" aria-hidden="true">
        {view.symbol}
      </p>
      <Fretboard geometry={g} dots={chordDots(view, labels, {})} label={caption} active={movedStrings(base, view).map((s) => posKey(view.notes.find((n) => n.string === s)!))}>
        <BarreBar g={g} view={view} />
        <MutedMarks g={g} view={view} />
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
        {moved.length > 0 && ` ${fill(copy.shape.moved, { base: base.symbol, moved: moved.join(', ') })}`}
      </p>
    </div>
  );
}

// --- Step 4 ---

function FindScene({ copy }: { copy: SceneCopy }) {
  const c = copy.find;
  const strum = useStrum();
  const g = useMemo(() => neckGeometry(BARRE_FRETS, { fretWidth: 46 }), []);
  const [q, setQ] = useState<FindQuestion>(() => findQuestion(Math.random));
  const [result, setResult] = useState<FindResult | null>(null);
  const [missed, setMissed] = useState(false);
  const [score, setScore] = useState({ right: 0, total: 0, streak: 0 });
  const symbol = chordSymbol({ root: q.root, id: q.id });
  const solved = result?.kind === 'right';

  const places: FretDot[] = ([6, 5] as const).flatMap((string) =>
    Array.from({ length: BARRE_FRETS - 2 }, (_, fret): FretDot => ({
      key: posKey({ string, fret }),
      string,
      fret,
      midi: midiAt({ string, fret }),
      faint: true,
    })),
  );
  const shown = solved ? chordDots(result.view, 'degrees') : [];
  const taken = new Set(shown.map((d) => d.key));
  const dots = [...places.filter((d) => !taken.has(d.key)), ...shown];

  const click = (d: FretDot) => {
    if (solved) return;
    const r = judgeFind(q, d);
    setResult(r);
    if (r.kind === 'right') {
      strum(r.view);
      setScore((s) => ({ right: s.right + (missed ? 0 : 1), total: s.total + 1, streak: missed ? 0 : s.streak + 1 }));
    } else {
      setMissed(true);
    }
  };
  const next = () => {
    if (!solved) setScore((s) => ({ ...s, total: s.total + 1, streak: 0 }));
    setQ((prev) => findQuestion(Math.random, prev));
    setResult(null);
    setMissed(false);
  };
  const message = (() => {
    switch (result?.kind) {
      case undefined:
        return '';
      case 'right':
        return fill(c.right, { symbol, shape: result.view.shape, fret: result.view.fret, otherShape: result.other.shape, otherFret: result.other.fret });
      case 'wrongString':
        return c.wrongString;
      case 'wrongNote':
        return fill(c.wrongNote, { heard: result.heard, root: format(q.root) });
    }
  })();
  const question = fill(c.question, { symbol });

  return (
    <div className="board">
      <div className="quiz">
        <span className="question">{question}</span>
        <Button onClick={next} ghost>
          {c.next}
        </Button>
        <span className="muted small">{fill(c.score, score)}</span>
      </div>
      <Fretboard geometry={g} dots={dots} label={question} onDot={click}>
        {solved && <BarreBar g={g} view={result.other} faint />}
        {solved && <BarreBar g={g} view={result.view} />}
      </Fretboard>
      <p className={solved ? 'caption good' : 'caption'} aria-live="polite">
        {message}
      </p>
    </div>
  );
}

// --- Step 5 ---

function ChangesScene({ copy }: { copy: SceneCopy }) {
  const c = copy.changes;
  const strum = useStrum();
  const g = useMemo(() => neckGeometry(BARRE_FRETS, { fretWidth: 46 }), []);
  const [tonic, setTonic] = useState<NoteName>(PROGRESSION_TONIC);
  const [mode, setMode] = useState<PathMode>('near');
  const path = useMemo(() => chordPath(progressionChords(tonic), mode), [tonic, mode]);
  const seq = useSequence(path.length, 1500, (i) => strum(path[i]!), true);
  const now = path[seq.current ?? 0]!;
  const caption = fill(c.caption, { chords: path.map((v) => v.symbol).join(' → '), travel: travel(path) });

  return (
    <div className="board">
      <KeyFinder keys={PROGRESSION_KEYS} label={c.key} value={tonic} onChange={(k) => setTonic(k)} />
      <div className="controls">
        <ChipGroup<PathMode>
          label={c.path}
          items={[
            { value: 'near', text: c.near },
            { value: 'string6', text: c.string6 },
          ]}
          value={mode}
          onChange={setMode}
        />
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : c.play}</Button>
      </div>
      <ol className="chordpath">
        {path.map((v, i) => (
          <li key={i} className={seq.current === i ? 'on' : undefined}>
            {fill(c.chordItem, { symbol: v.symbol, shape: v.shape, fret: v.fret })}
          </li>
        ))}
      </ol>
      <Fretboard geometry={g} dots={chordDots(now, 'degrees')} label={caption}>
        {path.map((v, i) => (
          <BarreBar key={i} g={g} view={v} faint={v !== now} />
        ))}
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}
