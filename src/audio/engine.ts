/**
 * AudioContext lifecycle. The context must be created inside a user gesture (browser autoplay
 * policy), so `createEngine` is called lazily from the play handler — never at module load.
 * Two sub-buses (click / note) feed a master gain so the UI can mix them independently.
 */
export interface AudioEngine {
  ctx: AudioContext;
  master: GainNode;
  clickBus: GainNode;
  noteBus: GainNode;
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

/** Create a fresh engine. Throws if Web Audio is unavailable — callers gate on `isAudioSupported`. */
export function createEngine(): AudioEngine {
  const Ctor = getAudioContextCtor();
  if (!Ctor) throw new Error('Web Audio API is not available in this environment.');

  const ctx = new Ctor();
  const master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(ctx.destination);

  const clickBus = ctx.createGain();
  clickBus.gain.value = 0.3;
  clickBus.connect(master);

  const noteBus = ctx.createGain();
  noteBus.gain.value = 0.8;
  noteBus.connect(master);

  return { ctx, master, clickBus, noteBus };
}
