import { chordSymbol, parseNote, progression, twelveBar, type Chord } from '../core/music';
import { PRACTICE_STORAGE_KEY, readPracticeState, trainerLink, vamp } from './trainerLink';

const n = parseNote;
/** Read a link back the way the practice app does: query value, strip 'v1:', base64, JSON. */
function payload(link: string) {
  const raw = new URLSearchParams(link.slice(link.indexOf('?'))).get('s')!;
  expect(raw.startsWith('v1:')).toBe(true);
  return JSON.parse(decodeURIComponent(atob(raw.slice(3))));
}
const cards = (p: { progression: { chord: { tonic: { letter: string; alter: number }; quality: string }; bars: number }[] }) =>
  p.progression.map((e) => `${e.chord.tonic.letter}${e.chord.tonic.alter ? '♭' : ''}${e.chord.quality}×${e.bars}`);

describe('trainerLink', () => {
  it('sends the key and the progression in the practice app share format', () => {
    const chords = progression(n('G'), 'I-V-vi-IV').map((s) => s.chord);
    const p = payload(trainerLink({ tonic: n('G'), scale: 'majorPentatonic' }, chords)!);
    expect(p.key).toEqual({ tonic: { letter: 'G', alter: 0 }, scaleId: 'majorPentatonic' });
    expect(cards(p)).toEqual(['GM×1', 'DM×1', 'Em×1', 'CM×1']);
    expect(new Set(p.progression.map((e: { id: string }) => e.id)).size).toBe(4);
  });

  it('merges a chord repeated in a row into two-bar cards: the 12-bar blues is 7 cards', () => {
    const A7: Chord = { root: n('A'), id: 'dom7' };
    const D7: Chord = { root: n('D'), id: 'dom7' };
    const E7: Chord = { root: n('E'), id: 'dom7' };
    const of: Record<string, Chord> = { I: A7, IV: D7, V: E7 };
    const p = payload(trainerLink({ tonic: n('A'), scale: 'minorBlues' }, twelveBar().map((d) => of[d]!))!);
    expect(cards(p)).toEqual(['Adom7×2', 'Adom7×2', 'Ddom7×2', 'Adom7×2', 'Edom7×1', 'Ddom7×1', 'Adom7×2']);
  });

  it('gives no link for a key the practice app cannot spell (D♭, A♭ major), a chord it lacks, or no chords', () => {
    const c: Chord = { root: n('Db'), id: 'major' };
    expect(trainerLink({ tonic: n('Db'), scale: 'major' }, [c])).toBeNull();
    expect(trainerLink({ tonic: n('Ab'), scale: 'major' }, [c])).toBeNull();
    expect(trainerLink({ tonic: n('Eb'), scale: 'major' }, [c])).not.toBeNull();
    expect(trainerLink({ tonic: n('C'), scale: 'major' }, [{ root: n('B'), id: 'm7b5' }])).toBeNull();
    expect(trainerLink({ tonic: n('C'), scale: 'major' }, [])).toBeNull();
  });

  it('maps scale names: the blues scale is "blues", natural minor is "natural-minor"', () => {
    const c: Chord = { root: n('A'), id: 'dom7' };
    expect(payload(trainerLink({ tonic: n('A'), scale: 'minorBlues' }, [c])!).key.scaleId).toBe('blues');
    expect(payload(trainerLink({ tonic: n('A'), scale: 'naturalMinor' }, [c])!).key.scaleId).toBe('natural-minor');
  });

  it("keeps the practice app's own settings, replacing only key, progression and tempo", () => {
    const saved = { tuningId: 'dropD', leftHanded: true, tempoBpm: 140, clickGain: 0.2, language: 'vi', positions: [3], key: { x: 1 } };
    const c: Chord = { root: n('A'), id: 'minor' };
    const p = payload(trainerLink({ tonic: n('A'), scale: 'minorPentatonic' }, [c], { saved, tempoBpm: 84, lang: 'en' })!);
    expect(p).toMatchObject({ tuningId: 'dropD', leftHanded: true, tempoBpm: 84, clickGain: 0.2 });
    expect(p.positions).toBeUndefined();
    expect(p.language).toBeUndefined();
    expect(p.key.scaleId).toBe('minorPentatonic');
  });

  it("carries the lesson's language in its own parameter, over the practice app's last one", () => {
    const c: Chord = { root: n('A'), id: 'minor' };
    const href = trainerLink({ tonic: n('A'), scale: 'minorPentatonic' }, [c], { saved: { language: 'en' }, lang: 'vi' })!;
    expect(new URL(href, 'https://x.test').searchParams.get('lang')).toBe('vi');
    expect(payload(href).language).toBeUndefined();
    expect(new URL(trainerLink({ tonic: n('A'), scale: 'minorPentatonic' }, [c])!, 'https://x.test').searchParams.has('lang')).toBe(false);
  });

  it("opens on the lesson's box: minor box n is the practice app's n − 1, major box 1 its box on the 6th", () => {
    const c: Chord = { root: n('A'), id: 'minor' };
    const at = (scale: 'minorPentatonic' | 'majorPentatonic' | 'minorBlues' | 'majorBlues', boxes: number[]) =>
      payload(trainerLink({ tonic: n('A'), scale }, [c], { boxes })!).positions;
    expect(at('minorPentatonic', [1])).toEqual([0]);
    expect(at('minorPentatonic', [4, 5])).toEqual([3, 4]);
    expect(at('minorBlues', [2])).toEqual([1]);
    // Major box 1 starts on the 6th (degree 4 of 1 2 3 5 6); box 2 on the root.
    expect(at('majorPentatonic', [1])).toEqual([4]);
    expect(at('majorPentatonic', [2, 3])).toEqual([0, 1]);
    expect(at('majorBlues', [5])).toEqual([3]);
  });

  it('sends no box for a scale the practice app does not draw as pentatonic boxes, and none unless asked', () => {
    const c: Chord = { root: n('C'), id: 'major' };
    expect(payload(trainerLink({ tonic: n('C'), scale: 'major' }, [c], { boxes: [2] })!).positions).toBeUndefined();
    expect(payload(trainerLink({ tonic: n('C'), scale: 'majorPentatonic' }, [c], { saved: { positions: [3] } })!).positions).toBeUndefined();
  });

  it('turns swing on or off when asked, and keeps the saved setting otherwise', () => {
    const c: Chord = { root: n('A'), id: 'dom7' };
    const key = { tonic: n('A'), scale: 'minorBlues' } as const;
    expect(payload(trainerLink(key, [c], { swing: true })!).swingEnabled).toBe(true);
    expect(payload(trainerLink(key, [c], { saved: { swingEnabled: true }, swing: false })!).swingEnabled).toBe(false);
    expect(payload(trainerLink(key, [c], { saved: { swingEnabled: true } })!).swingEnabled).toBe(true);
  });

  it('vamps on the i and iv as m7 chords in a minor key, I and IV in a major one, two bars each', () => {
    expect(vamp({ tonic: n('A'), scale: 'minorPentatonic' }).map(chordSymbol)).toEqual(['Am7', 'Am7', 'Dm7', 'Dm7']);
    expect(vamp({ tonic: n('E'), scale: 'minorBlues' }).map(chordSymbol)).toEqual(['Em7', 'Em7', 'Am7', 'Am7']);
    expect(vamp({ tonic: n('G'), scale: 'majorPentatonic' }).map(chordSymbol)).toEqual(['G', 'G', 'C', 'C']);
    // Spelled in the key: F major's IV is B♭, not A♯.
    expect(vamp({ tonic: n('F'), scale: 'majorPentatonic' }).map(chordSymbol)).toEqual(['F', 'F', 'B♭', 'B♭']);
    const p = payload(trainerLink({ tonic: n('A'), scale: 'minorPentatonic' }, vamp({ tonic: n('A'), scale: 'minorPentatonic' }))!);
    expect(cards(p)).toEqual(['Am7×2', 'Dm7×2']);
  });

  it('survives a broken practice store', () => {
    expect(readPracticeState({ getItem: () => '{oops', setItem: () => {} })).toBeUndefined();
    expect(readPracticeState({ getItem: (k) => (k === PRACTICE_STORAGE_KEY ? '{"leftHanded":true}' : null), setItem: () => {} })).toEqual({ leftHanded: true });
  });
});
