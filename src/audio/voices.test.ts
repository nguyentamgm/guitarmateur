import { describe, expect, it } from 'vitest';
import {
  articulationFor,
  decayScaleForMidi,
  envelopeLevelAt,
  glideCurve,
  makeDriveCurve,
  midiToFrequency,
} from './voices';

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

const ALL_TECHNIQUES = [undefined, 'hammer', 'pull', 'slide', 'bendHalf', 'bendFull'] as const;

describe('articulationFor', () => {
  it('defaults to a plainly picked note', () => {
    const plain = articulationFor(undefined);
    expect(plain.transient.source).toBe('pick');
    expect(plain.glideSec).toBe(0);
    expect(plain.velocityScale).toBe(1);
  });

  it('hammer-ons and pull-offs are fretting-hand only — no new pick, and quieter', () => {
    for (const t of ['hammer', 'pull'] as const) {
      const art = articulationFor(t);
      expect(art.transient.source).toBe('slap');
      expect(art.velocityScale).toBeLessThan(1);
      expect(art.glideSec).toBe(0);
    }
  });

  it('every technique still makes a noise at the front, or you cannot hear which one it was', () => {
    for (const t of ALL_TECHNIQUES) {
      const { transient } = articulationFor(t, 3);
      expect(transient.levelScale).toBeGreaterThan(0);
      expect(transient.decaySec).toBeGreaterThan(0);
    }
  });

  it('gives each fretting-hand technique its own colour — a slap is duller than a scrape', () => {
    const hammer = articulationFor('hammer').transient;
    const pull = articulationFor('pull').transient;
    const slide = articulationFor('slide', 2).transient;
    expect(hammer.bandScale).toBeLessThan(pull.bandScale);
    expect(pull.bandScale).toBeLessThan(slide.bandScale);
    // ...and a scrape runs long enough to cover the glide it belongs to.
    expect(slide.decaySec).toBeGreaterThan(hammer.decaySec);
  });

  it('slides and bends glide from the previous pitch', () => {
    for (const t of ['slide', 'bendHalf', 'bendFull'] as const) {
      expect(articulationFor(t, 2).glideSec).toBeGreaterThan(0);
    }
  });

  it('a longer slide takes longer — a hand crossing five frets is not a pitch jump', () => {
    expect(articulationFor('slide', 5).glideSec).toBeGreaterThan(
      articulationFor('slide', 2).glideSec,
    );
    // Direction does not change how far the hand travels.
    expect(articulationFor('slide', -4).glideSec).toBeCloseTo(articulationFor('slide', 4).glideSec);
  });

  it('a full bend leans in slower than a half bend', () => {
    expect(articulationFor('bendFull').glideSec).toBeGreaterThan(
      articulationFor('bendHalf').glideSec,
    );
  });

  it('only bends ease into pitch and shimmer once there — a slide runs at a constant rate', () => {
    for (const t of ['bendHalf', 'bendFull'] as const) {
      expect(articulationFor(t).glideEase).toBe(true);
      expect(articulationFor(t).vibratoAtPitch).toBe(true);
    }
    expect(articulationFor('slide', 3).glideEase).toBe(false);
    expect(articulationFor('slide', 3).vibratoAtPitch).toBe(false);
  });

  it('every articulation has a non-zero attack so nothing clicks', () => {
    for (const t of ALL_TECHNIQUES) {
      expect(articulationFor(t).attackSec).toBeGreaterThan(0);
    }
  });
});

describe('glideCurve', () => {
  it('starts on the old pitch and lands exactly on the new one', () => {
    const curve = glideCurve(60, 64, false, 32);
    expect(curve[0]!).toBeCloseTo(midiToFrequency(60), 4);
    expect(curve[31]!).toBeCloseTo(midiToFrequency(64), 4);
  });

  it('moves monotonically in both directions', () => {
    const up = glideCurve(55, 62, true, 48);
    for (let i = 1; i < up.length; i++) expect(up[i]!).toBeGreaterThanOrEqual(up[i - 1]!);
    const down = glideCurve(62, 55, false, 48);
    for (let i = 1; i < down.length; i++) expect(down[i]!).toBeLessThanOrEqual(down[i - 1]!);
  });

  it('interpolates in semitones, not Hz — the midpoint is the musical midpoint', () => {
    // Linear-in-Hz would put the midpoint of an octave at 1.5x, a fifth sharp of the true one.
    const curve = glideCurve(60, 72, false, 65);
    expect(curve[32]!).toBeCloseTo(midiToFrequency(66), 4);
  });

  it('easing holds near the start pitch before committing, the way a bent string does', () => {
    const eased = glideCurve(60, 62, true, 65);
    const linear = glideCurve(60, 62, false, 65);
    expect(eased[8]!).toBeLessThan(linear[8]!);
    // ...and settles onto the target rather than arriving at full speed.
    expect(eased[56]!).toBeGreaterThan(linear[56]!);
  });
});

describe('envelopeLevelAt', () => {
  const env = [
    { t: 0, v: 0.0001, curve: 'lin' as const },
    { t: 0.01, v: 1, curve: 'lin' as const },
    { t: 0.1, v: 0.5, curve: 'exp' as const },
    { t: 1, v: 0.25, curve: 'exp' as const },
  ];

  it('reads the breakpoints back exactly', () => {
    for (const p of env) expect(envelopeLevelAt(env, p.t)).toBeCloseTo(p.v, 6);
  });

  it('clamps outside the envelope rather than extrapolating', () => {
    expect(envelopeLevelAt(env, -5)).toBeCloseTo(0.0001, 6);
    expect(envelopeLevelAt(env, 99)).toBeCloseTo(0.25, 6);
  });

  it('traces an exponential segment geometrically, matching what Web Audio schedules', () => {
    // Halving from 0.5 to 0.25 over 0.9s: the midpoint is 0.5/sqrt(2), not 0.375.
    expect(envelopeLevelAt(env, 0.55)).toBeCloseTo(0.5 / Math.SQRT2, 6);
  });

  it('traces a linear segment linearly', () => {
    expect(envelopeLevelAt(env, 0.005)).toBeCloseTo(0.5, 3);
  });

  it('is monotonic across the decay, so a release never jumps up', () => {
    let last = Infinity;
    for (let t = 0.1; t <= 1; t += 0.02) {
      const v = envelopeLevelAt(env, t);
      expect(v).toBeLessThanOrEqual(last + 1e-9);
      last = v;
    }
  });
});
