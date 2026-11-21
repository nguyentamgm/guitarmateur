import { expect, it } from 'vitest';
import { BEATS_PER_BAR } from '../../core/rhythm';
import { soloKey } from './soloKey';

it('sounds the tonic triads of contrasting forms and reveals the matching low root', () => {
  const major = soloKey.next(() => 0);
  const minor = soloKey.next(() => 0, major);

  for (const [question, answer, name, root, third] of [
    [major, 'major', 'G', 43, 4],
    [minor, 'minor', 'A', 45, 3],
  ] as const) {
    const [first] = question.sound.events;
    const pcs = first?.midis?.map((midi) => midi % 12);
    expect(question.answer).toBe(answer);
    expect(question.detail).toBe(name);
    expect(pcs).toContain(root % 12);
    expect(pcs).toContain((root + third) % 12);
    expect(question.revealSound?.events[0]?.midis).toEqual([root]);
    expect(question.vars?.fret).toBe(root - 40);
    const downbeats = question.sound.events.filter(({ at }) => at % BEATS_PER_BAR === 0);
    expect(downbeats).toHaveLength(5);
    expect(downbeats.at(-1)?.midis).toEqual(first?.midis);
  }
});
