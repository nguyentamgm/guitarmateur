import { describe, expect, it } from 'vitest';
import { levelKeyOwnedByTarget, levelShortcut, ownedByTarget, shortcut } from './keys';

const press = (key: string, code: string, shiftKey = false) => shortcut({ key, code, shiftKey });

describe('shortcut', () => {
  it('Space and Enter: Start, then Next', () => {
    expect(press(' ', 'Space')).toEqual({ type: 'primary' });
    expect(press('Enter', 'Enter')).toEqual({ type: 'primary' });
    expect(press('Enter', 'NumpadEnter')).toEqual({ type: 'primary' });
  });

  it('R, K, T in either case: replay the note, hear the key, play 1', () => {
    expect(press('r', 'KeyR')).toEqual({ type: 'replayNote' });
    expect(press('R', 'KeyR', true)).toEqual({ type: 'replayNote' });
    expect(press('k', 'KeyK')).toEqual({ type: 'replayContext' });
    expect(press('t', 'KeyT')).toEqual({ type: 'playTonic' });
  });

  it('1–7: the degrees; on the number row and the keypad', () => {
    expect(['1', '2', '3', '4', '5', '6', '7'].map((d) => press(d, `Digit${d}`))).toEqual(
      ['1', '2', '3', '4', '5', '6', '7'].map((degree) => ({ type: 'answer', degree })),
    );
    expect(press('3', 'Numpad3')).toEqual({ type: 'answer', degree: '3' });
    expect(press('8', 'Digit8')).toBeNull();
    expect(press('0', 'Digit0')).toBeNull();
  });

  it('Shift + digit: a half step lower, whatever the layout puts on that key', () => {
    expect(press('#', 'Digit3', true)).toEqual({ type: 'answer', degree: 'b3' });
    expect(press('§', 'Digit3', true)).toEqual({ type: 'answer', degree: 'b3' });
    expect(press('%', 'Digit5', true)).toEqual({ type: 'answer', degree: '#4' });
    expect(press('@', 'Digit2', true)).toEqual({ type: 'answer', degree: 'b2' });
    expect(press('^', 'Digit6', true)).toEqual({ type: 'answer', degree: 'b6' });
    expect(press('&', 'Digit7', true)).toEqual({ type: 'answer', degree: 'b7' });
    // ♭1 and ♭4 name no degree.
    expect(press('!', 'Digit1', true)).toBeNull();
    expect(press('$', 'Digit4', true)).toBeNull();
  });

  it('a digit without a known code still counts (an odd keyboard)', () => {
    expect(press('5', '')).toEqual({ type: 'answer', degree: '5' });
  });

  it('other keys do nothing', () => {
    expect(press('a', 'KeyA')).toBeNull();
    expect(press('Tab', 'Tab')).toBeNull();
    expect(press('ArrowLeft', 'ArrowLeft')).toBeNull();
  });
});

describe('ownedByTarget', () => {
  const el = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.firstElementChild!;
  };
  const primary = { type: 'primary' } as const;
  const replay = { type: 'replayNote' } as const;

  it('typing keeps every key', () => {
    for (const html of ['<input>', '<textarea></textarea>', '<select></select>']) {
      expect(ownedByTarget(el(html), replay), html).toBe(true);
      expect(ownedByTarget(el(html), primary), html).toBe(true);
    }
  });

  it('a button, link or summary keeps Space / Enter, not the letters and digits', () => {
    for (const html of [
      '<button></button>',
      '<a href="#">x</a>',
      '<summary></summary>',
      '<div role="button"></div>',
    ]) {
      expect(ownedByTarget(el(html), primary), html).toBe(true);
      expect(ownedByTarget(el(html), replay), html).toBe(false);
    }
  });

  it('the page itself owns nothing', () => {
    expect(ownedByTarget(document.body, primary)).toBe(false);
    expect(ownedByTarget(el('<section tabindex="-1"></section>'), primary)).toBe(false);
    expect(ownedByTarget(null, primary)).toBe(false);
  });
});

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
