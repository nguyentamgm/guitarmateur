import { useMemo, useState } from 'react';
import { parseNote } from '../../core/music';
import { soloWindow, toneIn } from '../../lessons/solo';
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

export function BackingTrack({
  block,
  label,
}: {
  block: Extract<Block, { kind: 'backingTrack' }>;
  label: string;
}) {
  const { ui } = useTheory();
  const [tonic, setTonic] = useState(block.in.tonic);
  const [bpm, setBpm] = useState(block.bpm);
  const speed = useSessionStrumSpeed();
  const strums = block.style === 'strum' || block.style === 'comp';
  const bars = useMemo(
    () =>
      block.bars.map((spec) => {
        const { roman, symbol, chord } = chordIn({ tonic, mode: block.in.mode }, spec);
        return {
          degree: roman,
          symbol,
          chord,
          midis: strums ? shapeMidis(chordShape(chord)) : undefined,
        };
      }),
    [block, tonic, strums],
  );
  const backing = useBacking(
    bars,
    block.style,
    bpm,
    undefined,
    true,
    strums ? STRUM_SPREADS[speed] : undefined,
  );
  const box = useMemo(
    () => block.scale && soloWindow(parseNote(tonic), block.scale),
    [block.scale, tonic],
  );
  const geometry = useNeckGeometry((box?.maxFret ?? 4) + 1, {
    from: Math.max(0, (box?.minFret ?? 0) - 1),
  });
  const chord = bars[backing.bar ?? 0]!.chord;
  const dots = box?.notes.map((n): FretDot => {
    const degree = toneIn(n, chord);
    return {
      ...n,
      key: posKey(n),
      label: degreeText(degree ?? n.degree),
      tone: degree === '1' ? 'home' : degree ? 'chord' : 'plain',
    };
  });
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
      {box && dots && <Fretboard box={box} dots={dots} geometry={geometry} label={label} />}
    </div>
  );
}
