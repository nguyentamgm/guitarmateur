import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Button, ChipGroup, OnOff, Slider } from './controls';

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

describe('shared controls', () => {
  it('ChipGroup: a labelled group, one chip pressed', () => {
    const onChange = vi.fn();
    const c = render(createElement(ChipGroup<string>, { label: 'Key', items: [{ value: 'A', text: 'A' }, { value: 'E', text: 'E' }], value: 'E', onChange }));
    expect(c.querySelector('[role="group"]')!.getAttribute('aria-label')).toBe('Key');
    const chips = [...c.querySelectorAll('button.chip')];
    expect(chips.map((b) => b.getAttribute('aria-pressed'))).toEqual(['false', 'true']);
    act(() => (chips[0] as HTMLButtonElement).click());
    expect(onChange).toHaveBeenCalledWith('A');
  });

  it('OnOff: off then on', () => {
    const onChange = vi.fn();
    const c = render(createElement(OnOff, { label: 'Loop', on: 'On', off: 'Off', value: false, onChange }));
    act(() => c.querySelectorAll<HTMLButtonElement>('button.chip')[1]!.click());
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('Button: filled or ghost', () => {
    expect(render(createElement(Button, { onClick: () => {}, children: 'Play' })).querySelector('button')!.className).toBe('btn');
    expect(render(createElement(Button, { onClick: () => {}, ghost: true, children: 'Stop' })).querySelector('button')!.className).toBe('btn ghost');
  });

  it('Slider: label, range, value text and an optional badge', () => {
    const c = render(createElement(Slider, { label: 'Tempo', value: 90, min: 40, max: 200, text: '90 BPM', onChange: () => {}, children: createElement('span', { className: 'best' }, 'Best') }));
    const input = c.querySelector<HTMLInputElement>('label.slider input[type="range"]')!;
    expect([input.min, input.max, input.step, input.value]).toEqual(['40', '200', '1', '90']);
    expect(c.querySelector('output')!.textContent).toBe('90 BPM');
    expect(c.querySelector('.best')).not.toBeNull();
    // Named by the label alone, not the changing value or the badge.
    const id = input.getAttribute('aria-labelledby')!;
    expect([...c.querySelectorAll('[id]')].find((el) => el.id === id)!.textContent).toBe('Tempo');
  });
});
