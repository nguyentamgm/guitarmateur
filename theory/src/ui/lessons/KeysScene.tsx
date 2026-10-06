/** The five scenes of "Keys and progressions". Every chord and voicing comes from lessons/keys. */
import { useMemo, useState } from 'react';
import { loopTravel } from '../../core/fretboard';
import { format, type Mode, type NoteName, type ProgressionId } from '../../core/music';
import { fill } from '../../i18n';
import {
  APPROACHES,
  FAMILY_TONIC,
  KEYS_FRETS,
  KEY_CHOICES,
  NUMBERS_TONIC,
  NUMBER_PROGRESSIONS,
  RELATIVE_TONIC,
  TWO_FIVE_TONIC,
  approachLoop,
  family,
  homePentatonic,
  homeQuestion,
  homeTonic,
  judgeHome,
  progressionViews,
  pullViews,
  quality,
  relativeChords,
  relativeLoop,
  scaleRow,
  stackIndices,
  type Approach,
  type ChordView,
  type HomeQuestion,
  type HomeResult,
  type SceneCopy,
  type Size,
  type StepId,
} from '../../lessons/keys';
import { BarGrid } from '../BarGrid';
import { BarreBar } from '../BarreBar';
import { Button, ChipGroup, KeyFinder } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { neckGeometry } from '../geometry';
import { degreeText, posKey } from '../keys';
import { useSequence } from '../useSequence';
import { useStrum } from '../useStrum';

export function KeysScene({ step, copy }: { step: StepId; copy: SceneCopy }) {
  switch (step) {
    case 'family':
      return <FamilyScene copy={copy} />;
    case 'numbers':
      return <NumbersScene copy={copy} />;
    case 'home':
      return <HomeScene copy={copy} />;
    case 'twoFive':
      return <TwoFiveScene copy={copy} />;
    case 'relative':
      return <RelativeScene copy={copy} />;
  }
}

/** Seconds between chords of a loop, and of a lead-in. */
const LOOP_MS = 1500;
const LEAD_MS = 1100;

const useNeck = () => useMemo(() => neckGeometry(KEYS_FRETS, { fretWidth: 46 }), []);

const chordDots = (view: ChordView): FretDot[] =>
  view.notes.map((n) => ({
    key: posKey(n),
    string: n.string,
    fret: n.fret,
    midi: n.midi,
    label: degreeText(n.degree),
    tone: n.degree === '1' ? 'home' : 'plain',
  }));

function QualityLegend({ copy }: { copy: SceneCopy }) {
  return (
    <div className="legend">
      {(['major', 'minor', 'dim'] as const).map((q) => (
        <span key={q}>
          <i className={`swatch q-${q}`} />
          {copy.quality[q]}
        </span>
      ))}
    </div>
  );
}

const placeKey = (v: ChordView) => `${v.shape ?? 'stack'}${v.fret}`;

/** A loop on the neck: the chord being heard, the barres of the others faint (a repeated chord drawn once). */
function LoopNeck({ path, current, label }: { path: readonly ChordView[]; current: number | null; label: string }) {
  const g = useNeck();
  const now = path[current ?? 0]!;
  const others = [...new Map(path.filter((v) => placeKey(v) !== placeKey(now)).map((v) => [placeKey(v), v])).values()];
  return (
    <Fretboard geometry={g} dots={chordDots(now)} label={label}>
      {others.map((v) => (
        <BarreBar key={placeKey(v)} g={g} view={v} faint />
      ))}
      <BarreBar g={g} view={now} />
    </Fretboard>
  );
}

const bars = (path: readonly ChordView[]) => path.map((v) => ({ degree: v.roman, symbol: v.symbol }));
const symbols = (path: readonly ChordView[]) => path.map((v) => v.symbol).join(' ');

// --- Step 1 ---

function FamilyScene({ copy }: { copy: SceneCopy }) {
  const c = copy.family;
  const strum = useStrum();
  const g = useNeck();
  const [tonic, setTonic] = useState<NoteName>(FAMILY_TONIC);
  const [size, setSize] = useState<Size>(3);
  const [degree, setDegree] = useState(1);
  const chords = useMemo(() => family(tonic, size), [tonic, size]);
  const scale = useMemo(() => scaleRow(tonic), [tonic]);
  const all = useSequence(7, LEAD_MS, (i) => {
    setDegree(i + 1);
    strum(chords[i]!);
  });
  const view = chords[degree - 1]!;
  const picked = stackIndices(degree, size);
  const caption = fill(c.caption, {
    roman: view.roman,
    symbol: view.symbol,
    notes: picked.map((i) => format(scale[i]!)).join(' '),
    start: format(scale[degree - 1]!),
  });
  const choose = (d: number) => {
    all.stop();
    setDegree(d);
    strum(chords[d - 1]!);
  };

  return (
    <div className="board">
      <KeyFinder keys={KEY_CHOICES} label={copy.key} value={tonic} onChange={(k) => setTonic(k)} />
      <div className="controls">
        <ChipGroup<Size>
          label={c.size}
          items={[
            { value: 3, text: c.triads },
            { value: 4, text: c.sevenths },
          ]}
          value={size}
          onChange={setSize}
        />
        <Button onClick={all.toggle}>{all.playing ? copy.stop : c.playAll}</Button>
      </div>
      <ol className="letters" aria-label={c.scale}>
        {scale.map((note, i) => (
          <li key={i} className={picked[0] === i ? 'pick root' : picked.includes(i) ? 'pick' : undefined}>
            <b>{i + 1}</b>
            <span>{format(note)}</span>
          </li>
        ))}
      </ol>
      <div className="degrees">
        {chords.map((v, i) => (
          <button key={i} type="button" className={`q-${quality(v.chord.id)}`} aria-pressed={degree === i + 1} onClick={() => choose(i + 1)}>
            <b>{v.roman}</b>
            <span>{v.symbol}</span>
          </button>
        ))}
      </div>
      <QualityLegend copy={copy} />
      <Fretboard geometry={g} dots={chordDots(view)} label={caption}>
        <BarreBar g={g} view={view} />
      </Fretboard>
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 2 ---

const progressionText = (id: ProgressionId) => id.replaceAll('-', '–');

function NumbersScene({ copy }: { copy: SceneCopy }) {
  const c = copy.numbers;
  const strum = useStrum();
  const [tonic, setTonic] = useState<NoteName>(NUMBERS_TONIC);
  const [id, setId] = useState<ProgressionId>('I-V-vi-IV');
  const path = useMemo(() => progressionViews(tonic, id), [tonic, id]);
  const seq = useSequence(path.length, LOOP_MS, (i) => strum(path[i]!), true);
  const caption = fill(c.caption, { key: format(tonic), chords: symbols(path), travel: loopTravel(path.map((v) => v.fret)) });
  const pick = (next: ProgressionId) => {
    seq.stop();
    setId(next);
  };
  const move = (k: NoteName) => {
    seq.stop();
    setTonic(k);
  };

  return (
    <div className="board">
      <KeyFinder keys={KEY_CHOICES} label={copy.key} value={tonic} onChange={move} />
      <div className="controls">
        <ChipGroup<ProgressionId> label={c.progression} items={NUMBER_PROGRESSIONS.map((p) => ({ value: p, text: progressionText(p) }))} value={id} onChange={pick} />
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.playLoop}</Button>
      </div>
      <BarGrid label={c.grid} bars={bars(path)} current={seq.current} />
      <LoopNeck path={path} current={seq.current} label={caption} />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 3 ---

function HomeScene({ copy }: { copy: SceneCopy }) {
  const c = copy.home;
  const strum = useStrum();
  const g = useNeck();
  const [q, setQ] = useState<HomeQuestion>(() => homeQuestion(Math.random));
  const [tried, setTried] = useState<ReadonlyMap<number, HomeResult>>(new Map());
  const [score, setScore] = useState({ right: 0, total: 0, streak: 0 });
  const lead = useSequence(q.lead.length, LEAD_MS, (i) => strum(q.lead[i]!));
  const solved = [...tried.values()].includes('right');
  const home = q.choices.find((v) => judgeHome(v) === 'right')!;

  const answer = (i: number) => {
    if (solved || tried.has(i)) return;
    lead.stop();
    const choice = q.choices[i]!;
    const result = judgeHome(choice);
    strum(q.lead.at(-1)!);
    strum(choice, LEAD_MS / 1000);
    setTried((t) => new Map(t).set(i, result));
    if (result === 'right') {
      const clean = tried.size === 0;
      setScore((s) => ({ right: s.right + (clean ? 1 : 0), total: s.total + 1, streak: clean ? s.streak + 1 : 0 }));
    }
  };
  const next = () => {
    lead.stop();
    if (!solved) setScore((s) => ({ ...s, total: s.total + 1, streak: 0 }));
    setQ((prev) => homeQuestion(Math.random, prev));
    setTried(new Map());
  };
  const last = [...tried.entries()].at(-1);
  /** On the neck: the chord being heard, else the last answer, else where the lead-in stops. */
  const shown = lead.current !== null ? q.lead[lead.current]! : last ? q.choices[last[0]]! : q.lead.at(-1)!;
  const message = (() => {
    if (!last) return '';
    const v = q.choices[last[0]]!;
    switch (last[1]) {
      case 'right':
        return fill(c.right, { symbol: v.symbol, key: format(q.tonic) });
      case 'vi':
        return fill(c.vi, { symbol: v.symbol, home: home.symbol });
      case 'away':
        return fill(c.away, { symbol: v.symbol, roman: v.roman });
    }
  })();

  return (
    <div className="board">
      <div className="quiz">
        <span className="question">{c.question}</span>
        <Button onClick={lead.toggle}>{lead.playing ? copy.stop : c.listen}</Button>
        <Button onClick={next} ghost>
          {c.next}
        </Button>
        <span className="muted small">{fill(c.score, score)}</span>
      </div>
      <ol className="chordpath" aria-label={c.leadIn}>
        {q.lead.map((v, i) => (
          <li key={i} className={lead.current === i ? 'on' : undefined}>
            {solved ? `${v.roman} · ${v.symbol}` : v.symbol}
          </li>
        ))}
        <li className="ask" aria-hidden="true">
          ?
        </li>
      </ol>
      <div className="degrees answers" role="group" aria-label={c.choices}>
        {q.choices.map((v, i) => {
          const result = tried.get(i);
          return (
            <button key={i} type="button" className={result ? `tried ${result}` : undefined} aria-pressed={result !== undefined} onClick={() => answer(i)}>
              <b>{result || solved ? v.roman : ' '}</b>
              <span>{v.symbol}</span>
            </button>
          );
        })}
      </div>
      <Fretboard geometry={g} dots={chordDots(shown)} label={shown.symbol}>
        <BarreBar g={g} view={shown} />
      </Fretboard>
      <p className={solved ? 'caption good' : 'caption'} aria-live="polite">
        {message}
      </p>
    </div>
  );
}

// --- Step 4 ---

function TwoFiveScene({ copy }: { copy: SceneCopy }) {
  const c = copy.twoFive;
  const strum = useStrum();
  const [tonic, setTonic] = useState<NoteName>(TWO_FIVE_TONIC);
  const [target, setTarget] = useState<Approach>('IV');
  const pull = useMemo(() => pullViews(tonic), [tonic]);
  const [resolved, setResolved] = useState<boolean | null>(null);
  const hang = useSequence(3, LEAD_MS, (i) => strum(pull[i]!));
  const resolve = useSequence(4, LEAD_MS, (i) => strum(pull[i]!));
  const path = useMemo(() => approachLoop(tonic, target), [tonic, target]);
  const loop = useSequence(path.length, LOOP_MS, (i) => strum(path[i]!), true);

  const stopAll = () => [hang, resolve, loop].forEach((s) => s.stop());
  const playPull = (home: boolean) => {
    stopAll();
    setResolved(home);
    (home ? resolve : hang).start();
  };
  const move = (k: NoteName) => {
    stopAll();
    setTonic(k);
  };
  const choose = (a: Approach) => {
    loop.stop();
    setTarget(a);
  };
  const playLoop = () => {
    if (loop.playing) return loop.stop();
    hang.stop();
    resolve.stop();
    loop.start();
  };
  const playing = hang.playing ? hang.current : resolve.current;
  const v7 = pull[2]!.symbol;
  const i = pull[0]!.symbol;
  const pullCaption = resolved === null ? '' : fill(resolved ? c.resolveCaption : c.hangCaption, { v: v7, i });
  const at = path.findIndex((v) => v.roman.startsWith('ii7'));
  const caption =
    target === 'off'
      ? fill(c.offCaption, { chords: symbols(path) })
      : fill(c.onCaption, { ii: path[at]!.symbol, v: path[at + 1]!.symbol, target: path[at + 2]!.symbol });
  const targetText: Record<Approach, string> = { off: c.off, I: c.intoI, IV: c.intoIV };

  return (
    <div className="board">
      <KeyFinder keys={KEY_CHOICES} label={copy.key} value={tonic} onChange={move} />
      <div className="controls">
        <div className="group" role="group" aria-label={c.pull}>
          <span aria-hidden="true">{c.pull}</span>
          <Button onClick={() => playPull(false)} ghost>
            {c.hang}
          </Button>
          <Button onClick={() => playPull(true)}>{c.resolve}</Button>
        </div>
      </div>
      <ol className="chordpath">
        {pull.map((v, k) => (
          <li key={k} className={[playing === k ? 'on' : '', k === 3 && resolved === false ? 'ghost' : ''].join(' ').trim() || undefined}>
            {`${v.roman} · ${v.symbol}`}
          </li>
        ))}
      </ol>
      <p className="caption" aria-live="polite">
        {pullCaption}
      </p>
      <div className="controls">
        <ChipGroup<Approach> label={c.approach} items={APPROACHES.map((a) => ({ value: a, text: targetText[a] }))} value={target} onChange={choose} />
        <Button onClick={playLoop}>{loop.playing ? copy.stop : copy.playLoop}</Button>
      </div>
      <BarGrid label={c.grid} bars={bars(path)} current={loop.current} />
      <LoopNeck path={path} current={loop.current} label={caption} />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}

// --- Step 5 ---

function RelativeScene({ copy }: { copy: SceneCopy }) {
  const c = copy.relative;
  const strum = useStrum();
  const g = useNeck();
  const [tonic, setTonic] = useState<NoteName>(RELATIVE_TONIC);
  const [home, setHome] = useState<Mode>('major');
  const chords = useMemo(() => relativeChords(tonic), [tonic]);
  const path = useMemo(() => relativeLoop(tonic, home), [tonic, home]);
  const scale = useMemo(() => homePentatonic(tonic, home), [tonic, home]);
  const seq = useSequence(path.length, LOOP_MS, (i) => strum(path[i]!), true);
  const root = format(homeTonic(tonic, home));
  const majorRoot = format(tonic);
  const minorRoot = format(homeTonic(tonic, 'minor'));
  const now = seq.current === null ? null : path[seq.current]!;
  const caption = fill(c.caption, {
    chords: symbols(path),
    root,
    scale: fill(home === 'major' ? c.majorScale : c.minorScale, { root }),
  });
  const dots: FretDot[] = scale.map((d) => ({
    key: posKey(d),
    string: d.string,
    fret: d.fret,
    midi: d.midi,
    label: d.name,
    tone: d.root ? (home === 'major' ? 'homeMajor' : 'home') : 'plain',
  }));
  const move = (k: NoteName) => {
    seq.stop();
    setTonic(k);
  };
  const choose = (m: Mode) => {
    seq.stop();
    setHome(m);
  };

  return (
    <div className="board">
      <KeyFinder keys={KEY_CHOICES} label={copy.key} value={tonic} onChange={move} />
      <div className="controls">
        <ChipGroup<Mode>
          label={c.home}
          items={[
            { value: 'major', text: fill(c.majorHome, { root: majorRoot }) },
            { value: 'minor', text: fill(c.minorHome, { root: minorRoot }) },
          ]}
          value={home}
          onChange={choose}
        />
        <Button onClick={seq.toggle}>{seq.playing ? copy.stop : copy.playLoop}</Button>
      </div>
      <div className="scroll">
        <table className="numerals">
          <tbody>
            <tr className={home === 'major' ? 'on major' : undefined}>
              <th scope="row">{fill(c.rowMajor, { root: majorRoot })}</th>
              {chords.map((ch, i) => (
                <td key={i}>{ch.major}</td>
              ))}
            </tr>
            <tr className="symbols">
              <th scope="row" />
              {chords.map((ch, i) => (
                <td key={i} className={[`q-${quality(ch.chord.id)}`, now?.symbol === ch.symbol ? 'on' : ''].join(' ').trim()}>
                  {ch.symbol}
                </td>
              ))}
            </tr>
            <tr className={home === 'minor' ? 'on minor' : undefined}>
              <th scope="row">{fill(c.rowMinor, { root: minorRoot })}</th>
              {chords.map((ch, i) => (
                <td key={i}>{ch.minor}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <ol className="chordpath">
        {path.map((v, i) => (
          <li key={i} className={seq.current === i ? 'on' : undefined}>
            {`${v.roman} · ${v.symbol}`}
          </li>
        ))}
      </ol>
      <Fretboard geometry={g} dots={dots} label={caption} />
      <p className="caption" aria-live="polite">
        {caption}
      </p>
    </div>
  );
}
