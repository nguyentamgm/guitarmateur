/** The five scenes of "Electric guitar". Every position comes from lessons/electric. */
import { useMemo, useState } from 'react';
import { slide } from '../../core/audio';
import { midiAt, type FretPos } from '../../core/fretboard';
import { format, type NoteName } from '../../core/music';
import { beatSeconds, strumDelays, swingDelay, swingLength } from '../../core/rhythm';
import { fill } from '../../i18n';
import {
  BOOGIE_BPM,
  BOOGIE_FRETS,
  BOOGIE_KEYS,
  BOOGIE_TONIC,
  MAX_ROOT_FRET,
  OCTAVE_STRINGS,
  POWER_FRETS,
  RIFF_BPM,
  RIFF_CELLS,
  boogieForm,
  boogieShape,
  boogieTops,
  octaveView,
  powerView,
  riffChords,
  slideFrom,
  stopsView,
  thirdOver,
  type SceneCopy,
  type StepId,
  type StopNote,
} from '../../lessons/electric';
import { BarGrid } from '../BarGrid';
import { BeatGrid, type Block } from '../BeatGrid';
import { useTheory } from '../context';
import { Button, ChipGroup, KeyFinder, OnOff, Tempo } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { neckGeometry } from '../geometry';
import { degreeText, posKey } from '../keys';
import { useClock } from '../useClock';
import { useSequence } from '../useSequence';

export function ElectricScene({ step, copy }: { step: StepId; copy: SceneCopy }) {
  switch (step) {
    case 'power':
      return <PowerScene copy={copy} />;
    case 'mute':
      return <MuteScene copy={copy} />;
    case 'doubleStops':
      return <DoubleStopsScene copy={copy} />;
    case 'octaves':
      return <OctavesScene copy={copy} />;
    case 'boogie':
      return <BoogieScene copy={copy} />;
  }
}

const EIGHTHS = 8;

const noteDot = (n: StopNote, extra: Partial<FretDot> = {}): FretDot => ({
  key: posKey(n),
  string: n.string,
  fret: n.fret,
  midi: n.midi,
  label: degreeText(n.degree),
  tone: n.degree === '1' || n.degree === '8' ? 'home' : 'plain',
  ...extra,
});

/** Strum a chord down, low string first, `length` seconds each. */
function useStrum() {
  const { player } = useTheory();
  return (notes: readonly StopNote[], delay = 0, length = 1.4) => {
    for (const s of strumDelays(notes, 'down', 0.01)) player.pluck(s.item.midi, delay + s.delay, length);
  };
}

// --- Step 1 ---

function PowerScene({ copy }: { copy: SceneCopy }) {
  const c = copy.power;
  const { player } = useTheory();
  const strum = useStrum();
  const g = useMemo(() => neckGeometry(POWER_FRETS, { fretWidth: 52 }), []);
  const [root, setRoot] = useState<FretPos>({ string: 6, fret: 5 });
  const [octave, setOctave] = useState(true);
  const view = powerView(root, octave);
  const taken = new Set(view.notes.map(posKey));

  const places: FretDot[] = ([6, 5] as const).flatMap((string) =>
    Array.from({ length: MAX_ROOT_FRET + 1 }, (_, fret): FretDot => ({
      key: posKey({ string, fret }),
      string,
      fret,
      midi: midiAt({ string, fret }),
      faint: true,
    })).filter((d) => !taken.has(d.key)),
  );
  const move = (d: FretDot) => {
    if ((d.string !== 6 && d.string !== 5) || d.fret > MAX_ROOT_FRET) return;
    const next = { string: d.string, fret: d.fret };
    setRoot(next);
    strum(powerView(next, octave).notes);
  };
  const under = (quality: 'major' | 'minor') => {
    strum(view.notes, 0, 2.2);
    player.pluck(thirdOver(root, quality), 0.5, 1.7);
  };
  const caption = fill(c.caption, { symbol: view.symbol, string: root.string, fret: root.fret });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<2 | 3>
          label={c.notes}
          items={[
            { value: 2, text: c.two },
            { value: 3, text: c.three },
          ]}
          value={octave ? 3 : 2}
          onChange={(v) => setOctave(v === 3)}
        />
        <Button onClick={() => strum(view.notes)}>{copy.play}</Button>
        <Button onClick={() => under('major')} ghost>
          {c.overMajor}
        </Button>
        <Button onClick={() => under('minor')} ghost>
          {c.overMinor}
        </Button>
      </div>
      <p className="power-symbol" aria-hidden="true">
        {view.symbol}
      </p>
      <Fretboard geometry={g} dots={[...places, ...view.notes.map((n) => noteDot(n))]} label={caption} onDot={move} />
      <p className="caption" aria-live="polite">
        {`${caption} ${c.idle}`}
      </p>
    </div>
  );
}

// --- Step 2 ---

function MuteScene({ copy }: { copy: SceneCopy }) {
  const c = copy.mute;
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(9, { fretWidth: 56 }), []);
  const chords = useMemo(() => riffChords(), []);
  const [palm, setPalm] = useState(true);
  const [bpm, setBpm] = useState(RIFF_BPM);
  const cell = beatSeconds(bpm) / 2;
  const clock = useClock(RIFF_CELLS, cell, (i, delay) => {
    if (i % 2 === 0) player.click(i % EIGHTHS === 0, delay);
    const ev = chords.find((e) => e.cell === i);
    if (!ev) return;
    for (const s of strumDelays(ev.notes, 'down', 0.008)) {
      if (ev.mute && palm) player.mute(s.item.midi, delay + s.delay);
      else player.pluck(s.item.midi, delay + s.delay, ev.cells * cell * 0.95);
    }
  });

  const now = clock.current === null ? chords[0]! : [...chords].reverse().find((e) => e.cell <= clock.current!)!;
  const blocks: Block[] = chords.map((e) => ({
    key: String(e.cell),
    start: e.cell,
    length: e.cells,
    tone: e.mute && palm ? 'note' : 'accent',
    text: e.mute && palm ? c.chug : e.symbol,
    label: e.symbol,
  }));

  return (
    <div className="board">
      <div className="controls">
        <Button onClick={clock.toggle}>{clock.playing ? copy.stop : copy.play}</Button>
        <OnOff label={copy.palmMute} on={copy.on} off={copy.off} value={palm} onChange={setPalm} />
        <Tempo label={copy.tempo} text={fill(copy.bpm, { bpm })} bpm={bpm} onChange={setBpm} />
      </div>
      <div className="legend">
        <span>
          <i className="swatch homeMajor" />
          {c.legendRing}
        </span>
        <span>
          <i className="swatch plain" />
          {c.legendMute}
        </span>
      </div>
      <BeatGrid cells={RIFF_CELLS} perBeat={2} blocks={blocks} label={c.grid} current={clock.current} />
      <Fretboard geometry={g} dots={now.notes.map((n) => noteDot(n))} label={c.grid} />
      <p className="caption" aria-live="polite">
        {clock.playing ? fill(c.playing, { symbol: now.symbol }) : c.idle}
      </p>
    </div>
  );
}

// --- Step 3 ---

function DoubleStopsScene({ copy }: { copy: SceneCopy }) {
  const c = copy.doubleStops;
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(15, { fretWidth: 50 }), []);
  const [k, setK] = useState(1);
  const [index, setIndex] = useState(0);
  const view = useMemo(() => stopsView(k), [k]);
  const pair = view.pairs[Math.min(index, view.pairs.length - 1)]!;
  const members = new Set([posKey(pair.low), posKey(pair.high)]);

  const play = () => {
    for (const n of [pair.low, pair.high]) player.pluck(n.midi, 0, 1.4);
  };
  const slideIn = () => {
    const from = slideFrom(pair.low.fret);
    const semis = pair.low.fret - from;
    for (const n of [pair.low, pair.high]) player.pluck(n.midi - semis, 0, 1.6, slide(semis, 0.12, 0.12));
  };
  const choose = (next: number) => {
    setK(next);
    setIndex(0);
  };
  const caption = fill(c.caption, {
    low: pair.low.string,
    high: pair.high.string,
    fret: pair.low.fret,
    a: pair.names[0],
    b: pair.names[1],
    interval: pair.semitones === 4 ? c.third : c.fourth,
  });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup label={c.box} items={[1, 2, 3, 4, 5].map((i) => ({ value: i, text: i }))} value={k} onChange={choose} />
      </div>
      <div className="controls">
        <ChipGroup<number>
          label={c.pair}
          items={view.pairs.map((p, i) => ({ value: i, text: `${p.low.string}–${p.high.string} · ${p.low.fret}` }))}
          value={index}
          onChange={setIndex}
        />
      </div>
      <div className="controls">
        <Button onClick={play}>{copy.play}</Button>
        <Button onClick={slideIn} ghost>
          {c.slide}
        </Button>
      </div>
      <Fretboard geometry={g} dots={view.notes.map((n) => noteDot(n, { dim: !members.has(posKey(n)) }))} label={caption} box={view.box}>
        {view.pairs.map((p, i) => (
          <line
            key={i}
            className={i === index ? 'stopline on' : 'stopline'}
            x1={g.x(p.low.fret)}
            x2={g.x(p.high.fret)}
            y1={g.y(p.low.string)}
            y2={g.y(p.high.string)}
          />
        ))}
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 4 ---

function OctavesScene({ copy }: { copy: SceneCopy }) {
  const c = copy.octaves;
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(15, { fretWidth: 50 }), []);
  const [lower, setLower] = useState(OCTAVE_STRINGS[1]!);
  const view = useMemo(() => octaveView(lower), [lower]);
  const seq = useSequence(view.pairs.length, 480, (i) => {
    const p = view.pairs[i]!;
    player.pluck(p.low.midi, 0, 0.45);
    player.pluck(p.high.midi, 0.006, 0.45);
  });

  const seen = new Set<string>();
  const dots = view.pairs
    .flatMap((p) => [p.low, p.high])
    .filter((n) => !seen.has(posKey(n)) && seen.add(posKey(n)))
    .map((n) => noteDot(n));
  const now = seq.current === null ? null : view.pairs[seq.current]!;
  const first = view.pairs[0]!;
  const caption = fill(c.caption, {
    key: format(view.tonic),
    low: lower,
    high: first.high.string,
    shift: first.high.fret - first.low.fret,
  });
  const change = (s: (typeof OCTAVE_STRINGS)[number]) => {
    seq.stop();
    setLower(s);
  };

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<number>
          label={c.strings}
          items={OCTAVE_STRINGS.map((s) => ({ value: s, text: fill(c.pairItem, { low: s, high: s - 2 }) }))}
          value={lower}
          onChange={(s) => change(s as (typeof OCTAVE_STRINGS)[number])}
        />
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.play}</Button>
      </div>
      <Fretboard geometry={g} dots={dots} label={caption} active={now ? [posKey(now.low), posKey(now.high)] : []}>
        {view.pairs.slice(0, 4).map((p) => (
          <g key={p.low.fret} className="olink">
            <line x1={g.x(p.low.fret)} x2={g.x(p.high.fret)} y1={g.y(p.low.string)} y2={g.y(p.high.string)} />
          </g>
        ))}
        {view.pairs.slice(0, 4).map((p) => (
          <text key={`x${p.low.fret}`} className="mutex" x={g.x(p.low.fret) + g.fretWidth * 0.5} y={g.y(p.muted)}>
            {c.mutedMark}
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

function BoogieScene({ copy }: { copy: SceneCopy }) {
  const c = copy.boogie;
  const { player } = useTheory();
  const g = useMemo(() => neckGeometry(BOOGIE_FRETS, { fretWidth: 42 }), []);
  const [tonic, setTonic] = useState<NoteName>(BOOGIE_TONIC);
  const [quickChange, setQuickChange] = useState(false);
  const [turnaround, setTurnaround] = useState(false);
  const [palm, setPalm] = useState(true);
  const [bpm, setBpm] = useState(BOOGIE_BPM);
  const form = useMemo(() => boogieForm(tonic, { quickChange, turnaround }), [tonic, quickChange, turnaround]);
  const clock = useClock(form.length * EIGHTHS, beatSeconds(bpm) / 2, (i, delay) => {
    const e = i % EIGHTHS;
    const at = delay + swingDelay(e, 1, bpm);
    for (const n of boogieShape(form[Math.floor(i / EIGHTHS)]!.root, e)) {
      if (palm) player.mute(n.midi, at);
      else player.pluck(n.midi, at, swingLength(e, 1) * beatSeconds(bpm) * 0.9);
    }
  });

  const barIndex = clock.current === null ? null : Math.floor(clock.current / EIGHTHS);
  const bar = form[barIndex ?? 0]!;
  const [root, top] = boogieShape(bar.root, clock.current ?? 0);
  const dots = [noteDot(root), ...boogieTops(bar.root).map((n) => noteDot(n, { dim: clock.current !== null && posKey(n) !== posKey(top) }))];

  return (
    <div className="board">
      <KeyFinder keys={BOOGIE_KEYS} label={c.key} value={tonic} onChange={setTonic} />
      <div className="controls">
        <Button onClick={clock.toggle}>{clock.playing ? copy.stop : copy.play}</Button>
        <OnOff label={copy.palmMute} on={copy.on} off={copy.off} value={palm} onChange={setPalm} />
        <OnOff label={c.quickChange} on={copy.on} off={copy.off} value={quickChange} onChange={setQuickChange} />
        <OnOff label={c.turnaround} on={copy.on} off={copy.off} value={turnaround} onChange={setTurnaround} />
        <Tempo label={copy.tempo} text={fill(copy.bpm, { bpm })} bpm={bpm} onChange={setBpm} />
      </div>
      <BarGrid label={c.form} bars={form} current={barIndex} />
      <Fretboard geometry={g} dots={dots} label={c.form} active={clock.current === null ? [] : [posKey(root), posKey(top)]} />
      <p className="caption" aria-live="polite">
        {barIndex === null ? fill(c.idle, { key: format(tonic) }) : fill(c.playing, { n: barIndex + 1, chord: bar.symbol, string: bar.root.string })}
      </p>
    </div>
  );
}
