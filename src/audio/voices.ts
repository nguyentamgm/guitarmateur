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

/** A short metronome blip: a square-wave click, higher/louder on the downbeat. */
export function click(ctx: AudioContext, dest: AudioNode, when: number, accented: boolean): void {
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = accented ? 2000 : 1500;

  const gain = ctx.createGain();
  const peak = accented ? 0.9 : 0.5;
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
 * A plucked-string note via Karplus-Strong: a short noise burst excites a feedback delay line
 * (delay = 1/f) damped by a lowpass filter, so it rings at the note's pitch and decays naturally.
 * `durationSec` sets the amplitude envelope; the string tail rings out a little past it.
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

  const delay = ctx.createDelay(1);
  delay.delayTime.value = period;

  const damp = ctx.createBiquadFilter();
  damp.type = 'lowpass';
  damp.frequency.value = Math.min(ctx.sampleRate / 2 - 1, freq * 6 + 800);

  const feedback = ctx.createGain();
  feedback.gain.value = 0.95; // <1 so the string decays

  // Feedback loop: delay → damp → feedback → delay.
  delay.connect(damp);
  damp.connect(feedback);
  feedback.connect(delay);

  // Excitation: one period of white noise.
  const burstLen = Math.max(1, Math.floor(ctx.sampleRate * period));
  const buffer = ctx.createBuffer(1, burstLen, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < burstLen; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.connect(delay);

  // Output amplitude envelope.
  const amp = ctx.createGain();
  const tail = when + Math.max(durationSec, 0.12) + 0.25;
  amp.gain.setValueAtTime(Math.max(0.0001, velocity), when);
  amp.gain.exponentialRampToValueAtTime(0.0001, tail);
  delay.connect(amp);
  amp.connect(dest);

  noise.start(when);
  noise.stop(when + period);

  // Tear down the loop once it has rung out, so nodes don't accumulate over a long loop.
  const stopInMs = Math.max(0, (tail - ctx.currentTime) * 1000) + 60;
  setTimeout(() => {
    noise.disconnect();
    delay.disconnect();
    damp.disconnect();
    feedback.disconnect();
    amp.disconnect();
  }, stopInMs);
}
