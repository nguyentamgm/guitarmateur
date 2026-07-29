/**
 * Voices — sound sources built from native Web Audio nodes (no samples, no AudioWorklet).
 *
 * The note voice models a *string*, not a whole guitar: two detuned sawtooth oscillators plus a
 * pick-noise transient, shaped by a lowpass whose cutoff falls as the note decays (a plucked string
 * is bright at the attack and darkens as its upper partials die first). The *amp* — pickup
 * resonance, overdrive, speaker cabinet — lives once on the shared note bus in `engine.ts`, because
 * distortion is non-linear and belongs after the mix, exactly as one amp serves a whole guitar.
 *
 * The pure math here (`midiToFrequency`, `makeDriveCurve`, `decayScaleForMidi`, `articulationFor`)
 * is unit-tested; the node graphs are exercised by ear.
 */

import type { Technique } from '../lick';

/**
 * Voice tuning. Read fresh on every note, so changes take effect from the next note on — that is
 * what lets the dev console tune it live while a loop plays (see `devTools.ts`).
 *
 * If notes sound like an ORGAN — steady, no attack, no decay — the amplitude envelope is being
 * flattened. In order of impact: lower `drive` (engine.ts), lower `sustainLevel`, raise
 * `pickLevel`, shorten `ringSec`. If notes sound THIN or CLICKY, go the other way and raise
 * `filterRestMult`.
 */
export interface VoiceTuning {
  /** Cents between the two oscillators. 0..12. Higher = thicker, but chorus-y and pad-like. */
  detuneCents: number;
  /** Peak level of one voice into the amp bus. 0.15..0.45. Raise together with engine PRE_GAIN. */
  peakLevel: number;
  /** Level right after the pluck, as a fraction of peak. 0.05..0.4.
   *  THE organ dial: lower = percussive and string-like, higher = sustained and organ-like. */
  sustainLevel: number;
  /** How fast the string settles from peak to `sustainLevel`, seconds. 0.02..0.15. */
  pluckDecaySec: number;
  /** How long a note rings past its notated length, seconds (scaled by pitch). 0.1..1.0.
   *  Higher = notes bleed into each other like a real guitar; too high = muddy soup. */
  ringSec: number;
  /** Pick-attack noise level. 0..0.6. Higher = more percussive bite, the main anti-organ cue. */
  pickLevel: number;
  /** Pick noise band centre, Hz. 1200..3500. Higher = brighter, more "scrape". */
  pickBandHz: number;
  /** Cutoff at the attack = freq × this, capped by `filterOpenCapHz`. 6..16. */
  filterOpenMult: number;
  filterOpenCapHz: number;
  /** Cutoff once the note has settled = freq × this. 1.2..4. Higher = brighter sustain. */
  filterRestMult: number;
  /** How long the cutoff takes to fall, seconds. 0.1..0.5. Longer = more audible movement. */
  filterFallSec: number;
  /** Vibrato needs a held note; below this it just sounds unstable. Seconds. */
  vibratoMinSec: number;
  /** Vibrato rate, Hz. 4..7 is the human hand range. */
  vibratoRateHz: number;
  /** Vibrato depth, cents. 8..35. Higher = more dramatic, above ~40 sounds seasick. */
  vibratoDepthCents: number;
  /** Delay before vibrato eases in, seconds. 0.1..0.3. Nobody vibratos from the first instant. */
  vibratoDelaySec: number;
  /** Downbeat click level. 0.2..0.8. The click bypasses the amp chain, so it needs more level
   *  than the notes to sit level with them. */
  clickAccentLevel: number;
  /** Off-beat click level. 0.1..0.6, keep below `clickAccentLevel`. */
  clickLevel: number;
}

export const VOICE_DEFAULTS: Readonly<VoiceTuning> = Object.freeze({
  detuneCents: 5,
  peakLevel: 0.3,
  sustainLevel: 0.12,
  pluckDecaySec: 0.05,
  ringSec: 2,
  pickLevel: 1,
  pickBandHz: 2200,
  filterOpenMult: 10,
  filterOpenCapHz: 9000,
  filterRestMult: 1.8,
  filterFallSec: 1,
  vibratoMinSec: 1,
  vibratoRateHz: 10,
  vibratoDepthCents: 60,
  vibratoDelaySec: 1,
  clickAccentLevel: 0.5,
  clickLevel: 0.32,
});

/** The live values. Mutated only by the dev console; production never writes to it. */
export const voiceTuning: VoiceTuning = { ...VOICE_DEFAULTS };

/** Equal-tempered frequency of a MIDI note (A4 = 69 = 440 Hz). */
export function midiToFrequency(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

/**
 * Waveshaping transfer curve for the overdrive stage.
 *
 * Signal below the threshold `1 - amount` passes through **untouched**; only peaks above it get
 * squashed. That linear region matters more than it looks: a curve whose gain is highest near
 * silence (the common `x(1+k)/(1+k|x|)` soft clipper) lifts a note's decay tail up to the level of
 * its attack, and a note that holds one level from start to finish is what an organ sounds like.
 * Clipping only the peaks grits up the attack and leaves the decay intact.
 *
 * Odd-symmetric (adds the odd harmonics a tube stage does, not octave-up fizz), monotonic, and
 * normalised so it maps [-1, 1] onto [-1, 1] — `amount = 0` is a true bypass.
 */
export function makeDriveCurve(amount: number, samples = 2048): Float32Array<ArrayBuffer> {
  const a = Math.min(1, Math.max(0, amount));
  const threshold = 1 - a;
  const span = 1 - threshold;
  const norm = span > 0 ? threshold + span * Math.tanh(1) : 1;
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / (samples - 1) - 1;
    const ax = Math.abs(x);
    const shaped = ax <= threshold ? ax : threshold + span * Math.tanh((ax - threshold) / span);
    curve[i] = Math.sign(x) * (shaped / norm);
  }
  return curve;
}

/**
 * How long a string at this pitch rings, relative to the middle of the neck. Thick low strings
 * sustain far longer than thin high ones, so a fixed release makes every note sound equally short.
 * 1.0 at MIDI 52 (open low E on the 3rd string region); clamped so extremes stay musical.
 */
export function decayScaleForMidi(m: number): number {
  return Math.min(1.6, Math.max(0.4, Math.pow(2, (52 - m) / 36)));
}

/** How a note is articulated *into* from the one before it. */
export interface Articulation {
  /** Whether the pick strikes again — hammer-ons and pull-offs are fretting-hand only. */
  repick: boolean;
  attackSec: number;
  /** Scales the note's peak level; un-picked notes are naturally weaker. */
  velocityScale: number;
  /** Seconds to glide from the previous pitch. 0 = jump straight to this note. */
  glideSec: number;
}

const PLAIN: Articulation = { repick: true, attackSec: 0.003, velocityScale: 1, glideSec: 0 };

/**
 * Map a lick technique onto how the voice should sound it. Bend times are deliberately slow — a
 * blues bend leans into pitch over a good fraction of a beat, and rushing it reads as a synth
 * portamento rather than a string being pushed.
 */
export function articulationFor(technique?: Technique): Articulation {
  switch (technique) {
    case 'hammer':
      return { repick: false, attackSec: 0.012, velocityScale: 0.6, glideSec: 0 };
    case 'pull':
      return { repick: false, attackSec: 0.01, velocityScale: 0.55, glideSec: 0 };
    case 'slide':
      return { repick: false, attackSec: 0.01, velocityScale: 0.7, glideSec: 0.06 };
    case 'bendHalf':
      return { repick: true, attackSec: 0.003, velocityScale: 1, glideSec: 0.11 };
    case 'bendFull':
      return { repick: true, attackSec: 0.003, velocityScale: 1, glideSec: 0.14 };
    default:
      return PLAIN;
  }
}

/** A short metronome blip: a triangle-wave click, slightly louder on the downbeat. */
export function click(ctx: AudioContext, dest: AudioNode, when: number, accented: boolean): void {
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = accented ? 1200 : 900;

  const gain = ctx.createGain();
  const peak = accented ? voiceTuning.clickAccentLevel : voiceTuning.clickLevel;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.linearRampToValueAtTime(peak, when + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.03);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(when);
  osc.stop(when + 0.04);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

/** One decaying white-noise burst per context, reused for every pick attack. */
const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>();

function pickNoise(ctx: AudioContext): AudioBuffer {
  const cached = noiseCache.get(ctx);
  if (cached) return cached;
  const length = Math.max(1, Math.floor(ctx.sampleRate * 0.05));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    // Fade across the burst so it reads as a pick scraping the string, not a click.
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  noiseCache.set(ctx, buffer);
  return buffer;
}

export interface PluckOptions {
  /** 0..1 peak level before articulation scaling. */
  velocity?: number;
  /** Articulation into this note from the previous one. */
  technique?: Technique;
  /** MIDI of the previous note in the lick — the start pitch for bend and slide glides. */
  fromMidi?: number;
}

/**
 * Sound one note. `durationSec` is the *notated* length — the voice deliberately rings past it
 * (see `decayScaleForMidi`) so notes bleed into each other the way a real guitar does rather than
 * being cut cleanly at the next onset.
 */
export function pluck(
  ctx: AudioContext,
  dest: AudioNode,
  when: number,
  m: number,
  durationSec: number,
  opts: PluckOptions = {},
): void {
  const { velocity = 1, technique, fromMidi } = opts;
  const art = articulationFor(technique);
  const freq = midiToFrequency(m);
  const decay = decayScaleForMidi(m);

  const noteEnd = when + Math.max(durationSec, 0.1);
  const ringEnd = noteEnd + voiceTuning.ringSec * decay;
  const stopTime = ringEnd + 0.05;

  // Two saws a few cents apart: a single oscillator sounds static, the beating between two reads
  // as string thickness. The second also fattens what the overdrive downstream has to chew on.
  const oscA = ctx.createOscillator();
  const oscB = ctx.createOscillator();
  oscA.type = 'sawtooth';
  oscB.type = 'sawtooth';
  oscB.detune.value = voiceTuning.detuneCents;

  const glideFrom = art.glideSec > 0 && fromMidi !== undefined ? midiToFrequency(fromMidi) : null;
  for (const osc of [oscA, oscB]) {
    if (glideFrom !== null) {
      osc.frequency.setValueAtTime(glideFrom, when);
      osc.frequency.linearRampToValueAtTime(freq, when + art.glideSec);
    } else {
      osc.frequency.setValueAtTime(freq, when);
    }
  }

  // Falling cutoff: bright at the attack, mellow as the note rings out.
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.7;
  const nyquist = ctx.sampleRate / 2 - 1;
  const openCutoff = Math.min(nyquist, Math.min(voiceTuning.filterOpenCapHz, freq * voiceTuning.filterOpenMult + 2000));
  const restCutoff = Math.min(nyquist, freq * voiceTuning.filterRestMult + 250);
  filter.frequency.setValueAtTime(openCutoff, when);
  filter.frequency.exponentialRampToValueAtTime(restCutoff, when + voiceTuning.filterFallSec);

  const amp = ctx.createGain();
  const peak = voiceTuning.peakLevel * art.velocityScale * Math.min(1, Math.max(0, velocity));
  amp.gain.setValueAtTime(0.0001, when);
  amp.gain.linearRampToValueAtTime(peak, when + art.attackSec);
  // The string settles fast right after the pluck, then rings out gently. The drop to
  // sustainLevel is what makes a note read as plucked rather than held.
  amp.gain.exponentialRampToValueAtTime(
    peak * voiceTuning.sustainLevel,
    when + art.attackSec + voiceTuning.pluckDecaySec,
  );
  amp.gain.exponentialRampToValueAtTime(0.0001, ringEnd);

  oscA.connect(filter);
  oscB.connect(filter);
  filter.connect(amp);
  amp.connect(dest);

  // Held notes get a hand vibrato, easing in the way a player's does — never from the first instant.
  let lfo: OscillatorNode | null = null;
  let lfoDepth: GainNode | null = null;
  if (ringEnd - when > voiceTuning.vibratoMinSec) {
    lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = voiceTuning.vibratoRateHz;
    lfoDepth = ctx.createGain();
    lfoDepth.gain.setValueAtTime(0, when);
    lfoDepth.gain.setValueAtTime(0, when + voiceTuning.vibratoDelaySec);
    lfoDepth.gain.linearRampToValueAtTime(voiceTuning.vibratoDepthCents, when + voiceTuning.vibratoDelaySec + 0.3);
    lfo.connect(lfoDepth);
    lfoDepth.connect(oscA.detune);
    lfoDepth.connect(oscB.detune);
    lfo.start(when);
    lfo.stop(stopTime);
  }

  let noise: AudioBufferSourceNode | null = null;
  let noiseGain: GainNode | null = null;
  let noiseFilter: BiquadFilterNode | null = null;
  if (art.repick) {
    noise = ctx.createBufferSource();
    noise.buffer = pickNoise(ctx);
    noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = voiceTuning.pickBandHz;
    noiseFilter.Q.value = 0.8;
    noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(voiceTuning.pickLevel * Math.min(1, Math.max(0, velocity)), when);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.03);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(when);
    noise.stop(when + 0.05);
  }

  oscA.start(when);
  oscB.start(when);
  oscA.stop(stopTime);
  oscB.stop(stopTime);

  // Tear down nodes once done, so they don't accumulate over a long loop.
  const cleanupDelay = Math.max(0, (stopTime + 0.1 - ctx.currentTime) * 1000);
  setTimeout(() => {
    oscA.disconnect();
    oscB.disconnect();
    filter.disconnect();
    amp.disconnect();
    lfo?.disconnect();
    lfoDepth?.disconnect();
    noise?.disconnect();
    noiseFilter?.disconnect();
    noiseGain?.disconnect();
  }, cleanupDelay);
}

// Dev only — see the matching note in engine.ts. The live `Transport` was constructed from the
// previous module graph, so a hot update here never reaches the `pluck` it actually calls.
if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}
