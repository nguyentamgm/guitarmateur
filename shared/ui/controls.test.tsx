import { describe, expect, it, vi } from 'vitest';
import { act, createElement, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, ChipGroup, OnOff, Slider } from './controls';

function render(el: ReactElement) {
  const container = document.createElement('div');
  act(() => createRoot(container).render(el));
  return container;
}

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
  });
});
