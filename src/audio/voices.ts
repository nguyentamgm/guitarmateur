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
 * If notes sound SHORT — each one a blip that dies before the next lands, so the line reads as a
 * sequence of clicks rather than a guitar — the note's body is decaying too fast. In order of
 * impact: raise `sustainLevel`, raise `bodyHalfLifeSec`, raise `ringSec`, raise `filterRestMult`.
 *
 * If notes sound like an ORGAN — steady, no attack, no decay — the amplitude envelope is being
 * flattened. Go the other way, and check `drive` (engine.ts) and `pickLevel` first: a strong pick
 * transient is what lets the body sustain without the result sounding held.
 *
 * If TECHNIQUES are inaudible — a hammer-on indistinguishable from a picked note, a bend that just
 * arrives at a new pitch — raise `slapLevel` first (the fretting-hand noise is the only cue that a
 * note was not picked), then `legatoLevel`, then `bendTimeSec` / `slideTimePerSemitoneSec` to give
 * the pitch move time to be heard. Note that the transport damps the previous note on the same
 * string as each note lands, which is what clears room for any of this to be audible at all.
 */
export interface VoiceTuning {
  /** Cents between the two oscillators. 0..12. Higher = thicker, but chorus-y and pad-like. */
  detuneCents: number;
  /** Peak level of one voice into the amp bus. 0.15..0.45. Raise together with engine PRE_GAIN. */
  peakLevel: number;
  /** Level the string settles to right after the pluck, as a fraction of peak. 0.2..0.6.
   *  THE organ dial: lower = percussive and short, higher = the note carries to the next one.
   *  Too low and every note is a click with nothing behind it. */
  sustainLevel: number;
  /** How fast the string settles from peak to `sustainLevel`, seconds. 0.02..0.15. */
  pluckDecaySec: number;
  /** How long the *body* of a note takes to halve in level, seconds (scaled by pitch). 0.4..4.
   *  This is what keeps a note alive until the next one: a quarter note barely fades over its
   *  own length, a whole note visibly dies away. Lower = notes drop out between onsets. */
  bodyHalfLifeSec: number;
  /** How long the release tail runs past the note's notated length, seconds (scaled by pitch).
   *  0.3..2.0. Higher = notes bleed into each other like a real guitar; too high = muddy soup. */
  ringSec: number;
  /** Pick-attack noise level. 0..0.6. Higher = more percussive bite, the main anti-organ cue. */
  pickLevel: number;
  /** Fretting-hand noise level: the fret slap of a hammer-on, the flick of a pull-off, the scrape
   *  of a slide. 0..1.2. THE dial for hearing techniques — it is the only cue that says a note was
   *  hammered rather than picked, since the pick never strikes. */
  slapLevel: number;
  /** Pick noise band centre, Hz. 1200..3500. Higher = brighter, more "scrape".
   *  Fretting-hand noises are placed relative to this, so it colours all of them. */
  pickBandHz: number;
  /** Level of an un-picked (hammer/pull/slide) note, as a fraction of a picked one. 0.5..1.
   *  A fretting hand really is weaker than a pick, but not by much — too low and legato runs
   *  disappear under the note they came from. */
  legatoLevel: number;
  /** How long a full-tone bend takes to reach pitch, seconds. 0.1..0.5. A blues bend leans into
   *  the note; rushing it reads as a synth portamento. Capped by the note's own length. */
  bendTimeSec: number;
  /** How long a slide takes, per semitone travelled, seconds. 0.02..0.12. Scaling by distance is
   *  what makes a slide read as a hand moving rather than a pitch jump. */
  slideTimePerSemitoneSec: number;
  /** Cutoff at the attack = freq × this, capped by `filterOpenCapHz`. 6..16. */
  filterOpenMult: number;
  filterOpenCapHz: number;
  /** Cutoff once the note has settled = freq × this. 1.2..4. Higher = brighter sustain. */
  filterRestMult: number;
  /** How long the cutoff takes to fall, seconds. 0.1..0.5. Longer = more audible movement. */
  filterFallSec: number;
  /** Vibrato needs a held note; below this it just sounds unstable. Seconds.
   *  Bends ignore this — a bend held without vibrato is the one that sounds synthetic. */
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
  peakLevel: 0.26,
  sustainLevel: 0.5,
  pluckDecaySec: 0.05,
  bodyHalfLifeSec: 1.6,
  ringSec: 1.2,
  pickLevel: 1,
  slapLevel: 0.75,
  pickBandHz: 2200,
  legatoLevel: 0.85,
  bendTimeSec: 0.22,
  slideTimePerSemitoneSec: 0.045,
  filterOpenMult: 10,
  filterOpenCapHz: 9000,
  filterRestMult: 2.4,
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

/**
 * The noise burst at the front of a note. Every way of starting a note makes a *different* sound
 * before the pitch arrives, and that noise is most of how you tell them apart: a pick is a bright
 * click, a hammer-on is a dull thump of fingertip on wood, a pull-off is a soft flick sideways off
 * the string, a slide is a long scrape across the fret wire. Giving un-picked notes no transient at
 * all — the obvious reading of "the pick doesn't strike" — is what makes legato inaudible.
 *
 * Levels and bands are *relative* to the `pickLevel` / `slapLevel` / `pickBandHz` dials so the two
 * families stay in proportion when either is retuned.
 */
export interface Transient {
  /** Which level dial this noise is scaled from: the pick, or the fretting hand. */
  source: 'pick' | 'slap';
  levelScale: number;
  /** Band centre relative to `pickBandHz`. Below 1 = duller and woodier, above = more scrape. */
  bandScale: number;
  /** Filter width. Low Q = broad thump, high Q = narrow chirp. */
  q: number;
  /** How long the burst lasts, seconds. */
  decaySec: number;
}

const PICK: Transient = { source: 'pick', levelScale: 1, bandScale: 1, q: 0.8, decaySec: 0.03 };
/** Fingertip landing on the fretboard: low, woody, and slower than a pick click. */
const SLAP: Transient = { source: 'slap', levelScale: 1, bandScale: 0.32, q: 0.7, decaySec: 0.05 };
/** The finger flicks the string sideways as it leaves — a soft pluck, brighter than a slap. */
const FLICK: Transient = { source: 'slap', levelScale: 0.9, bandScale: 0.65, q: 1, decaySec: 0.035 };
/** Wound string dragged over fret wire: quieter but far longer, running under the whole glide. */
const SCRAPE: Transient = { source: 'slap', levelScale: 0.5, bandScale: 1.3, q: 1.6, decaySec: 0.11 };

/** How a note is articulated *into* from the one before it. */
export interface Articulation {
  /** The noise at the front of the note. Never null — every way of starting a note makes one. */
  transient: Transient;
  attackSec: number;
  /** Scales the note's peak level; un-picked notes are naturally weaker. */
  velocityScale: number;
  /** Seconds to glide from the previous pitch. 0 = jump straight to this note. */
  glideSec: number;
  /** Whether the glide eases in and out (a hand bending a string) or runs at a constant rate
   *  (a hand sliding along the neck). */
  glideEase: boolean;
  /** Bends get vibrato at the top of the push regardless of `vibratoMinSec` — that shimmer is
   *  what says "a hand is holding this string bent" rather than "the pitch moved". */
  vibratoAtPitch: boolean;
}

const PLAIN: Articulation = {
  transient: PICK,
  attackSec: 0.003,
  velocityScale: 1,
  glideSec: 0,
  glideEase: false,
  vibratoAtPitch: false,
};

/**
 * Map a lick technique onto how the voice should sound it.
 *
 * `semitones` is the interval being travelled into this note; it only matters for slides, where a
 * hand crossing five frets plainly takes longer than one crossing two. Bend times are deliberately
 * slow — a blues bend leans into pitch over a good fraction of a beat, and rushing it reads as a
 * synth portamento rather than a string being pushed. `pluck` caps both against the note's own
 * length, so a fast lick still lands on pitch in time.
 */
export function articulationFor(technique?: Technique, semitones = 0): Articulation {
  const legato = voiceTuning.legatoLevel;
  switch (technique) {
    case 'hammer':
      return { ...PLAIN, transient: SLAP, attackSec: 0.012, velocityScale: legato };
    case 'pull':
      return { ...PLAIN, transient: FLICK, attackSec: 0.01, velocityScale: legato * 0.96 };
    case 'slide':
      return {
        ...PLAIN,
        transient: SCRAPE,
        attackSec: 0.01,
        velocityScale: legato * 1.05,
        glideSec: Math.max(0.05, Math.abs(semitones) * voiceTuning.slideTimePerSemitoneSec),
      };
    case 'bendHalf':
      return { ...PLAIN, glideSec: voiceTuning.bendTimeSec * 0.75, glideEase: true, vibratoAtPitch: true };
    case 'bendFull':
      return { ...PLAIN, glideSec: voiceTuning.bendTimeSec, glideEase: true, vibratoAtPitch: true };
    default:
      return PLAIN;
  }
}

/**
 * Sampled pitch path from one note to another, as frequencies for `setValueCurveAtTime`.
 *
 * Interpolation runs in *semitones*, not Hz: pitch is logarithmic, so a straight line in Hz sweeps
 * fast at the bottom and crawls at the top, which is audibly not what a hand does. `ease` adds a
 * smoothstep — a bent string starts slow while the hand takes up tension, moves through the middle,
 * and settles onto the target rather than arriving at full speed. A slide stays linear: the hand
 * travels the neck at a roughly constant rate.
 */
export function glideCurve(
  fromMidi: number,
  toMidi: number,
  ease: boolean,
  points = 64,
): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(points);
  for (let i = 0; i < points; i++) {
    const p = i / (points - 1);
    const shaped = ease ? p * p * (3 - 2 * p) : p;
    curve[i] = midiToFrequency(fromMidi + (toMidi - fromMidi) * shaped);
  }
  return curve;
}

/** One breakpoint of a gain envelope, and the shape of the ramp *into* it from the previous one. */
export interface EnvelopePoint {
  t: number;
  v: number;
  curve: 'lin' | 'exp';
}

/**
 * The level an envelope has reached at time `t`, tracing the same ramps the Web Audio scheduler
 * does. Needed because a voice may be cut short partway through — see `Voice.release`, which has to
 * know where the gain currently is to fade from it without a click, and cannot ask the param
 * (`AudioParam.value` reports the *current* time, not a future one).
 */
export function envelopeLevelAt(points: readonly EnvelopePoint[], t: number): number {
  const first = points[0];
  if (!first) return 0;
  if (t <= first.t) return first.v;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    if (t > b.t) continue;
    const span = b.t - a.t;
    if (span <= 0) return b.v;
    const p = (t - a.t) / span;
    // Exponential ramps are geometric between the endpoints — the same curve `pow` traces.
    return b.curve === 'exp' && a.v > 0 && b.v > 0
      ? a.v * Math.pow(b.v / a.v, p)
      : a.v + (b.v - a.v) * p;
  }
  return points[points.length - 1]!.v;
}

/** Schedule an envelope onto a gain param, using each point's own ramp shape. */
function applyEnvelope(param: AudioParam, points: readonly EnvelopePoint[]): void {
  param.setValueAtTime(points[0]!.v, points[0]!.t);
  for (let i = 1; i < points.length; i++) {
    const p = points[i]!;
    if (p.curve === 'exp') param.exponentialRampToValueAtTime(p.v, p.t);
    else param.linearRampToValueAtTime(p.v, p.t);
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

/**
 * One white-noise burst per context, reused for every attack transient. Long enough to cover a
 * slide's scrape (the longest of them); each transient's own gain envelope decides how much of it
 * is actually heard, so the buffer itself only fades gently.
 */
const noiseCache = new WeakMap<BaseAudioContext, AudioBuffer>();

const NOISE_BUFFER_SEC = 0.2;

function pickNoise(ctx: AudioContext): AudioBuffer {
  const cached = noiseCache.get(ctx);
  if (cached) return cached;
  const length = Math.max(1, Math.floor(ctx.sampleRate * NOISE_BUFFER_SEC));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    // Fade across the burst so it reads as something dragging on the string, not a click.
    data[i] = (Math.random() * 2 - 1) * (1 - 0.6 * (i / length));
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
 * A sounding note, still under the caller's control after it has been scheduled.
 *
 * This exists for one reason: a guitar string can only sound one note at a time. Every technique in
 * a lick — hammer, pull, slide, bend — happens on the *same string* as the note before it, so the
 * previous note has to get out of the way or it masks the very thing the technique is meant to
 * make audible. `transport.ts` holds one of these per string and releases it as the next note lands.
 */
export interface Voice {
  /** Fade this note out from `at`, over `fadeSec`, replacing whatever was scheduled after it. */
  release(at: number, fadeSec: number): void;
}

/**
 * Sound one note. `durationSec` is the *notated* length: the note stays at full body for all of it
 * — a real string is still ringing when the next one is picked — and then releases past it (see
 * `decayScaleForMidi`) so notes bleed into each other rather than being cut at the next onset.
 */
export function pluck(
  ctx: AudioContext,
  dest: AudioNode,
  when: number,
  m: number,
  durationSec: number,
  opts: PluckOptions = {},
): Voice {
  const { velocity = 1, technique, fromMidi } = opts;
  const semitones = fromMidi === undefined ? 0 : m - fromMidi;
  const art = articulationFor(technique, semitones);
  const freq = midiToFrequency(m);
  const decay = decayScaleForMidi(m);

  const noteEnd = when + Math.max(durationSec, 0.1);
  const ringEnd = noteEnd + voiceTuning.ringSec * decay;
  let stopTime = ringEnd + 0.05;

  // Two saws a few cents apart: a single oscillator sounds static, the beating between two reads
  // as string thickness. The second also fattens what the overdrive downstream has to chew on.
  const oscA = ctx.createOscillator();
  const oscB = ctx.createOscillator();
  oscA.type = 'sawtooth';
  oscB.type = 'sawtooth';
  oscB.detune.value = voiceTuning.detuneCents;

  // Never spend more than half the note getting to pitch — otherwise a bend on a fast eighth note
  // is still travelling when the next note lands, and the target pitch is never actually heard.
  const glideSec =
    art.glideSec > 0 && fromMidi !== undefined && fromMidi !== m
      ? Math.min(art.glideSec, Math.max(0.03, (noteEnd - when) * 0.5))
      : 0;
  for (const osc of [oscA, oscB]) {
    if (glideSec > 0) {
      osc.frequency.setValueCurveAtTime(glideCurve(fromMidi!, m, art.glideEase), when, glideSec);
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
  // Four stages: pick attack, the fast settle right after it, the *body* that carries the note to
  // the next onset, then the release tail. Only the settle is fast — a real string does not lose
  // most of its energy in the first 50 ms, and an envelope that does makes every note read as a
  // blip. Held pitch through the body is what a guitar sounds like; the attack transient (peak,
  // pick noise, open filter) is what keeps it from sounding like an organ.
  const sustain = Math.max(0.0002, peak * voiceTuning.sustainLevel);
  // Keep the body a real span even for a very short note or a slow-settling tuning.
  const bodyStart = Math.min(
    when + art.attackSec + voiceTuning.pluckDecaySec,
    noteEnd - 0.01,
  );
  // The body decays at a constant *rate*, not to a fixed level — so a quarter note holds nearly
  // flat until the next note lands while a whole note audibly dies away, exactly as a string does.
  // `exponentialRampToValueAtTime` between two breakpoints is exponential, so this half-life is
  // literally what the ramp traces.
  const halfLife = Math.max(0.05, voiceTuning.bodyHalfLifeSec * decay);
  const bodyEndLevel = Math.max(0.0002, sustain * Math.pow(0.5, (noteEnd - bodyStart) / halfLife));

  const envelope: EnvelopePoint[] = [
    { t: when, v: 0.0001, curve: 'lin' },
    { t: when + art.attackSec, v: peak, curve: 'lin' },
    { t: bodyStart, v: sustain, curve: 'exp' },
    { t: noteEnd, v: bodyEndLevel, curve: 'exp' },
    { t: ringEnd, v: 0.0001, curve: 'exp' },
  ];
  applyEnvelope(amp.gain, envelope);

  oscA.connect(filter);
  oscB.connect(filter);
  filter.connect(amp);
  amp.connect(dest);

  // Vibrato, easing in the way a player's hand does — never from the first instant. A long held
  // note earns it; so does *any* bend, regardless of length, because a bend held dead still is the
  // one that gives the synthesiser away. On a bend it starts as the push arrives at pitch.
  let lfo: OscillatorNode | null = null;
  let lfoDepth: GainNode | null = null;
  const vibratoDelay = art.vibratoAtPitch
    ? glideSec + 0.05
    : voiceTuning.vibratoDelaySec;
  if (art.vibratoAtPitch ? ringEnd - when > glideSec + 0.2 : ringEnd - when > voiceTuning.vibratoMinSec) {
    lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = voiceTuning.vibratoRateHz;
    lfoDepth = ctx.createGain();
    lfoDepth.gain.setValueAtTime(0, when);
    lfoDepth.gain.setValueAtTime(0, when + vibratoDelay);
    lfoDepth.gain.linearRampToValueAtTime(voiceTuning.vibratoDepthCents, when + vibratoDelay + 0.3);
    lfo.connect(lfoDepth);
    lfoDepth.connect(oscA.detune);
    lfoDepth.connect(oscB.detune);
    lfo.start(when);
    lfo.stop(stopTime);
  }

  // The attack transient. Always present — how a note *starts* is how you tell a hammer-on from a
  // pull-off from a pick, and the pitch alone carries none of that.
  const transient = art.transient;
  const noise = ctx.createBufferSource();
  noise.buffer = pickNoise(ctx);
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = Math.min(nyquist, voiceTuning.pickBandHz * transient.bandScale);
  noiseFilter.Q.value = transient.q;
  const noiseGain = ctx.createGain();
  const base = transient.source === 'pick' ? voiceTuning.pickLevel : voiceTuning.slapLevel;
  const noiseLevel = Math.max(
    0.0001,
    base * transient.levelScale * Math.min(1, Math.max(0, velocity)),
  );
  noiseGain.gain.setValueAtTime(noiseLevel, when);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, when + transient.decaySec);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(dest);
  noise.start(when);
  noise.stop(when + Math.min(NOISE_BUFFER_SEC, transient.decaySec + 0.02));

  oscA.start(when);
  oscB.start(when);
  oscA.stop(stopTime);
  oscB.stop(stopTime);

  // Tear down nodes once done, so they don't accumulate over a long loop. Scheduled from the
  // original stop time; an early `release` only ever brings the real end forward, and disconnecting
  // an already-stopped node is harmless.
  const cleanupDelay = Math.max(0, (stopTime + 0.1 - ctx.currentTime) * 1000);
  setTimeout(() => {
    oscA.disconnect();
    oscB.disconnect();
    filter.disconnect();
    amp.disconnect();
    lfo?.disconnect();
    lfoDepth?.disconnect();
    noise.disconnect();
    noiseFilter.disconnect();
    noiseGain.disconnect();
  }, cleanupDelay);

  let released = false;
  return {
    release(at: number, fadeSec: number): void {
      // Only ever shortens a note, and only once — a voice already fading must not be re-armed.
      if (released || at >= ringEnd) return;
      released = true;
      const end = at + Math.max(0.005, fadeSec);
      // The gain has to be pinned at whatever the envelope had reached by `at` before the rest of
      // the automation is dropped — a bare `cancelScheduledValues` rewinds the param to the last
      // breakpoint that already passed, which reads as the note swelling and then ducking.
      // `cancelAndHoldAtTime` does exactly this and keeps the ramp so far intact; where it is
      // missing, compute the same level from the envelope we scheduled.
      const gain = amp.gain as AudioParam & { cancelAndHoldAtTime?: (t: number) => void };
      if (typeof gain.cancelAndHoldAtTime === 'function') {
        gain.cancelAndHoldAtTime(at);
      } else {
        gain.cancelScheduledValues(at);
        gain.setValueAtTime(Math.max(0.0002, envelopeLevelAt(envelope, at)), at);
      }
      gain.exponentialRampToValueAtTime(0.0001, end);
      stopTime = end + 0.02;
      oscA.stop(stopTime);
      oscB.stop(stopTime);
      lfo?.stop(stopTime);
    },
  };
}

// Dev only — see the matching note in engine.ts. The live `Transport` was constructed from the
// previous module graph, so a hot update here never reaches the `pluck` it actually calls.
if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}
