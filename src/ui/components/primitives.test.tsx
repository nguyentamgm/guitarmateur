import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { TextButton } from './primitives';

const roots: Root[] = [];
afterEach(() => {
  for (const r of roots.splice(0)) act(() => r.unmount());
});

describe('TextButton', () => {
  it('is named by its text and says whether its panel is open', () => {
    const c = document.createElement('div');
    const root = createRoot(c);
    roots.push(root);
    act(() => root.render(createElement(TextButton, { onClick: () => {}, expanded: false, children: 'Pick any chord' })));
    const b = c.querySelector('button')!;
    expect(b.hasAttribute('aria-label')).toBe(false);
    expect(b.getAttribute('aria-expanded')).toBe('false');
    act(() => root.render(createElement(TextButton, { onClick: () => {}, expanded: true, children: 'Hide the chord picker' })));
    expect(b.getAttribute('aria-expanded')).toBe('true');
  });
});
