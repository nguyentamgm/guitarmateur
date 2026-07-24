import {
  TONICS,
  defaultProgression,
  type Chord,
  type Key,
  type NoteName,
  type QualityId,
  type ScaleId,
  type ToneRole,
} from '../music';
import { TUNINGS, areAdjacent, positions, recommendedPosition, type TuningId } from '../fretboard';

/** Bars a chord spans (× 4 beats). v1 audio supports 1- or 2-bar licks. */
export type Bars = 1 | 2;

export interface ProgressionEntry {
  id: string;
  chord: Chord;
  lickSeed: number;
  /** How many 4/4 bars this chord's lick spans (added in schema v3, default 1). */
  bars: Bars;
}

/** Tempo bounds shared by state clamping and the UI slider. */
export const MIN_BPM = 40;
export const MAX_BPM = 200;
export const DEFAULT_BPM = 90;

export interface AppState {
  schemaVersion: 6;
  tuningId: TuningId;
  key: Key;
  /** 1–2 selected position indices. */
  positions: number[];
  progression: ProgressionEntry[];
  level: 1 | 2 | 3 | 4 | 5;
  targetRole: ToneRole;
  resolveToNext: boolean;
  /** Playback tempo in BPM (40–200), added in schema v3. */
  tempoBpm: number;
  /** Swing/shuffle feel toggle, added in schema v4. */
  swingEnabled: boolean;
  /** Metronome click gain [0–1], added in schema v5. */
  clickGain: number;
  /** Note gain [0–1], added in schema v5. */
  noteGain: number;
  /** Mirror fretboard and tab for left-handed players, added in schema v6. */
  leftHanded: boolean;
  /** Not persisted. */
  ui: {
    advancedOpen: boolean;
    advRoot: NoteName;
    advQuality: QualityId;
    dragIndex: number | null;
  };
}

export type Action =
  | { type: 'setKey'; tonic: NoteName }
  | { type: 'setScale'; scaleId: ScaleId }
  | { type: 'togglePosition'; index: number }
  | { type: 'setLevel'; level: 1 | 2 | 3 | 4 | 5 }
  | { type: 'setTargetRole'; role: ToneRole }
  | { type: 'setResolveToNext'; value: boolean }
  | { type: 'addChord'; chord: Chord }
  | { type: 'removeChord'; id: string }
  | { type: 'clearProgression' }
  | { type: 'resetProgression' }
  | { type: 'reorderChord'; fromId: string; toIndex: number }
  | { type: 'setBars'; id: string; bars: Bars }
  | { type: 'setTempo'; bpm: number }
  | { type: 'setSwing'; value: boolean }
  | { type: 'setClickGain'; gain: number }
  | { type: 'setNoteGain'; gain: number }
  | { type: 'setLeftHanded'; value: boolean }
  | { type: 'rerollLick'; id: string }
  | { type: 'setTuning'; tuningId: TuningId }
  | { type: 'rerollAll' }
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'toggleAdvanced' }
  | { type: 'setAdvRoot'; tonic: NoteName }
  | { type: 'setAdvQuality'; quality: QualityId }
  | { type: 'dragStart'; index: number }
  | { type: 'dragEnd' };

/** Non-deterministic at the app boundary on purpose; tests inject a counter instead. */
export const defaultNextSeed = (): number => (Date.now() ^ Math.floor(Math.random() * 2 ** 31)) | 0;

/**
 * Lightweight UUID v4 generator that works in all environments (browser, jsdom, Node).
 * Falls back to Math.random if crypto.randomUUID is unavailable (e.g. older jsdom).
 */
const generateId = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback for jsdom / SSR: not cryptographically secure, but sufficient for
    // session-local state identifiers.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
};

function freshProgression(key: Key, nextSeed: () => number): ProgressionEntry[] {
  return defaultProgression(key).map((chord) => ({
    id: generateId(),
    chord,
    lickSeed: nextSeed(),
    bars: 1,
  }));
}

/** Clamp any number to the supported BPM range, rounding to a whole beat-per-minute. */
export function clampBpm(bpm: number): number {
  if (!Number.isFinite(bpm)) return DEFAULT_BPM;
  return Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(bpm)));
}

export function defaultState(nextSeed: () => number = defaultNextSeed): AppState {
  const key: Key = { tonic: TONICS[0]!, scaleId: 'minorPentatonic' };
  const tuningId: TuningId = 'standard';
  const pos = positions(TUNINGS[tuningId], key);
  const rec = recommendedPosition(pos);

  return {
    schemaVersion: 6,
    tuningId,
    key,
    positions: [rec],
    progression: freshProgression(key, nextSeed),
    level: 2,
    targetRole: 'R',
    resolveToNext: false,
    tempoBpm: DEFAULT_BPM,
    swingEnabled: false,
    clickGain: 0.6,
    noteGain: 0.9,
    leftHanded: false,
    ui: {
      advancedOpen: false,
      advRoot: TONICS[0]!,
      advQuality: 'm',
      dragIndex: null,
    },
  };
}

/** Key/scale change: positions are scale-relative and don't survive meaningfully, so both
 *  positions and the progression (with fresh seeds) reset to the new key's defaults. */
function resetForKey(state: AppState, key: Key, nextSeed: () => number): AppState {
  const pos = positions(TUNINGS[state.tuningId], key);
  const rec = recommendedPosition(pos);
  return {
    ...state,
    key,
    positions: [rec],
    progression: freshProgression(key, nextSeed),
  };
}

function toggleSelectedPosition(state: AppState, index: number): number[] {
  const pos = positions(TUNINGS[state.tuningId], state.key);
  const cur = state.positions;
  if (cur.includes(index)) return cur.length > 1 ? cur.filter((x) => x !== index) : cur;
  if (cur.length === 1 && areAdjacent(pos, cur[0]!, index)) return [cur[0]!, index].sort((a, b) => a - b);
  return [index];
}

export function reducer(state: AppState, action: Action, nextSeed: () => number): AppState {
  switch (action.type) {
    case 'setKey':
      return resetForKey(state, { tonic: action.tonic, scaleId: state.key.scaleId }, nextSeed);
    case 'setScale':
      return resetForKey(state, { tonic: state.key.tonic, scaleId: action.scaleId }, nextSeed);
    case 'togglePosition':
      return { ...state, positions: toggleSelectedPosition(state, action.index) };
    case 'setLevel':
      return { ...state, level: action.level };
    case 'setTargetRole':
      return { ...state, targetRole: action.role };
    case 'setResolveToNext':
      return { ...state, resolveToNext: action.value };
    case 'addChord':
      return {
        ...state,
        progression: [...state.progression, { id: generateId(), chord: action.chord, lickSeed: nextSeed(), bars: 1 }],
      };
    case 'removeChord':
      return { ...state, progression: state.progression.filter((e) => e.id !== action.id) };
    case 'clearProgression':
      return { ...state, progression: [] };
    case 'resetProgression':
      return { ...state, progression: freshProgression(state.key, nextSeed) };
    case 'reorderChord': {
      const idx = state.progression.findIndex((e) => e.id === action.fromId);
      if (idx === -1) return state;
      const next = [...state.progression];
      const [entry] = next.splice(idx, 1);
      const clamped = Math.max(0, Math.min(action.toIndex, next.length));
      next.splice(clamped, 0, entry!);
      return { ...state, progression: next };
    }
    case 'setBars':
      return {
        ...state,
        progression: state.progression.map((e) => (e.id === action.id ? { ...e, bars: action.bars } : e)),
      };
    case 'setTempo':
      return { ...state, tempoBpm: clampBpm(action.bpm) };
    case 'setSwing':
      return { ...state, swingEnabled: action.value };
    case 'setClickGain':
      return { ...state, clickGain: action.gain };
    case 'setNoteGain':
      return { ...state, noteGain: action.gain };
    case 'setLeftHanded':
      return { ...state, leftHanded: action.value };
    case 'rerollLick':
      return {
        ...state,
        progression: state.progression.map((e) => (e.id === action.id ? { ...e, lickSeed: nextSeed() } : e)),
      };
    case 'setTuning': {
      const newPos = positions(TUNINGS[action.tuningId], state.key);
      return {
        ...state,
        tuningId: action.tuningId,
        positions: [recommendedPosition(newPos)],
        progression: freshProgression(state.key, nextSeed),
      };
    }
    case 'rerollAll':
      return { ...state, progression: state.progression.map((e) => ({ ...e, lickSeed: nextSeed() })) };
    case 'SET_STATE':
      return action.payload;
    case 'toggleAdvanced':
      return { ...state, ui: { ...state.ui, advancedOpen: !state.ui.advancedOpen } };
    case 'setAdvRoot':
      return { ...state, ui: { ...state.ui, advRoot: action.tonic } };
    case 'setAdvQuality':
      return { ...state, ui: { ...state.ui, advQuality: action.quality } };
    case 'dragStart':
      return { ...state, ui: { ...state.ui, dragIndex: action.index } };
    case 'dragEnd':
      return { ...state, ui: { ...state.ui, dragIndex: null } };
  }
}
