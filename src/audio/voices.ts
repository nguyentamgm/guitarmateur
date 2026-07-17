/**
 * Voices — two sound sources built from native Web Audio nodes (no samples, no AudioWorklet).
 * The pitch math (`midiToFrequency`) is pure and unit-tested; the node graphs are exercised by ear.
 *
 * Note synth uses an oscillator + ADSR envelope + lowpass filter instead of Karplus-Strong for
 * reliable pitch accuracy and consistent volume. Karplus-Strong was causing quiet, out-of-tune
 * output due to issues with the delay-line feedback loop resonance and filter phase interaction.
 */

/** Equal-tempered frequency of a MIDI note (A4 = 69 = 440 Hz). */
export function midiToFrequency(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

/**
 * Karplus-Strong delay-line length for a pitch: the feedback delay must equal one period, `1/f`.
 * Kept for backward compatibility — tests reference it, and it's correct pure math.
 */
export function delayTimeForMidi(m: number): number {
  return 1 / midiToFrequency(m);
}

/** A short metronome blip: a square-wave click, slightly louder on the downbeat. */
export function click(ctx: AudioContext, dest: AudioNode, when: number, accented: boolean): void {
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = accented ? 2000 : 1500;

  const gain = ctx.createGain();
  // Lower peak so metronome is a subtle background element, not overpowering
  const peak = accented ? 0.3 : 0.15;
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + 0.001);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(when);
  osc.stop(when + 0.06);
  osc.onended = () => {
    osc.disconnect();
    gain.disconnect();
  };
}

/**
 * A plucked-string note via oscillator synthesis: a sawtooth wave with an ADSR-like envelope and
 * gentle lowpass filter for warmth. Provides correct pitch, consistent audible volume, and a basic
 * guitar-like tone — trading Karplus-Strong's physical-modeling authenticity for reliability.
 *
 * Envelope shape mimics a plucked string:
 *   - Very fast attack (~3ms)
 *   - Quick initial decay to ~30% over ~30ms
 *   - Natural exponential ring-out after that
 */
export function pluck(
  ctx: AudioContext,
  dest: AudioNode,
  when: number,
  m: number,
  durationSec: number,
  velocity = 1,
): void {
  const freq = midiToFrequency(m);

  // Sawtooth oscillator for rich harmonic content (guitar-like)
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, when);

  // Gentle lowpass filter for warmth — let enough harmonics through for a natural tone
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = Math.min(ctx.sampleRate / 2 - 1, freq * 8 + 1200);
  filter.Q.value = 0.3;

  // Pluck-like amplitude envelope
  const amp = ctx.createGain();
  const peakGain = 0.6 * Math.min(1, Math.max(0, velocity));
  const sustainTime = when + Math.max(durationSec, 0.12);
  const releaseEnd = sustainTime + 0.2;
  const stopTime = releaseEnd + 0.05;

  // Attack: fast ramp to peak
  amp.gain.setValueAtTime(0.0001, when);
  amp.gain.linearRampToValueAtTime(peakGain, when + 0.003);
  // Quick initial decay (string settles after pluck)
  amp.gain.exponentialRampToValueAtTime(peakGain * 0.3, when + 0.03);
  // Ring out at natural decay rate
  amp.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

  // Signal chain: oscillator → filter → amplifier → destination
  osc.connect(filter);
  filter.connect(amp);
  amp.connect(dest);

  osc.start(when);
  osc.stop(stopTime);

  // Tear down nodes once done, so they don't accumulate over a long loop
  const cleanupDelay = Math.max(0, (stopTime + 0.1 - ctx.currentTime) * 1000);
  setTimeout(() => {
    osc.disconnect();
    filter.disconnect();
    amp.disconnect();
  }, cleanupDelay);
}
