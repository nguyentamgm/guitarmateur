import { useEffect, useMemo, useState } from 'react';
import { EIGHTHS_PER_BAR } from '../../core/audio';
import { parseNote } from '../../core/music';
import { beatSeconds, countBar } from '../../core/rhythm';
import { POWER_CHORD_LENGTH, POWER_RIFF_BPM, powerRiff } from '../../sessions/powerRiff';
import type { Block, PowerRiffCopy } from '../../sessions/types';
import { BeatGrid, type Block as BeatBlock } from '../BeatGrid';
import { useTheory } from '../context';
import { Button, ChipGroup } from '../controls';
import { useClock } from '../useClock';

const counts = countBar(2).map((word) => (word.kind === 'beat' ? String(word.n) : '&'));

export function PowerRiff({
  block,
  copy,
}: {
  block: Extract<Block, { kind: 'powerRiff' }>;
  copy: PowerRiffCopy;
}) {
  const { player, ui } = useTheory();
  const [tonic, setTonic] = useState(block.tonic);
  const [feel, setFeel] = useState<'open' | 'muted'>('muted');
  const hits = useMemo(() => powerRiff(parseNote(tonic)), [tonic]);
  const seconds = beatSeconds(POWER_RIFF_BPM);
  const clock = useClock(EIGHTHS_PER_BAR, seconds / 2, (cell, delay) => {
    const hit = hits[cell];
    if (!hit) return;
    for (const midi of hit.midis) {
      if (feel === 'muted') player.mute(midi, delay);
      else player.pluck(midi, delay, POWER_CHORD_LENGTH * seconds);
    }
  });
  useEffect(() => () => player.cancel(), [player]);

  const blocks: BeatBlock[] = hits.map(({ cell, symbol }) => ({
    key: String(cell),
    start: cell,
    length: 1,
    tone: 'note',
    text: symbol,
    label: symbol,
  }));
  blocks.push({
    key: 'rest',
    start: EIGHTHS_PER_BAR - 2,
    length: 2,
    tone: 'rest',
    text: copy.rest,
    label: copy.rest,
  });

  return (
    <div className="board">
      <div className="controls">
        <ChipGroup
          label={ui.session.key}
          items={block.keys.map((key) => ({ value: key, text: key }))}
          value={tonic}
          onChange={(key) => {
            if (key === tonic) return;
            clock.stop();
            player.cancel();
            setTonic(key);
          }}
        />
        <ChipGroup<'open' | 'muted'>
          label={copy.articulation}
          items={[
            { value: 'open', text: copy.open },
            { value: 'muted', text: copy.muted },
          ]}
          value={feel}
          onChange={setFeel}
        />
        <Button
          onClick={() => {
            player.cancel();
            clock.toggle();
          }}
        >
          {clock.playing ? ui.session.stop : ui.session.play}
        </Button>
      </div>
      <BeatGrid
        label={copy.grid}
        cells={EIGHTHS_PER_BAR}
        perBeat={2}
        words={counts}
        blocks={blocks}
        current={clock.current}
      />
    </div>
  );
}
