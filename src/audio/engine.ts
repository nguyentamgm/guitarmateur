/**
 * AudioContext lifecycle. The context must be created inside a user gesture (browser autoplay
 * policy), so `createEngine` is called lazily from the play handler — never at module load.
 * Two sub-buses (click / note) feed a master gain so the UI can mix them independently.
 *
 * The note path runs through a fixed guitar amp chain (pickup resonance → overdrive → cabinet →
 * tone stack). It lives here rather than in `voices.ts` for two reasons: a `WaveShaperNode` curve
 * is a 2048-sample array that would otherwise be rebuilt for every note, and distortion is
 * non-linear, so applying it once after the mix is what a real amp actually does.
 */

import { makeDriveCurve } from './voices';
import { installAmpDevTools } from './devTools';

/** The amp chain's individual stages, kept addressable so the dev console can tune them live. */
export interface AmpNodes {
  pickup: BiquadFilterNode;
  preGain: GainNode;
  shaper: WaveShaperNode;
  cabHigh: BiquadFilterNode;
  cabLowA: BiquadFilterNode;
  cabLowB: BiquadFilterNode;
  bass: BiquadFilterNode;
  mid: BiquadFilterNode;
  treble: BiquadFilterNode;
}

export interface AudioEngine {
  ctx: AudioContext;
  master: GainNode;
  clickBus: GainNode;
  /** Voices connect here — the input to the amp chain. */
  noteBus: GainNode;
  /** Post-amp level. The note mix slider rides this so drive stays constant as you change volume. */
  noteOut: GainNode;
  amp: AmpNodes;
}

type AudioContextCtor = typeof AudioContext;

/** Resolve the (possibly webkit-prefixed) AudioContext constructor, or null if unsupported. */
export function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

export function isAudioSupported(): boolean {
  return getAudioContextCtor() !== null;
}

/* ── Tuning: amp ─────────────────────────────────────────────────────────────
 * Tweak by ear. Each constant lists a sane range and which way to move it.
 * Voice-side dials (attack, decay, vibrato, click level) live in voices.ts.
 * ────────────────────────────────────────────────────────────────────────── */

/** Master output. 0.4..0.9. Drop it if the mix clips on dense level-5 licks. */
const MASTER_GAIN = 0.9;
/** Metronome level before the user's click slider. 0.3..1.0.
 *  The click bypasses the amp chain, so it needs more than the notes to sit level with them. */
const CLICK_BUS_GAIN = 0.6;
/** Level of the summed voices entering the amp. 0.3..0.8. Works against PRE_GAIN — raise one,
 *  lower the other, or the waveshaper saturates and everything flattens out. */
const NOTE_BUS_GAIN = 0.5;
/** How hard the note bus hits the waveshaper. 1.2..3.5. Higher = more of the signal clips. */
const PRE_GAIN = 2.2;
/** Fraction of the signal range that gets squashed. 0..0.8.
 *  Higher = more grit. Everything below `1 - DRIVE` passes through linearly, so unlike a
 *  compressor-style clipper this does not flatten a note's decay — but past ~0.8 there is barely
 *  any linear range left and notes start sounding sustained and organ-like again. */
const DRIVE = 0.55;
/** Post-amp level, before the user's note slider. 0.5..1.2. */
const NOTE_OUT_GAIN = 0.9;

/** Pickup resonance peak: centre Hz (2000..5000), Q (0.7..2), boost dB (3..10).
 *  This is most of the difference between a bright single-coil and a fat humbucker. */
const PICKUP_HZ = 3000;
const PICKUP_Q = 1.2;
const PICKUP_GAIN_DB = 6;

/** Cabinet band edges, Hz. Low corner 60..120, high corner 3000..5500.
 *  Lowering the high corner tames fizz; raising it brings back bite (and harshness). */
const CAB_LOW_CORNER_HZ = 90;
const CAB_HIGH_CORNER_HZ = 4200;

/** Tone stack, dB. Bass -3..+5, mid -3..+6 (blues lives in the mids), treble -8..+2. */
const BASS_DB = 2;
const MID_DB = 2.5;
const TREBLE_DB = -4;

/** Create a fresh engine. Throws if Web Audio is unavailable — callers gate on `isAudioSupported`. */
export function createEngine(): AudioEngine {
  const Ctor = getAudioContextCtor();
  if (!Ctor) throw new Error('Web Audio API is not available in this environment.');

  const ctx = new Ctor();
  const master = ctx.createGain();
  master.gain.value = MASTER_GAIN;
  master.connect(ctx.destination);

  const clickBus = ctx.createGain();
  clickBus.gain.value = CLICK_BUS_GAIN;
  clickBus.connect(master);

  const noteBus = ctx.createGain();
  noteBus.gain.value = NOTE_BUS_GAIN;

  // Pickup resonance: the coil's inductance and the cable capacitance form a peak up in the
  // presence range. It is part of the guitar, so it sits *before* the drive.
  const pickup = ctx.createBiquadFilter();
  pickup.type = 'peaking';
  pickup.frequency.value = PICKUP_HZ;
  pickup.Q.value = PICKUP_Q;
  pickup.gain.value = PICKUP_GAIN_DB;

  const preGain = ctx.createGain();
  preGain.gain.value = PRE_GAIN;

  const shaper = ctx.createWaveShaper();
  shaper.curve = makeDriveCurve(DRIVE);
  // Distortion generates harmonics above Nyquist; oversampling keeps them from folding back as
  // inharmonic aliasing, which is most of what makes naive web-audio drive sound cheap.
  shaper.oversample = '4x';

  // Speaker cabinet. A guitar cab is a bandpass box: nothing below ~90 Hz, a steep roll-off above
  // ~4 kHz. Skipping this is why a bare waveshaper sounds like fizz rather than grit — the upper
  // harmonics the drive just created have to go somewhere, and a real speaker never reproduces them.
  const cabHigh = ctx.createBiquadFilter();
  cabHigh.type = 'highpass';
  cabHigh.frequency.value = CAB_LOW_CORNER_HZ;
  cabHigh.Q.value = 0.7;

  const cabLowA = ctx.createBiquadFilter();
  cabLowA.type = 'lowpass';
  cabLowA.frequency.value = CAB_HIGH_CORNER_HZ;
  cabLowA.Q.value = 0.7;

  // Cascaded so the roll-off is 24 dB/oct rather than 12 — closer to a real cab's skirt.
  const cabLowB = ctx.createBiquadFilter();
  cabLowB.type = 'lowpass';
  cabLowB.frequency.value = CAB_HIGH_CORNER_HZ * 1.1;
  cabLowB.Q.value = 0.5;

  // Tone stack: a little body, a mid push (blues lives in the mids), and the top corner taken off.
  const bass = ctx.createBiquadFilter();
  bass.type = 'lowshelf';
  bass.frequency.value = 110;
  bass.gain.value = BASS_DB;

  const mid = ctx.createBiquadFilter();
  mid.type = 'peaking';
  mid.frequency.value = 900;
  mid.Q.value = 0.8;
  mid.gain.value = MID_DB;

  const treble = ctx.createBiquadFilter();
  treble.type = 'highshelf';
  treble.frequency.value = 5200;
  treble.gain.value = TREBLE_DB;

  const noteOut = ctx.createGain();
  noteOut.gain.value = NOTE_OUT_GAIN;

  noteBus.connect(pickup);
  pickup.connect(preGain);
  preGain.connect(shaper);
  shaper.connect(cabHigh);
  cabHigh.connect(cabLowA);
  cabLowA.connect(cabLowB);
  cabLowB.connect(bass);
  bass.connect(mid);
  mid.connect(treble);
  treble.connect(noteOut);
  noteOut.connect(master);

  const engine: AudioEngine = {
    ctx,
    master,
    clickBus,
    noteBus,
    noteOut,
    amp: { pickup, preGain, shaper, cabHigh, cabLowA, cabLowB, bass, mid, treble },
  };

  if (import.meta.env.DEV) {
    installAmpDevTools(engine, {
      masterGain: MASTER_GAIN,
      clickBus: CLICK_BUS_GAIN,
      noteBus: NOTE_BUS_GAIN,
      preGain: PRE_GAIN,
      drive: DRIVE,
      noteOut: NOTE_OUT_GAIN,
      pickupHz: PICKUP_HZ,
      pickupQ: PICKUP_Q,
      pickupDb: PICKUP_GAIN_DB,
      cabLowHz: CAB_LOW_CORNER_HZ,
      cabHighHz: CAB_HIGH_CORNER_HZ,
      bassDb: BASS_DB,
      midDb: MID_DB,
      trebleDb: TREBLE_DB,
    });
  }

  return engine;
}

// Dev only. `useTransport` builds the engine once on the first play and caches it in a ref, and
// React Fast Refresh preserves refs across hot updates — so editing the tuning constants above
// would silently do nothing until a manual reload. Force the reload instead of letting the old
// node graph keep playing.
if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}
