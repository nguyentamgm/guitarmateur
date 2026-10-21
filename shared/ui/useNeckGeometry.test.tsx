import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { NeckGeometry } from './geometry';
import { useNeckGeometry } from './useNeckGeometry';

afterEach(() => vi.unstubAllGlobals());

function geometryAt(phone: boolean): NeckGeometry {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: phone && query === '(max-width: 560px)',
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  let g: NeckGeometry | undefined;
  const Probe = () => {
    g = useNeckGeometry(12, { fretWidth: 46 });
    return null;
  };
  const root = createRoot(document.createElement('div'));
  act(() => root.render(createElement(Probe)));
  act(() => root.unmount());
  return g!;
}

describe('useNeckGeometry', () => {
  it('draws the neck for touch on a phone only', () => {
    expect(geometryAt(true).stringGap).toBe(40);
    expect(geometryAt(false).stringGap).toBe(26);
  });
});
