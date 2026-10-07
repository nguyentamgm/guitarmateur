import { parseNote, progression, type Chord } from '../core/music';
import { trainerLink } from './trainerLink';

const n = parseNote;
/** Read a link back the way the practice app does: query value, strip 'v1:', base64, JSON. */
function payload(link: string) {
  const raw = new URLSearchParams(link.slice(link.indexOf('?'))).get('s')!;
  expect(raw.startsWith('v1:')).toBe(true);
  return JSON.parse(decodeURIComponent(atob(raw.slice(3))));
}

describe('trainerLink', () => {
  it('sends the key and the progression in the practice app share format', () => {
    const chords = progression(n('G'), 'I-V-vi-IV').map((s) => s.chord);
    const p = payload(trainerLink({ tonic: n('G'), scale: 'majorPentatonic' }, chords)!);
    expect(p.key).toEqual({ tonic: { letter: 'G', alter: 0 }, scaleId: 'majorPentatonic' });
    expect(p.progression.map((e: { chord: { tonic: { letter: string }; quality: string } }) => `${e.chord.tonic.letter}${e.chord.quality}`)).toEqual(['GM', 'DM', 'Em', 'CM']);
    expect(new Set(p.progression.map((e: { id: string }) => e.id)).size).toBe(4);
  });

  it('respells a key the practice app does not list: D♭ becomes C♯, A♯ becomes B♭', () => {
    const chord: Chord = { root: n('Db'), id: 'major' };
    expect(payload(trainerLink({ tonic: n('Db'), scale: 'major' }, [chord])!).key.tonic).toEqual({ letter: 'C', alter: 1 });
    expect(payload(trainerLink({ tonic: n('A#'), scale: 'minorPentatonic' }, [chord])!).key.tonic).toEqual({ letter: 'B', alter: -1 });
  });

  it('maps scale names: the blues scale is "blues", natural minor is "natural-minor"', () => {
    const c: Chord = { root: n('A'), id: 'dom7' };
    expect(payload(trainerLink({ tonic: n('A'), scale: 'minorBlues' }, [c])!).key.scaleId).toBe('blues');
    expect(payload(trainerLink({ tonic: n('A'), scale: 'naturalMinor' }, [c])!).key.scaleId).toBe('natural-minor');
  });

  it('gives no link for a chord the practice app does not have, or no chords', () => {
    expect(trainerLink({ tonic: n('C'), scale: 'major' }, [{ root: n('B'), id: 'm7b5' }])).toBeNull();
    expect(trainerLink({ tonic: n('C'), scale: 'major' }, [])).toBeNull();
  });
});
