import { describe, expect, it } from 'vitest';
import { fill } from './fill';

describe('fill', () => {
  it('fills placeholders and leaves a missing one visible', () => {
    expect(fill('{a} of {b}', { a: 3 })).toBe('3 of {b}');
    expect(fill('{n} BPM, {n} again', { n: 90 })).toBe('90 BPM, 90 again');
  });
});
