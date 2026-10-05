/** The five scenes of "The major scale and interval shapes". Every position comes from lessons/major-scale. */
import { useMemo, useState } from 'react';
import { STRINGS, midiAt, type FretPos } from '../../core/fretboard';
import { format, interval, type DegreeLabel, type NoteName } from '../../core/music';
import { fill } from '../../i18n';
import {
  DEGREE_FRETS,
  FORMULA_FRETS,
  INTERVAL_FRETS,
  INTERVAL_ROOT,
  INTERVAL_TONIC,
  KEYS,
  SHAPES,
  SHAPE_FRETS,
  SHAPE_START,
  SPELLING_FRETS,
  alterLabel,
  degreeWindow,
  formulaRun,
  intervalTargets,
  labelsFor,
  readInterval,
  scaleNeck,
  spellingView,
  stamp,
  type IntervalTarget,
  type SceneCopy,
  type StepId,
} from '../../lessons/major-scale';
import { useTheory } from '../context';
import { Button, ChipGroup } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { neckGeometry } from '../geometry';
import { useSequence } from '../useSequence';

const posKey = (p: FretPos) => `${p.string}:${p.fret}`;
/** '+3', '−2', '0' (a real minus sign). */
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');
/** 'b3' → '♭3', '#4' → '♯4'. */
const degreeText = (d: DegreeLabel) => d.replace('b', '♭').replace('#', '♯');
const keyItems = KEYS.map((k) => ({ value: format(k), text: format(k) }));
const keyOf = (name: string): NoteName => KEYS.find((k) => format(k) === name)!;

type IntervalCopy = SceneCopy['interval'];

function nameOf(copy: IntervalCopy, label: DegreeLabel): string {
  const r = readInterval(INTERVAL_TONIC, label);
  return fill(copy.name, { quality: copy.qualities[r.quality], number: copy.numbers[r.number - 1]! });
}
const spanOf = (copy: IntervalCopy, n: number) => (n === 1 ? copy.spanOne : fill(copy.span, { n }));

export function MajorScaleScene({ step, copy }: { step: StepId; copy: SceneCopy }) {
  switch (step) {
    case 'formula':
      return <FormulaScene copy={copy.formula} />;
    case 'spelling':
      return <SpellingScene copy={copy.spelling} />;
    case 'intervals':
      return <IntervalsScene copy={copy.intervals} names={copy.interval} />;
    case 'shapes':
      return <ShapesScene copy={copy.shapes} names={copy.interval} />;
    case 'degrees':
      return <DegreesScene copy={copy.degrees} names={copy.interval} />;
  }
}

// --- Step 1 ---

function FormulaScene({ copy }: { copy: SceneCopy['formula'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(FORMULA_FRETS, { fretWidth: 40 }), []);
  const [key, setKey] = useState('C');
  const run = useMemo(() => formulaRun(keyOf(key)), [key]);
  const seq = useSequence(run.notes.length, 520, (i) => player.pluck(run.notes[i]!.midi));
  const reached = (i: number) => seq.current === null || i <= seq.current;

  const dots: FretDot[] = run.notes.map((n, i) => ({
    key: `F${i}`,
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: n.degree,
    tone: n.isTonic ? 'home' : 'plain',
    dim: !reached(i),
  }));
  const choose = (k: string) => {
    seq.stop();
    setKey(k);
  };
  const on = seq.current;
  const caption =
    on === null
      ? fill(copy.idle, { note: key, fret: run.notes[0]!.fret })
      : fill(copy.step, { n: run.notes[on]!.degree, note: run.notes[on]!.name });
  const y = g.y(5) - 12;

  return (
    <div className="board">
      <div className="formula" aria-hidden="true">
        {run.steps.map((s, i) => (
          <span key={i} className={s.half ? 'half' : ''}>{`+${s.size}`}</span>
        ))}
      </div>
      <div className="controls">
        <ChipGroup<string> label={copy.key} items={keyItems} value={key} onChange={choose} />
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.play}</Button>
      </div>
      <div className="legend">
        <span>
          <span className="swatch whole" />
          {copy.whole}
        </span>
        <span>
          <span className="swatch half" />
          {copy.half}
        </span>
      </div>
      <Fretboard geometry={g} dots={dots} label={caption} active={on === null ? [] : [`F${on}`]}>
        {run.steps.map((s, i) => {
          const x1 = g.x(run.notes[i]!.fret);
          const x2 = g.x(run.notes[i + 1]!.fret);
          return (
            <g key={i} className={['arc', s.half ? 'half' : '', reached(i + 1) ? '' : 'dim'].join(' ')}>
              <path d={`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y - 34} ${x2} ${y}`} />
              <text x={(x1 + x2) / 2} y={y - 22}>{`+${s.size}`}</text>
            </g>
          );
        })}
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 2 ---

function SpellingScene({ copy }: { copy: SceneCopy['spelling'] }) {
  const g = useMemo(() => neckGeometry(SPELLING_FRETS, { fretWidth: 52 }), []);
  const [key, setKey] = useState('F');
  const [misspell, setMisspell] = useState(false);
  const [names, setNames] = useState<'show' | 'hide'>('show');
  const tonic = keyOf(key);
  const view = useMemo(() => spellingView(tonic, misspell), [tonic, misspell]);
  const neck = useMemo(() => scaleNeck(tonic, SPELLING_FRETS), [tonic]);

  const dots: FretDot[] = neck.map((n) => ({
    key: posKey(n),
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: names === 'show' ? n.name : undefined,
    tone: n.isTonic ? 'home' : 'plain',
  }));
  const choose = (k: string) => {
    setKey(k);
    setMisspell(false);
  };
  const right = format(view.right);
  const wrong = format(view.wrong);
  const caption = misspell
    ? fill(copy.clash, { wrong, letter: view.wrong.letter, missing: view.right.letter, key, right })
    : fill(copy.right, { notes: view.notes.join(' ') });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<string> label={copy.key} items={keyItems} value={key} onChange={choose} />
      </div>
      <div className="controls">
        <ChipGroup<string>
          label={copy.fourth}
          items={[
            { value: 'right', text: right },
            { value: 'wrong', text: wrong },
          ]}
          value={misspell ? 'wrong' : 'right'}
          onChange={(v) => setMisspell(v === 'wrong')}
        />
        <ChipGroup<'show' | 'hide'>
          label={copy.names}
          items={[
            { value: 'show', text: copy.show },
            { value: 'hide', text: copy.hide },
          ]}
          value={names}
          onChange={setNames}
        />
      </div>
      <ol className="letters" aria-label={copy.letters}>
        {view.letters.map((c) => (
          <li key={c.letter} className={c.notes.length === 1 ? '' : c.notes.length > 1 ? 'twice' : 'empty'}>
            <b>{c.letter}</b>
            <span>{c.notes.join(' ')}</span>
          </li>
        ))}
      </ol>
      <p className={misspell ? 'caption warn' : 'caption'} aria-live="polite">
        {caption}
      </p>
      <Fretboard geometry={g} dots={dots} label={fill(copy.neck, { key })} />
    </div>
  );
}

// --- Step 3 ---

interface Picked {
  readonly target: IntervalTarget;
  /** One label, or two (#4 and b5) for 6 semitones clicked without context. */
  readonly labels: readonly DegreeLabel[];
}

function IntervalsScene({ copy, names }: { copy: SceneCopy['intervals']; names: IntervalCopy }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(INTERVAL_FRETS, { fretWidth: 64 }), []);
  const targets = useMemo(() => intervalTargets(), []);
  const [picked, setPicked] = useState<Picked | null>(null);
  const rootMidi = midiAt(INTERVAL_ROOT);
  const rootKey = posKey(INTERVAL_ROOT);

  const dots: FretDot[] = targets.map((t) => {
    const k = posKey(t);
    const isRoot = k === rootKey;
    return {
      key: k,
      string: t.string,
      fret: t.fret,
      midi: t.midi,
      label: isRoot ? format(INTERVAL_TONIC) : undefined,
      tone: isRoot ? 'home' : picked && posKey(picked.target) === k ? 'homeMajor' : 'plain',
    };
  });
  const pick = (d: FretDot) => {
    const target = targets.find((t) => posKey(t) === d.key)!;
    setPicked({ target, labels: labelsFor(target.semitones) });
  };
  const playPair = (p: Picked) => {
    player.pluck(rootMidi);
    player.pluck(p.target.midi, 0.6);
    player.pluck(rootMidi, 1.3);
    player.pluck(p.target.midi, 1.3);
  };
  const alter = (by: 1 | -1) => {
    if (!picked || picked.labels.length !== 1) return;
    const label = alterLabel(picked.labels[0]!, by);
    const fret = picked.target.fret + by;
    if (!label || fret < 0 || fret > INTERVAL_FRETS) return;
    const pos = { string: picked.target.string, fret };
    const next = { target: { ...pos, midi: midiAt(pos), semitones: picked.target.semitones + by }, labels: [label] };
    setPicked(next);
    player.pluck(next.target.midi);
  };

  const readings = picked?.labels.map((l) => readInterval(INTERVAL_TONIC, l)) ?? [];
  const caption = picked
    ? fill(copy.reading, {
        from: format(INTERVAL_TONIC),
        to: readings.map((r) => format(r.note)).join(' / '),
        name: picked.labels.map((l) => nameOf(names, l)).join(` ${copy.or} `),
        span: spanOf(names, picked.target.semitones),
      })
    : copy.idle;
  const canAlter = (by: 1 | -1) => {
    if (!picked || picked.labels.length !== 1) return false;
    const f = picked.target.fret + by;
    return alterLabel(picked.labels[0]!, by) !== null && f >= 0 && f <= INTERVAL_FRETS;
  };
  const band = picked && posKey(picked.target) !== rootKey ? picked.target : null;

  return (
    <div className="board">
      <div className="controls">
        <span className="muted small">{fill(copy.home, { note: format(INTERVAL_TONIC) })}</span>
        {picked && <Button onClick={() => playPair(picked)}>{copy.play}</Button>}
        {canAlter(-1) && (
          <Button ghost onClick={() => alter(-1)}>
            {copy.lower}
          </Button>
        )}
        {canAlter(1) && (
          <Button ghost onClick={() => alter(1)}>
            {copy.raise}
          </Button>
        )}
      </div>
      <Fretboard geometry={g} dots={dots} label={caption} active={band ? [posKey(band)] : []} onDot={pick}>
        {band && (
          <g className="band">
            <line x1={g.x(INTERVAL_ROOT.fret)} y1={g.y(INTERVAL_ROOT.string)} x2={g.x(band.fret)} y2={g.y(band.string)} />
          </g>
        )}
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 4 ---

function ShapesScene({ copy, names }: { copy: SceneCopy['shapes']; names: IntervalCopy }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(SHAPE_FRETS, { fretWidth: 52 }), []);
  const [label, setLabel] = useState<DegreeLabel>('3');
  const [root, setRoot] = useState<FretPos>(SHAPE_START);
  const shape = SHAPES.find((s) => s.label === label)!;
  const st = stamp(root, shape);
  const rootKey = posKey(root);
  const toKey = st ? posKey(st.to) : null;

  const dots: FretDot[] = STRINGS.flatMap((string) =>
    Array.from({ length: SHAPE_FRETS + 1 }, (_, fret): FretDot => {
      const k = posKey({ string, fret });
      const isRoot = k === rootKey;
      const isTo = k === toKey;
      return {
        key: k,
        string,
        fret,
        midi: midiAt({ string, fret }),
        label: isRoot ? '1' : isTo ? degreeText(label) : undefined,
        tone: isRoot ? 'home' : isTo ? 'homeMajor' : 'plain',
        faint: !isRoot && !isTo,
      };
    }),
  );
  const play = (from: FretPos, to: FretPos | null) => {
    player.pluck(midiAt(from));
    if (to) {
      player.pluck(midiAt(to), 0.5);
      player.pluck(midiAt(from), 1.1);
      player.pluck(midiAt(to), 1.1);
    }
  };
  const move = (d: FretDot) => {
    const from = { string: d.string, fret: d.fret };
    setRoot(from);
    const next = stamp(from, shape);
    if (next) player.pluck(midiAt(next.to), 0.5);
  };
  const choose = (l: DegreeLabel) => {
    setLabel(l);
    const next = stamp(root, SHAPES.find((s) => s.label === l)!);
    if (next) play(root, next.to);
  };
  const caption = st
    ? fill(copy.caption, {
        name: nameOf(names, label),
        from: `${st.from.string}/${st.from.fret}`,
        to: `${st.to.string}/${st.to.fret}`,
        up: shape.stringsUp === 1 ? copy.up1 : copy.up2,
        offset: signed(st.offset),
      })
    : copy.offNeck;

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<DegreeLabel>
          label={copy.interval}
          items={SHAPES.map((s) => ({ value: s.label, text: degreeText(s.label) }))}
          value={label}
          onChange={choose}
        />
        <Button onClick={() => play(root, st?.to ?? null)}>{copy.play}</Button>
      </div>
      <Fretboard geometry={g} dots={dots} label={copy.idle} active={toKey ? [rootKey, toKey] : [rootKey]} onDot={move}>
        {st && (
          <g className={st.crossesB ? 'olink b' : 'olink'}>
            <line x1={g.x(st.from.fret)} y1={g.y(st.from.string)} x2={g.x(st.to.fret)} y2={g.y(st.to.string)} />
            <text x={(g.x(st.from.fret) + g.x(st.to.fret)) / 2 + 16} y={(g.y(st.from.string) + g.y(st.to.string)) / 2}>
              {signed(st.offset)}
            </text>
          </g>
        )}
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
      <p className="caption">{st?.crossesB ? copy.crossesB : copy.idle}</p>
    </div>
  );
}

// --- Step 5 ---

function DegreesScene({ copy, names }: { copy: SceneCopy['degrees']; names: IntervalCopy }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(DEGREE_FRETS, { fretWidth: 50 }), []);
  const [key, setKey] = useState('C');
  const [labels, setLabels] = useState<'degrees' | 'notes'>('degrees');
  const [heard, setHeard] = useState<DegreeLabel | null>(null);
  const tonic = keyOf(key);
  const win = useMemo(() => degreeWindow(tonic), [tonic]);
  const homeMidi = midiAt(win.home);

  const dots: FretDot[] = win.notes.map((n) => ({
    key: posKey(n),
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: labels === 'degrees' ? n.degree : n.name,
    tone: n.isTonic ? 'home' : 'plain',
  }));
  // The lowest copy of each degree at or above home: one octave of the scale.
  const above = (d: DegreeLabel) => win.notes.find((n) => n.degree === d && n.midi >= homeMidi)!;
  const hear = (d: DegreeLabel) => {
    player.pluck(homeMidi);
    player.pluck(above(d).midi, 0.6);
    setHeard(d);
  };
  const choose = (k: string) => {
    setKey(k);
    setHeard(null);
  };
  const degrees = ['1', '2', '3', '4', '5', '6', '7'];
  const caption = heard
    ? fill(copy.heard, {
        n: heard,
        note: above(heard).name,
        name: nameOf(names, heard),
        span: spanOf(names, interval(heard).semitones),
      })
    : fill(copy.idle, { key, fret: win.home.fret });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<string> label={copy.key} items={keyItems} value={key} onChange={choose} />
      </div>
      <div className="controls">
        <ChipGroup<string>
          label={copy.degree}
          items={degrees.map((d) => ({ value: d, text: d }))}
          value={heard ?? ''}
          onChange={hear}
        />
        <ChipGroup<'degrees' | 'notes'>
          label={copy.labels}
          items={[
            { value: 'degrees', text: copy.degrees },
            { value: 'notes', text: copy.notes },
          ]}
          value={labels}
          onChange={setLabels}
        />
      </div>
      <Fretboard
        geometry={g}
        dots={dots}
        label={caption}
        box={win}
        active={heard ? [posKey(win.home), posKey(above(heard))] : []}
      />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}
