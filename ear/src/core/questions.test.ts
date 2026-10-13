import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@shared/core/rng';
import {
  MAJOR_KEY_TONICS,
  MINOR_KEY_TONICS,
  format,
  mod,
  parseNote,
  pc,
  type DegreeLabel,
  type Key,
} from '@shared/core/music';
import { DEGREES, noteOf, presetDegrees } from './degrees';
import {
  HIGHEST_MIDI,
  KEY_CHANGE_EVERY,
  LOWEST_MIDI,
  REGISTERS,
  nextQuestion,
  questionTonic,
  type Question,
  type QuestionSettings,
} from './questions';

const KEYS: Key[] = [
  ...MAJOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'major' as const })),
  ...MINOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'minor' as const })),
];
const keyName = (k: Key) => `${format(k.tonic)} ${k.mode}`;
const key = (tonic: string, mode: Key['mode']): Key => ({ tonic: parseNote(tonic), mode });
const CHROMATIC = DEGREES.map((d) => d.label);
const N = 10_000;

/** Fixed key, above the root: the defaults, with `over` on top. */
const make = (k: Key, degrees: readonly DegreeLabel[], over: Partial<QuestionSettings> = {}): QuestionSettings => ({
  key: k,
  degrees,
  register: 'above',
  keyChange: 'fixed',
  ...over,
});

/** `n` questions in a row from one seed, each given the ones before it. */
function run(settings: QuestionSettings, n: number, seed: number): Question[] {
  const rng = mulberry32(seed);
  const history: Question[] = [];
  for (let i = 0; i < n; i++) history.push(nextQuestion(settings, history, rng));
  return history;
}

const counts = (qs: readonly Question[]) => {
  const c: Record<DegreeLabel, number> = {};
  for (const q of qs) c[q.degree] = (c[q.degree] ?? 0) + 1;
  return c;
};

describe('nextQuestion: degree', () => {
  it('is reproducible: the same seed asks the same questions', () => {
    const settings = make(key('A', 'minor'), CHROMATIC, { register: 'twoOctaves', keyChange: 10 });
    expect(run(settings, 200, 3)).toEqual(run(settings, 200, 3));
    expect(run(settings, 200, 3)).not.toEqual(run(settings, 200, 4));
  });

  it('only asks active degrees, as ids', () => {
    const settings = make(key('C', 'major'), ['1', 'b5', '5']);
    expect(Object.keys(counts(run(settings, 1000, 1))).sort()).toEqual(['#4', '1', '5']);
  });

  // 10,000 draws over k degrees: one count's sd is sqrt(N·p·(1−p)) ≈ 28 for k = 12 and ≈ 35 for
  // k = 7; ±12% of the mean is ≥ 3.6 sd, while a degree drawn 1.5× as often lands ~50% off.
  it.each([
    ['chromatic', key('C', 'major'), CHROMATIC],
    ['natural minor', key('E', 'minor'), presetDegrees('scale', 'minor')!],
    ['two degrees', key('G', 'major'), ['1', '5']],
  ])('is roughly uniform over 10,000 questions (%s): every count within ±12 percent of N/k', (_, k, degrees) => {
    const c = counts(run(make(k, degrees), N, 214));
    const mean = N / degrees.length;
    expect(Object.keys(c)).toHaveLength(degrees.length);
    for (const d of degrees) expect(Math.abs(c[d]! - mean), `${d}: ${c[d]}`).toBeLessThanOrEqual(0.12 * mean);
  });

  it('shifts the distribution toward a weighted degree, and leaves the others even', () => {
    const scale = presetDegrees('scale', 'major')!;
    const uniform = counts(run(make(key('C', 'major'), scale), N, 217));
    const c = counts(run(make(key('C', 'major'), scale, { weights: { '3': 4 } }), N, 217));
    expect(c['3']!).toBeGreaterThan(2 * uniform['3']!);
    const others = scale.filter((d) => d !== '3');
    const mean = (N - c['3']!) / others.length;
    for (const d of others) {
      expect(c[d]!, d).toBeLessThan(c['3']! / 2);
      expect(Math.abs(c[d]! - mean), `${d}: ${c[d]}`).toBeLessThanOrEqual(0.12 * mean);
    }
  });

  it('never asks a degree weighted 0, and is uniform when no weight is usable', () => {
    const triad = ['1', '3', '5'];
    expect(counts(run(make(key('C', 'major'), triad, { weights: { '5': 0 } }), 2000, 1))['5']).toBeUndefined();
    const c = counts(run(make(key('C', 'major'), triad, { weights: { '1': 0, '3': -1, '5': Number.NaN } }), N, 1));
    for (const d of triad) expect(Math.abs(c[d]! - N / 3), `${d}: ${c[d]}`).toBeLessThanOrEqual(0.12 * (N / 3));
  });

  it.each([
    ['two degrees', ['1', '5']],
    ['triad', ['1', '3', '5']],
    ['chromatic', CHROMATIC],
  ])('never asks one degree three times in a row, but does twice (%s)', (_, degrees) => {
    const qs = run(make(key('D', 'major'), degrees, { keyChange: 10 }), N, 7);
    let twice = 0;
    for (let i = 2; i < qs.length; i++) {
      expect(qs[i]!.degree === qs[i - 1]!.degree && qs[i]!.degree === qs[i - 2]!.degree, `at ${i}`).toBe(false);
    }
    for (let i = 1; i < qs.length; i++) if (qs[i]!.degree === qs[i - 1]!.degree) twice++;
    expect(twice).toBeGreaterThan(0);
  });

  it('reads the last two questions of the history, whatever their key', () => {
    const settings = make(key('C', 'major'), ['1', '5']);
    const asked = (degree: DegreeLabel): Question => ({ key: key('F', 'major'), degree, midi: 65 });
    for (let seed = 0; seed < 50; seed++) {
      expect(nextQuestion(settings, [asked('5'), asked('1'), asked('1')], mulberry32(seed)).degree).toBe('5');
      const tritone = { ...settings, degrees: ['1', '#4'] };
      expect(nextQuestion(tritone, [asked('1'), asked('b5'), asked('#4')], mulberry32(seed)).degree).toBe('1');
    }
  });
});

describe('nextQuestion: pitch and register', () => {
  const PRESETS = [CHROMATIC, ['1', '3', '5'], presetDegrees('blues', 'major')!, ['1', '7']];

  it.each(REGISTERS)('puts every pitch in E2–E5 on its degree, in all 24 keys (%s)', (register) => {
    expect(KEYS).toHaveLength(24);
    for (const [i, k] of KEYS.entries()) {
      for (const degrees of PRESETS) {
        for (const q of run(make(k, degrees, { register }), 200, i)) {
          expect(q.midi, keyName(k)).toBeGreaterThanOrEqual(LOWEST_MIDI);
          expect(q.midi, keyName(k)).toBeLessThanOrEqual(HIGHEST_MIDI);
          expect(mod(q.midi, 12), `${keyName(k)} ${q.degree}`).toBe(pc(noteOf(k, q.degree)));
        }
      }
    }
  });

  it.each(REGISTERS)('stays in E2–E5 over 10,000 questions with key changes (%s)', (register) => {
    for (const keyChange of KEY_CHANGE_EVERY) {
      const qs = run(make(key('B', 'major'), CHROMATIC, { register, keyChange }), N, 1);
      expect(Math.min(...qs.map((q) => q.midi))).toBeGreaterThanOrEqual(LOWEST_MIDI);
      expect(Math.max(...qs.map((q) => q.midi))).toBeLessThanOrEqual(HIGHEST_MIDI);
      for (const q of qs) expect(mod(q.midi, 12)).toBe(pc(noteOf(q.key, q.degree)));
    }
  });

  it('keeps the tonic in octave 4 while the active set fits, an octave down when it does not', () => {
    // A: 69 + 11 (7) = 80 > 76, so 57; the triad's 69 + 7 = 76 fits.
    expect(questionTonic(key('A', 'major'), make(key('A', 'major'), CHROMATIC))).toBe(57);
    expect(questionTonic(key('A', 'major'), make(key('A', 'major'), ['1', '3', '5']))).toBe(69);
    expect(questionTonic(key('C', 'major'), make(key('C', 'major'), CHROMATIC))).toBe(60);
    // Around: B's tritone 71 + 6 = 77 drops it to 59; without the tritone 71 − 1 … 71 + 5 fits.
    expect(questionTonic(key('B', 'major'), make(key('B', 'major'), CHROMATIC, { register: 'around' }))).toBe(59);
    expect(questionTonic(key('B', 'major'), make(key('B', 'major'), ['1', '3', '5', '7'], { register: 'around' }))).toBe(71);
    // Two octaves: C 60 + 23 drops twice to 48; F♯ 66 + 23 to 42 (F♯2).
    expect(questionTonic(key('C', 'major'), make(key('C', 'major'), CHROMATIC, { register: 'twoOctaves' }))).toBe(48);
    expect(questionTonic(key('F#', 'minor'), make(key('F#', 'minor'), CHROMATIC, { register: 'twoOctaves' }))).toBe(42);
  });

  /** Semitones from the question's tonic, per degree. */
  const spread = (register: QuestionSettings['register'], k: Key) => {
    const settings = make(k, CHROMATIC, { register });
    const tonic = questionTonic(k, settings);
    const by = new Map<DegreeLabel, Set<number>>();
    for (const q of run(settings, N, 9)) {
      by.set(q.degree, (by.get(q.degree) ?? new Set()).add(q.midi - tonic));
    }
    return by;
  };

  it.each(KEYS.filter((_, i) => i % 5 === 0).map((k) => [keyName(k), k] as const))(
    'above: every degree one octave up from the tonic, never below (%s)',
    (_, k) => {
      const by = spread('above', k);
      for (const { label, semitones } of DEGREES) expect([...by.get(label)!], label).toEqual([semitones]);
    },
  );

  it.each(KEYS.filter((_, i) => i % 5 === 0).map((k) => [keyName(k), k] as const))(
    'around: each degree on the nearer side, 5 to 7 below, 1 to the tritone above (%s)',
    (_, k) => {
      const by = spread('around', k);
      for (const { label, semitones } of DEGREES) {
        expect([...by.get(label)!], label).toEqual([semitones <= 6 ? semitones : semitones - 12]);
      }
      expect(by.get('5')).toEqual(new Set([-5]));
      expect(by.get('7')).toEqual(new Set([-1]));
    },
  );

  it.each(KEYS.filter((_, i) => i % 5 === 0).map((k) => [keyName(k), k] as const))(
    'twoOctaves: every degree in both octaves above the tonic (%s)',
    (_, k) => {
      const by = spread('twoOctaves', k);
      for (const { label, semitones } of DEGREES) {
        expect([...by.get(label)!].sort((a, b) => a - b), label).toEqual([semitones, semitones + 12]);
      }
    },
  );
});

describe('nextQuestion: key', () => {
  const sameKey = (a: Key, b: Key) => a.mode === b.mode && pc(a.tonic) === pc(b.tonic);

  it('stays in the settings key when fixed, over 10,000 questions', () => {
    const k = key('Eb', 'minor');
    for (const register of REGISTERS) {
      expect(run(make(k, CHROMATIC, { register }), N, 5).every((q) => q.key === k)).toBe(true);
    }
  });

  it.each(KEY_CHANGE_EVERY)('changes key exactly every %i questions, and never otherwise', (every) => {
    for (const k of [key('C', 'major'), key('A', 'minor')]) {
      const qs = run(make(k, presetDegrees('scale', k.mode)!, { keyChange: every }), N, every);
      expect(qs[0]!.key).toBe(k);
      const changes: number[] = [];
      for (let i = 1; i < qs.length; i++) if (!sameKey(qs[i]!.key, qs[i - 1]!.key)) changes.push(i);
      expect(changes).toEqual(Array.from({ length: Math.ceil(N / every) - 1 }, (_, j) => (j + 1) * every));
      // Same mode, from the 12 keys, all of them reached.
      const tonics = k.mode === 'major' ? MAJOR_KEY_TONICS : MINOR_KEY_TONICS;
      for (const q of qs) expect(q.key.mode).toBe(k.mode);
      expect(new Set(qs.map((q) => format(q.key.tonic)))).toEqual(new Set(tonics.map(format)));
    }
  });

  it('starts from the settings key when the history is in another mode', () => {
    const k = key('G', 'major');
    const history = Array.from({ length: 25 }, (): Question => ({ key: key('E', 'minor'), degree: '1', midi: 64 }));
    expect(nextQuestion(make(k, CHROMATIC, { keyChange: 25 }), history, mulberry32(1)).key).toBe(k);
  });
});
