import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UI } from '../../i18n';
import type { TransposeCopy } from '../../sessions/types';
import { Ctx, type TheoryContext } from '../context';
import { SessionSettingsContext } from './sessionSettingsContext';
import { TransposeTable, type TransposeBlock } from './TransposeTable';

const roots: Root[] = [];
function render(el: ReactElement) {
  const container = document.createElement('div');
  const root = createRoot(container);
  roots.push(root);
  act(() => root.render(el));
  return container;
}

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount());
});

function click(el: Element | null) {
  act(() => {
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

const plucks: { midi: number; delay: number; length: number }[] = [];
const mockPlayer = {
  pluck: vi.fn((midi: number, delay = 0, length = 1) => {
    plucks.push({ midi, delay, length });
  }),
  mute: vi.fn(),
  click: vi.fn(),
  cancel: vi.fn(),
  close: vi.fn(),
  unlock: vi.fn().mockResolvedValue(undefined),
  loadSample: vi.fn().mockResolvedValue(undefined),
  samplesLoaded: () => true,
  setEnabled: vi.fn(),
  enabled: true,
  now: () => 0,
  setLevels: vi.fn(),
};

const mockCtx: TheoryContext = {
  lang: 'en',
  ui: UI.en,
  setLang: () => {},
  player: mockPlayer,
  navigate: () => {},
  recordQuiz: () => {},
  quizStats: () => ({ tries: 0, right: 0, streak: 0 }),
  weakestScene: () => undefined,
};

const testCopy: TransposeCopy = {
  intro: 'Test intro',
  caption: 'Test caption',
};

const blockWithCapo: TransposeBlock = {
  kind: 'transpose',
  key: 'table',
  bars: [1, 4, 5, 1],
  tonics: ['G', 'D', 'A', 'C'],
  capoShapes: 'G',
};

describe('TransposeTable', () => {
  beforeEach(() => {
    plucks.length = 0;
    vi.clearAllMocks();
  });

  it('renders Roman numerals in header and key rows with chords', () => {
    const container = render(
      <Ctx.Provider value={mockCtx}>
        <SessionSettingsContext.Provider
          value={{ strumSpeed: 'medium', setStrumSpeed: () => {} }}
        >
          <TransposeTable block={blockWithCapo} copy={testCopy} />
        </SessionSettingsContext.Provider>
      </Ctx.Provider>,
    );

    const transposeTable = container.querySelector('table.transpose-table')!;
    expect(transposeTable).not.toBeNull();

    // Col headers: empty first col, then I, IV, V, I
    const colHeaders = [...transposeTable.querySelectorAll('thead th[scope="col"]')];
    expect(colHeaders).toHaveLength(5);
    expect(colHeaders.slice(1).map((th) => th.textContent)).toEqual(['I', 'IV', 'V', 'I']);

    // Row headers: Key of G, Key of D, Key of A, Key of C
    const rowHeaders = [...transposeTable.querySelectorAll('tbody th[scope="row"]')];
    expect(rowHeaders).toHaveLength(4);
    expect(rowHeaders[0]!.textContent).toContain('Key of G');
    expect(rowHeaders[1]!.textContent).toContain('Key of D');
    expect(rowHeaders[2]!.textContent).toContain('Key of A');
    expect(rowHeaders[3]!.textContent).toContain('Key of C');

    // Chords in first row: G, C, D, G
    const firstRowCells = [...transposeTable.querySelectorAll('tbody tr')][0]!.querySelectorAll('td');
    expect([...firstRowCells].map((td) => td.textContent)).toEqual(['G', 'C', 'D', 'G']);

    // Caption
    expect(container.querySelector('p.caption')?.textContent).toBe('Test caption');
  });

  it('renders capo table when capoShapes is set with fret 0 written as No capo', () => {
    const container = render(
      <Ctx.Provider value={mockCtx}>
        <SessionSettingsContext.Provider
          value={{ strumSpeed: 'medium', setStrumSpeed: () => {} }}
        >
          <TransposeTable block={blockWithCapo} copy={testCopy} />
        </SessionSettingsContext.Provider>
      </Ctx.Provider>,
    );

    const capoTable = container.querySelector('table.capo-table')!;
    expect(capoTable).not.toBeNull();

    const headers = [...capoTable.querySelectorAll('thead th[scope="col"]')];
    expect(headers[0]!.textContent).toBe('Capo fret');
    expect(headers[1]!.textContent).toBe('Sounds in');

    const rows = [...capoTable.querySelectorAll('tbody tr')];
    expect(rows).toHaveLength(6);

    // Fret 0 is "No capo", sounds "G"
    expect(rows[0]!.querySelector('th[scope="row"]')?.textContent).toBe('No capo');
    expect(rows[0]!.querySelector('td')?.textContent).toBe('G');

    // Fret 1..5: A♭, A, B♭, B, C
    expect(rows[1]!.querySelector('th[scope="row"]')?.textContent).toBe('1');
    expect(rows[1]!.querySelector('td')?.textContent).toBe('A♭');
    expect(rows[2]!.querySelector('th[scope="row"]')?.textContent).toBe('2');
    expect(rows[2]!.querySelector('td')?.textContent).toBe('A');
    expect(rows[3]!.querySelector('th[scope="row"]')?.textContent).toBe('3');
    expect(rows[3]!.querySelector('td')?.textContent).toBe('B♭');
    expect(rows[4]!.querySelector('th[scope="row"]')?.textContent).toBe('4');
    expect(rows[4]!.querySelector('td')?.textContent).toBe('B');
    expect(rows[5]!.querySelector('th[scope="row"]')?.textContent).toBe('5');
    expect(rows[5]!.querySelector('td')?.textContent).toBe('C');
  });

  it('plays chords when row play button is clicked and honours slow strum speed widening gap', () => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'],
    });
    try {
      const container = render(
        <Ctx.Provider value={mockCtx}>
          <SessionSettingsContext.Provider
            value={{ strumSpeed: 'slow', setStrumSpeed: () => {} }}
          >
            <TransposeTable block={blockWithCapo} copy={testCopy} />
          </SessionSettingsContext.Provider>
        </Ctx.Provider>,
      );

      const firstRow = [...container.querySelectorAll('table.transpose-table tbody tr')][0]!;
      const playBtn = firstRow.querySelector('button')!;
      expect(playBtn.textContent).toBe('Play');

      click(playBtn);

      // On step 0, G chord is strummed with slow spread (0.08)
      expect(plucks.length).toBeGreaterThanOrEqual(6);
      expect(plucks[1]!.delay - plucks[0]!.delay).toBeCloseTo(0.08, 3);
    } finally {
      vi.useRealTimers();
    }
  });
});
