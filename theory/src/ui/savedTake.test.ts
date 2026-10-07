import { parseNote } from '../core/music';
import { backingWindow, recordNote, type TakeNote } from '../lessons/solo';
import { TAKE_STORAGE_KEY, initialTake, storeTake, takeLink } from './savedTake';

const KEY = TAKE_STORAGE_KEY;

function memory(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return { data, getItem: (k: string) => data[k] ?? null, setItem: (k: string, v: string) => void (data[k] = v) };
}
const box = backingWindow('blues', parseNote('A'));
const take: TakeNote[] = recordNote([], box.notes[3]!, 0);
const saved = { id: 'blues' as const, tonic: parseNote('A'), bpm: 84, take };

describe('saved takes', () => {
  it('remembers the last take and opens with it', () => {
    const store = memory();
    storeTake(saved, store);
    expect(store.data[KEY]).toMatch(/^1\.blues\.A\.84\./);
    expect(initialTake('', store)).toMatchObject({ from: 'stored', saved: { id: 'blues', bpm: 84 } });
    storeTake(null, store);
    expect(initialTake('', store)).toBeNull();
  });

  it('prefers a shared link, and ignores a broken one', () => {
    const store = memory();
    storeTake({ ...saved, bpm: 70 }, store);
    const link = takeLink(saved, 'https://guitarmateur.com');
    expect(link.startsWith('https://guitarmateur.com/theory/solo?take=1.blues.A.84.')).toBe(true);
    expect(link.endsWith('#record')).toBe(true);
    const search = link.slice(link.indexOf('?'), link.indexOf('#'));
    expect(initialTake(search, store)).toMatchObject({ from: 'link', saved: { bpm: 84 } });
    expect(initialTake('?take=garbage', store)).toMatchObject({ from: 'stored', saved: { bpm: 70 } });
    expect(initialTake('?take=1.blues.A.84.', store)).toMatchObject({ from: 'stored' }); // a link with no notes
  });

  it('never throws when storage does', () => {
    const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); } };
    expect(initialTake('', broken)).toBeNull();
    expect(() => storeTake(saved, broken)).not.toThrow();
  });
});
