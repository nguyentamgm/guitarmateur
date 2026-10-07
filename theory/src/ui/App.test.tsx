import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { Player } from '../core/audio';
import { LANG_STORAGE_KEY } from '../i18n';
import { LESSONS, barre, pentatonicMap } from '../lessons';
import { App } from './App';
import { PROGRESS_STORAGE_KEY, QUIZZES, recordAnswer } from './progress';

function fakePlayer() {
  const plucked: number[] = [];
  const clicks: boolean[] = [];
  let enabled = true;
  const player: Player = {
    pluck: (midi) => {
      if (enabled) plucked.push(midi);
    },
    mute: (midi) => {
      if (enabled) plucked.push(midi);
    },
    click: (accent = false) => {
      if (enabled) clicks.push(accent);
    },
    setEnabled: (on) => {
      enabled = on;
    },
    get enabled() {
      return enabled;
    },
  };
  return { player, plucked, clicks };
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
      'C minor: root on string 6 at fret 8; the shape slid +3 frets',
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
    // Both settled questions are stored for the review page.
    expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY)!)['fretboard-root']).toMatchObject({ right: 0, total: 2 });
  });

  it('asks sharps and flats once the quiz is switched to all 12', () => {
    render('/theory/fretboard');
    const section = container.querySelector('section#home')!;
    const question = () => section.querySelector('.question')!.textContent!;
    click(button('All 12 (♯/♭)'));
    const asked = new Set<string>();
    for (let i = 0; i < 60; i++) {
      expect(question()).toMatch(/^Find [A-G][♯♭]? on string [56]$/);
      asked.add(question());
      click(button('Next note'));
    }
    expect([...asked].some((q) => /[♯♭]/.test(q))).toBe(true);
  });

  describe('major scale', () => {
    const chip = (section: Element, label: string) =>
      [...section.querySelectorAll('button.chip')].find((b) => b.textContent === label)!;

    it('doubles the letter A when F major spells its fourth A♯', () => {
      render('/theory/major-scale');
      const section = container.querySelector('section#spelling')!;
      const caption = () => section.querySelector('.caption')!.textContent;
      expect(caption()).toBe('Each letter once: F G A B♭ C D E');
      click(chip(section, 'A♯'));
      expect(caption()).toBe('A♯ uses the letter A twice and leaves B out. That is why F major has B♭.');
      expect(section.querySelector('.letters .twice')!.textContent).toBe('AA A♯');
      expect(section.querySelector('.letters .empty')!.textContent).toBe('B');
    });

    it('names a clicked interval, both ways at 6 semitones, and lowers major to minor', () => {
      const { player, plucked } = fakePlayer();
      render('/theory/major-scale', player);
      const section = container.querySelector('section#intervals')!;
      const caption = () => section.querySelector('.caption')!.textContent;
      // Home C is string 5 fret 3; string 4 fret 2 is E, fret 4 is F♯/G♭.
      click(section.querySelector('.dot[aria-label$="D/2"]')!);
      expect(caption()).toBe('C → E: major 3rd, 4 semitones');
      click(button('Lower ½ step'));
      expect(caption()).toBe('C → E♭: minor 3rd, 3 semitones');
      click(section.querySelector('.dot[aria-label$="D/4"]')!);
      expect(caption()).toBe('C → F♯ / G♭: augmented 4th or diminished 5th, 6 semitones');
      expect(plucked).toEqual([52, 51, 54]);
    });

    it('shifts a stamp one fret right across G→B', () => {
      render('/theory/major-scale');
      const section = container.querySelector('section#shapes')!;
      const lines = () => [...section.querySelectorAll('p.caption')].map((p) => p.textContent);
      expect(lines()[0]).toBe('major 3rd, 5/3 → 4/2: next string up, fret shift −1');
      click(section.querySelector('.dot[aria-label$="G/5"]')!);
      expect(lines()).toEqual([
        'major 3rd, 3/5 → 2/5: next string up, fret shift 0',
        'Crosses G→B: the upper note sits one fret further right.',
      ]);
    });
  });

  describe('rhythm', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'] });
    });
    afterEach(() => {
      vi.useRealTimers();
    });
    const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

    it('ticks four beats per bar with beat 1 accented, and stops', () => {
      const { player, clicks } = fakePlayer();
      render('/theory/rhythm', player);
      const section = container.querySelector('section#beat')!;
      click(button('Start'));
      // 80 BPM = 750 ms a beat: one bar and a little more, so beat 1 of bar 2 is heard too.
      advance(3000);
      expect(clicks.slice(0, 5)).toEqual([true, false, false, false, true]);
      expect(section.querySelector('.caption')!.textContent).toMatch(/^Beat [1-4] of 4$/);
      click(button('Stop'));
      const heard = clicks.length;
      advance(3000);
      expect(clicks.length).toBe(heard);
      expect(section.querySelector('.caption')!.textContent).toBe(
        'Press start and tap your foot on every beat. Beat 1 has the higher click.',
      );
    });

    it('plays one clock at a time: starting a scene stops the one playing', () => {
      render('/theory/rhythm');
      const startIn = (id: string) => click(container.querySelector(`section#${id} button.btn`)!);
      startIn('beat');
      advance(100);
      expect(container.querySelector('section#beat button.btn')!.textContent).toBe('Stop');
      startIn('counting');
      advance(100);
      expect(container.querySelector('section#beat button.btn')!.textContent).toBe('Start');
      expect(container.querySelector('section#counting button.btn')!.textContent).toBe('Stop');
    });

    it('names a leftover rest turned into a note by its own length', () => {
      render('/theory/rhythm');
      const section = container.querySelector('section#lengths')!;
      click([...section.querySelectorAll('.chip')].find((b) => b.textContent === 'Dotted half')!);
      const blocks = () => [...section.querySelectorAll('.block')];
      click(blocks()[1]!);
      expect(blocks().map((b) => b.getAttribute('aria-label'))).toEqual([
        'Dotted half note (beats: 3)',
        'Quarter note (beats: 1)',
      ]);
    });

    it('turns a note into a rest, which then stays silent', () => {
      const { player, plucked } = fakePlayer();
      render('/theory/rhythm', player);
      const section = container.querySelector('section#lengths')!;
      expect(section.querySelector('.caption')!.textContent).toBe('Quarter: beats per note 1 · notes per bar 4');
      const blocks = () => [...section.querySelectorAll('.block')];
      click(blocks()[1]!);
      click(blocks()[3]!);
      expect(blocks().map((b) => b.classList.contains('rest'))).toEqual([false, true, false, true]);
      click(section.querySelector('button.btn')!);
      // 80 BPM: one bar is 3 s. Two quarter notes sound in it.
      advance(2900);
      expect(plucked).toEqual([57, 57]);
    });

    it('labels the count under the grid in the chosen language', () => {
      localStorage.setItem(LANG_STORAGE_KEY, 'vi');
      render('/theory/rhythm');
      const words = [...container.querySelectorAll('section#counting .word')].map((w) => w.textContent);
      expect(words).toEqual(['1', 'và', '2', 'và', '3', 'và', '4', 'và']);
    });

    it('makes a custom strum pattern by clicking cells', () => {
      render('/theory/rhythm');
      const section = container.querySelector('section#strum')!;
      expect(section.querySelector('.caption')!.textContent).toBe('Pattern: D-DU-UDU');
      click(section.querySelectorAll('.block')[1]!);
      expect(section.querySelector('.caption')!.textContent).toBe('Pattern: DUDU-UDU');
      expect(section.querySelector('.chip[aria-pressed="true"]')!.textContent).toBe('Your own');
    });
  });

  describe('review', () => {
    it('lists every quiz as not tried yet, in curriculum order', () => {
      render('/theory/review');
      const cards = [...container.querySelectorAll('.review-card')];
      expect(cards).toHaveLength(QUIZZES.length);
      expect(cards[0]!.textContent).toContain('Do this next');
      expect(cards[1]!.textContent).toContain('Not tried yet');
      expect(cards[0]!.querySelector('a')!.getAttribute('href')).toBe('/theory/fretboard#home');
      expect(document.title).toBe('Review · Guitarmateur Theory');
    });

    it('puts a weak quiz first and shows its stored score', () => {
      const now = Date.now();
      let p = {};
      for (const q of QUIZZES) p = recordAnswer(p, q.id, true, now);
      p = recordAnswer(recordAnswer(p, 'barre-find', false, now), 'barre-find', false, now);
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(p));
      render('/theory/review');
      const first = container.querySelector('.review-card')!;
      expect(first.textContent).toContain(barre.copy.en.steps.find.title);
      expect(first.textContent).toContain('33% right in the last 3 · best streak 1');
      expect(first.textContent).toContain('Last practised today');
    });

    it('counts a song skipped without an answer as a miss', () => {
      render('/theory/pentatonic');
      const section = container.querySelector('section#choose')!;
      click([...section.querySelectorAll('button')].find((b) => b.textContent === 'Next song')!);
      expect(section.textContent).toContain('0 of 1');
      expect(JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY)!)['pentatonic-shape']).toMatchObject({ right: 0, total: 1 });
    });

    it('is reachable from the header and the contents', () => {
      render('/theory');
      const links = [...container.querySelectorAll('a')].filter((a) => a.getAttribute('href') === '/theory/review');
      expect(links).toHaveLength(2);
      click(links[1]!);
      expect(window.location.pathname).toBe('/theory/review');
      expect(text()).toContain('Each quiz in the lessons keeps its score');
    });
  });

  it('shows the contents with a notice for an unknown lesson', () => {
    render('/theory/nope');
    expect(text()).toContain('There is no lesson at “/theory/nope”');
    expect(text()).toContain(pentatonicMap.copy.en.title);
  });
});
