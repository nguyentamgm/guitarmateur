import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { Player } from '../core/audio';
import { LANG_STORAGE_KEY } from '../i18n';
import { LESSONS, pentatonicMap } from '../lessons';
import { App } from './App';

function fakePlayer() {
  const plucked: number[] = [];
  let enabled = true;
  const player: Player = {
    pluck: (midi) => {
      if (enabled) plucked.push(midi);
    },
    setEnabled: (on) => {
      enabled = on;
    },
    get enabled() {
      return enabled;
    },
  };
  return { player, plucked };
}

/** Fret of a natural note on string 6 or 5, computed independently of the lesson code. */
function naturalHomeFret(name: string, string: 6 | 5): number {
  const pcOf: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const open = string === 6 ? 4 : 9;
  return (pcOf[name]! - open + 12) % 12;
}

let container: HTMLDivElement;
let root: Root;

function render(path: string, player = fakePlayer().player) {
  window.history.replaceState(null, '', path);
  act(() => root.render(<App player={player} />));
}
const text = () => container.textContent ?? '';
const button = (label: string) =>
  [...container.querySelectorAll('button')].find((b) => b.textContent === label || b.getAttribute('aria-label') === label)!;
const click = (el: Element) => act(() => el.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 })));

beforeEach(() => {
  localStorage.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('Theory app', () => {
  it('opens the contents in English by default', () => {
    render('/theory');
    expect(text()).toContain('Learn the neck by its shapes');
    expect(text()).toContain(pentatonicMap.copy.en.title);
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe('Guitarmateur Theory');
  });

  it('switches to Vietnamese and remembers it', () => {
    render('/theory');
    click(button('Tiếng Việt'));
    expect(text()).toContain('Học cần đàn qua hình');
    expect(document.documentElement.lang).toBe('vi');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('vi');
  });

  it('lists the lessons in order, the fretboard first', () => {
    render('/theory');
    const cards = [...container.querySelectorAll('a.lesson-card')].map((a) => a.getAttribute('href'));
    expect(cards).toEqual(LESSONS.map((l) => `/theory/${l.slug}`));
    expect(cards[0]).toBe('/theory/fretboard');
  });

  it('navigates from the contents to the lesson without a reload', () => {
    render('/theory');
    click(container.querySelector('a.lesson-card[href="/theory/pentatonic-map"]')!);
    expect(window.location.pathname).toBe('/theory/pentatonic-map');
    expect(container.querySelectorAll('section.step')).toHaveLength(pentatonicMap.steps.length + 1);
    expect(document.title).toBe(`${pentatonicMap.copy.en.title} · Guitarmateur Theory`);
  });

  describe.each(LESSONS.map((l) => [l.slug, l] as const))('%s', (slug, lesson) => {
    it.each(['en', 'vi'] as const)('renders every step in %s', (lang) => {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
      render(`/theory/${slug}`);
      const copy = lesson.copy[lang];
      for (const s of lesson.steps) {
        expect(text()).toContain(copy.steps[s.id]!.title);
        expect(text()).toContain(copy.steps[s.id]!.takeaway);
        expect(container.querySelector(`section#${s.id} svg`)).not.toBeNull();
      }
    });
  });

  it('plays the note you click, and stays silent when sound is off', () => {
    const { player, plucked } = fakePlayer();
    render('/theory/pentatonic-map', player);
    // Step 1, first pair: string 6 at fret 5 is A2 = MIDI 45.
    const first = container.querySelector('section#grid .dot')!;
    click(first);
    expect(plucked).toEqual([45]);
    click(button('Sound: on'));
    click(first);
    expect(plucked).toEqual([45]);
  });

  it('moves box 1 to C when C is picked in the finder', () => {
    render('/theory/pentatonic-map');
    const finder = container.querySelector('section#keys .finder')!;
    click([...finder.querySelectorAll('button')].find((b) => b.textContent?.startsWith('C'))!);
    expect(container.querySelector('section#keys .caption')!.textContent).toBe(
      'C minor: home on string 6 at fret 8; the shape slid +3 frets',
    );
  });

  it('plays an open string and names it (fretboard, step 1)', () => {
    const { player, plucked } = fakePlayer();
    render('/theory/fretboard', player);
    click(container.querySelector('section#strings .dot[aria-label$="A/0"]')!);
    expect(plucked).toEqual([45]);
    expect(container.querySelector('section#strings .caption')!.textContent).toBe('String 5: A');
  });

  it('lights the neck dot of a tab number, and the tab number of a dot', () => {
    const { player, plucked } = fakePlayer();
    render('/theory/fretboard', player);
    const section = container.querySelector('section#tab')!;
    const tabNum = section.querySelector('.tabnum[aria-label="D/7"]')!;
    click(tabNum);
    expect(plucked).toEqual([57]);
    expect(section.querySelector('.dot.hit[aria-label="7 D/7"]')).not.toBeNull();
    expect(section.querySelector('.caption')!.textContent).toBe('String 4, fret 7');
    click(section.querySelector('.dot[aria-label="0 A/0"]')!);
    expect(section.querySelector('.tabnum.on')!.getAttribute('aria-label')).toBe('A/0');
    expect(section.querySelector('.caption')!.textContent).toBe('String 5, open (0)');
  });

  it('shows octave links for the picked note', () => {
    render('/theory/fretboard');
    const section = container.querySelector('section#octaves')!;
    expect(section.querySelector('.caption')!.textContent).toBe('A: 8 places on the first 15 frets');
    click([...section.querySelectorAll('button')].find((b) => b.textContent === 'E')!);
    expect(section.querySelector('.caption')!.textContent).toBe('E: 9 places on the first 15 frets');
    expect(section.querySelectorAll('.olink.b').length).toBeGreaterThan(0);
  });

  it('marks the home-note quiz: wrong string, wrong fret, then right', () => {
    render('/theory/fretboard');
    const section = container.querySelector('section#home')!;
    const q = /^Find ([A-G]) on string ([56])$/.exec(section.querySelector('.question')!.textContent!)!;
    const [name, string] = [q[1]!, Number(q[2]) as 6 | 5];
    const other = string === 6 ? 5 : 6;
    const homeFret = naturalHomeFret(name, string);
    const caption = () => section.querySelector('.caption')!.textContent;
    const dot = (s: number, f: number) => section.querySelector(`.dot[aria-label$="${s === 6 ? 'E' : 'A'}/${f}"]`)!;

    click(dot(other, 1));
    expect(caption()).toBe(`Right idea, wrong string: look on string ${string}.`);
    click(dot(string, homeFret <= 10 ? homeFret + 2 : homeFret - 2));
    expect(caption()).toMatch(/^Fret \d+ is /);
    click(dot(string, homeFret));
    expect(caption()).toBe(`Yes: ${name} on string ${string} is at fret ${homeFret}.`);
    expect(section.textContent).toContain('First try: 0 of 1');
    click(button('Next note'));
    expect(caption()).toBe('');
    // A miss counts even when the question is skipped.
    const next = /^Find [A-G] on string ([56])$/.exec(section.querySelector('.question')!.textContent!)!;
    click(dot(Number(next[1]) === 6 ? 5 : 6, 1));
    click(button('Next note'));
    expect(section.textContent).toContain('First try: 0 of 2');
  });

  it('shows the contents with a notice for an unknown lesson', () => {
    render('/theory/nope');
    expect(text()).toContain('There is no lesson at “/theory/nope”');
    expect(text()).toContain(pentatonicMap.copy.en.title);
  });
});
