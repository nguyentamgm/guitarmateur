import { describe, expect, it } from 'vitest';
import { levelKeyOwnedByTarget, levelShortcut } from './keys';

describe('levelShortcut', () => {
  const lv = (key: string, code: string, answers = 2) => levelShortcut({ key, code, shiftKey: false }, answers);

  it('Space plays again, Enter goes on', () => {
    expect(lv(' ', 'Space')).toEqual({ type: 'replay' });
    expect(lv('Enter', 'Enter')).toEqual({ type: 'next' });
    expect(lv('Enter', 'NumpadEnter')).toEqual({ type: 'next' });
  });

  it('1 to 6 pick an answer by its place, only among the answers shown', () => {
    expect(lv('1', 'Digit1')).toEqual({ type: 'answer', index: 0 });
    expect(lv('2', 'Numpad2')).toEqual({ type: 'answer', index: 1 });
    expect(lv('3', 'Digit3')).toBeNull();
    expect(lv('6', 'Digit6', 6)).toEqual({ type: 'answer', index: 5 });
    expect(lv('7', 'Digit7', 6)).toBeNull();
    expect(lv('0', 'Digit0', 6)).toBeNull();
  });

  it('with two answers, the arrows pick left and right; with more they do nothing', () => {
    expect(lv('ArrowLeft', 'ArrowLeft')).toEqual({ type: 'answer', index: 0 });
    expect(lv('ArrowRight', 'ArrowRight')).toEqual({ type: 'answer', index: 1 });
    expect(lv('ArrowLeft', 'ArrowLeft', 4)).toBeNull();
    expect(lv('ArrowUp', 'ArrowUp')).toBeNull();
    expect(lv('r', 'KeyR')).toBeNull();
  });

  it('Space and Enter on a focused button press that button; digits still answer', () => {
    const b = document.createElement('button');
    expect(levelKeyOwnedByTarget(b, { type: 'replay' })).toBe(true);
    expect(levelKeyOwnedByTarget(b, { type: 'next' })).toBe(true);
    expect(levelKeyOwnedByTarget(b, { type: 'answer', index: 0 })).toBe(false);
    expect(levelKeyOwnedByTarget(document.createElement('input'), { type: 'answer', index: 0 })).toBe(true);
    expect(levelKeyOwnedByTarget(document.body, { type: 'replay' })).toBe(false);
  });
});
