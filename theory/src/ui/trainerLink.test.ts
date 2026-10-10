import { parseNote, progression, twelveBar, type Chord } from '../core/music';
import { PRACTICE_STORAGE_KEY, readPracticeState, trainerLink } from './trainerLink';

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

  it('survives a broken practice store', () => {
    expect(readPracticeState({ getItem: () => '{oops', setItem: () => {} })).toBeUndefined();
    expect(readPracticeState({ getItem: (k) => (k === PRACTICE_STORAGE_KEY ? '{"leftHanded":true}' : null), setItem: () => {} })).toEqual({ leftHanded: true });
  });
});
