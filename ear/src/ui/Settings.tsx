/**
 * The settings card (#222), under the trainer: which degrees, the key, what plays before each
 * question, the drone, the range, the sound, what happens after an answer. Built from the shared
 * controls; every change is saved by the caller and reaches the session as `settingsChanged`.
 */
import { useState } from 'react';
import { format } from '@shared/core/music';
import { Chip, ChipGroup, KeyPicker, OnOff, Slider } from '@shared/ui/controls';
import { DEGREES, presetDegrees, presetsFor, toggleDegree, type PresetId } from '../core/degrees';
import { KEY_CHANGE_EVERY, REGISTERS, type KeyChange } from '../core/questions';
import { DRONE_MODES } from '../core/session';
import { fill, type UiStrings } from '../i18n';
import { SOUNDS, type EarSettings } from '../store/settings';
import {
  BEFORE,
  beforeOf,
  lowEFret,
  presetOf,
  tonicsOf,
  withBefore,
  withMode,
} from './editSettings';
import { answerText, degreesText } from './labels';

/** The tempo the card offers; stored settings may hold any of the shared 40–200. */
export const TEMPO_MIN = 60;
export const TEMPO_MAX = 160;

/** Open on a wide screen, folded on a phone. */
const wide = () =>
  typeof window.matchMedia !== 'function' || !window.matchMedia('(max-width: 560px)').matches;

export function Settings({
  ui,
  settings: s,
  onChange,
}: {
  ui: UiStrings;
  settings: EarSettings;
  onChange(settings: EarSettings): void;
}) {
  const [open] = useState(wide);
  const set = (patch: Partial<EarSettings>) => onChange({ ...s, ...patch });
  const mode = s.key.mode;
  const preset = presetOf(mode, s.degrees);
  const on = new Set(s.degrees);
  const keyChanges: readonly KeyChange[] = ['fixed', ...KEY_CHANGE_EVERY];

  return (
    <details className="board settings" open={open}>
      <summary>
        <h2>{ui.settingsTitle}</h2>
      </summary>
      <p className="settings-note">{ui.settingsNote}</p>

      <div className="settings-row">
        <ChipGroup
          label={ui.presetsLabel}
          items={presetsFor(mode).map((p) => ({
            value: p,
            text: p === 'scale' ? ui.presetScale[mode] : ui.preset[p],
          }))}
          // No chip is checked when the degrees were picked by hand.
          value={preset ?? ('' as PresetId)}
          onChange={(p) => set({ degrees: presetDegrees(p, mode)! })}
        />
      </div>
      <div className="settings-row">
        <div className="group" role="group" aria-label={ui.degreesLabel}>
          <span aria-hidden="true">{ui.degreesLabel}</span>
          {DEGREES.map(({ label }) => (
            <Chip
              key={label}
              pressed={on.has(label)}
              ariaLabel={fill(ui.degreeName, {
                shown: answerText(label),
                spoken: ui.spoken[label as keyof UiStrings['spoken']],
              })}
              onClick={() => set({ degrees: toggleDegree(s.degrees, label) })}
            >
              {answerText(label)}
            </Chip>
          ))}
        </div>
        <span className="settings-hint">{degreesText(ui, s.key, s.degrees)}</span>
      </div>

      <div className="settings-row">
        <span className="settings-label" aria-hidden="true">
          {ui.keyLabel}
        </span>
        <KeyPicker
          label={ui.keyLabel}
          keys={tonicsOf(mode)}
          name={format}
          fret={lowEFret}
          value={s.key.tonic}
          onChange={(tonic) => set({ key: { tonic, mode } })}
        />
      </div>
      <div className="settings-row controls">
        <ChipGroup
          label={ui.modeLabel}
          items={(['major', 'minor'] as const).map((m) => ({ value: m, text: ui.modeChip[m] }))}
          value={mode}
          onChange={(m) => onChange(withMode(s, m))}
        />
        <ChipGroup
          label={ui.newKeyLabel}
          items={keyChanges.map((k) => ({ value: k, text: ui.newKey[k] }))}
          value={s.keyChange}
          onChange={(keyChange) => set({ keyChange })}
        />
      </div>

      <div className="settings-row controls">
        <ChipGroup
          label={ui.beforeLabel}
          items={BEFORE.map((b) => ({ value: b, text: ui.before[b] }))}
          value={beforeOf(s)}
          onChange={(b) => onChange(withBefore(s, b))}
        />
        <Slider
          label={ui.tempoLabel}
          value={Math.min(TEMPO_MAX, Math.max(TEMPO_MIN, s.bpm))}
          min={TEMPO_MIN}
          max={TEMPO_MAX}
          text={fill(ui.bpm, { bpm: s.bpm })}
          onChange={(bpm) => set({ bpm })}
        />
      </div>

      <div className="settings-row controls">
        <ChipGroup
          label={ui.droneLabel}
          items={DRONE_MODES.map((d) => ({ value: d, text: ui.drone[d] }))}
          value={s.drone}
          onChange={(drone) => set({ drone })}
        />
        <Slider
          label={ui.droneLevelLabel}
          value={Math.round(s.droneLevel * 100)}
          min={0}
          max={100}
          step={5}
          text={fill(ui.percent, { n: Math.round(s.droneLevel * 100) })}
          onChange={(n) => set({ droneLevel: n / 100 })}
        />
      </div>

      <div className="settings-row controls">
        <ChipGroup
          label={ui.rangeLabel}
          items={REGISTERS.map((r) => ({ value: r, text: ui.range[r] }))}
          value={s.register}
          onChange={(register) => set({ register })}
        />
        <ChipGroup
          label={ui.soundLabel}
          items={SOUNDS.map((v) => ({ value: v, text: ui.sound[v] }))}
          value={s.sound}
          onChange={(sound) => set({ sound })}
        />
      </div>

      <div className="settings-row controls">
        <OnOff
          label={ui.resolveLabel}
          on={ui.on}
          off={ui.off}
          value={s.resolution}
          onChange={(resolution) => set({ resolution })}
        />
        <OnOff
          label={ui.autoNextLabel}
          on={ui.on}
          off={ui.off}
          value={s.autoNext}
          onChange={(autoNext) => set({ autoNext })}
        />
        <OnOff
          label={ui.showNeckLabel}
          on={ui.on}
          off={ui.off}
          value={s.showNeck}
          onChange={(showNeck) => set({ showNeck })}
        />
      </div>
    </details>
  );
}
