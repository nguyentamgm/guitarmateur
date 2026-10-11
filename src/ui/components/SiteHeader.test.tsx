import { describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { SiteHeader } from './SiteHeader';

function render(props: Partial<Parameters<typeof SiteHeader>[0]> = {}) {
  const container = document.createElement('div');
  const root = createRoot(container);
  const all = { language: 'en' as const, onLanguage: vi.fn(), ...props };
  act(() => root.render(createElement(SiteHeader, all)));
  return { container, ...all };
}

describe('SiteHeader', () => {
  it('has the same order as the Theory header, Practice being the current section', () => {
    const { container } = render();
    const header = container.querySelector('header.topbar')!;
    expect(header.querySelector('a.brand')!.textContent).toBe('Guitarmateur');
    const tools = [...header.querySelector('.topbar-tools')!.children].map((el) => el.tagName);
    expect(tools).toEqual(['NAV', 'DIV']);
    expect(header.querySelector('[aria-current="page"]')!.getAttribute('href')).toBe('/');
  });

  it('switches language with EN/VI chips', () => {
    const { container, onLanguage } = render({ language: 'vi' });
    const vi = container.querySelector<HTMLButtonElement>('button[aria-label="Tiếng Việt"]')!;
    expect(vi.textContent).toBe('VI');
    expect(vi.getAttribute('aria-pressed')).toBe('true');
    act(() => container.querySelector<HTMLButtonElement>('button[aria-label="English"]')!.click());
    expect(onLanguage).toHaveBeenCalledWith('en');
  });
});
