/**
 * Dev-only live tuning console for the guitar tone. Stripped from production builds — every call
 * site is behind `import.meta.env.DEV`, so bundlers drop this module entirely.
 *
 * The amp's node graph is built once and cached by `useTransport`, and the voice reads its tuning
 * fresh on every note. That means both can be retuned *while a loop plays* — which beats editing a
 * constant, waiting for a reload, and trying to remember what the last version sounded like.
 *
 * `SETTINGS` and `formatDump` are pure and unit-tested; only `installAmpDevTools` touches globals.
 */

import type { AudioEngine } from './engine';
import { VOICE_DEFAULTS, makeDriveCurve, voiceTuning, type VoiceTuning } from './voices';

/** Where a setting lives, which decides how `dump()` formats it for pasting back. */
type Source = 'engine' | 'voice';

interface Setting {
  /** Identifier to print in `dump()` — a `const` name in engine.ts, a field in voices.ts. */
  code: string;
  source: Source;
  min: number;
  max: number;
  /** One-line hint shown by `help()`. */
  hint: string;
  read: (engine: AudioEngine) => number;
  write: (engine: AudioEngine, value: number) => void;
}

/** Build a setting backed by an `AudioParam` somewhere in the engine. */
function param(
  code: string,
  min: number,
  max: number,
  hint: string,
  pick: (engine: AudioEngine) => AudioParam,
): Setting {
  return {
    code,
    source: 'engine',
    min,
    max,
    hint,
    read: (engine) => pick(engine).value,
    write: (engine, value) => {
      pick(engine).value = value;
    },
  };
}

/** Build a setting backed by a field on the mutable `voiceTuning` object. */
function voice(key: keyof VoiceTuning, min: number, max: number, hint: string): Setting {
  return {
    code: key,
    source: 'voice',
    min,
    max,
    hint,
    read: () => voiceTuning[key],
    write: (_engine, value) => {
      voiceTuning[key] = value;
    },
  };
}

export const SETTINGS: Readonly<Record<string, Setting>> = {
  // ── Amp (engine.ts) — these take effect immediately, mid-note.
  masterGain: param('MASTER_GAIN', 0, 1.5, 'overall output', (e) => e.master.gain),
  clickBus: param('CLICK_BUS_GAIN', 0, 2, 'metronome level', (e) => e.clickBus.gain),
  noteBus: param('NOTE_BUS_GAIN', 0, 1.5, 'voices into the amp', (e) => e.noteBus.gain),
  preGain: param('PRE_GAIN', 0.5, 5, 'how hard the waveshaper is hit', (e) => e.amp.preGain.gain),
  noteOut: param('NOTE_OUT_GAIN', 0, 1.5, 'post-amp level', (e) => e.noteOut.gain),
  pickupHz: param('PICKUP_HZ', 500, 8000, 'pickup resonance centre', (e) => e.amp.pickup.frequency),
  pickupQ: param('PICKUP_Q', 0.1, 5, 'pickup resonance width', (e) => e.amp.pickup.Q),
  pickupDb: param('PICKUP_GAIN_DB', -12, 15, 'pickup resonance boost', (e) => e.amp.pickup.gain),
  cabLowHz: param('CAB_LOW_CORNER_HZ', 40, 300, 'cabinet low corner', (e) => e.amp.cabHigh.frequency),
  bassDb: param('BASS_DB', -12, 12, 'tone stack bass', (e) => e.amp.bass.gain),
  midDb: param('MID_DB', -12, 12, 'tone stack mid', (e) => e.amp.mid.gain),
  trebleDb: param('TREBLE_DB', -12, 12, 'tone stack treble', (e) => e.amp.treble.gain),

  // Two nodes move together, so this one can't use `param`.
  cabHighHz: {
    code: 'CAB_HIGH_CORNER_HZ',
    source: 'engine',
    min: 1000,
    max: 12000,
    hint: 'cabinet high corner — lower tames fizz',
    read: (e) => e.amp.cabLowA.frequency.value,
    write: (e, v) => {
      e.amp.cabLowA.frequency.value = v;
      e.amp.cabLowB.frequency.value = v * 1.1;
    },
  },

  // Rebuilds the transfer curve rather than setting a param.
  drive: {
    code: 'DRIVE',
    source: 'engine',
    min: 0,
    max: 1,
    hint: 'overdrive amount — past ~0.8 the decay flattens into an organ',
    read: () => driveAmount,
    write: (e, v) => {
      driveAmount = v;
      e.amp.shaper.curve = makeDriveCurve(v);
    },
  },

  // ── Voice (voices.ts) — these take effect from the next note on.
  detuneCents: voice('detuneCents', 0, 30, 'spread between the two oscillators'),
  peakLevel: voice('peakLevel', 0.05, 0.8, 'voice peak level'),
  sustainLevel: voice('sustainLevel', 0.01, 0.6, 'THE organ dial — lower is more percussive'),
  pluckDecaySec: voice('pluckDecaySec', 0.005, 0.3, 'time from peak to sustain'),
  ringSec: voice('ringSec', 0.05, 2, 'how far notes ring past their notated length'),
  pickLevel: voice('pickLevel', 0, 1, 'pick attack noise — the main anti-organ cue'),
  pickBandHz: voice('pickBandHz', 500, 6000, 'pick noise colour'),
  filterOpenMult: voice('filterOpenMult', 2, 24, 'brightness at the attack'),
  filterOpenCapHz: voice('filterOpenCapHz', 2000, 16000, 'ceiling on attack brightness'),
  filterRestMult: voice('filterRestMult', 0.8, 8, 'brightness once settled'),
  filterFallSec: voice('filterFallSec', 0.05, 1, 'how long the cutoff takes to fall'),
  vibratoMinSec: voice('vibratoMinSec', 0.1, 3, 'note length that earns vibrato'),
  vibratoRateHz: voice('vibratoRateHz', 2, 10, 'vibrato speed'),
  vibratoDepthCents: voice('vibratoDepthCents', 0, 60, 'vibrato depth'),
  vibratoDelaySec: voice('vibratoDelaySec', 0, 1, 'delay before vibrato eases in'),
  clickAccentLevel: voice('clickAccentLevel', 0, 1, 'downbeat click'),
  clickLevel: voice('clickLevel', 0, 1, 'off-beat click'),
};

export type SettingKey = keyof typeof SETTINGS;

/** Mirrors the engine's DRIVE constant; a WaveShaper curve can't be read back as a scalar. */
let driveAmount = 0.55;

/** Clamp a value into a setting's documented range. Unknown keys pass through untouched. */
export function clampSetting(key: string, value: number): number {
  const setting = SETTINGS[key];
  if (!setting) return value;
  return Math.min(setting.max, Math.max(setting.min, value));
}

/** Trim float noise so `dump()` prints `0.35`, not `0.35000000000000003`. */
function tidy(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * Format current values as source you can paste straight back into the two files, so a session of
 * knob-twiddling ends as a diff rather than a pile of numbers to transcribe by hand.
 */
export function formatDump(values: Readonly<Record<string, number>>): string {
  const lines: string[] = [];
  const group = (source: Source, header: string, render: (s: Setting, v: number) => string) => {
    const entries = Object.entries(SETTINGS).filter(([, s]) => s.source === source);
    lines.push(header);
    for (const [key, setting] of entries) {
      const value = values[key];
      if (value === undefined) continue;
      lines.push(render(setting, tidy(value)));
    }
    lines.push('');
  };

  group('engine', '// src/audio/engine.ts', (s, v) => `const ${s.code} = ${v};`);
  group('voice', '// src/audio/voices.ts — VOICE_DEFAULTS', (s, v) => `  ${s.code}: ${v},`);
  return lines.join('\n');
}

/**
 * Expose `window.__amp`. Called from `createEngine` in dev builds only.
 *
 * `engineDefaults` is passed in rather than re-declared here so `reset()` can never drift from the
 * constants actually committed in engine.ts — and so this module doesn't import values back from
 * the module that imports it.
 */
export function installAmpDevTools(
  engine: AudioEngine,
  engineDefaults: Readonly<Record<string, number>>,
): void {
  driveAmount = engineDefaults.drive ?? driveAmount;

  const read = (): Record<string, number> =>
    Object.fromEntries(Object.entries(SETTINGS).map(([key, s]) => [key, s.read(engine)]));

  const api = {
    /** Current value of every setting. */
    get: () => read(),

    /** Apply one or more settings, e.g. `__amp.set({ drive: 0.3, sustainLevel: 0.05 })`. */
    set: (patch: Partial<Record<string, number>>) => {
      const applied: Record<string, number> = {};
      for (const [key, raw] of Object.entries(patch)) {
        const setting = SETTINGS[key];
        if (!setting || raw === undefined) {
          console.warn(`[amp] unknown setting "${key}" — try __amp.help()`);
          continue;
        }
        const value = clampSetting(key, raw);
        if (value !== raw) {
          console.warn(`[amp] ${key} clamped to ${value} (range ${setting.min}..${setting.max})`);
        }
        setting.write(engine, value);
        applied[key] = value;
      }
      return applied;
    },

    /** Print the current tone as paste-ready source for engine.ts and voices.ts. */
    dump: () => {
      console.log(formatDump(read()));
    },

    /** Restore every setting to the value committed in the source files. */
    reset: () => {
      api.set({ ...VOICE_DEFAULTS, ...engineDefaults });
      console.log('[amp] reset to committed defaults');
    },

    help: () => {
      console.log(
        [
          'window.__amp — live guitar tone tuning',
          '',
          '  __amp.set({ drive: 0.3, sustainLevel: 0.05 })   apply settings',
          '  __amp.get()                                     read every value',
          '  __amp.dump()                                    print paste-ready source',
          '  __amp.reset()                                   back to committed defaults',
          '',
          'Amp settings apply instantly; voice settings apply from the next note.',
          '',
        ].join('\n'),
      );
      console.table(
        Object.fromEntries(
          Object.entries(SETTINGS).map(([key, s]) => [
            key,
            { range: `${s.min}..${s.max}`, hint: s.hint },
          ]),
        ),
      );
    },
  };

  (window as unknown as Record<string, unknown>).__amp = api;
  console.log('[amp] live tuning ready — run __amp.help()');
}
