import { describe, expect, it } from 'vitest';
import { SETTINGS, clampSetting, formatDump } from './devTools';
import { VOICE_DEFAULTS } from './voices';

describe('SETTINGS', () => {
  it('gives every setting a usable range', () => {
    for (const [key, setting] of Object.entries(SETTINGS)) {
      expect(setting.min, key).toBeLessThan(setting.max);
      expect(setting.hint, key).not.toBe('');
    }
  });

  it('covers every voice tuning field, so nothing is silently un-tunable', () => {
    const voiceKeys = Object.entries(SETTINGS)
      .filter(([, s]) => s.source === 'voice')
      .map(([key]) => key)
      .sort();
    expect(voiceKeys).toEqual(Object.keys(VOICE_DEFAULTS).sort());
  });

  it('brackets every committed voice default inside its own range', () => {
    for (const [key, setting] of Object.entries(SETTINGS)) {
      if (setting.source !== 'voice') continue;
      const committed = VOICE_DEFAULTS[key as keyof typeof VOICE_DEFAULTS];
      expect(committed, key).toBeGreaterThanOrEqual(setting.min);
      expect(committed, key).toBeLessThanOrEqual(setting.max);
    }
  });
});

describe('clampSetting', () => {
  it('holds values inside the documented range', () => {
    expect(clampSetting('drive', 5)).toBe(1);
    expect(clampSetting('drive', -2)).toBe(0);
    expect(clampSetting('drive', 0.4)).toBe(0.4);
  });

  it('passes unknown keys through untouched', () => {
    expect(clampSetting('nope', 999)).toBe(999);
  });
});

describe('formatDump', () => {
  it('emits const declarations for the amp and object fields for the voice', () => {
    const out = formatDump({ drive: 0.3, sustainLevel: 0.05 });
    expect(out).toContain('// src/audio/engine.ts');
    expect(out).toContain('const DRIVE = 0.3;');
    expect(out).toContain('// src/audio/voices.ts');
    expect(out).toContain('  sustainLevel: 0.05,');
  });

  it('rounds away float noise so the output is paste-ready', () => {
    expect(formatDump({ drive: 0.1 + 0.2 })).toContain('const DRIVE = 0.3;');
  });

  it('skips settings that were not read', () => {
    expect(formatDump({ drive: 0.5 })).not.toContain('sustainLevel');
  });
});
