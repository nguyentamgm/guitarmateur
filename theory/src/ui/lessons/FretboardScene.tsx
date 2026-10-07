/** The five scenes of "The neck is a grid". Every position comes from lessons/fretboard. */
import { useMemo, useState } from 'react';
import { STRINGS, midiAt, type StringNumber } from '../../core/fretboard';
import { format, type NoteName } from '../../core/music';
import { fill } from '../../i18n';
import {
  HOME_STRINGS,
  NECK_FRETS,
  OCTAVE_KEYS,
  isAnswer,
  naturalAt,
  naturalHomes,
  namesAt,
  octaveView,
  openStrings,
  quizQuestion,
  semitoneRun,
  tabExample,
  type QuizNotes,
  type QuizQuestion,
  type SceneCopy,
  type StepId,
} from '../../lessons/fretboard';
import { useTheory } from '../context';
import { posKey } from '../keys';
import { Button, ChipGroup } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { neckGeometry } from '../geometry';
import { Tab, type TabNote } from '../Tab';
import { useSequence } from '../useSequence';


export function FretboardScene({ step, copy }: { step: StepId; copy: SceneCopy }) {
  switch (step) {
    case 'strings':
      return <StringsScene copy={copy.strings} />;
    case 'semitones':
      return <SemitonesScene copy={copy.semitones} />;
    case 'tab':
      return <TabScene copy={copy.tab} />;
    case 'octaves':
      return <OctavesScene copy={copy.octaves} />;
    case 'home':
      return <HomeScene copy={copy.home} />;
  }
}

// --- Step 1 ---

function StringsScene({ copy }: { copy: SceneCopy['strings'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(4, { fretWidth: 60 }), []);
  const open = useMemo(() => openStrings(), []);
  const lowFirst = useMemo(() => [...open].reverse(), [open]);
  const [picked, setPicked] = useState<StringNumber | null>(null);
  const seq = useSequence(lowFirst.length, 650, (i) => {
    player.pluck(lowFirst[i]!.midi);
    setPicked(lowFirst[i]!.string);
  });

  const dots: FretDot[] = open.map((s) => ({
    key: posKey(s),
    string: s.string,
    fret: 0,
    midi: s.midi,
    label: String(s.string),
    tone: s.string === 1 ? 'home' : 'plain',
  }));
  const current = open.find((s) => s.string === picked);
  const caption = current ? fill(copy.caption, { n: current.string, name: current.name }) : copy.idle;

  return (
    <div className="board">
      <p className="note">{copy.note}</p>
      <div className="controls">
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.play}</Button>
      </div>
      <Fretboard
        geometry={g}
        dots={dots}
        label={copy.note}
        active={picked === null ? [] : [posKey({ string: picked, fret: 0 })]}
        onDot={(d) => setPicked(d.string)}
      />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 2 ---

function SemitonesScene({ copy }: { copy: SceneCopy['semitones'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(12, { fretWidth: 52 }), []);
  const [string, setString] = useState<StringNumber>(6);
  const run = useMemo(() => semitoneRun(string), [string]);
  const last = run.length - 1;
  const seq = useSequence(run.length, 380, (i) => {
    player.pluck(run[i]!.midi);
    if (i === last) player.pluck(run[0]!.midi, 0.4);
  });
  const reached = (i: number) => seq.current === null || i <= seq.current;

  const dots: FretDot[] = run.map((n, i) => ({
    key: posKey(n),
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: String(n.fret),
    tone: i === 0 || i === last ? 'home' : 'plain',
    dim: !reached(i),
  }));
  const on = seq.current;
  const active = on === null ? [] : on === last ? [posKey(run[0]!), posKey(run[last]!)] : [posKey(run[on]!)];
  const caption =
    on === null ? copy.idle : on === last ? copy.octave : fill(copy.step, { fret: run[on]!.fret });
  const choose = (s: StringNumber) => {
    seq.stop();
    setString(s);
  };
  const y = g.y(string);
  const dir = string <= 2 ? 1 : -1;

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<StringNumber>
          label={copy.string}
          items={STRINGS.map((s) => ({ value: s, text: s }))}
          value={string}
          onChange={choose}
        />
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.run}</Button>
      </div>
      <Fretboard geometry={g} dots={dots} label={copy.idle} active={active}>
        {on === last && (
          <path
            className="pair on"
            // Arc above the string, or below it on strings 1 and 2, which sit near the top edge.
            d={`M ${g.x(0)} ${y + 14 * dir} Q ${(g.x(0) + g.x(12)) / 2} ${y + 60 * dir} ${g.x(12)} ${y + 14 * dir}`}
          />
        )}
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 3 ---

function TabScene({ copy }: { copy: SceneCopy['tab'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(9, { fretWidth: 54 }), []);
  const columns = useMemo(
    () => tabExample().map((c) => c.notes.map((n): TabNote => ({ ...n, key: posKey(n) }))),
    [],
  );
  const [picked, setPicked] = useState<readonly TabNote[]>([]);
  const seq = useSequence(columns.length, 700, (i) => {
    for (const n of columns[i]!) player.pluck(n.midi);
    setPicked(columns[i]!);
  });

  const unique = new Map(columns.flat().map((n) => [n.key, n]));
  const active = picked.map((n) => n.key);
  const dots: FretDot[] = [...unique.values()].map((n) => ({
    ...n,
    label: String(n.fret),
    tone: active.includes(n.key) ? 'home' : 'plain',
  }));
  const describe = (notes: readonly TabNote[]): string => {
    if (notes.length === 0) return copy.idle;
    if (notes.length > 1) return fill(copy.together, { notes: notes.map((n) => `${n.string}/${n.fret}`).join(' + ') });
    const n = notes[0]!;
    return n.fret === 0 ? fill(copy.open, { string: n.string }) : fill(copy.single, { string: n.string, fret: n.fret });
  };
  const pick = (notes: readonly TabNote[]) => {
    seq.stop();
    setPicked(notes);
  };
  return (
    <div className="board">
      <div className="controls">
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.play}</Button>
      </div>
      <Tab columns={columns} label={copy.label} active={active} column={seq.current} onNote={(n) => pick([n])} />
      <Fretboard geometry={g} dots={dots} label={copy.idle} active={active} onDot={(d) => pick([unique.get(d.key)!])} />
      <p className="caption" aria-live="polite">
        {describe(picked)}
      </p>
    </div>
  );
}

// --- Step 4 ---

function OctavesScene({ copy }: { copy: SceneCopy['octaves'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(NECK_FRETS, { fretWidth: 50 }), []);
  const [tonic, setTonic] = useState<NoteName>(OCTAVE_KEYS[3]!);
  const view = useMemo(() => octaveView(tonic), [tonic]);
  const seq = useSequence(view.notes.length, 450, (i) => player.pluck(view.notes[i]!.midi));
  const reached = (i: number) => seq.current === null || i <= seq.current;

  const name = format(tonic);
  const dots: FretDot[] = view.notes.map((n, i) => ({
    key: posKey(n),
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: name,
    tone: 'home',
    dim: !reached(i),
  }));
  const choose = (k: string) => {
    seq.stop();
    const next = OCTAVE_KEYS.find((n) => format(n) === k)!;
    setTonic(next);
    player.pluck(midiAt({ string: 6, fret: octaveView(next).outer[0]! }));
  };
  const caption = fill(copy.caption, { note: name, count: view.notes.length });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<string>
          label={copy.picker}
          items={OCTAVE_KEYS.map((k) => ({ value: format(k), text: format(k) }))}
          value={name}
          onChange={choose}
        />
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.play}</Button>
      </div>
      <Fretboard
        geometry={g}
        dots={dots}
        label={caption}
        active={seq.current === null ? [] : [posKey(view.notes[seq.current]!)]}
      >
        {view.outer.map((f) => (
          <g key={`o${f}`} className="olink outer">
            <line x1={g.x(f)} x2={g.x(f)} y1={g.y(6)} y2={g.y(1)} />
            {/* Near the end of the neck the label goes left of the line so it is not cut off. */}
            <text
              x={f > g.frets - 3 ? g.x(f) - 14 : g.x(f) + 14}
              y={(g.y(3) + g.y(4)) / 2}
              style={{ textAnchor: f > g.frets - 3 ? 'end' : 'start' }}
            >
              {copy.twoOctaves}
            </text>
          </g>
        ))}
        {view.links.map((l) => {
          const x1 = g.x(l.from.fret);
          const y1 = g.y(l.from.string);
          const x2 = g.x(l.to.fret);
          const y2 = g.y(l.to.string);
          return (
            <g key={`${posKey(l.from)}>${posKey(l.to)}`} className={l.crossesB ? 'olink b' : 'olink'}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} />
              <text x={(x1 + x2) / 2 - 8} y={(y1 + y2) / 2 - 8}>{`+${l.shift}`}</text>
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

// --- Step 5 ---

type Feedback =
  | { readonly kind: 'right'; readonly fret: number }
  | { readonly kind: 'wrongString' }
  | { readonly kind: 'wrongFret'; readonly fret: number; readonly heard: string }
  | { readonly kind: 'between'; readonly fret: number };

function HomeScene({ copy }: { copy: SceneCopy['home'] }) {
  const { player, recordQuiz } = useTheory();
  const g = useMemo(() => neckGeometry(12, { fretWidth: 52 }), []);
  const [names, setNames] = useState<'show' | 'hide'>('show');
  const [pool, setPool] = useState<QuizNotes>('naturals');
  const [question, setQuestion] = useState<QuizQuestion>(() => quizQuestion(Math.random));
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [missed, setMissed] = useState(false);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [lit, setLit] = useState<string | null>(null);
  const solved = feedback?.kind === 'right';

  const dots: FretDot[] = HOME_STRINGS.flatMap((string) =>
    Array.from({ length: 13 }, (_, fret): FretDot => {
      const pos = { string, fret };
      const natural = naturalAt(pos);
      return {
        key: posKey(pos),
        string,
        fret,
        midi: midiAt(pos),
        label: names === 'show' && natural ? format(natural) : undefined,
        tone: solved && isAnswer(question, pos) ? 'home' : 'plain',
      };
    }),
  );

  const answer = (d: FretDot) => {
    setLit(d.key);
    if (solved) return;
    // A question counts once, on its first answer: right scores, a miss counts even if skipped.
    if (isAnswer(question, d)) {
      setFeedback({ kind: 'right', fret: d.fret });
      if (!missed) {
        setScore((s) => ({ right: s.right + 1, total: s.total + 1 }));
        recordQuiz('fretboard-root', true);
      }
      return;
    }
    if (!missed) {
      setScore((s) => ({ ...s, total: s.total + 1 }));
      recordQuiz('fretboard-root', false);
    }
    setMissed(true);
    const natural = naturalAt(d);
    if (d.string !== question.string) setFeedback({ kind: 'wrongString' });
    // With sharps and flats in play, a black-key fret is named too, both ways.
    else if (natural || pool === 'all') setFeedback({ kind: 'wrongFret', fret: d.fret, heard: namesAt(d) });
    else setFeedback({ kind: 'between', fret: d.fret });
  };
  const next = (notes: QuizNotes = pool, skip = true) => {
    // Skipping a question you never answered counts as a miss, as in every other quiz.
    if (skip && !solved && !missed) {
      setScore((s) => ({ ...s, total: s.total + 1 }));
      recordQuiz('fretboard-root', false);
    }
    setQuestion((q) => quizQuestion(Math.random, q, notes));
    setFeedback(null);
    setMissed(false);
    setLit(null);
  };
  const choosePool = (notes: QuizNotes) => {
    setPool(notes);
    next(notes, false);
  };
  const play = (string: 6 | 5, fret: number) => {
    const pos = { string, fret };
    player.pluck(midiAt(pos));
    setLit(posKey(pos));
  };

  const vars = { note: format(question.name), n: question.string };
  const result = (() => {
    switch (feedback?.kind) {
      case undefined:
        return '';
      case 'right':
        return fill(copy.right, { ...vars, fret: feedback.fret });
      case 'wrongString':
        return fill(copy.wrongString, vars);
      case 'wrongFret':
        return fill(copy.wrongFret, { fret: feedback.fret, heard: feedback.heard });
      case 'between':
        return fill(copy.between, { fret: feedback.fret });
    }
  })();

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<'show' | 'hide'>
          label={copy.names}
          items={[
            { value: 'show', text: copy.show },
            { value: 'hide', text: copy.hide },
          ]}
          value={names}
          onChange={setNames}
        />
        <ChipGroup<QuizNotes>
          label={copy.pool}
          items={[
            { value: 'naturals', text: copy.naturals },
            { value: 'all', text: copy.all },
          ]}
          value={pool}
          onChange={choosePool}
        />
      </div>
      {names === 'show' && (
        <div className="homemap" role="group" aria-label={copy.mapTitle}>
          {HOME_STRINGS.map((s) => (
            <div key={s} className="finder">
              <span className="muted small">{fill(copy.onString, { n: s })}</span>
              {naturalHomes(s).map((c) => (
                <button key={c.fret} type="button" onClick={() => play(s, c.fret)}>
                  <b>{format(c.name)}</b> {c.fret}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <div className="quiz">
        <span className="question">{fill(copy.question, vars)}</span>
        <Button onClick={() => next()} ghost>
          {copy.next}
        </Button>
        <span className="muted small">{fill(copy.score, score)}</span>
      </div>
      <Fretboard
        geometry={g}
        dots={dots}
        label={fill(copy.question, vars)}
        active={lit === null ? [] : [lit]}
        onDot={answer}
      />
      <p className={solved ? 'caption good' : 'caption'} aria-live="polite">
        {result}
      </p>
    </div>
  );
}
