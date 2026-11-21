import { useEffect, useMemo } from 'react';
import { cellSeconds } from '../../core/rhythm';
import { lickPlan, planGlide, planSeconds } from '../../lessons/blues';
import type { Block, TabPhraseCopy } from '../../sessions/types';
import { Button } from '../controls';
import { useTheory } from '../context';
import { posKey } from '../keys';
import { Tab, type TabNote } from '../Tab';
import { useClock } from '../useClock';

export function TabPhrase({
  block: { notes, bpm },
  copy,
}: {
  block: Extract<Block, { kind: 'tabPhrase' }>;
  copy: TabPhraseCopy;
}) {
  const { player, ui } = useTheory();
  const columns = useMemo(() => {
    const cells = notes.reduce((end, { event }) => Math.max(end, event.cell + event.cells), 0);
    const tab: TabNote[][] = Array.from({ length: cells }, () => []);
    for (const note of notes) tab[note.event.cell]!.push({ ...note, key: posKey(note) });
    return tab;
  }, [notes]);
  const plans = useMemo(() => new Map(lickPlan(notes).map((plan) => [plan.cell, plan])), [notes]);
  const clock = useClock(
    columns.length,
    cellSeconds(bpm, 2),
    (cell, delay) => {
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
      <Tab columns={columns} label={copy.label} column={clock.current} />
    </div>
  );
}
