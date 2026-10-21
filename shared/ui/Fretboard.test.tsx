import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { DROP_D_STRING_NAMES } from '../core/neck';
import { Fretboard, type FretDot } from './Fretboard';
import type { DotWords } from './dotName';
import { neckGeometry } from './geometry';

const roots: Root[] = [];
afterEach(() => {
  for (const r of roots.splice(0)) act(() => r.unmount());
});

function render(props: Partial<Parameters<typeof Fretboard>[0]> & { dots: readonly FretDot[] }) {
  const container = document.createElement('div');
  const root = createRoot(container);
  roots.push(root);
  act(() => root.render(createElement(Fretboard, { geometry: neckGeometry(12), label: 'Neck', ...props })));
  return container;
}

// A minor pentatonic in box 1 (frets 5–8), a few notes of each kind a Practice lick card shows.
const dots: FretDot[] = [
  { key: 'a', string: 6, fret: 5, midi: 45, degree: '1', name: 'A', tone: 'home' },
  { key: 'c', string: 6, fret: 8, midi: 48, degree: '♭3', name: 'C', tone: 'chord', mark: '3' },
  { key: 'e', string: 5, fret: 7, midi: 52, degree: '5', name: 'E', tone: 'target', halo: true, mark: '5' },
  { key: 'eb', string: 5, fret: 6, midi: 51, degree: '♭5', name: 'E♭', tone: 'blue' },
  { key: 'd', string: 5, fret: 5, midi: 50, degree: '4', name: 'D' },
];

const dot = (c: HTMLElement, key: string) => c.querySelectorAll('g.dot')[dots.findIndex((d) => d.key === key)]!;

describe('shared Fretboard', () => {
  it('draws every Practice marker: target, chord tone, landing halo, blue note, role mark', () => {
    const c = render({ dots });
    expect(dot(c, 'e').getAttribute('class')).toBe('dot target');
    // The halo is drawn just before its dot, outside it (so the dot's tone never styles it).
    const halo = c.querySelector('circle.halo')!;
    expect(halo.nextElementSibling).toBe(dot(c, 'e'));
    expect(c.querySelectorAll('circle.halo')).toHaveLength(1);
    expect(dot(c, 'c').getAttribute('class')).toBe('dot chord');
    expect(dot(c, 'c').nextElementSibling!.matches('text.mark')).toBe(true);
    expect(dot(c, 'c').nextElementSibling!.textContent).toBe('3');
    expect(dot(c, 'eb').getAttribute('class')).toBe('dot blue');
  });

  it('labels dots with degrees by default, note names on request; an explicit label wins', () => {
    const texts = (c: HTMLElement) => [...c.querySelectorAll('g.dot > text')].map((t) => t.textContent);
    expect(texts(render({ dots }))).toEqual(['1', '♭3', '5', '♭5', '4']);
    expect(texts(render({ dots, labels: 'name' }))).toEqual(['A', 'C', 'E', 'E♭', 'D']);
    expect(texts(render({ dots: [{ ...dots[0]!, label: 'R' }] }))).toEqual(['R']);
  });

  it('frames merged boxes as one span', () => {
    const g = neckGeometry(12);
    const c = render({ dots, box: { minFret: 5, maxFret: 10 } });
    const rect = c.querySelector('rect.boxrect') as SVGRectElement;
    expect(Number(rect.getAttribute('width'))).toBe(g.wireX(10) - g.wireX(4));
    expect(rect.style.transform).toBe(`translateX(${g.wireX(4)}px)`);
  });

  it('names the strings in the tuning: Drop D', () => {
    const names = (c: HTMLElement) => [...c.querySelectorAll('text.sname')].map((t) => t.textContent);
    expect(names(render({ dots }))).toEqual(['E', 'A', 'D', 'G', 'B', 'e']);
    const drop = render({ dots, stringNames: DROP_D_STRING_NAMES });
    expect(names(drop)).toEqual(['D', 'A', 'D', 'G', 'B', 'e']);
    expect(dot(drop, 'a').getAttribute('aria-label')).toBe('1 D/5');
  });

  it('mirrors the neck for a left-handed player and keeps text upright', () => {
    const g = neckGeometry(12);
    const c = render({ dots, leftHanded: true });
    expect(c.querySelector('svg > g')!.getAttribute('transform')).toBe(`translate(${g.width} 0) scale(-1 1)`);
    const label = dot(c, 'a').querySelector('text')!;
    expect(label.getAttribute('transform')).toBe(`translate(${2 * g.x(5)} 0) scale(-1 1)`);
    expect(c.querySelector('text.sname')!.getAttribute('text-anchor')).toBe('end');
    // The role mark stays at the dot's top right as seen: drawn left of it before mirroring.
    expect(dot(c, 'c').nextElementSibling!.getAttribute('x')).toBe(String(g.x(8) - 11));
    // Right-handed: no transforms at all.
    expect(render({ dots }).querySelector('svg > g')!.getAttribute('transform')).toBeNull();
  });

  it('plays a dot by click or keyboard through the caller', () => {
    const play = vi.fn();
    const onDot = vi.fn();
    const c = render({ dots, play, onDot });
    act(() => (dot(c, 'a') as SVGGElement).dispatchEvent(new MouseEvent('click', { bubbles: true })));
    act(() => dot(c, 'c').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    expect(play.mock.calls).toEqual([[45], [48]]);
    expect(onDot).toHaveBeenCalledTimes(2);
    // Silent without `play`.
    const silent = render({ dots });
    expect(() => act(() => (dot(silent, 'a') as SVGGElement).dispatchEvent(new MouseEvent('click', { bubbles: true })))).not.toThrow();
  });

  it('a tap beside a dot plays the nearest one within 20px, at the size the neck is drawn', () => {
    const g = neckGeometry(12);
    const tapAt = (c: HTMLElement, x: number, y: number) =>
      act(() => c.querySelector('svg')!.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y })));
    const play = vi.fn();
    const c = render({ dots, play });
    // Drawn at half size, as a phone shrinks a long neck: 20 CSS px reach 40 of the drawing's units.
    c.querySelector('svg')!.getBoundingClientRect = () => new DOMRect(0, 0, g.width / 2, g.height / 2);
    const css = (fret: number, string: 1 | 2 | 3 | 4 | 5 | 6) => [g.x(fret) / 2, g.y(string) / 2] as const;
    const [ax, ay] = css(5, 6);
    tapAt(c, ax, ay + 15); // below string 6, under the root
    tapAt(c, ax + 21, ay + 3); // 21px from A: the nearest dot is E♭ (fret 6, string 5), 17px away
    tapAt(c, ax, ay + 21); // too far from every dot
    expect(play.mock.calls).toEqual([[45], [51]]);
    // Mirrored for a left-handed player: the same dot, tapped where it is drawn.
    const left = vi.fn();
    const m = render({ dots, play: left, leftHanded: true });
    m.querySelector('svg')!.getBoundingClientRect = () => new DOMRect(0, 0, g.width / 2, g.height / 2);
    tapAt(m, (g.width - g.x(5)) / 2, ay + 15);
    expect(left.mock.calls).toEqual([[45]]);
  });
});

describe('keyboard and screen reader', () => {
  const words: DotWords = {
    fret: (n) => `fret ${n}`,
    string: (n) => `string ${n}`,
    root: 'root',
    tones: { chord: 'chord tone', target: 'target note', blue: 'blue note' },
  };
  const names = (c: HTMLElement) => [...c.querySelectorAll('g.dot')].map((d) => d.getAttribute('aria-label'));

  it('names each dot by note, fret, string, then degree (and root for 1), tone and mark', () => {
    expect(names(render({ dots, words }))).toEqual([
      'A, fret 5, string 6, 1, root',
      'C, fret 8, string 6, ♭3, chord tone 3',
      'E, fret 7, string 5, 5, target note 5',
      'E♭, fret 6, string 5, ♭5, blue note',
      'D, fret 5, string 5, 4',
    ]);
    // Without a note name, the text the dot shows leads; a `home` tone is the root.
    expect(names(render({ dots: [{ key: 'x', string: 3, fret: 2, midi: 57, label: '1', tone: 'home' }], words }))).toEqual(['1, fret 2, string 3, root']);
    // `homeMajor` paints other notes too (a 7th, a bass): not called the root by its tone alone.
    expect(names(render({ dots: [{ key: 'y', string: 1, fret: 7, midi: 71, label: '7', tone: 'homeMajor' }], words }))).toEqual(['7, fret 7, string 1']);
  });

  it('draws the mark beside the button, so the button\'s visible text is its label, which leads its name', () => {
    expect(dot(render({ dots, words }), 'c').textContent).toBe('♭3');
  });

  it('is one Tab stop: the first lit dot, then the one last focused; dimmed dots are in it too', () => {
    const tabbable = (c: HTMLElement) => [...c.querySelectorAll<SVGGElement>('g.dot')].filter((d) => d.tabIndex === 0);
    const dimFirst = [{ ...dots[4]!, key: 'dim', dim: true }, ...dots];
    const c = render({ dots: dimFirst, words });
    expect(tabbable(c).map((d) => d.getAttribute('aria-label'))).toEqual(['A, fret 5, string 6, 1, root']);
    const dim = c.querySelector<SVGGElement>('g.dot.dim')!;
    expect(dim.tabIndex).toBe(-1);
    act(() => dim.dispatchEvent(new FocusEvent('focusin', { bubbles: true })));
    expect(tabbable(c)).toEqual([dim]);
  });

  it('moves along the string with Left / Right, across strings with Up / Down; Enter still plays', () => {
    const play = vi.fn();
    const c = render({ dots, words, play });
    document.body.append(c);
    const key = (k: string) => act(() => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })));
    const at = () => document.activeElement!.getAttribute('aria-label');
    act(() => (dot(c, 'a') as SVGGElement).focus());
    key('ArrowRight');
    expect(at()).toBe('C, fret 8, string 6, ♭3, chord tone 3');
    key('ArrowRight'); // the last dot on the string: stays
    expect(at()).toBe('C, fret 8, string 6, ♭3, chord tone 3');
    key('ArrowUp'); // string 5 is drawn above string 6; nearest fret to 8 is 7
    expect(at()).toBe('E, fret 7, string 5, 5, target note 5');
    key('ArrowLeft');
    expect(at()).toBe('E♭, fret 6, string 5, ♭5, blue note');
    key('ArrowDown');
    expect(at()).toBe('A, fret 5, string 6, 1, root');
    key('Enter');
    expect(play).toHaveBeenLastCalledWith(45);
    c.remove();
  });

  it('left-handed: Right goes toward the nut, as the mirrored neck is drawn', () => {
    const c = render({ dots, words, leftHanded: true });
    document.body.append(c);
    act(() => (dot(c, 'c') as SVGGElement).focus());
    act(() => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })));
    expect(document.activeElement!.getAttribute('aria-label')).toBe('A, fret 5, string 6, 1, root');
    c.remove();
  });
});

describe('PositionFrame', () => {
  it('keeps its number upright on a left-handed neck', async () => {
    const { PositionFrame } = await import('./PositionFrame');
    const g = neckGeometry(12);
    const c = document.createElement('div');
    const root = createRoot(c);
    roots.push(root);
    act(() => root.render(createElement('svg', null, createElement(PositionFrame, { g, span: { index: 2, minFret: 5, maxFret: 8 }, leftHanded: true }))));
    const x = g.wireX(4) + 5;
    expect(c.querySelector('text')!.getAttribute('transform')).toBe(`translate(${2 * x} 0) scale(-1 1)`);
  });
});

describe('a window of the neck (from > 0)', () => {
  it('starts at the given wire with no nut: frets from+1…frets, numbered as on the neck', () => {
    const g = neckGeometry(8, { from: 4, fretWidth: 50 });
    expect(g.from).toBe(4);
    expect(g.wireX(4)).toBe(g.nutX);
    expect(g.x(5)).toBe(g.nutX + 25);
    expect(g.width).toBe(g.nutX + 4 * 50 + 14);
    const c = render({ dots: [{ key: 'a', string: 6, fret: 5, midi: 45 }], geometry: g });
    expect(c.querySelector('rect.nutbar')).toBeNull();
    expect([...c.querySelectorAll('text.fnum')].map((t) => t.textContent)).toEqual(['5', '6', '7', '8']);
    // The 5th and 7th fret inlays only; none from frets outside the window.
    expect(c.querySelectorAll('circle.inlay')).toHaveLength(2);
  });

  it('keeps the whole neck from the nut by default', () => {
    const g = neckGeometry(12);
    expect(g.from).toBe(0);
    const c = render({ dots: [] });
    expect(c.querySelector('rect.nutbar')).not.toBeNull();
    expect(c.querySelectorAll('text.fnum')).toHaveLength(12);
    expect(g.wireX(0)).toBe(g.nutX);
  });
});

describe('larger dots (dotRadius)', () => {
  it('keeps the shared neck as it was by default', () => {
    const g = neckGeometry(12);
    expect([g.dotRadius, g.textScale, g.nutX, g.top, g.height, g.x(0)]).toEqual([11, 1, 44, 22, 192, 26]);
    const c = render({ dots: [{ key: 'a', string: 6, fret: 5, midi: 45 }] });
    expect(c.querySelector('g.dot circle')!.getAttribute('r')).toBe('11');
  });

  it('grows the dots, their text and the room around them', () => {
    const g = neckGeometry(4, { dotRadius: 20, stringGap: 46, fretWidth: 48 });
    const c = render({ dots: [{ key: 'e', string: 1, fret: 0, midi: 64, halo: true }], geometry: g });
    expect(c.querySelector('g.dot circle')!.getAttribute('r')).toBe('20');
    expect(c.querySelector('circle.halo')!.getAttribute('r')).toBe('25');
    expect(c.querySelector('svg')!.style.getPropertyValue('--neck-text')).toBe(String(20 / 11));
    // An open-string dot sits between the string names (drawn from x 4) and the nut, clear of both.
    expect(g.x(0) - 20).toBeGreaterThan(20);
    expect(g.x(0) + 20).toBeLessThan(g.nutX - 5);
    // The top string's dots fit in the drawing; the fret numbers (11px × textScale, ~3/4 of it above
    // the line) sit below the bottom string's.
    expect(g.y(1) - 20 - 5).toBeGreaterThanOrEqual(0);
    const fnumY = Number(c.querySelector('text.fnum')!.getAttribute('y'));
    expect(fnumY - 11 * g.textScale * 0.75).toBeGreaterThan(g.y(6) + 20);
    expect(fnumY).toBeLessThan(g.height);
  });
});

describe('drawn for touch (#279)', () => {
  // The closest two dots, in px once drawn at the smallest scale the neck allows.
  const closest = (g: ReturnType<typeof neckGeometry>) =>
    Math.min(g.stringGap, g.fretWidth, g.from === 0 ? g.x(1) - g.x(0) : Infinity) * g.minScale;

  it('spreads the strings and never shrinks the dots under a 40px tap apart', () => {
    for (const opts of [{ fretWidth: 46 }, { fretWidth: 40 }, { fretWidth: 72 }, { from: 4, fretWidth: 50 }]) {
      const g = neckGeometry(12, { ...opts, touch: true });
      expect(g.stringGap).toBe(40);
      expect(closest(g)).toBeGreaterThanOrEqual(40);
    }
    // Strings already wider apart stay so (level 14's window), and then it may shrink a little.
    const wide = neckGeometry(8, { from: 3, stringGap: 46, fretWidth: 48, dotRadius: 20, touch: true });
    expect([wide.stringGap, closest(wide)]).toEqual([46, 40]);
  });

  it('leaves the neck as it was without touch, and draws its smallest size from minScale', () => {
    const g = neckGeometry(12, { fretWidth: 46 });
    expect([g.stringGap, g.minScale]).toEqual([26, 0.62]);
    const t = neckGeometry(12, { fretWidth: 46, touch: true });
    const c = render({ dots: [], geometry: t });
    expect(c.querySelector('svg')!.style.minWidth).toBe(`${Math.round(t.width * t.minScale)}px`);
  });
});
