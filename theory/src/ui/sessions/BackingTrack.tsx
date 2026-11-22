import { useEffect, useMemo, useState } from 'react';
import { EIGHTHS_PER_BAR, STYLE_SWINGS, chordMidis } from '../../core/audio';
import { parseNote } from '../../core/music';
import { lickNotes, lickNotesFrom, lickPlan, planGlide } from '../../lessons/blues';
import { guideTonePositions, soloWindow, toneIn } from '../../lessons/solo';
import { chordIn, type Block } from '../../sessions';
import { chordShape, shapeMidis } from '../../sessions/voicing';
import { BarGrid } from '../BarGrid';
import { useTheory } from '../context';
import { Button, ChipGroup, Tempo } from '../controls';
import { Fretboard, type FretDot } from '../Fretboard';
import { useNeckGeometry } from '../geometry';
import { degreeText, posKey } from '../keys';
import { useBacking } from '../useBacking';
import { useSessionStrumSpeed } from './sessionSettingsContext';
import { STRUM_SPREADS } from './strumSpeed';

const isCallBar = (bar: number) => bar % 4 < 2;

export function BackingTrack({
  block,
  label,
}: {
  block: Extract<Block, { kind: 'backingTrack' }>;
  label: string;
}) {
  const { player, ui } = useTheory();
  const [tonic, setTonic] = useState(block.in.tonic);
  const [bpm, setBpm] = useState(block.bpm);
  const speed = useSessionStrumSpeed();
  const strums = block.style === 'strum' || block.style === 'comp';
  const swing = STYLE_SWINGS[block.style] ? 1 : 0;
  const box = useMemo(
    () => block.scale && soloWindow(parseNote(tonic), block.scale, block.notesPerString),
    [block.scale, block.notesPerString, tonic],
  );
  const callPlans = useMemo(() => {
    if (!block.call) return null;
    const notes =
      block.notesPerString === 3 && box
        ? lickNotesFrom(box.notes, block.call)
        : lickNotes(
            parseNote(tonic),
            block.call,
            1,
            block.scale === 'minorBlues' ? block.scale : undefined,
          );
    return new Map(lickPlan(notes).map((plan) => [plan.cell, plan]));
  }, [block.call, block.notesPerString, block.scale, box, tonic]);
  useEffect(() => {
    if (block.call) return () => player.cancel();
  }, [block.call, player]);
  const bars = useMemo(
    () =>
      block.bars.map((spec) => {
        const { roman, symbol, chord } = chordIn({ tonic, mode: block.in.mode }, spec);
        const midis = strums
          ? shapeMidis(chordShape(chord))
          : block.fullChords
            ? chordMidis(chord)
            : undefined;
        return {
          degree: roman,
          symbol,
          chord,
          midis,
        };
      }),
    [block, tonic, strums],
  );
  const backing = useBacking(
    bars,
    block.style,
    bpm,
    callPlans
      ? ({ bar, eighth, at, seconds }) => {
          if (!isCallBar(bar)) return;
          const plan = callPlans.get((bar % 4) * EIGHTHS_PER_BAR + eighth);
          if (plan) player.pluck(plan.midi, at, seconds(plan.cells), planGlide(plan, bpm, swing));
        }
      : undefined,
    true,
    strums ? STRUM_SPREADS[speed] : undefined,
  );
  const geometry = useNeckGeometry((box?.maxFret ?? 4) + 1, {
    from: Math.max(0, (box?.minFret ?? 0) - 1),
  });
  const chord = bars[backing.bar ?? 0]!.chord;
  const guides = box && block.guideTones ? guideTonePositions(box, chord) : [];
  const guideKeys = new Set(guides.map(posKey));
  const dots = box?.notes
    .filter((n) => !guideKeys.has(posKey(n)))
    .map((n): FretDot => {
      const degree = toneIn(n, chord);
      return {
        ...n,
        key: posKey(n),
        label: degreeText(degree ?? n.degree),
        tone: degree === '1' ? 'home' : degree ? 'chord' : 'plain',
      };
    });
  dots?.push(
    ...guides.map((note): FretDot => ({
      ...note,
      key: posKey(note),
      degree: degreeText(note.degree),
      label: degreeText(note.degree),
      tone: 'target',
    })),
  );
  return (
    <div className="board">
      <div className="controls">
        {block.keys && (
          <ChipGroup
            label={ui.session.key}
            items={block.keys.map((k) => ({ value: k, text: k }))}
            value={tonic}
            onChange={(key) => {
              backing.stop();
              setTonic(key);
            }}
          />
        )}
        <Button onClick={backing.toggle}>
          {backing.playing ? ui.session.stop : ui.session.play}
        </Button>
        <Tempo bpm={bpm} onChange={setBpm} />
      </div>
      <BarGrid bars={bars} current={backing.bar} label={label} />
      {callPlans && (
        <p className="caption" aria-live="polite">
          {backing.bar === null
            ? ''
            : isCallBar(backing.bar)
              ? ui.session.listenToCall
              : ui.session.yourResponse}
        </p>
      )}
      {box && dots && <Fretboard box={box} dots={dots} geometry={geometry} label={label} />}
    </div>
  );
}
