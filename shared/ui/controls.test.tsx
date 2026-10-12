import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Button, Chip, ChipGroup, KeyPicker, OnOff, Slider, Takeaways } from './controls';

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
  it('Takeaways: a label and its text per row, the caller\'s class added', () => {
    const rows = [
      { label: 'Takeaway', text: 'One box at a time.' },
      { label: 'Try it', text: 'Play it up and down.' },
    ];
    const c = render(createElement(Takeaways, { rows, className: 'prose' }));
    const dl = c.querySelector('dl')!;
    expect(dl.className).toBe('takeaways prose');
    expect([...dl.querySelectorAll('div')].map((d) => [d.querySelector('dt')!.textContent, d.querySelector('dd')!.textContent])).toEqual(
      rows.map((r) => [r.label, r.text]),
    );
  });

  it('ChipGroup: a labelled radio group, one chip checked and the only Tab stop', () => {
    const onChange = vi.fn();
    const c = render(createElement(ChipGroup<string>, { label: 'Key', items: [{ value: 'A', text: 'A' }, { value: 'E', text: 'E' }], value: 'E', onChange }));
    expect(c.querySelector('[role="radiogroup"]')!.getAttribute('aria-label')).toBe('Key');
    const chips = [...c.querySelectorAll<HTMLButtonElement>('button.chip')];
    expect(chips.map((b) => b.getAttribute('role'))).toEqual(['radio', 'radio']);
    expect(chips.map((b) => b.getAttribute('aria-checked'))).toEqual(['false', 'true']);
    expect(chips.map((b) => b.tabIndex)).toEqual([-1, 0]);
    expect(chips[0]!.hasAttribute('aria-pressed')).toBe(false);
    act(() => chips[0]!.click());
    expect(onChange).toHaveBeenCalledWith('A');
  });

  it('RadioGroup: the arrow keys move the choice and the focus, wrapping; other keys do nothing', () => {
    const onChange = vi.fn();
    const items = ['A', 'B', 'C'].map((v) => ({ value: v, text: v }));
    const c = render(createElement(ChipGroup<string>, { label: 'Key', items, value: 'B', onChange }));
    document.body.append(c);
    const chips = [...c.querySelectorAll<HTMLButtonElement>('button.chip')];
    const key = (el: HTMLElement, k: string) => act(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })));
    key(chips[1]!, 'ArrowRight');
    expect(onChange).toHaveBeenLastCalledWith('C');
    expect(document.activeElement).toBe(chips[2]);
    key(chips[2]!, 'ArrowDown');
    expect(onChange).toHaveBeenLastCalledWith('A');
    key(chips[0]!, 'ArrowLeft');
    expect(onChange).toHaveBeenLastCalledWith('C');
    key(chips[1]!, 'ArrowUp');
    expect(onChange).toHaveBeenLastCalledWith('A');
    key(chips[1]!, 'x');
    expect(onChange).toHaveBeenCalledTimes(4);
    c.remove();
  });

  it('ChipGroup / KeyPicker with nothing checked: the first radio still takes Tab', () => {
    const items = ['A', 'B'].map((v) => ({ value: v, text: v }));
    const c = render(createElement(ChipGroup<string>, { label: 'Answer', items, value: 'none', onChange: () => {} }));
    expect([...c.querySelectorAll<HTMLButtonElement>('button.chip')].map((b) => b.tabIndex)).toEqual([0, -1]);
    const k = render(createElement(KeyPicker<string>, { label: 'Key', keys: ['A', 'C'], name: (x) => x, fret: () => 0, value: 'E', onChange: () => {} }));
    expect([...k.querySelectorAll('button')].map((b) => b.tabIndex)).toEqual([0, -1]);
  });

  it('RadioGroup `manual`: the arrow keys move the focus only; a click chooses', () => {
    const onChange = vi.fn();
    const items = ['A', 'B'].map((v) => ({ value: v, text: v }));
    const c = render(createElement(ChipGroup<string>, { label: 'Answer', items, value: 'none', onChange, manual: true }));
    document.body.append(c);
    const chips = [...c.querySelectorAll<HTMLButtonElement>('button.chip')];
    act(() => chips[0]!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })));
    expect(document.activeElement).toBe(chips[1]);
    expect(onChange).not.toHaveBeenCalled();
    act(() => chips[1]!.click());
    expect(onChange).toHaveBeenCalledWith('B');
    c.remove();
  });

  it('Chip without `radio` stays a toggle button', () => {
    const c = render(createElement(Chip, { pressed: true, onClick: () => {}, children: 'Loop' }));
    const b = c.querySelector('button')!;
    expect(b.getAttribute('aria-pressed')).toBe('true');
    expect(b.hasAttribute('role')).toBe(false);
    expect(b.hasAttribute('tabindex')).toBe(false);
  });

  it('KeyPicker: each key with its fret, a radio group with the current one checked', () => {
    const onChange = vi.fn();
    const frets: Record<string, number> = { A: 5, 'B♭': 6, C: 8 };
    const c = render(
      createElement(KeyPicker<string>, { label: 'Key', keys: ['A', 'B♭', 'C'], name: (k) => k, fret: (k) => frets[k]!, value: 'B♭', onChange }),
    );
    expect(c.querySelector('.finder[role="radiogroup"]')!.getAttribute('aria-label')).toBe('Key');
    const buttons = [...c.querySelectorAll('button')];
    expect(buttons.map((b) => b.textContent)).toEqual(['A 5', 'B♭ 6', 'C 8']);
    expect(buttons.map((b) => b.getAttribute('role'))).toEqual(['radio', 'radio', 'radio']);
    expect(buttons.map((b) => b.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
    expect(buttons.map((b) => b.tabIndex)).toEqual([-1, 0, -1]);
    act(() => buttons[2]!.click());
    expect(onChange).toHaveBeenCalledWith('C');
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
