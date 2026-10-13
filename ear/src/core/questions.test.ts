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
import { HIGHEST_MIDI, LOWEST_MIDI, nextQuestion, questionTonic, type Question, type QuestionSettings } from './questions';

const KEYS: Key[] = [
  ...MAJOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'major' as const })),
  ...MINOR_KEY_TONICS.map((tonic) => ({ tonic, mode: 'minor' as const })),
];
const keyName = (k: Key) => `${format(k.tonic)} ${k.mode}`;
const key = (tonic: string, mode: Key['mode']): Key => ({ tonic: parseNote(tonic), mode });
const CHROMATIC = DEGREES.map((d) => d.label);
const N = 10_000;

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
    const settings = { key: key('A', 'minor'), degrees: CHROMATIC };
    expect(run(settings, 200, 3)).toEqual(run(settings, 200, 3));
    expect(run(settings, 200, 3)).not.toEqual(run(settings, 200, 4));
  });

  it('only asks active degrees, as ids', () => {
    const settings = { key: key('C', 'major'), degrees: ['1', 'b5', '5'] };
    expect(Object.keys(counts(run(settings, 1000, 1))).sort()).toEqual(['#4', '1', '5']);
  });

  // 10,000 draws over k degrees: one count's sd is sqrt(N·p·(1−p)) ≈ 28 for k = 12 and ≈ 35 for
  // k = 7; ±12% of the mean is ≥ 3.6 sd, while a degree drawn 1.5× as often lands ~50% off.
  it.each([
    ['chromatic', key('C', 'major'), CHROMATIC],
    ['natural minor', key('E', 'minor'), presetDegrees('scale', 'minor')!],
    ['two degrees', key('G', 'major'), ['1', '5']],
  ])('is roughly uniform over 10,000 questions (%s): every count within 12%% of N/k', (_, k, degrees) => {
    const c = counts(run({ key: k, degrees }, N, 214));
    const mean = N / degrees.length;
    expect(Object.keys(c)).toHaveLength(degrees.length);
    for (const d of degrees) expect(Math.abs(c[d]! - mean), `${d}: ${c[d]}`).toBeLessThanOrEqual(0.12 * mean);
  });

  it.each([
    ['two degrees', ['1', '5']],
    ['triad', ['1', '3', '5']],
    ['chromatic', CHROMATIC],
  ])('never asks one degree three times in a row, but does twice (%s)', (_, degrees) => {
    const qs = run({ key: key('D', 'major'), degrees }, N, 7);
    let twice = 0;
    for (let i = 2; i < qs.length; i++) {
      expect(qs[i]!.degree === qs[i - 1]!.degree && qs[i]!.degree === qs[i - 2]!.degree, `at ${i}`).toBe(false);
    }
    for (let i = 1; i < qs.length; i++) if (qs[i]!.degree === qs[i - 1]!.degree) twice++;
    expect(twice).toBeGreaterThan(0);
  });

  it('reads the last two questions of the history, whatever their key', () => {
    const settings = { key: key('C', 'major'), degrees: ['1', '5'] };
    const asked = (degree: DegreeLabel): Question => ({ key: key('F', 'major'), degree, midi: 65 });
    for (let seed = 0; seed < 50; seed++) {
      expect(nextQuestion(settings, [asked('5'), asked('1'), asked('1')], mulberry32(seed)).degree).toBe('5');
      const tritone = { ...settings, degrees: ['1', '#4'] };
      expect(nextQuestion(tritone, [asked('1'), asked('b5'), asked('#4')], mulberry32(seed)).degree).toBe('1');
    }
  });
});

describe('nextQuestion: pitch', () => {
  it('puts every pitch in E2–E5 on its degree, in all 24 keys', () => {
    expect(KEYS).toHaveLength(24);
    for (const [i, k] of KEYS.entries()) {
      for (const q of run({ key: k, degrees: CHROMATIC }, 500, i)) {
        expect(q.midi, keyName(k)).toBeGreaterThanOrEqual(LOWEST_MIDI);
        expect(q.midi, keyName(k)).toBeLessThanOrEqual(HIGHEST_MIDI);
        expect(mod(q.midi, 12), `${keyName(k)} ${q.degree}`).toBe(pc(noteOf(k, q.degree)));
      }
    }
  });

  it('keeps the tonic in octave 4 while the active set fits, an octave down when it does not', () => {
    // A: 69 + 11 (7) = 80 > 76, so 57; with the triad 69 + 7 = 76 fits.
    expect(questionTonic({ key: key('A', 'major'), degrees: CHROMATIC })).toBe(57);
    expect(questionTonic({ key: key('A', 'major'), degrees: ['1', '3', '5'] })).toBe(69);
    expect(questionTonic({ key: key('C', 'major'), degrees: CHROMATIC })).toBe(60);
  });
});
