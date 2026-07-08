# Plan 07 — Audio: Metronome & Lick Playback (Phase 2 / M5)

## Goals

Let the user *hear* what they're practicing: a metronome, per-card lick playback, and a
progression play-along loop — **entirely client-side with the Web Audio API**. Zero cost, zero
external assets, zero backend. This plan builds on the rhythm data that plan 04 made first-class
(`startBeat`/`durationBeats` — the reason audio is now a bolt-on instead of a rewrite).

Do not start before M3 is live; nothing earlier depends on this.

## Scope

In: metronome with count-in, tempo control, play one lick, loop the whole progression
(each chord's lick in sequence) with the metronome underneath, per-chord bar counts.
Out (unscheduled): backing-track synthesis (drums/bass), swing feel, YouTube sync, recording,
volume mixer beyond two gain sliders (click / notes).

## New state (extends plan 06 — schema v3 migration: add fields with defaults)

```ts
tempoBpm: number;                     // default 90, range 40–200
// ProgressionEntry gains: bars: number (default 1) — a chord now spans bars × 4 beats
```

Lick `lengthBeats` becomes `bars * 4` — plan 04's generator already takes `lengthBeats` as input;
rhythm pattern library gains 2-bar variants (data addition, no engine change). UI: a small
"×1/×2" bar toggle on progression chips; tempo number input + slider in the practice controls bar.

## Architecture (`src/audio/`, no React imports)

```
engine.ts      AudioContext lifecycle (created on first user gesture), master gain
scheduler.ts   lookahead scheduler (the standard "tale of two clocks" pattern:
               setInterval(25ms) schedules events falling in the next 100ms window
               on the AudioContext clock) — sample-accurate, tab-throttle-proof
voices.ts      click(when, accented) — short filtered noise/oscillator blip, two pitches
               pluck(when, midi, durationSec) — Karplus-Strong plucked string:
               noise burst into a feedback delay line (delay = 1/f) with lowpass damping,
               implemented with native DelayNode/BiquadFilterNode (no AudioWorklet needed v1)
transport.ts   play/stop/loop state machine; converts Lick + tempo into scheduled events;
               emits beat/position callbacks for UI highlighting
```

`useTransport()` hook in `src/ui/` adapts transport to React (play state, current beat, current
card). Techniques map to playback pragmatically: slides/hammers/pulls just retrigger softly
(shorter attack); bends = pitch ramp via detune automation on the delay time is overkill — v1
plays the bend's *target* pitch. Note pitch comes from `LickNote.pitch` → `midi()`.

## UI additions (mockup has no audio design — stay in its visual language)

- Practice controls bar gains: play/stop button (accent, mono "▶ / ■"), tempo control,
  count-in toggle (1 bar of clicks), loop toggle, two small gain sliders.
- Playing card gets an accent border; current note highlighted on its `TabStaff` (via transport
  beat callback — position, not per-sample, precision).
- Remove the header's "No audio here" line; replace with "Play along or cue your own backing track."
- Autoplay policy: the AudioContext is created/resumed inside the click handler of the play
  button (required by browsers); show a muted hint if `context.state` stays `suspended`.

## Tests (unit-testable parts only — no audio-output assertions)

- Event compilation: `transport.compile(licks, tempo, countIn)` → list of `{timeSec, voice,
  midi}`: beat→seconds math at several tempos; count-in prepends 4 clicks; loop wraps seamlessly
  (first note of repeat = one bar after last bar start); bars×4 length respected.
- Karplus-Strong parameters: delay time = 1/frequency for sampled midi notes.
- Scheduler: with a mocked clock, events fire exactly once, in the lookahead window.
- Manual checklist: no drift over 2 minutes of looping (compare against a phone metronome);
  playback works on Chrome + Firefox + one mobile Safari/Chrome; UI never blocks while playing.

## Acceptance criteria

- [ ] Metronome + lick playback + progression loop work at 40–200 BPM without drift or glitches.
- [ ] All audio code behind the user-gesture gate; no console autoplay warnings.
- [ ] Schema v3 migration preserves existing user state (new fields defaulted).
- [ ] Still zero runtime dependencies and zero network requests for audio assets.
