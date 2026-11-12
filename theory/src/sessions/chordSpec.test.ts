import { describe, expect, it } from 'vitest';
import { chordIn } from './chordSpec';
import type { SessionKey } from './types';

describe('chordIn', () => {
  const gMajor: SessionKey = { tonic: 'G', mode: 'major' };
  const eMinor: SessionKey = { tonic: 'E', mode: 'minor' };
  const aMinor: SessionKey = { tonic: 'A', mode: 'minor' };

  it('resolves diatonic and altered chord specs in G major', () => {
    expect(chordIn(gMajor, 1)).toMatchObject({ symbol: 'G', roman: 'I' });
    expect(chordIn(gMajor, 4)).toMatchObject({ symbol: 'C', roman: 'IV' });
    expect(chordIn(gMajor, 5)).toMatchObject({ symbol: 'D', roman: 'V' });
    expect(chordIn(gMajor, 6)).toMatchObject({ symbol: 'Em', roman: 'vi' });

    expect(chordIn(gMajor, { root: 'b7', id: 'major' })).toMatchObject({ symbol: 'F', roman: '♭VII' });
    expect(chordIn(gMajor, { root: '4', id: 'minor' })).toMatchObject({ symbol: 'Cm', roman: 'iv' });
    expect(chordIn(gMajor, { root: '3', id: 'dom7' })).toMatchObject({ symbol: 'B7', roman: 'III7' });
    expect(chordIn(gMajor, { root: '5', id: 'dom7' })).toMatchObject({ symbol: 'D7', roman: 'V7' });
  });

  it('resolves chord specs in E minor', () => {
    expect(chordIn(eMinor, 1)).toMatchObject({ symbol: 'Em', roman: 'i' });
    expect(chordIn(eMinor, { root: '1', id: 'major' })).toMatchObject({ symbol: 'E', roman: 'I' });
  });

  it('resolves chord specs in A minor', () => {
    expect(chordIn(aMinor, { root: '5', id: 'major' })).toMatchObject({ symbol: 'E', roman: 'V' });
  });
});
