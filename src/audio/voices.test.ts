import { describe, expect, it } from 'vitest';
import { articulationFor, decayScaleForMidi, makeDriveCurve, midiToFrequency } from './voices';

describe('voice pitch math', () => {
  it('midiToFrequency: A4 (69) = 440 Hz, one octave up doubles', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440);
    expect(midiToFrequency(81)).toBeCloseTo(880);
    expect(midiToFrequency(57)).toBeCloseTo(220);
  });
});

describe('makeDriveCurve', () => {
  it('spans the full [-1, 1] input domain', () => {
    const curve = makeDriveCurve(0.6, 512);
    expect(curve).toHaveLength(512);
    expect(curve[0]).toBeCloseTo(-1);
    expect(curve[511]).toBeCloseTo(1);
  });

  it('is odd-symmetric, so it adds odd harmonics rather than octave-up fizz', () => {
    const n = 1024;
    const curve = makeDriveCurve(0.75, n);
    for (let i = 0; i < n; i++) {
      expect(curve[i]!).toBeCloseTo(-curve[n - 1 - i]!, 6);
    }
  });

  it('is monotonically increasing (a transfer curve must never fold back)', () => {
    const curve = makeDriveCurve(1, 1024);
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i]!).toBeGreaterThan(curve[i - 1]!);
    }
  });

  it('stays bounded within [-1, 1] at every drive amount', () => {
    for (const amount of [0, 0.25, 0.6, 1, 4]) {
      for (const y of makeDriveCurve(amount, 256)) {
        expect(y).toBeGreaterThanOrEqual(-1);
        expect(y).toBeLessThanOrEqual(1);
      }
    }
  });

  it('amount 0 is a true bypass — output equals input', () => {
    const n = 256;
    const curve = makeDriveCurve(0, n);
    for (let i = 0; i < n; i++) {
      expect(curve[i]!).toBeCloseTo((i * 2) / (n - 1) - 1, 6);
    }
  });

  it('leaves a linear region below the threshold, so decay tails survive', () => {
    // The whole point: gain must not be highest near silence, or a note's tail gets lifted to the
    // level of its attack and the result sounds like an organ rather than a plucked string.
    const n = 2048;
    const amount = 0.55;
    const curve = makeDriveCurve(amount, n);
    const gainAt = (x: number) => {
      const i = Math.round(((x + 1) / 2) * (n - 1));
      return curve[i]! / x;
    };
    const quiet = gainAt(0.05); // deep in the decay tail
    const mid = gainAt(0.3); // still under the 1 - amount threshold
    expect(mid / quiet).toBeCloseTo(1, 2);
    // ...and peaks really are squashed relative to that linear region.
    expect(gainAt(0.98)).toBeLessThan(quiet);
  });

  it('more drive means more gain at low signal levels', () => {
    const n = 1024;
    const quiet = Math.floor(n * 0.55); // a little above the zero crossing
    const soft = makeDriveCurve(0.2, n)[quiet]!;
    const hard = makeDriveCurve(0.9, n)[quiet]!;
    expect(hard).toBeGreaterThan(soft);
  });
});

describe('decayScaleForMidi', () => {
  it('is 1.0 at the MIDI 52 reference', () => {
    expect(decayScaleForMidi(52)).toBeCloseTo(1);
  });

  it('decreases with pitch — thin high strings ring shorter than thick low ones', () => {
    const pitches = [40, 45, 52, 60, 69, 76, 88];
    for (let i = 1; i < pitches.length; i++) {
      expect(decayScaleForMidi(pitches[i]!)).toBeLessThan(decayScaleForMidi(pitches[i - 1]!));
    }
  });

  it('clamps extremes so no note rings absurdly long or dies instantly', () => {
    for (const m of [-20, 0, 40, 64, 100, 160]) {
      expect(decayScaleForMidi(m)).toBeGreaterThanOrEqual(0.4);
      expect(decayScaleForMidi(m)).toBeLessThanOrEqual(1.6);
    }
  });
});

describe('articulationFor', () => {
  it('defaults to a plainly picked note', () => {
    const plain = articulationFor(undefined);
    expect(plain.repick).toBe(true);
    expect(plain.glideSec).toBe(0);
    expect(plain.velocityScale).toBe(1);
  });

  it('hammer-ons and pull-offs are fretting-hand only — no new pick, and quieter', () => {
    for (const t of ['hammer', 'pull'] as const) {
      const art = articulationFor(t);
      expect(art.repick).toBe(false);
      expect(art.velocityScale).toBeLessThan(1);
      expect(art.glideSec).toBe(0);
    }
  });

  it('slides and bends glide from the previous pitch', () => {
    for (const t of ['slide', 'bendHalf', 'bendFull'] as const) {
      expect(articulationFor(t).glideSec).toBeGreaterThan(0);
    }
  });

  it('a full bend leans in slower than a half bend, and both slower than a slide', () => {
    expect(articulationFor('bendFull').glideSec).toBeGreaterThan(
      articulationFor('bendHalf').glideSec,
    );
    expect(articulationFor('bendHalf').glideSec).toBeGreaterThan(articulationFor('slide').glideSec);
  });

  it('every articulation has a non-zero attack so nothing clicks', () => {
    for (const t of [undefined, 'hammer', 'pull', 'slide', 'bendHalf', 'bendFull'] as const) {
      expect(articulationFor(t).attackSec).toBeGreaterThan(0);
    }
  });
});
