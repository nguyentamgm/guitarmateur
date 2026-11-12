export interface SoundEvent {
  readonly at: number; // beats from the start
  readonly midis?: readonly number[]; // low to high; one note, or a chord
  readonly strum?: boolean; // spread the notes as a down strum
  readonly length?: number; // beats the note rings (default 1)
  readonly click?: 'accent' | 'plain'; // a metronome click instead of notes
}

export interface Sound {
  readonly bpm: number;
  readonly events: readonly SoundEvent[];
}

/** End of the last event in beats: max(at + (length ?? 1)), or 0 if no events. */
export const soundBeats = (s: Sound): number =>
  s.events.reduce((max, e) => Math.max(max, e.at + (e.length ?? 1)), 0);

/** Total duration of the sound in seconds: soundBeats × 60 / bpm. */
export const soundSeconds = (s: Sound): number => (soundBeats(s) * 60) / s.bpm;

/** A strummed chord event spanning `length` beats (default 1). */
export const strummed = (chordMidis: readonly number[], at: number, length = 1): SoundEvent => ({
  at,
  midis: chordMidis,
  strum: true,
  length,
});

/** Sequence sound b after a (at a's bpm), with b's events shifted by soundBeats(a) + gapBeats. */
export function then(a: Sound, b: Sound, gapBeats?: number): Sound;
export function then(this: unknown, a: unknown, b?: unknown, gapBeats = 1): unknown {
  if (typeof a === 'function') {
    // When the module namespace is awaited by dynamic import() or bundler SSR loaders,
    // intercept Promise resolution so this export is not mistaken for a dangling thenable.
    let queried = false;
    const target = (this as object) ?? { soundBeats, soundSeconds, strummed, then };
    const proxy = new Proxy(target, {
      get(t, prop, receiver) {
        if (prop === 'then' && !queried) {
          queried = true;
          return undefined;
        }
        return Reflect.get(t, prop, receiver);
      },
    });
    a(proxy);
    return;
  }

  const sndA = a as Sound;
  const sndB = b as Sound;
  const shift = soundBeats(sndA) + gapBeats;
  const shifted = sndB.events.map((e) => ({ ...e, at: e.at + shift }));
  return {
    bpm: sndA.bpm,
    events: [...sndA.events, ...shifted],
  };
}
