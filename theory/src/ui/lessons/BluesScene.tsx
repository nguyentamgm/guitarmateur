/** The five scenes of "Blues: blue notes, shuffle and bends". Every note comes from lessons/blues. */
import { useMemo, useState } from 'react';
import { bend, type PitchPoint } from '../../core/audio';
import { midiAt } from '../../core/fretboard';
import { format, type NoteName } from '../../core/music';
import { beatSeconds, countTriplets, swingDelay, swingLength } from '../../core/rhythm';
import { fill } from '../../i18n';
import {
  BENDS,
  BLUES_BPM,
  BLUES_KEYS,
  DEMOS,
  EXAMPLE_TONIC,
  FULL_BENDS,
  LICK_BARS,
  LICK_CELLS,
  NECK_FRETS,
  SHUFFLE_MIDI,
  bendQuestion,
  bendView,
  bluePhrase,
  bluesBoxes,
  bluesForm,
  bluesNeck,
  demoNotes,
  lickNotes,
  lickPlan,
  planGlide,
  planSeconds,
  questionSemis,
  swingBar,
  type BendOutcome,
  type BendQuestion,
  type BluesKind,
  type DemoId,
  type LickNote,
  type PluckPlan,
  type SceneCopy,
  type StepId,
} from '../../lessons/blues';
import { BarGrid } from '../BarGrid';
import { BeatGrid, type Block } from '../BeatGrid';
import { useTheory } from '../context';
import { Button, ChipGroup, KeyFinder, OnOff, Tempo } from '../controls';
import { Fretboard, type DotTone, type FretDot } from '../Fretboard';
import { neckGeometry } from '../geometry';
import { degreeText, posKey } from '../keys';
import { PitchCurve } from '../PitchCurve';
import { Tab, type TabNote } from '../Tab';
import { useBacking } from '../useBacking';
import { useClock } from '../useClock';
import { useSequence } from '../useSequence';

export function BluesScene({ step, copy }: { step: StepId; copy: SceneCopy }) {
  switch (step) {
    case 'blueNote':
      return <BlueNoteScene copy={copy} />;
    case 'shuffle':
      return <ShuffleScene copy={copy} />;
    case 'twelveBar':
      return <TwelveBarScene copy={copy} />;
    case 'bends':
      return <BendsScene copy={copy} />;
    case 'legato':
      return <LegatoScene copy={copy} />;
  }
}

/** Shuffle backing: every scene that swings uses the full triplet feel. */
const SHUFFLE = 1;
const EIGHTHS = 8;

// --- Step 1 ---

function BlueNoteScene({ copy }: { copy: SceneCopy }) {
  const c = copy.blueNote;
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(NECK_FRETS, { fretWidth: 50 }), []);
  const [kind, setKind] = useState<BluesKind>('minor');
  const [index, setIndex] = useState(1);
  const [blueOn, setBlueOn] = useState(true);
  const neck = useMemo(() => bluesNeck(kind), [kind]);
  const box = useMemo(() => bluesBoxes(kind)[index - 1]!, [kind, index]);
  const phrase = useMemo(() => bluePhrase(box, blueOn), [box, blueOn]);
  const seq = useSequence(phrase.length, 330, (i) => player.pluck(phrase[i]!.midi));
  const blueDegree = neck.find((n) => n.isBlue)!.degree;
  const homeTone: DotTone = kind === 'minor' ? 'home' : 'homeMajor';

  const dots = neck
    .filter((n) => blueOn || !n.isBlue)
    .map(
      (n): FretDot => ({
        key: posKey(n),
        string: n.string,
        fret: n.fret,
        midi: n.midi,
        label: degreeText(n.degree),
        tone: n.isTonic ? homeTone : n.isBlue ? 'blue' : 'plain',
        dim: n.fret < box.minFret || n.fret > box.maxFret,
      }),
    );
  const change = (fn: () => void) => {
    seq.stop();
    fn();
  };
  const caption = fill(c.phrase, { degrees: phrase.map((n) => degreeText(n.degree)).join(' ') });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<BluesKind>
          label={c.scale}
          items={[
            { value: 'minor', text: c.minor },
            { value: 'major', text: c.major },
          ]}
          value={kind}
          onChange={(k) => change(() => setKind(k))}
        />
        <ChipGroup label={c.box} items={[1, 2, 3, 4, 5].map((i) => ({ value: i, text: i }))} value={index} onChange={(i) => change(() => setIndex(i))} />
        <ChipGroup<'on' | 'off'>
          label={c.blue}
          items={[
            { value: 'on', text: c.on },
            { value: 'off', text: c.off },
          ]}
          value={blueOn ? 'on' : 'off'}
          onChange={(v) => change(() => setBlueOn(v === 'on'))}
        />
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : c.playPhrase}</Button>
      </div>
      <div className="legend">
        <span>
          <i className="swatch blue" />
          {fill(c.legend, { degree: degreeText(blueDegree) })}
        </span>
      </div>
      <Fretboard geometry={g} dots={dots} label={caption} box={box} active={seq.current === null ? [] : [posKey(phrase[seq.current]!)]} />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 2 ---

function ShuffleScene({ copy }: { copy: SceneCopy }) {
  const c = copy.shuffle;
  const { player } = useTheory();
  const [swing, setSwing] = useState(SHUFFLE);
  const [bpm, setBpm] = useState(80);
  const bar = useMemo(() => swingBar(swing), [swing]);
  const clock = useClock(EIGHTHS, beatSeconds(bpm) / 2, (i, delay) => {
    if (i % 2 === 0) player.click(i === 0, delay);
    player.pluck(SHUFFLE_MIDI, delay + swingDelay(i, swing, bpm), swingLength(i, swing) * beatSeconds(bpm) * 0.8);
  });

  const pct = Math.round(swing * 100);
  const words = countTriplets().map((s) => (s.kind === 'beat' ? String(s.n) : c[s.kind]));
  const blocks: Block[] = bar.map((b) => ({
    key: String(b.eighth),
    start: b.start,
    length: b.length,
    tone: b.eighth % 2 === 0 ? 'accent' : 'note',
    label: `${b.eighth + 1}`,
  }));
  const caption = fill(c.caption, { pct, at: `${Math.round((bar[1]!.start / 3) * 100)}%` });

  return (
    <div className="board">
      <div className="controls">
        <Button onClick={clock.toggle}>{clock.playing ? copy.stop : copy.play}</Button>
        <ChipGroup<number>
          label={c.feel}
          items={[
            { value: 0, text: c.straight },
            { value: 1, text: c.shuffle },
          ]}
          value={swing}
          onChange={setSwing}
        />
        <label className="tempo">
          <span>{c.swing}</span>
          <input type="range" min={0} max={100} step={1} value={pct} onChange={(e) => setSwing(Number(e.target.value) / 100)} />
          <output>{`${pct}%`}</output>
        </label>
        <Tempo label={copy.tempo} text={fill(copy.bpm, { bpm })} bpm={bpm} onChange={setBpm} />
      </div>
      <BeatGrid
        cells={12}
        perBeat={3}
        blocks={blocks}
        label={c.grid}
        current={clock.current === null ? null : bar[clock.current]!.start}
        words={words}
      />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 3 ---

function TwelveBarScene({ copy }: { copy: SceneCopy }) {
  const c = copy.twelveBar;
  const [tonic, setTonic] = useState<NoteName>(EXAMPLE_TONIC);
  const [quickChange, setQuickChange] = useState(false);
  const [turnaround, setTurnaround] = useState(false);
  const [bpm, setBpm] = useState(BLUES_BPM);
  const form = useMemo(() => bluesForm(tonic, { quickChange, turnaround }), [tonic, quickChange, turnaround]);
  const clock = useBacking(form, 'shuffle', bpm);
  const bar = clock.bar;

  return (
    <div className="board">
      <KeyFinder keys={BLUES_KEYS} label={c.key} value={tonic} onChange={setTonic} />
      <div className="controls">
        <Button onClick={clock.toggle}>{clock.playing ? copy.stop : copy.play}</Button>
        <OnOff label={c.quickChange} on={c.on} off={c.off} value={quickChange} onChange={setQuickChange} />
        <OnOff label={c.turnaround} on={c.on} off={c.off} value={turnaround} onChange={setTurnaround} />
        <Tempo label={copy.tempo} text={fill(copy.bpm, { bpm })} bpm={bpm} onChange={setBpm} />
      </div>
      <BarGrid label={c.form} bars={form} current={bar} />
      <p className="caption" aria-live="polite">
        {bar === null ? fill(c.idle, { key: format(tonic) }) : fill(c.playing, { n: bar + 1, chord: form[bar]!.symbol, degree: form[bar]!.degree })}
      </p>
    </div>
  );
}

// --- Step 4 ---

/** Where the bend sound starts after the target note in "target, then bend". */
const BEND_AFTER = 0.9;
const BEND_GLIDE = (semis: number) => bend(semis, 0.15, 0.2);

function BendsScene({ copy }: { copy: SceneCopy }) {
  const c = copy.bends;
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(12, { fretWidth: 52 }), []);
  const [index, setIndex] = useState(0);
  const [run, setRun] = useState(0);
  const view = useMemo(() => bendView(BENDS[index]!), [index]);
  const box = useMemo(() => bluesBoxes('minor')[0]!, []);
  const curl = view.def.semis < 1;
  const glide = BEND_GLIDE(view.def.semis);

  const play = () => {
    const delay = curl ? 0 : BEND_AFTER;
    if (!curl) player.pluck(midiAt(view.target), 0, 0.75);
    player.pluck(view.at.midi, delay, 1.2, glide);
    setRun((r) => r + 1);
  };

  const dots: FretDot[] = box.notes
    .filter((n) => !n.isBlue)
    .map((n) => ({
      key: posKey(n),
      string: n.string,
      fret: n.fret,
      midi: n.midi,
      label: degreeText(n.degree),
      tone: posKey(n) === posKey(view.at) ? 'homeMajor' : n.isTonic ? 'home' : 'plain',
      dim: posKey(n) !== posKey(view.at),
    }));
  if (!curl && !dots.some((d) => d.key === posKey(view.target))) {
    dots.push({ key: posKey(view.target), ...view.target, midi: midiAt(view.target), label: degreeText(view.def.to), tone: 'blue' });
  }
  const name = (i: number) => {
    const b = BENDS[i]!;
    return b.semis < 1 ? c.curl : fill(c.pair, { from: degreeText(b.from), to: degreeText(b.to) });
  };
  const caption = curl
    ? fill(c.curlCaption, { string: view.at.string, fret: view.at.fret })
    : fill(c.caption, { from: degreeText(view.def.from), to: degreeText(view.def.to), string: view.at.string, fret: view.at.fret, target: view.target.fret });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<number> label={c.bend} items={BENDS.map((_, i) => ({ value: i, text: name(i) }))} value={index} onChange={setIndex} />
        <Button onClick={play}>{c.playBend}</Button>
      </div>
      <Fretboard geometry={g} dots={dots} label={caption} />
      <PitchCurve
        glide={glide}
        length={1}
        label={copy.curve}
        target={curl ? 1 : view.def.semis}
        targetLabel={degreeText(view.def.to)}
        seconds={1}
        delay={curl ? 0 : BEND_AFTER}
        run={run}
      />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
      <BendQuiz copy={copy} />
    </div>
  );
}

function BendQuiz({ copy }: { copy: SceneCopy }) {
  const c = copy.bends;
  const { player } = useTheory();
  const [q, setQ] = useState<BendQuestion>(() => bendQuestion(Math.random));
  const [answer, setAnswer] = useState<BendOutcome | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const view = bendView(FULL_BENDS[q.bend]!);

  const listen = () => {
    player.pluck(midiAt(view.target), 0, 0.75);
    player.pluck(view.at.midi, BEND_AFTER, 1.2, BEND_GLIDE(questionSemis(q)));
  };
  const choose = (o: BendOutcome) => {
    if (answer) return;
    setAnswer(o);
    setScore((s) => ({ right: s.right + (o === q.outcome ? 1 : 0), total: s.total + 1 }));
  };
  const next = () => {
    setQ((prev) => bendQuestion(Math.random, prev));
    setAnswer(null);
  };
  const result = answer === null ? '' : fill(answer === q.outcome ? c.right : c.wrong, { outcome: c.outcomes[q.outcome] });

  return (
    <div className="subquiz">
      <h3>{c.quizTitle}</h3>
      <div className="controls">
        <Button onClick={listen}>{c.listen}</Button>
        <ChipGroup<BendOutcome | 'none'>
          label={c.bend}
          items={(['flat', 'full', 'sharp'] as const).map((o) => ({ value: o, text: c.outcomes[o] }))}
          value={answer ?? 'none'}
          onChange={(o) => o !== 'none' && choose(o)}
        />
        <Button onClick={next} ghost>
          {c.next}
        </Button>
        <span className="muted small">{fill(c.score, score)}</span>
      </div>
      <p className={answer !== null && answer === q.outcome ? 'caption good' : 'caption'} aria-live="polite">
        {result}
      </p>
    </div>
  );
}

// --- Step 5 ---

/** One pitch picture for several picks: each pick jumps to its own pitch, measured from the first. */
function curveOf(plans: readonly PluckPlan[]): PitchPoint[] {
  const base = plans[0]?.midi ?? 0;
  return plans.flatMap((p) => p.points.map((pt) => ({ t: p.cell + pt.t, semis: p.midi - base + pt.semis, ramp: pt.t === 0 ? ('step' as const) : pt.ramp })));
}

const tabColumns = (notes: readonly LickNote[], cells: number): TabNote[][] =>
  Array.from({ length: cells }, (_, cell) =>
    notes.filter((n) => n.event.cell === cell).map((n) => ({ key: posKey(n), string: n.string, fret: n.fret, midi: n.midi, text: n.text })),
  );

const DEMO_CELLS = 6;
const DEMO_BPM = 72;

function LegatoScene({ copy }: { copy: SceneCopy }) {
  const c = copy.legato;
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(10, { fretWidth: 52 }), []);
  const [mode, setMode] = useState<DemoId | 'lick'>('hammer');
  const [run, setRun] = useState(0);
  const [bpm, setBpm] = useState(BLUES_BPM);
  const lick = mode === 'lick';
  const notes = useMemo(() => (lick ? lickNotes() : demoNotes(mode)), [lick, mode]);
  const plans = useMemo(() => lickPlan(notes), [notes]);
  const cells = lick ? LICK_CELLS : DEMO_CELLS;
  const swing = lick ? SHUFFLE : 0;
  const form = useMemo(() => bluesForm(EXAMPLE_TONIC), []);

  // The lick over the 12-bar: the shuffle on every eighth, lick picks in bars 1–2, 5–6, 9–10.
  const clock = useBacking(form, 'shuffle', bpm, ({ step, delay }) => {
    const cell = lickCellAt(step);
    if (cell === 0) setRun((r) => r + 1);
    for (const p of plans) {
      if (p.cell === cell) player.pluck(p.midi, delay + swingDelay(cell, swing, bpm), planSeconds(p, bpm, swing), planGlide(p, bpm, swing));
    }
  });

  const playDemo = () => {
    const p = plans[0]!;
    player.pluck(p.midi, 0, planSeconds(p, DEMO_BPM, 0), planGlide(p, DEMO_BPM, 0));
    setRun((r) => r + 1);
  };
  const choose = (m: DemoId | 'lick') => {
    clock.stop();
    setMode(m);
  };

  const cell = clock.current === null ? null : lickCellAt(clock.current);
  const sounding = cell === null ? null : [...notes].reverse().find((n) => n.event.cell <= cell);
  const seen = new Set<string>();
  const dots: FretDot[] = notes
    .filter((n) => !seen.has(posKey(n)) && seen.add(posKey(n)))
    .map((n) => ({ key: posKey(n), string: n.string, fret: n.fret, midi: n.midi, label: degreeText(n.degree), tone: n.isTonic ? 'home' : 'plain' }));
  const bar = clock.current === null ? null : Math.floor(clock.current / EIGHTHS);
  const seconds = lick ? (cells / 2) * beatSeconds(bpm) : planSeconds(plans[0]!, DEMO_BPM, 0);

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<DemoId | 'lick'>
          label={c.technique}
          items={[...DEMOS.map((d) => ({ value: d, text: c.demos[d] })), { value: 'lick' as const, text: c.lick }]}
          value={mode}
          onChange={choose}
        />
      </div>
      <div className="controls">
        {lick ? (
          <>
            <Button onClick={clock.toggle}>{clock.playing ? copy.stop : c.playLick}</Button>
            <Tempo label={copy.tempo} text={fill(copy.bpm, { bpm })} bpm={bpm} onChange={setBpm} />
          </>
        ) : (
          <Button onClick={playDemo}>{copy.play}</Button>
        )}
      </div>
      <Tab columns={tabColumns(notes, cells)} label={c.tab} active={sounding ? [posKey(sounding)] : []} column={cell} />
      <p className="muted small">{c.marks}</p>
      <PitchCurve glide={curveOf(plans)} length={cells} label={copy.curve} seconds={seconds} run={run} />
      <Fretboard geometry={g} dots={dots} label={c.tab} active={sounding ? [posKey(sounding)] : []} />
      <p className="caption" aria-live="polite">
        {lick ? (bar === null ? c.lickIdle : fill(c.playing, { n: bar + 1, chord: form[bar]!.symbol })) : c.captions[mode]}
      </p>
    </div>
  );
}

/** The lick cell heard at a step of the 12-bar clock, or null between licks. */
function lickCellAt(step: number): number | null {
  const bar = Math.floor(step / EIGHTHS);
  const start = LICK_BARS.find((b) => bar >= b && bar < b + LICK_CELLS / EIGHTHS);
  return start === undefined ? null : (bar - start) * EIGHTHS + (step % EIGHTHS);
}
