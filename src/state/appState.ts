import {
  TONICS,
  defaultProgression,
  type Chord,
  type Key,
  type NoteName,
  type QualityId,
  type ScaleId,
} from '../music';
import { TUNINGS, areAdjacent, positions, recommendedPosition, type TuningId } from '../fretboard';

export interface ProgressionEntry {
  id: string;
  chord: Chord;
  lickSeed: number;
}

export interface AppState {
  schemaVersion: 2;
  tuningId: TuningId;
  key: Key;
  /** 1–2 selected position indices. */
  positions: number[];
  progression: ProgressionEntry[];
  level: 1 | 2 | 3 | 4 | 5;
  targetRole: 'R' | '3' | '5';
  resolveToNext: boolean;
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
  | { type: 'setTargetRole'; role: 'R' | '3' | '5' }
  | { type: 'setResolveToNext'; value: boolean }
  | { type: 'addChord'; chord: Chord }
  | { type: 'removeChord'; id: string }
  | { type: 'clearProgression' }
  | { type: 'resetProgression' }
  | { type: 'reorderChord'; fromId: string; toIndex: number }
  | { type: 'rerollLick'; id: string }
  | { type: 'rerollAll' }
  | { type: 'toggleAdvanced' }
  | { type: 'setAdvRoot'; tonic: NoteName }
  | { type: 'setAdvQuality'; quality: QualityId }
  | { type: 'dragStart'; index: number }
  | { type: 'dragEnd' };

/** Non-deterministic at the app boundary on purpose; tests inject a counter instead. */
export const defaultNextSeed = (): number => (Date.now() ^ Math.floor(Math.random() * 2 ** 31)) | 0;

function freshProgression(key: Key, nextSeed: () => number): ProgressionEntry[] {
  return defaultProgression(key).map((chord) => ({
    id: crypto.randomUUID(),
    chord,
    lickSeed: nextSeed(),
  }));
}

export function defaultState(nextSeed: () => number = defaultNextSeed): AppState {
  const key: Key = { tonic: TONICS[0]!, scaleId: 'minorPentatonic' };
  const tuningId: TuningId = 'standard';
  const pos = positions(TUNINGS[tuningId], key);
  const rec = recommendedPosition(pos);

  return {
    schemaVersion: 2,
    tuningId,
    key,
    positions: [rec],
    progression: freshProgression(key, nextSeed),
    level: 2,
    targetRole: 'R',
    resolveToNext: false,
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
        progression: [...state.progression, { id: crypto.randomUUID(), chord: action.chord, lickSeed: nextSeed() }],
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
    case 'rerollLick':
      return {
        ...state,
        progression: state.progression.map((e) => (e.id === action.id ? { ...e, lickSeed: nextSeed() } : e)),
      };
    case 'rerollAll':
      return { ...state, progression: state.progression.map((e) => ({ ...e, lickSeed: nextSeed() })) };
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
