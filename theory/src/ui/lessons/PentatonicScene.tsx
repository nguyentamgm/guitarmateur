/** The five scenes of "Pentatonic, the whole neck". Every position comes from lessons/pentatonic. */
import { useMemo, useRef, useState } from 'react';
import { bassMidi, chordMidis } from '../../core/audio';
import { SEQUENCE_IDS, homeFret, midiAt, type Direction, type SequenceId } from '../../core/fretboard';
import { format, sameNote, type NoteName } from '../../core/music';
import { beatSeconds, cellSeconds, clampBpm, strumDelays } from '../../core/rhythm';
import { fill } from '../../i18n';
import {
  DRILL_BPM,
  EXAMPLE_TONIC,
  MAJOR_KEYS,
  NECK_FRETS,
  PAIR_FRETS,
  SPEED_STEP,
  VAMP_BPM,
  VAMP_CELLS,
  boxPair,
  boxes,
  crossRun,
  drillRun,
  inBox,
  judge,
  majorView,
  namesAt,
  quizQuestion,
  quizView,
  scaleNeck,
  shapeTonic,
  songChord,
  songChordSymbol,
  upAndDown,
  type Box,
  type NeckNote,
  type QuizQuestion,
  type SceneCopy,
  type StepId,
  type Verdict,
} from '../../lessons/pentatonic';
import { useTheory } from '../context';
import { Button, ChipGroup, Tempo } from '../controls';
import { Fretboard, type DotTone, type FretDot } from '../Fretboard';
import { boxSpan, neckGeometry, type NeckGeometry } from '../geometry';
import { degreeText, posKey } from '../keys';
import { Tab, type TabNote } from '../Tab';
import { useClock } from '../useClock';
import { useStoredTempo } from '../useStoredTempo';
import { useSequence } from '../useSequence';

export function PentatonicScene({ step, copy }: { step: StepId; copy: SceneCopy }) {
  switch (step) {
    case 'boxes':
      return <BoxesScene copy={copy.boxes} />;
    case 'connect':
      return <ConnectScene copy={copy.connect} />;
    case 'sequences':
      return <SequencesScene copy={copy.sequences} />;
    case 'major':
      return <MajorScene copy={copy.major} />;
    case 'choose':
      return <ChooseScene copy={copy.choose} />;
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

/** An outline frame with its box number in the top-left corner, for boxes that are not selected. */
function Frame({ g, box, on = false }: { g: NeckGeometry; box: Pick<Box, 'index' | 'minFret' | 'maxFret'>; on?: boolean }) {
  const { left, right } = boxSpan(g, box.minFret, box.maxFret);
  return (
    <g className={on ? 'boxghost on' : 'boxghost'}>
      <rect x={left + 2} y={g.top - 12} width={right - left - 4} height={5 * g.stringGap + 24} rx={7} />
      <text x={left + 5} y={g.top - 5}>
        {box.index}
      </text>
    </g>
  );
}

// --- Step 1 ---

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

  const dots = neck.map((n) =>
    dotOf(n, labels === 'degrees' ? degreeText(n.degree) : n.name, n.isTonic ? 'home' : 'plain', !members.has(posKey(n))),
  );
  const choose = (i: number) => {
    seq.stop();
    setIndex(i);
  };
  const caption = fill(copy.caption, { n: index, min: box.minFret, max: box.maxFret });
  // Where the B-string pair would sit if G→B were tuned like the other strings: one fret left.
  const bNotes = box.notes.filter((n) => n.string === 2);

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
      <div className="legend">
        <span>
          <i className="swatch kinkghost" />
          {copy.kink}
        </span>
      </div>
      <Fretboard
        geometry={g}
        dots={dots}
        label={caption}
        box={box}
        active={seq.current === null ? [] : [posKey(order[seq.current]!)]}
      >
        {all.map((b) => (
          <Frame key={b.index} g={g} box={b} on={b.index === index} />
        ))}
        <g className="kink">
          {bNotes.map((n) => (
            <g key={n.fret}>
              <circle cx={g.x(n.fret - 1)} cy={g.y(2)} r={10} />
              <line x1={g.x(n.fret - 1) + 10} x2={g.x(n.fret) - 13} y1={g.y(2)} y2={g.y(2)} />
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

function ConnectScene({ copy }: { copy: SceneCopy['connect'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(PAIR_FRETS, { fretWidth: 46 }), []);
  const [k, setK] = useState(1);
  const pair = useMemo(() => boxPair(k), [k]);
  const run = useMemo(() => crossRun(pair), [pair]);
  const seq = useSequence(run.length, 220, (i) => player.pluck(run[i]!.midi));

  const seen = new Set<string>();
  const dots = [...pair.from.notes, ...pair.to.notes]
    .filter((n) => !seen.has(posKey(n)) && seen.add(posKey(n)))
    .map((n) => dotOf(n, degreeText(n.degree), n.isTonic ? 'home' : 'plain'));
  const choose = (next: number) => {
    seq.stop();
    setK(next);
  };
  const vars = { from: pair.from.index, to: pair.to.index, count: pair.shared.length };
  const caption = fill(seq.playing ? copy.playing : copy.caption, vars);

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup
          label={copy.pair}
          items={[1, 2, 3, 4, 5].map((i) => ({ value: i, text: fill(copy.pairItem, { from: i, to: (i % 5) + 1 }) }))}
          value={k}
          onChange={choose}
        />
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.cross}</Button>
      </div>
      <Fretboard
        geometry={g}
        dots={dots}
        label={fill(copy.caption, vars)}
        box={pair.from}
        active={seq.current === null ? [] : [posKey(run[seq.current]!)]}
      >
        <Frame g={g} box={pair.from} on />
        <Frame g={g} box={pair.to} on />
        {pair.shared.map((n) => (
          <circle key={posKey(n)} className="shared" cx={g.x(n.fret)} cy={g.y(n.string)} r={15} />
        ))}
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 3 ---

function SequencesScene({ copy }: { copy: SceneCopy['sequences'] }) {
  const { player, ui } = useTheory();
  const g = useMemo(() => neckGeometry(NECK_FRETS, { fretWidth: 50 }), []);
  const all = useMemo(() => boxes(), []);
  const [index, setIndex] = useState(1);
  const [pattern, setPattern] = useState<SequenceId>('threes');
  const [direction, setDirection] = useState<Direction>('up');
  const [speedUp, setSpeedUp] = useState(false);
  const { bpm, setBpm, best, step } = useStoredTempo('pentatonic-sequences', DRILL_BPM);
  const [round, setRound] = useState(0);
  const rounds = useRef(0);
  const box = all[index - 1]!;
  const drill = useMemo(() => drillRun(box, pattern, direction), [box, pattern, direction]);
  const cell = cellSeconds(bpm, 2);
  const clock = useClock(drill.length, cell, (i, delay) => {
    step(i, drill.length);
    if (i === 0) {
      if (rounds.current > 0 && speedUp) setBpm((b) => clampBpm(b + SPEED_STEP));
      rounds.current += 1;
      setRound(rounds.current);
    }
    if (i % 2 === 0) player.click(i % 8 === 0, delay);
    player.pluck(drill[i]!.midi, delay, cell * 0.9);
  });
  const toggle = () => {
    if (!clock.playing) {
      rounds.current = 0;
      setRound(0);
    }
    clock.toggle();
  };
  const change = (fn: () => void) => {
    clock.stop();
    fn();
  };

  const now = clock.current === null ? null : drill[clock.current]!;
  const active = now ? [posKey(now)] : [];
  const dots = box.notes.map((n) => dotOf(n, degreeText(n.degree), n.isTonic ? 'home' : 'plain'));
  const columns = drill.map((n): TabNote[] => [{ key: posKey(n), string: n.string, fret: n.fret, midi: n.midi }]);
  const idle = fill(copy.idle, { pattern: copy.patterns[pattern], n: index, count: drill.length });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup label={copy.box} items={all.map((b) => ({ value: b.index, text: b.index }))} value={index} onChange={(i) => change(() => setIndex(i))} />
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
        <Button onClick={toggle}>{clock.playing ? copy.stop : copy.start}</Button>
        <Tempo label={copy.tempo} text={fill(copy.bpm, { bpm })} bpm={bpm} onChange={setBpm} best={best ? fill(ui.tempoBest, { bpm: best }) : undefined} />
        <ChipGroup<'off' | 'on'>
          label={copy.speedUp}
          items={[
            { value: 'off', text: copy.off },
            { value: 'on', text: fill(copy.on, { n: SPEED_STEP }) },
          ]}
          value={speedUp ? 'on' : 'off'}
          onChange={(v) => setSpeedUp(v === 'on')}
        />
      </div>
      <Tab columns={columns} label={copy.tab} active={active} column={clock.current} />
      <Fretboard geometry={g} dots={dots} label={idle} box={box} active={active} />
      <p className="caption" aria-live="polite">
        {clock.playing ? fill(copy.round, { round: Math.max(1, round), bpm }) : idle}
      </p>
    </div>
  );
}

// --- Step 4 ---

function MajorScene({ copy }: { copy: SceneCopy['major'] }) {
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(NECK_FRETS, { fretWidth: 50 }), []);
  const [tonic, setTonic] = useState<NoteName>(MAJOR_KEYS[3]!);
  const view = useMemo(() => majorView(tonic), [tonic]);
  const cell = cellSeconds(80, 2);
  const clock = useClock(VAMP_CELLS, cell, (i, delay) => {
    if (i % 8 === 0) player.pluck(bassMidi(view.tonic), delay, beatSeconds(80) * 4 * 0.95);
    const n = view.run[i];
    if (n) player.pluck(n.midi, delay, cell * 1.6);
  });
  const pick = (k: NoteName) => {
    clock.stop();
    setTonic(k);
    player.pluck(bassMidi(k));
  };

  const start = { string: 6, fret: view.minorFret } as const;
  const dots = view.notes.map((n) => {
    const tone: DotTone = n.isTonic ? 'homeMajor' : n.string === start.string && n.fret === start.fret ? 'home' : 'plain';
    return dotOf(n, degreeText(n.degree), tone, !inBox(view.box1, n));
  });
  const now = clock.current === null ? null : view.run[clock.current];
  const key = format(tonic);
  const caption = fill(copy.caption, { key, minor: format(view.relativeMinor), minorFret: view.minorFret, majorFret: view.majorFret });
  const y = g.y(6) + 13;
  const x1 = g.x(view.majorFret);
  const x2 = g.x(view.minorFret);

  return (
    <div className="board">
      <div className="finder" role="group" aria-label={copy.key}>
        {MAJOR_KEYS.map((k) => (
          <button key={format(k)} type="button" aria-pressed={sameNote(k, tonic)} onClick={() => pick(k)}>
            <b>{format(k)}</b> {homeFret(k)}
          </button>
        ))}
      </div>
      <div className="controls">
        <Button onClick={clock.toggle}>{clock.playing ? copy.stop : copy.play}</Button>
      </div>
      <div className="legend">
        <span>
          <i className="swatch homeMajor" />
          {copy.legendMajor}
        </span>
        <span>
          <i className="swatch home" />
          {copy.legendMinor}
        </span>
      </div>
      <Fretboard geometry={g} dots={dots} label={caption} box={view.box1} active={now ? [posKey(now)] : []}>
        <g className="arc">
          <path d={`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y + 18} ${x2} ${y}`} />
        </g>
      </Fretboard>
      <p className="caption" aria-live="polite">
        {clock.playing ? fill(copy.playing, { key }) : caption}
      </p>
    </div>
  );
}

// --- Step 5 ---

interface Score {
  readonly right: number;
  readonly total: number;
  readonly streak: number;
}

function ChooseScene({ copy }: { copy: SceneCopy['choose'] }) {
  const { player, recordQuiz } = useTheory();
  const g = useMemo(() => neckGeometry(NECK_FRETS, { fretWidth: 50 }), []);
  const [question, setQuestion] = useState<QuizQuestion>(() => quizQuestion(Math.random));
  const [verdict, setVerdict] = useState<{ kind: Verdict; fret: number } | null>(null);
  const [missed, setMissed] = useState(false);
  const [score, setScore] = useState<Score>({ right: 0, total: 0, streak: 0 });
  const [withScale, setWithScale] = useState(false);
  // Read by the clock: its first step runs before React re-renders with the new state.
  const scaleOn = useRef(false);
  const solved = verdict?.kind === 'right';
  const view = useMemo(() => quizView(question), [question]);
  const voicing = useMemo(() => chordMidis(songChord(question)), [question]);

  const cell = cellSeconds(VAMP_BPM, 2);
  const clock = useClock(VAMP_CELLS, cell, (i, delay) => {
    if (i % 4 === 0) {
      for (const s of strumDelays(voicing, 'down')) player.pluck(s.item, delay + s.delay, cell * 3.8);
    }
    const n = scaleOn.current ? view.run[i] : undefined;
    if (n) player.pluck(n.midi, delay, cell * 1.6);
  });
  const play = (scale: boolean) => {
    if (clock.playing && withScale === scale) return clock.stop();
    scaleOn.current = scale;
    setWithScale(scale);
    if (!clock.playing) clock.toggle();
  };

  const answer = (d: FretDot) => {
    if (solved || d.string !== 6) return;
    const kind = judge(question, d.fret);
    setVerdict({ kind, fret: d.fret });
    // A question counts once, on its first answer.
    if (kind === 'right') {
      if (!missed) {
        setScore((s) => ({ right: s.right + 1, total: s.total + 1, streak: s.streak + 1 }));
        recordQuiz('pentatonic-shape', true);
      }
      return;
    }
    if (!missed) {
      setScore((s) => ({ ...s, total: s.total + 1, streak: 0 }));
      recordQuiz('pentatonic-shape', false);
    }
    setMissed(true);
  };
  const next = () => {
    clock.stop();
    // Skipping a song you never answered counts as a miss, as in every other quiz.
    if (!solved && !missed) {
      setScore((s) => ({ ...s, total: s.total + 1, streak: 0 }));
      recordQuiz('pentatonic-shape', false);
    }
    setQuestion((q) => quizQuestion(Math.random, q));
    setVerdict(null);
    setMissed(false);
    scaleOn.current = false;
    setWithScale(false);
  };

  const homeTone: DotTone = question.kind === 'major' ? 'homeMajor' : 'home';
  const boxDots = solved ? view.box1.notes.map((n) => dotOf(n, degreeText(n.degree), n.isTonic ? homeTone : 'plain')) : [];
  const taken = new Set(boxDots.map((d) => d.key));
  const strip: FretDot[] = Array.from({ length: NECK_FRETS + 1 }, (_, fret) => ({
    key: posKey({ string: 6, fret }),
    string: 6 as const,
    fret,
    midi: midiAt({ string: 6, fret }),
    faint: true,
  })).filter((d) => !taken.has(d.key));
  const now = clock.current === null || !withScale ? null : view.run[clock.current];

  const chord = songChordSymbol(question);
  const key = format(question.tonic);
  const questionText = fill(copy.question, { chord, kind: copy.kinds[question.kind] });
  const result = (() => {
    if (!verdict) return copy.idle;
    const vars = { fret: verdict.fret, key, chord, shape: format(shapeTonic(question)) };
    switch (verdict.kind) {
      case 'right':
        return fill(question.kind === 'major' ? copy.rightMajor : question.kind === 'blues' ? copy.rightBlues : copy.right, vars);
      case 'songRoot':
        return fill(copy.songRoot, vars);
      case 'majorTrick':
        return fill(copy.majorTrick, vars);
      case 'other':
        return fill(copy.other, { ...vars, note: namesAt({ string: 6, fret: verdict.fret }) });
    }
  })();

  return (
    <div className="board">
      <div className="quiz">
        <span className="question">{questionText}</span>
      </div>
      <div className="controls">
        <Button onClick={() => play(false)}>{clock.playing && !withScale ? copy.stop : copy.vamp}</Button>
        {solved && (
          <Button onClick={() => play(true)} ghost>
            {clock.playing && withScale ? copy.stop : copy.hear}
          </Button>
        )}
        <Button onClick={next} ghost>
          {copy.next}
        </Button>
        <span className="muted small">{fill(copy.score, { ...score })}</span>
      </div>
      <Fretboard
        geometry={g}
        dots={[...strip, ...boxDots]}
        label={questionText}
        box={solved ? view.box1 : null}
        active={now ? [posKey(now)] : []}
        onDot={answer}
      />
      <p className={solved ? 'caption good' : 'caption'} aria-live="polite">
        {result}
      </p>
    </div>
  );
}
