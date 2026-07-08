import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the header copy', () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain('Fretboard Trainer');
    expect(html).toContain('Pentatonic Practice');
  });
});
