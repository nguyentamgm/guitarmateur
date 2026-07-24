import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb(): null {
  throw new Error('test render error');
}

function Fine() {
  return createElement('span', null, 'all good');
}

describe('ErrorBoundary', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    document.body.removeChild(container);
  });

  it('renders children when no error occurs', async () => {
    await act(async () => {
      root.render(createElement(ErrorBoundary, null, createElement(Fine)));
    });
    expect(container.innerHTML).toContain('all good');
  });

  it('renders fallback UI when a child throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => {
      root.render(createElement(ErrorBoundary, null, createElement(Bomb)));
    });
    consoleSpy.mockRestore();

    expect(container.innerHTML).toContain('Something went wrong');
    expect(container.innerHTML).toContain('localStorage');
    expect(container.innerHTML).toContain('Reload');
  });
});
