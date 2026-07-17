/**
 * Voices — the two sound sources, built entirely from native Web Audio nodes (no samples, no
 * AudioWorklet). The pitch math (`midiToFrequency`, `delayTimeForMidi`) is pure and unit-tested;
 * the node graphs are exercised by ear via the manual checklist, not asserted in tests.
 */

/** Equal-tempered frequency of a MIDI note (A4 = 69 = 440 Hz). */
export function midiToFrequency(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

/**
 * Karplus-Strong delay-line length for a pitch: the feedback delay must equal one period, `1/f`,
 * so the loop resonates at the note's fundamental.
 */
export function delayTimeForMidi(m: number): number {
  return 1 / midiToFrequency(m);
}

/** A short metronome blip: a triangle-wave click, higher/louder on the downbeat. */
export function click(ctx: AudioContext, dest: AudioNode, when: number, accented: boolean): void {
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = accented ? 1200 : 900;

  const gain = ctx.createGain();
  const peak = accented ? 0.25 : 0.15;
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
 * A plucked-string note via Karplus-Strong synthesis, designed for warm, listenable guitar-like
 * tones (Songsterr-level quality — not pro, but safe for speakers and ears).
 *
 * Signal chain:
 * ```
 * Noise → noiseFilter ─┐
 *                       ↓
 * delay ─→ damp ─→ dcBlock ─→ feedback ─→ delay    (feedback loop)
 *               │
 *               └─→ amp ─→ dest                      (output tap — after damping = warmer)
 * ```
 *
 * Key design decisions:
 * - Damping lowpass at ~1.2× fundamental aggressively cuts harsh harmonics for warmth.
 * - Output is tapped **after** the damping filter so the listener hears the shaped tone.
 * - DC blocker inside the feedback loop prevents subsonic buildup.
 * - Smooth 6ms attack ramp eliminates the click/pop on note start.
 * - Release envelope scales with note duration (clamped 50ms–2s).
 * - Noise excitation is lowpass-filtered at 3× fundamental for a band-limited, softer attack.
 * - Feedback gain 0.82 gives natural string decay without howl.
 * - Gain-staged so multiple overlapping notes sum cleanly without clipping.
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
  const period = 1 / freq;
  const attackSec = 0.006; // 6 ms attack ramp — smooth start, no click

  // ── Karplus-Strong feedback loop ──────────────────────────────────────

  const delay = ctx.createDelay(1);
  delay.delayTime.value = period;

  // Damping lowpass: strongly attenuates harmonics above ~1.2× fundamental,
  // giving a warm, guitar-like body tone rather than a bright, metallic twang.
  const damp = ctx.createBiquadFilter();
  damp.type = 'lowpass';
  damp.frequency.value = Math.min(ctx.sampleRate / 2 - 1, freq * 1.2 + 80);

  // Feedback gain: lower values = shorter, more natural decay. 0.82 lets
  // the note ring for about 1–2 seconds on low strings, shorter on highs.
  const feedback = ctx.createGain();
  feedback.gain.value = 0.82;

  // DC blocker inside the loop prevents DC offset from accumulating in the
  // delay line across many feedback iterations (which would cause a subsonic
  // thump audible on headphones / large speakers).
  const dcBlock = ctx.createBiquadFilter();
  dcBlock.type = 'highpass';
  dcBlock.frequency.value = 25;

  // Wire the feedback loop: delay → damp → dcBlock → feedback → delay
  delay.connect(damp);
  damp.connect(dcBlock);
  dcBlock.connect(feedback);
  feedback.connect(delay);

  // ── Excitation: a soft, band-limited noise burst ──────────────────────

  // One period of noise excites the string. A full-spectrum burst sounds
  // harsh, so we pre-filter the noise through a lowpass at 3× the note's
  // fundamental, keeping only musically relevant harmonics.
  const burstLen = Math.max(2, Math.floor(ctx.sampleRate * period));
  const buffer = ctx.createBuffer(1, burstLen, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // Approximate Gaussian noise (central limit theorem with 4 uniforms) for
  // a smoother, less spiky attack than raw uniform white noise.
  for (let i = 0; i < burstLen; i++) {
    data[i] = (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 0.28;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = Math.min(ctx.sampleRate / 2 - 1, freq * 3);
  noise.connect(noiseFilter);
  noiseFilter.connect(delay);

  // ── Output amplitude envelope ─────────────────────────────────────────

  const amp = ctx.createGain();
  const peakGain = Math.max(0.0001, Math.min(0.7, velocity * 0.7));
  // Release time is proportional to the note duration, clamped to a
  // reasonable range so very short notes don't cut off abruptly and long
  // notes don't sustain memory pressure.
  const releaseSec = Math.min(2.0, Math.max(0.05, durationSec));
  const tail = when + releaseSec + 0.15;

  // Attack: smooth linear ramp from silence to peak over 6 ms.
  amp.gain.setValueAtTime(0.0001, when);
  amp.gain.linearRampToValueAtTime(peakGain, when + attackSec);
  // Hold at peak for a brief moment then release.
  amp.gain.setValueAtTime(peakGain, when + attackSec + 0.001);
  amp.gain.exponentialRampToValueAtTime(0.0001, tail);

  // Output is tapped from **after** the damping filter for a warmer tone.
  damp.connect(amp);
  amp.connect(dest);

  // ── Fire the noise burst ──────────────────────────────────────────────

  noise.start(when);
  noise.stop(when + period + 0.001);

  // ── Cleanup: disconnect all nodes after the note has rung out ──────────

  const stopInMs = Math.max(0, (tail - ctx.currentTime) * 1000) + 100;
  setTimeout(() => {
    noise.disconnect();
    noiseFilter.disconnect();
    delay.disconnect();
    damp.disconnect();
    dcBlock.disconnect();
    feedback.disconnect();
    amp.disconnect();
  }, stopInMs);
}
