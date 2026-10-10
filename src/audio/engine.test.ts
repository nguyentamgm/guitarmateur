import { describe, expect, it } from 'vitest';
import { setMuted, type AudioEngine } from './engine';

/** Just enough of an engine for `setMuted`: a master gain that records its scheduled targets. */
function fakeEngine(level: number) {
  const targets: number[] = [];
  const gain = {
    value: level,
    cancelScheduledValues: () => {},
    setTargetAtTime: (v: number) => {
      targets.push(v);
      gain.value = v;
    },
  };
  return { engine: { ctx: { currentTime: 0 }, master: { gain } } as unknown as AudioEngine, targets };
}

describe('setMuted', () => {
  it('fades the master out and back to the level it had, whatever it was', () => {
    const { engine, targets } = fakeEngine(0.7);
    setMuted(engine, true);
    setMuted(engine, true); // a repeat changes nothing
    setMuted(engine, false);
    expect(targets).toEqual([0, 0.7]);
  });

  it('unmuting an engine that was never muted does nothing', () => {
    const { engine, targets } = fakeEngine(0.9);
    setMuted(engine, false);
    expect(targets).toEqual([]);
  });
});
