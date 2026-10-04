/** The five scenes of the Pentatonic Map. Every position comes from lessons/pentatonic-map. */
import { useMemo, useRef, useState } from 'react';
import { homeFret, midiAt, type FretPos } from '../../core/fretboard';
import { format, sameNote, type NoteName } from '../../core/music';
import { fill } from '../../i18n';
import {
  EXAMPLE_TONIC,
  FINDER_KEYS,
  NECK_FRETS,
  boxes,
  formulaStrip,
  homeView,
  keyView,
  scaleNeck,
  slide,
  stringPairs,
  upAndDown,
  type HomeMode,
  type SceneCopy,
  type StepId,
} from '../../lessons/pentatonic-map';
import { useTheory } from '../context';
import { Button, ChipGroup } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { neckGeometry, stringName } from '../geometry';
import { useSequence } from '../useSequence';

const posKey = (p: FretPos) => `${p.string}:${p.fret}`;
const homeMidi = (tonic: NoteName) => midiAt({ string: 6, fret: homeFret(tonic, 6) });
/** '+3', '−2', '0' (a real minus sign). */
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');

export function PentatonicMapScene({ step, copy }: { step: StepId; copy: SceneCopy }) {
  switch (step) {
    case 'grid':
      return <GridScene copy={copy.grid} />;
    case 'formula':
      return <FormulaScene copy={copy.formula} />;
    case 'boxes':
      return <BoxesScene copy={copy.boxes} />;
    case 'keys':
      return <KeysScene copy={copy.keys} />;
    case 'home':
      return <HomeScene copy={copy.home} />;
  }
}

// --- Step 1 ---

function GridScene({ copy }: { copy: SceneCopy['grid'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(6, { fretWidth: 64 }), []);
  const pairs = useMemo(() => stringPairs(), []);
  const seq = useSequence(pairs.length, 1100, (i) => {
    const p = pairs[i]!;
    player.pluck(midiAt(p.low));
    player.pluck(midiAt(p.high), 0.45);
  });

  const dots: FretDot[] = pairs.flatMap((p, i) => [
    { key: `L${i}`, ...p.low, midi: midiAt(p.low), label: String(p.low.fret) },
    { key: `H${i}`, ...p.high, midi: midiAt(p.high), label: '0' },
  ]);
  const on = seq.current;
  const current = on === null ? null : pairs[on]!;
  const caption = current
    ? fill(current.odd ? copy.oddPair : copy.pair, {
        low: stringName(current.low.string),
        fret: current.low.fret,
        high: stringName(current.high.string),
      })
    : copy.idle;

  return (
    <div className="board">
      <div className="controls">
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.run}</Button>
      </div>
      <Fretboard geometry={g} dots={dots} label={copy.idle} active={on === null ? [] : [`L${on}`, `H${on}`]}>
        {pairs.map((p, i) => (
          <path
            key={i}
            className={['pair', p.odd ? 'odd' : '', on === i ? 'on' : '', on !== null && on !== i ? 'faded' : ''].join(' ')}
            d={`M ${g.x(p.low.fret)} ${g.y(p.low.string)} L ${g.x(0)} ${g.y(p.high.string)}`}
          />
        ))}
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 2 ---

function FormulaScene({ copy }: { copy: SceneCopy['formula'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(17, { fretWidth: 46 }), []);
  const strip = useMemo(() => formulaStrip(), []);
  const seq = useSequence(strip.notes.length, 520, (i) => player.pluck(strip.notes[i]!.midi));
  const reached = (i: number) => seq.current === null || i <= seq.current;

  const dots: FretDot[] = strip.notes.map((n, i) => ({
    key: `F${i}`,
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: n.degree,
    tone: n.isTonic ? 'home' : 'plain',
    dim: !reached(i),
  }));
  const y = g.y(6) - 12;

  return (
    <div className="board">
      <div className="formula" aria-hidden="true">
        <span className="h">{copy.home}</span>
        {strip.steps.map((s, i) => (
          <span key={i} className={i === strip.steps.length - 1 ? 'last' : ''}>
            {`+${s}`}
          </span>
        ))}
        <span className="h">{copy.home}</span>
      </div>
      <div className="controls">
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.run}</Button>
        <span className="muted small">{copy.example}</span>
      </div>
      <Fretboard geometry={g} dots={dots} label={copy.example} active={seq.current === null ? [] : [`F${seq.current}`]}>
        {strip.steps.map((s, i) => {
          const x1 = g.x(strip.notes[i]!.fret);
          const x2 = g.x(strip.notes[i + 1]!.fret);
          return (
            <g key={i} className={reached(i + 1) ? 'arc' : 'arc dim'}>
              <path d={`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y - 40} ${x2} ${y}`} />
              <text x={(x1 + x2) / 2} y={y - 26}>{`+${s}`}</text>
            </g>
          );
        })}
      </Fretboard>
    </div>
  );
}

// --- Step 3 ---

function BoxesScene({ copy }: { copy: SceneCopy['boxes'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(NECK_FRETS, { fretWidth: 50 }), []);
  const all = useMemo(() => boxes(), []);
  const neck = useMemo(() => scaleNeck(EXAMPLE_TONIC), []);
  const [index, setIndex] = useState(1);
  const [labels, setLabels] = useState<'degrees' | 'notes'>('degrees');
  const box = all[index - 1]!;
  const order = useMemo(() => upAndDown(box.notes), [box]);
  const seq = useSequence(order.length, 240, (i) => player.pluck(order[i]!.midi));
  const members = new Set(box.notes.map(posKey));

  const dots: FretDot[] = neck.map((n) => ({
    key: posKey(n),
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: labels === 'degrees' ? n.degree : n.name,
    tone: n.isTonic ? 'home' : 'plain',
    dim: !members.has(posKey(n)),
  }));
  const choose = (i: number) => {
    seq.stop();
    setIndex(i);
  };
  const caption = fill(copy.caption, { n: index, min: box.minFret, max: box.maxFret });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup label={copy.box} items={all.map((b) => ({ value: b.index, text: b.index }))} value={index} onChange={choose} />
        <ChipGroup<'degrees' | 'notes'>
          label={copy.labels}
          items={[
            { value: 'degrees', text: copy.degrees },
            { value: 'notes', text: copy.notes },
          ]}
          value={labels}
          onChange={setLabels}
        />
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.play}</Button>
      </div>
      <Fretboard
        geometry={g}
        dots={dots}
        label={caption}
        box={box}
        active={seq.current === null ? [] : [posKey(order[seq.current]!)]}
      />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 4 ---

function KeysScene({ copy }: { copy: SceneCopy['keys'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(NECK_FRETS, { fretWidth: 50 }), []);
  const [tonic, setTonic] = useState<NoteName>(EXAMPLE_TONIC);
  const [shift, setShift] = useState<number | null>(null);
  const view = useMemo(() => keyView(tonic), [tonic]);
  const startAt = useRef(0);

  const select = (next: NoteName) => {
    setShift(slide(tonic, next));
    setTonic(next);
    player.pluck(homeMidi(next));
  };
  const seq = useSequence(
    FINDER_KEYS.length,
    1800,
    (i) => select(FINDER_KEYS[(startAt.current + i + 1) % FINDER_KEYS.length]!),
    true,
  );
  const cycle = () => {
    startAt.current = FINDER_KEYS.findIndex((k) => sameNote(k, tonic));
    seq.toggle();
  };
  const pick = (k: NoteName) => {
    seq.stop();
    select(k);
  };

  const members = new Set(view.box1.notes.map(posKey));
  const dots: FretDot[] = view.notes.map((n) => ({
    key: posKey(n),
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: n.name,
    tone: n.isTonic ? 'home' : 'plain',
    dim: !members.has(posKey(n)),
  }));
  const vars = { key: format(tonic), fret: view.homeFret, shift: signed(shift ?? 0) };
  const caption = fill(shift === null ? copy.caption : copy.moved, vars);

  return (
    <div className="board">
      <div className="finder" role="group" aria-label={copy.finder}>
        {FINDER_KEYS.map((k) => (
          <button key={format(k)} type="button" aria-pressed={sameNote(k, tonic)} onClick={() => pick(k)}>
            <b>{format(k)}</b> {homeFret(k)}
          </button>
        ))}
      </div>
      <div className="controls">
        <Button onClick={cycle} ghost>
          {seq.playing ? copy.stop : copy.cycle}
        </Button>
      </div>
      <Fretboard geometry={g} dots={dots} label={caption} box={view.box1} />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 5 ---

function HomeScene({ copy }: { copy: SceneCopy['home'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(NECK_FRETS, { fretWidth: 50 }), []);
  const [mode, setMode] = useState<HomeMode>('minor');
  const view = useMemo(() => homeView(mode), [mode]);
  const choose = (m: HomeMode) => {
    setMode(m);
    player.pluck(homeMidi(homeView(m).home));
  };

  const dots: FretDot[] = view.notes.map((n) => ({
    key: posKey(n),
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: n.degree,
    tone: n.isTonic ? (mode === 'minor' ? 'home' : 'homeMajor') : 'plain',
  }));
  const caption = fill(copy.caption, { home: format(view.home), fret: homeFret(view.home, 6) });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<HomeMode>
          label={copy.switch}
          items={[
            { value: 'minor', text: copy.minor },
            { value: 'major', text: copy.major },
          ]}
          value={mode}
          onChange={choose}
        />
      </div>
      <div className="legend">
        <span>
          <i className="swatch home" />
          {copy.legendMinor}
        </span>
        <span>
          <i className="swatch homeMajor" />
          {copy.legendMajor}
        </span>
        <span>
          <i className="swatch plain" />
          {copy.legendOther}
        </span>
      </div>
      <Fretboard geometry={g} dots={dots} label={caption} />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}
