import { useEffect, useMemo } from 'react';
import { EIGHTHS_PER_BAR } from '../../core/audio';
import { cellSeconds } from '../../core/rhythm';
import { lickPlan, planGlide, planSeconds } from '../../lessons/blues';
import type { Block, TabPhraseCopy } from '../../sessions/types';
import { Button } from '../controls';
import { useTheory } from '../context';
import { posKey } from '../keys';
import { Tab, type TabNote } from '../Tab';
import { useClock } from '../useClock';

export function TabPhrase({
  block: { notes, bpm, metronome, bars },
  copy,
}: {
  block: Extract<Block, { kind: 'tabPhrase' }>;
  copy: TabPhraseCopy;
}) {
  const { player, ui } = useTheory();
  const columns = useMemo(() => {
    const end = notes.reduce((last, { event }) => Math.max(last, event.cell + event.cells), 0);
    const endWithClick = metronome ? Math.ceil(end / EIGHTHS_PER_BAR) * EIGHTHS_PER_BAR : end;
    const cells = Math.max(endWithClick, (bars ?? 0) * EIGHTHS_PER_BAR);
    const tab: TabNote[][] = Array.from({ length: cells }, () => []);
    for (const note of notes) tab[note.event.cell]!.push({ ...note, key: posKey(note) });
    return tab;
  }, [bars, metronome, notes]);
  const barLines = Array.from(
    { length: Math.ceil(columns.length / EIGHTHS_PER_BAR) - 1 },
    (_, i) => (i + 1) * EIGHTHS_PER_BAR,
  );
  const plans = useMemo(() => new Map(lickPlan(notes).map((plan) => [plan.cell, plan])), [notes]);
  const clock = useClock(
    columns.length,
    cellSeconds(bpm, 2),
    (cell, delay) => {
      if (metronome && cell % 2 === 0) player.click(cell % EIGHTHS_PER_BAR === 0, delay);
      const plan = plans.get(cell);
      if (plan) player.pluck(plan.midi, delay, planSeconds(plan, bpm, 0), planGlide(plan, bpm, 0));
    },
    false,
  );
  useEffect(() => () => player.cancel(), [player]);

  return (
    <div className="board">
      <div className="controls">
        <Button
          onClick={() => {
            player.cancel();
            clock.toggle();
          }}
        >
          {clock.playing ? ui.session.stop : copy.play}
        </Button>
      </div>
      <Tab columns={columns} label={copy.label} column={clock.current} barLines={barLines} />
    </div>
  );
}
