import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { Player } from '../core/audio';
import { LANG_STORAGE_KEY } from '../i18n';
import { pentatonicMap } from '../lessons';
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

  it('navigates from the contents to the lesson without a reload', () => {
    render('/theory');
    click(container.querySelector('a.lesson-card')!);
    expect(window.location.pathname).toBe('/theory/pentatonic-map');
    expect(container.querySelectorAll('section.step')).toHaveLength(pentatonicMap.steps.length + 1);
    expect(document.title).toBe(`${pentatonicMap.copy.en.title} · Guitarmateur Theory`);
  });

  it.each(['en', 'vi'] as const)('renders every step of the lesson in %s', (lang) => {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    render('/theory/pentatonic-map');
    const copy = pentatonicMap.copy[lang];
    for (const s of pentatonicMap.steps) {
      expect(text()).toContain(copy.steps[s.id].title);
      expect(text()).toContain(copy.steps[s.id].takeaway);
    }
    expect(container.querySelectorAll('svg')).toHaveLength(pentatonicMap.steps.length);
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

  it('shows the contents with a notice for an unknown lesson', () => {
    render('/theory/nope');
    expect(text()).toContain('There is no lesson at “/theory/nope”');
    expect(text()).toContain(pentatonicMap.copy.en.title);
  });
});
