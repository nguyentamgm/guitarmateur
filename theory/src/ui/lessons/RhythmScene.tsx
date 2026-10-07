/** The five scenes of "Rhythm Without Sheet Music". Lengths, counts and patterns come from lessons/rhythm. */
import { useMemo, useState } from 'react';
import {
  BEATS_PER_BAR,
  CELLS_PER_BAR,
  CELLS_PER_BEAT,
  STRUM_CELLS,
  beatSeconds,
  cellSeconds,
  countBar,
  fillBar,
  formatStrum,
  isBeat,
  pendulum,
  strumDelays,
  toggleRest,
  valueOfLength,
  type NoteValueId,
  type Slot,
} from '../../core/rhythm';
import { fill } from '../../i18n';
import {
  COUNT_LEVELS,
  DEFAULT_BPM,
  DOWN_STRINGS,
  DRILL_START_FRETS,
  LENGTH_CHOICES,
  NOTE_MIDI,
  PER_BEAT_OF,
  STRUM_PRESET_IDS,
  UP_STRINGS,
  beatsText,
  fingerDrill,
  openNote,
  presetHits,
  slotStarts,
  type CountLevel,
  type SceneCopy,
  type StepId,
  type StrumPresetId,
} from '../../lessons/rhythm';
import { BeatGrid, type Block } from '../BeatGrid';
import { useTheory } from '../context';
import { posKey } from '../keys';
import { Button, ChipGroup, Tempo } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { neckGeometry } from '../geometry';
import { Tab, type TabNote } from '../Tab';
import { useClock } from '../useClock';
import { useLastTempo, useStoredTempo } from '../useStoredTempo';


export function RhythmScene({ step, copy }: { step: StepId; copy: SceneCopy }) {
  switch (step) {
    case 'beat':
      return <BeatScene copy={copy} />;
    case 'lengths':
      return <LengthsScene copy={copy} />;
    case 'counting':
      return <CountingScene copy={copy} />;
    case 'strum':
      return <StrumScene copy={copy} />;
    case 'fingers':
      return <FingersScene copy={copy} />;
  }
}

/** Start/stop and the tempo slider, the same in every scene. */
function Transport({ copy, playing, toggle, bpm, setBpm, best }: { copy: SceneCopy; playing: boolean; toggle(): void; bpm: number; setBpm(b: number): void; best?: number }) {
  return (
    <>
      <Button onClick={toggle}>{playing ? copy.stop : copy.start}</Button>
      <Tempo label={copy.tempo.label} text={fill(copy.tempo.value, { bpm })} bpm={bpm} onChange={setBpm} best={best} />
    </>
  );
}

// --- Step 1 ---

function BeatScene({ copy }: { copy: SceneCopy }) {
  const { player } = useTheory();
  const [bpm, setBpm] = useLastTempo('rhythm-beat', DEFAULT_BPM.beat);
  const clock = useClock(BEATS_PER_BAR, beatSeconds(bpm), (i, delay) => player.click(i === 0, delay));

  const blocks: Block[] = Array.from({ length: BEATS_PER_BAR }, (_, i) => ({
    key: `b${i}`,
    start: i,
    length: 1,
    tone: i === 0 ? 'accent' : 'note',
    text: i + 1,
    label: fill(copy.beat.caption, { n: i + 1 }),
  }));
  const caption = clock.current === null ? copy.beat.idle : fill(copy.beat.caption, { n: clock.current + 1 });

  return (
    <div className="board">
      <div className="controls">
        <Transport copy={copy} playing={clock.playing} toggle={clock.toggle} bpm={bpm} setBpm={setBpm} />
      </div>
      <BeatGrid cells={BEATS_PER_BAR} perBeat={1} blocks={blocks} label={copy.beat.grid} current={clock.current} />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 2 ---

function LengthsScene({ copy }: { copy: SceneCopy }) {
  const { player } = useTheory();
  const c = copy.lengths;
  const [bpm, setBpm] = useLastTempo('rhythm-lengths', DEFAULT_BPM.lengths);
  const [value, setValue] = useState<NoteValueId>('quarter');
  const [slots, setSlots] = useState<readonly Slot[]>(() => fillBar('quarter'));
  const starts = useMemo(() => slotStarts(slots, CELLS_PER_BAR), [slots]);
  const cell = cellSeconds(bpm, CELLS_PER_BEAT);
  const clock = useClock(CELLS_PER_BAR, cell, (i, delay) => {
    if (isBeat(i, CELLS_PER_BEAT)) player.click(i === 0, delay);
    const slot = slots[starts[i]!];
    if (slot && !slot.rest) player.pluck(NOTE_MIDI, delay, slot.length * cell * 0.95);
  });

  const choose = (id: NoteValueId) => {
    setValue(id);
    setSlots(fillBar(id));
  };
  const blocks: Block[] = slots.map((s, i) => {
    const beats = beatsText(s.length);
    return {
      key: `${value}${i}`,
      start: s.start,
      length: s.length,
      tone: s.rest ? 'rest' : 'note',
      text: beats,
      // Name the block by its own length: a leftover rest turned into a note is not the chosen value.
      label: s.rest ? fill(c.rest, { beats }) : fill(c.note, { name: c.names[valueOfLength(s.length) ?? value], beats }),
      onClick: () => setSlots((all) => toggleRest(all, i)),
    };
  });
  const full = fillBar(value).filter((s) => !s.rest).length;
  const caption = fill(c.caption, { name: c.names[value], beats: beatsText(fillBar(value)[0]!.length), count: full });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<NoteValueId>
          label={c.value}
          items={LENGTH_CHOICES.map((id) => ({ value: id, text: c.names[id] }))}
          value={value}
          onChange={choose}
        />
      </div>
      <div className="controls">
        <Transport copy={copy} playing={clock.playing} toggle={clock.toggle} bpm={bpm} setBpm={setBpm} />
      </div>
      <div className="legend">
        <span>
          <i className="swatch note" />
          {c.legendNote}
        </span>
        <span>
          <i className="swatch rest" />
          {c.legendRest}
        </span>
        <span>{c.hint}</span>
      </div>
      <BeatGrid cells={CELLS_PER_BAR} perBeat={CELLS_PER_BEAT} blocks={blocks} label={caption} current={clock.current} />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 3 ---

type CountSound = 'notes' | 'click';

function CountingScene({ copy }: { copy: SceneCopy }) {
  const { player } = useTheory();
  const c = copy.counting;
  const [bpm, setBpm] = useLastTempo('rhythm-counting', DEFAULT_BPM.counting);
  const [level, setLevel] = useState<CountLevel>('eighths');
  const [sound, setSound] = useState<CountSound>('notes');
  const perBeat = PER_BEAT_OF[level];
  const cells = BEATS_PER_BAR * perBeat;
  const cell = cellSeconds(bpm, perBeat);
  const clock = useClock(cells, cell, (i, delay) => {
    if (isBeat(i, perBeat)) player.click(i === 0, delay);
    if (sound === 'notes') player.pluck(NOTE_MIDI, delay, cell * 0.8);
  });

  const words = countBar(perBeat).map((s) => (s.kind === 'beat' ? String(s.n) : c.syllables[s.kind]));
  const blocks: Block[] = words.map((w, i) => ({
    key: `${level}${i}`,
    start: i,
    length: 1,
    tone: sound === 'notes' ? (isBeat(i, perBeat) ? 'accent' : 'note') : 'ghost',
    label: w,
  }));
  const pickLevel = (l: CountLevel) => {
    clock.stop();
    setLevel(l);
  };

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<CountLevel> label={c.level} items={COUNT_LEVELS.map((l) => ({ value: l, text: c.levels[l] }))} value={level} onChange={pickLevel} />
        <ChipGroup<CountSound>
          label={c.sound}
          items={[
            { value: 'notes', text: c.notes },
            { value: 'click', text: c.clickOnly },
          ]}
          value={sound}
          onChange={setSound}
        />
      </div>
      <div className="controls">
        <Transport copy={copy} playing={clock.playing} toggle={clock.toggle} bpm={bpm} setBpm={setBpm} />
      </div>
      <BeatGrid cells={cells} perBeat={perBeat} blocks={blocks} label={c.idle} current={clock.current} words={words} />
      <p className="caption" aria-live="polite">
        {clock.current === null ? c.idle : words.join(' ')}
      </p>
    </div>
  );
}

// --- Step 4 ---

type PatternChoice = StrumPresetId | 'custom';

function StrumScene({ copy }: { copy: SceneCopy }) {
  const { player } = useTheory();
  const c = copy.strum;
  const [bpm, setBpm] = useLastTempo('rhythm-strum', DEFAULT_BPM.strum);
  const [choice, setChoice] = useState<PatternChoice>('folk');
  const [hits, setHits] = useState<readonly boolean[]>(() => presetHits('folk'));
  const cell = cellSeconds(bpm, 2);
  const clock = useClock(STRUM_CELLS, cell, (i, delay) => {
    if (isBeat(i, 2)) player.click(i === 0, delay);
    if (!hits[i]) return;
    const stroke = pendulum(i);
    for (const { item, delay: d } of strumDelays(stroke === 'down' ? DOWN_STRINGS : UP_STRINGS, stroke)) {
      player.pluck(openNote(item), delay + d, cell * 1.9);
    }
  });

  const pick = (p: PatternChoice) => {
    if (p === 'custom') return;
    setChoice(p);
    setHits(presetHits(p));
  };
  const toggle = (i: number) => {
    setChoice('custom');
    setHits((h) => h.map((x, k) => (k === i ? !x : x)));
  };
  const blocks: Block[] = hits.map((hit, i) => {
    const down = pendulum(i) === 'down';
    return {
      key: `s${i}`,
      start: i,
      length: 1,
      tone: hit ? (i === 0 ? 'accent' : 'note') : 'ghost',
      text: down ? '↓' : '↑',
      label: fill(c.cell, { n: i + 1, stroke: down ? c.down : c.up, state: hit ? c.hit : c.miss }),
      onClick: () => toggle(i),
    };
  });
  const words = countBar(2).map((s) => (s.kind === 'beat' ? String(s.n) : copy.counting.syllables[s.kind]));
  const caption = fill(c.caption, { pattern: formatStrum(hits) });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup<PatternChoice>
          label={c.pattern}
          items={[...STRUM_PRESET_IDS.map((id) => ({ value: id as PatternChoice, text: c.presets[id] })), { value: 'custom', text: c.custom }]}
          value={choice}
          onChange={pick}
        />
      </div>
      <div className="controls">
        <Transport copy={copy} playing={clock.playing} toggle={clock.toggle} bpm={bpm} setBpm={setBpm} />
      </div>
      <BeatGrid cells={STRUM_CELLS} perBeat={2} blocks={blocks} label={caption} current={clock.current} words={words} />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 5 ---

function FingersScene({ copy }: { copy: SceneCopy }) {
  const { player } = useTheory();
  const c = copy.fingers;
  const { bpm, setBpm, best, step } = useStoredTempo('rhythm-fingers', DEFAULT_BPM.fingers);
  const [startFret, setStartFret] = useState(DRILL_START_FRETS[0]!);
  const [perBeat, setPerBeat] = useState<1 | 2>(1);
  const drill = useMemo(() => fingerDrill(startFret), [startFret]);
  const cell = cellSeconds(bpm, perBeat);
  const clock = useClock(drill.length, cell, (i, delay) => {
    step(i, drill.length, cell);
    if (isBeat(i, perBeat)) player.click(isBeat(i, perBeat * BEATS_PER_BAR), delay);
    player.pluck(drill[i]!.midi, delay, cell * 0.9);
  });
  const g = useMemo(() => neckGeometry(9, { fretWidth: 54 }), []);

  const now = clock.current === null ? null : drill[clock.current]!;
  const columns = drill.map((n): TabNote[] => [{ key: posKey(n), string: n.string, fret: n.fret, midi: n.midi }]);
  const dots: FretDot[] = drill.map((n) => ({
    key: posKey(n),
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: String(n.finger),
    tone: now && posKey(now) === posKey(n) ? 'home' : 'plain',
  }));
  const active = now ? [posKey(now)] : [];
  const change = (fn: () => void) => {
    clock.stop();
    fn();
  };

  return (
    <div className="board">
      <div className="checklist">
        <h3>{c.checklistTitle}</h3>
        <ul>
          {c.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div className="controls">
        <ChipGroup<number>
          label={c.startFret}
          items={DRILL_START_FRETS.map((f) => ({ value: f, text: f }))}
          value={startFret}
          onChange={(f) => change(() => setStartFret(f))}
        />
        <ChipGroup<1 | 2>
          label={c.perBeat}
          items={[
            { value: 1, text: 1 },
            { value: 2, text: 2 },
          ]}
          value={perBeat}
          onChange={(p) => change(() => setPerBeat(p))}
        />
      </div>
      <div className="controls">
        <Transport copy={copy} playing={clock.playing} toggle={clock.toggle} bpm={bpm} setBpm={setBpm} best={best} />
      </div>
      <Tab columns={columns} label={c.tab} active={active} column={clock.current} />
      <Fretboard geometry={g} dots={dots} label={c.tab} active={active} />
      <p className="caption" aria-live="polite">
        {now ? fill(c.caption, { string: now.string, fret: now.fret, finger: now.finger }) : c.idle}
      </p>
    </div>
  );
}
