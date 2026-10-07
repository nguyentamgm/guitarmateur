/** The five scenes of "Soloing over the changes". Backings, boxes, targets and phrases come from lessons/solo. */
import { useMemo, useState, type ReactNode } from 'react';
import { EIGHTHS_PER_BAR, seededRandom } from '../../core/audio';
import { LICK_EIGHTHS, SCALES, format, type DegreeLabel, type NoteName, type ScaleId } from '../../core/music';
import { cellSeconds } from '../../core/rhythm';
import { fill } from '../../i18n';
import {
  BACKINGS,
  BACKING_IDS,
  EAR_BPM,
  PHRASE_BARS,
  SOLO_FRETS,
  backingBars,
  backingKeys,
  backingWindow,
  earQuestion,
  earWindow,
  guideLine,
  judgeEar,
  outsideNotes,
  phrase,
  phraseRole,
  soloWindow,
  toneIn,
  uniqueChords,
  wrongScale,
  type BackingBar,
  type BackingId,
  type EarNote,
  type SceneCopy,
  type SoloNote,
  type SoloWindow,
  type StepId,
} from '../../lessons/solo';
import { BarGrid } from '../BarGrid';
import { useTheory } from '../context';
import { TrainerLink } from '../TrainerLink';
import { Button, ChipGroup, KeyFinder, OnOff, Tempo } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { neckGeometry } from '../geometry';
import { degreeText, posKey } from '../keys';
import { Tab, type TabNote } from '../Tab';
import { useBacking, type Backing } from '../useBacking';
import { useClock } from '../useClock';

export function SoloScene({ step, copy }: { step: StepId; copy: SceneCopy }) {
  switch (step) {
    case 'scale':
      return <ScaleScene copy={copy} />;
    case 'tones':
      return <TonesScene copy={copy} />;
    case 'guide':
      return <GuideScene copy={copy} />;
    case 'phrase':
      return <PhraseScene copy={copy} />;
    case 'ear':
      return <EarScene copy={copy.ear} />;
  }
}

const useNeck = () => useMemo(() => neckGeometry(SOLO_FRETS, { fretWidth: 46 }), []);

/** The backing, key and tempo a scene plays: picking a backing resets its key and tempo. */
function useBackingChoice() {
  const [id, setId] = useState<BackingId>('blues');
  const [tonic, setTonic] = useState<NoteName>(BACKINGS.blues.tonic);
  const [bpm, setBpm] = useState(BACKINGS.blues.bpm);
  const bars = useMemo(() => backingBars(id, tonic), [id, tonic]);
  const box = useMemo(() => backingWindow(id, tonic), [id, tonic]);
  const choose = (next: BackingId) => {
    setId(next);
    setTonic(BACKINGS[next].tonic);
    setBpm(BACKINGS[next].bpm);
  };
  return { id, tonic, setTonic, bpm, setBpm, bars, box, choose };
}
type BackingChoice = ReturnType<typeof useBackingChoice>;

function BackingControls({ copy, choice, backing, children }: { copy: SceneCopy; choice: BackingChoice; backing: Backing; children?: ReactNode }) {
  const change = (fn: () => void) => {
    backing.stop();
    fn();
  };
  return (
    <>
      <div className="controls">
        <ChipGroup<BackingId>
          label={copy.backing}
          items={BACKING_IDS.map((b) => ({ value: b, text: copy.backings[b] }))}
          value={choice.id}
          onChange={(b) => change(() => choice.choose(b))}
        />
      </div>
      <KeyFinder keys={backingKeys(choice.id)} label={copy.key} value={choice.tonic} onChange={(k) => change(() => choice.setTonic(k))} />
      <div className="controls">
        <Button onClick={backing.toggle}>{backing.playing ? copy.stop : copy.play}</Button>
        <Tempo label={copy.tempo} text={fill(copy.bpm, { bpm: choice.bpm })} bpm={choice.bpm} onChange={choice.setBpm} />
        {children}
      </div>
    </>
  );
}

const scaleName = (copy: SceneCopy, scale: ScaleId, tonic: NoteName) => fill(copy.scales[scale] ?? '{root}', { root: format(tonic) });

/** A note of the box: its scale degree, the home note marked, added notes (blue note, 4 and 7) set apart. */
function scaleDot(n: SoloNote, minor: boolean): FretDot {
  return {
    key: posKey(n),
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: degreeText(n.degree),
    tone: n.isTonic ? (minor ? 'home' : 'homeMajor') : n.isAdded ? (minor ? 'blue' : 'soft') : 'plain',
  };
}
const isMinorScale = (w: SoloWindow) => SCALES[w.scale].quality === 'minor';

/** A note of the box, dimmed and unlabelled: the background a target stands out from. */
const quietDot = (n: SoloNote): FretDot => ({ key: posKey(n), string: n.string, fret: n.fret, midi: n.midi, dim: true });

// --- Step 1 ---

function ScaleScene({ copy }: { copy: SceneCopy }) {
  const c = copy.scale;
  const g = useNeck();
  const choice = useBackingChoice();
  const [wrong, setWrong] = useState(false);
  const backing = useBacking(choice.bars, BACKINGS[choice.id].style, choice.bpm);
  const scale = wrong ? wrongScale(choice.id) : BACKINGS[choice.id].scale;
  const wrongBox = useMemo(() => soloWindow(choice.tonic, wrongScale(choice.id)), [choice.tonic, choice.id]);
  const box = wrong ? wrongBox : choice.box;
  const name = scaleName(copy, scale, choice.tonic);
  const caption = !wrong
    ? `${box.minFret === 0 ? fill(c.captionOpen, { scale: name }) : fill(c.caption, { scale: name, fret: box.minFret })} ${c.styles[choice.id]}`
    : choice.id === 'blues'
      ? fill(c.wrongBlues, { scale: name })
      : fill(c.wrongCaption, { scale: name, notes: outsideNotes(choice.id, choice.tonic).join(', ') });

  return (
    <div className="board">
      <BackingControls copy={copy} choice={choice} backing={backing}>
        <ChipGroup<'right' | 'wrong'>
          label={c.choice}
          items={[
            { value: 'right', text: c.right },
            { value: 'wrong', text: c.wrong },
          ]}
          value={wrong ? 'wrong' : 'right'}
          onChange={(v) => setWrong(v === 'wrong')}
        />
      </BackingControls>
      <Fretboard geometry={g} dots={box.notes.map((n) => scaleDot(n, isMinorScale(box)))} box={box} label={fill(copy.neck, { scale: name })} />
      <BarGrid label={copy.grid} bars={choice.bars} current={backing.bar} />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
      <TrainerLink trainerKey={{ tonic: choice.tonic, scale: BACKINGS[choice.id].scale }} chords={choice.bars.map((b) => b.chord)} />
    </div>
  );
}

// --- Step 2 ---

/** "D (1), A (5), C (♭7)": the chord tones in the box, in the chord's order. */
function toneList(box: SoloWindow, bar: BackingBar): string {
  const seen = new Map<string, DegreeLabel>();
  for (const n of box.notes) {
    const d = toneIn(n, bar.chord);
    if (d && !seen.has(n.name)) seen.set(n.name, d);
  }
  const order = (d: string) => Number(d.replace(/\D/g, ''));
  return [...seen]
    .sort((a, b) => order(a[1]) - order(b[1]))
    .map(([name, d]) => `${name} (${degreeText(d)})`)
    .join(', ');
}

function TonesScene({ copy }: { copy: SceneCopy }) {
  const c = copy.tones;
  const g = useNeck();
  const choice = useBackingChoice();
  const [picked, setPicked] = useState(0);
  const backing = useBacking(choice.bars, BACKINGS[choice.id].style, choice.bpm);
  const chords = uniqueChords(choice.bars);
  const pick = (b: BackingId) => {
    setPicked(0);
    choice.choose(b);
  };
  const bar = backing.bar === null ? chords[Math.min(picked, chords.length - 1)]! : choice.bars[backing.bar]!;
  const dots = choice.box.notes.map((n): FretDot => {
    const d = toneIn(n, bar.chord);
    return d ? { ...quietDot(n), dim: false, label: degreeText(d), tone: d === '1' ? 'home' : 'plain' } : quietDot(n);
  });
  const tones = toneList(choice.box, bar);
  const name = scaleName(copy, BACKINGS[choice.id].scale, choice.tonic);

  return (
    <div className="board">
      <BackingControls copy={copy} choice={{ ...choice, choose: pick }} backing={backing}>
        <ChipGroup
          label={c.chord}
          items={chords.map((b, i) => ({ value: i, text: b.symbol }))}
          value={backing.bar === null ? picked : chords.findIndex((b) => b.symbol === bar.symbol)}
          onChange={(i) => {
            backing.stop();
            setPicked(i);
          }}
        />
      </BackingControls>
      <Fretboard geometry={g} dots={dots} box={choice.box} label={fill(copy.neck, { scale: name })} />
      <BarGrid label={copy.grid} bars={choice.bars} current={backing.bar} />
      <p className="caption" aria-live="polite">
        {backing.bar === null ? fill(c.caption, { symbol: bar.symbol, tones }) : fill(c.playing, { n: backing.bar + 1, symbol: bar.symbol, tones })}
      </p>
    </div>
  );
}

// --- Step 3 ---

const isThird = (d: string) => d === '3' || d === 'b3';

function GuideScene({ copy }: { copy: SceneCopy }) {
  const c = copy.guide;
  const g = useNeck();
  const choice = useBackingChoice();
  const { player } = useTheory();
  const [withLine, setWithLine] = useState(true);
  const line = useMemo(() => guideLine(choice.box, choice.bars), [choice.box, choice.bars]);
  const backing = useBacking(choice.bars, BACKINGS[choice.id].style, choice.bpm, ({ bar, eighth, at, seconds }) => {
    if (withLine && eighth === 0) player.pluck(line[bar]!.note.midi, at, seconds(EIGHTHS_PER_BAR) * 0.95);
  });
  const at = backing.bar ?? 0;
  const now = line[at]!;
  const lineKeys = new Set(line.map((x) => posKey(x.note)));
  const dots = choice.box.notes.map((n): FretDot =>
    lineKeys.has(posKey(n)) ? { ...quietDot(n), dim: false, label: n.name, tone: posKey(n) === posKey(now.note) ? 'home' : 'soft' } : quietDot(n),
  );
  // The line as it moves: a run of bars on one target counts once.
  const moves = line.filter((x, i) => i === 0 || posKey(x.note) !== posKey(line[i - 1]!.note));
  const fields = { n: at + 1, symbol: now.bar.symbol, name: now.note.name, degree: degreeText(now.degree) };
  const name = scaleName(copy, BACKINGS[choice.id].scale, choice.tonic);

  return (
    <div className="board">
      <BackingControls copy={copy} choice={choice} backing={backing}>
        <OnOff label={c.withLine} on={c.on} off={c.off} value={withLine} onChange={setWithLine} />
      </BackingControls>
      <Fretboard geometry={g} dots={dots} box={choice.box} active={[posKey(now.note)]} label={fill(copy.neck, { scale: name })}>
        <polyline className="guideline" points={moves.map((x) => `${g.x(x.note.fret)},${g.y(x.note.string)}`).join(' ')} />
      </Fretboard>
      <BarGrid label={copy.grid} bars={choice.bars} current={backing.bar} />
      <p className="caption" aria-live="polite">
        {fill(isThird(now.degree) ? c.caption : c.fallback, fields)} {fill(c.line, { line: moves.map((x) => x.note.name).join(' – ') })}
      </p>
    </div>
  );
}

// --- Step 4 ---

const newSeed = () => Math.floor(Math.random() * 2 ** 31);

function PhraseScene({ copy }: { copy: SceneCopy }) {
  const c = copy.phrase;
  const g = useNeck();
  const choice = useBackingChoice();
  const { player } = useTheory();
  const [seed, setSeed] = useState(newSeed);
  const lines = useMemo(() => phrase(choice.box, choice.bars, seededRandom(seed)), [choice.box, choice.bars, seed]);
  const backing = useBacking(choice.bars, BACKINGS[choice.id].style, choice.bpm, ({ bar, eighth, at, seconds }) => {
    for (const x of lines[bar]!) if (x.at === eighth) player.pluck(x.note.midi, at, seconds(x.length) * 0.95);
  });

  const at = backing.bar ?? 0;
  const first = at - (at % PHRASE_BARS);
  const group = lines.slice(first, first + PHRASE_BARS);
  const columns: TabNote[][] = [];
  const counts: string[] = [];
  const barLines: number[] = [];
  const columnOf = new Map<string, number>();
  group.forEach((notes, k) => {
    if (k > 0) barLines.push(columns.length);
    if (notes.length === 0) {
      columns.push([]);
      counts.push(c.yourTurn);
      return;
    }
    for (const x of notes) {
      columnOf.set(`${k}:${x.at}`, columns.length);
      columns.push([{ key: `${k}:${x.at}`, string: x.note.string, fret: x.note.fret, midi: x.note.midi }]);
      counts.push(x.at % 2 === 0 ? String(x.at / 2 + 1) : fill(c.offbeat, { n: Math.floor(x.at / 2) + 1 }));
    }
  });
  const eighth = backing.current === null ? null : backing.current % EIGHTHS_PER_BAR;
  const sounding = backing.bar === null || eighth === null ? undefined : lines[backing.bar]!.find((x) => x.at <= eighth && eighth < x.at + x.length);
  const column = sounding ? (columnOf.get(`${at - first}:${sounding.at}`) ?? null) : null;
  const groupKeys = new Set(group.flat().map((x) => posKey(x.note)));
  const dots = choice.box.notes.map((n) => (groupKeys.has(posKey(n)) ? { ...quietDot(n), dim: false, label: n.name } : quietDot(n)));

  const role = phraseRole(at);
  const ending = lines[at]!.at(-1);
  const caption =
    backing.bar === null
      ? c.idle
      : fill(c.roles[role], { n: at + 1, name: ending?.note.name ?? '', degree: ending ? degreeText(toneIn(ending.note, choice.bars[at]!.chord) ?? ending.note.degree) : '', symbol: choice.bars[at]!.symbol });
  const name = scaleName(copy, BACKINGS[choice.id].scale, choice.tonic);

  return (
    <div className="board">
      <BackingControls copy={copy} choice={choice} backing={backing}>
        <Button ghost onClick={() => setSeed(newSeed())}>
          {c.newIdea}
        </Button>
      </BackingControls>
      <Fretboard geometry={g} dots={dots} box={choice.box} active={sounding ? [posKey(sounding.note)] : []} label={fill(copy.neck, { scale: name })} />
      <Tab columns={columns} counts={counts} barLines={barLines} column={column} active={sounding ? [`${at - first}:${sounding.at}`] : []} label={c.tab} />
      <BarGrid label={copy.grid} bars={choice.bars} current={backing.bar} />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 5 ---

type EarHelp = 'first' | 'none';

function EarScene({ copy }: { copy: SceneCopy['ear'] }) {
  const { player, recordQuiz } = useTheory();
  const g = useNeck();
  const box = useMemo(() => earWindow(), []);
  const [question, setQuestion] = useState<EarNote[]>(() => earQuestion(box, Math.random));
  const [help, setHelp] = useState<EarHelp>('first');
  const start = help === 'first' ? 1 : 0;
  const [found, setFound] = useState(start);
  const [missed, setMissed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const solved = found >= question.length;

  const cell = cellSeconds(EAR_BPM, 2);
  const clock = useClock(
    LICK_EIGHTHS,
    cell,
    (i, delay) => {
      for (const n of question) if (n.at === i) player.pluck(n.midi, delay, n.length * cell * 0.95);
    },
    false,
  );

  const settle = (right: boolean) => {
    setScore((s) => ({ right: s.right + (right ? 1 : 0), total: s.total + 1 }));
    recordQuiz('solo-ear', right);
  };
  const reset = (q: EarNote[], h: EarHelp) => {
    clock.stop();
    setQuestion(q);
    setFound(h === 'first' ? 1 : 0);
    setMissed(false);
    setMessage(null);
  };
  const next = () => {
    // Skipping an idea you have not found counts as a miss, as in every quiz.
    if (!solved) settle(false);
    reset(earQuestion(box, Math.random, question), help);
  };
  const chooseHelp = (h: EarHelp) => {
    // Leaving an idea you already missed counts, as "next" does; switching before trying does not.
    if (!solved && missed) settle(false);
    setHelp(h);
    reset(earQuestion(box, Math.random, question), h);
  };
  const click = (d: FretDot) => {
    if (solved) return;
    const r = judgeEar(question, found, d.midi);
    // Notes already found (or given) just play again: hearing them is not an answer.
    if (r.kind === 'wrong' && question.slice(0, found).some((n) => n.midi === d.midi)) return;
    if (r.kind === 'wrong') {
      setMissed(true);
      return setMessage(fill(r.direction === 'higher' ? copy.higher : copy.lower, { name: d.label ?? '' }));
    }
    const now = found + 1;
    setFound(now);
    if (now < question.length) return setMessage(fill(copy.progress, { found: now, count: question.length }));
    settle(!missed);
    const notes = question.map((n) => degreeText(n.degree)).join(' ');
    setMessage(fill(missed ? copy.solvedMissed : copy.solved, { notes }));
  };

  const shown = new Set(question.slice(0, found).map(posKey));
  const dots = box.notes.map((n): FretDot => ({
    key: posKey(n),
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: n.name,
    tone: shown.has(posKey(n)) ? 'home' : 'plain',
  }));
  // While playing, light the notes only once the idea is found: lighting them earlier gives it away.
  const sounding = solved && clock.current !== null ? question.filter((n) => n.at <= clock.current! && clock.current! < n.at + n.length) : [];

  return (
    <div className="board">
      <div className="controls">
        <Button onClick={clock.toggle}>{clock.playing ? copy.stop : copy.hear}</Button>
        <Button onClick={next} ghost>
          {copy.next}
        </Button>
        <ChipGroup<EarHelp>
          label={copy.help}
          items={[
            { value: 'first', text: copy.helpFirst },
            { value: 'none', text: copy.helpNone },
          ]}
          value={help}
          onChange={chooseHelp}
        />
        <span className="muted small">{fill(copy.score, score)}</span>
      </div>
      <Fretboard geometry={g} dots={dots} label={copy.neck} box={box} active={sounding.map(posKey)} onDot={click} />
      <p className={solved ? 'caption good' : 'caption'} aria-live="polite">
        {message ?? (start > 0 ? fill(copy.progress, { found, count: question.length }) : copy.idle)}
      </p>
    </div>
  );
}
