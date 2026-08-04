import { describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { TONICS } from '../../music';
import { TUNINGS, positions, mergedBox } from '../../fretboard';
import { FretboardDiagram } from './FretboardDiagram';

const key = { tonic: TONICS.find((t) => t.letter === 'A' && t.alter === 0)!, scaleId: 'minorPentatonic' as const };
const pos = positions(TUNINGS.standard, key);
const box = mergedBox(pos, [0]);

describe('FretboardDiagram left-handed text mirroring', () => {
  it('leaves text glyphs untransformed when not left-handed', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(createElement(FretboardDiagram, { box, title: 't' }));
    });

    const texts = container.querySelectorAll('text');
    expect(texts.length).toBeGreaterThan(0);
    texts.forEach((t) => {
      expect(t.getAttribute('transform')).toBeNull();
    });

    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);
  });

  it('counter-mirrors every text glyph in left-handed mode', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(createElement(FretboardDiagram, { box, title: 't', leftHanded: true }));
    });

    const texts = container.querySelectorAll('text');
    expect(texts.length).toBeGreaterThan(0);
    texts.forEach((t) => {
      expect(t.getAttribute('transform')).toMatch(/scale\(-1/);
    });

    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('style')).toMatch(/scaleX\(-1\)/);

    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);
  });
});
