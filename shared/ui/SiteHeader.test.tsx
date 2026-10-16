import { act, createElement, type MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import { SiteHeader } from './SiteHeader';
import type { SiteSection } from './siteSections';

const LABELS = { lessons: 'Lessons', review: 'Review', practice: 'Practice', ear: 'Ear training' };
const LANGUAGES = [
  { id: 'en', tag: 'en', name: 'English' },
  { id: 'vi', tag: 'vi', name: 'Tiếng Việt' },
] as const;

function render(props: { current?: SiteSection; language?: 'en' | 'vi'; onNavigate?: (e: MouseEvent<HTMLAnchorElement>, href: string) => void } = {}) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const onLanguage = vi.fn();
  act(() =>
    root.render(
      createElement(SiteHeader<'en' | 'vi'>, {
        brand: 'Guitarmateur',
        navLabel: 'Sections',
        labels: LABELS,
        languageLabel: 'Language',
        languages: LANGUAGES,
        language: props.language ?? 'en',
        onLanguage,
        current: props.current,
        onNavigate: props.onNavigate,
      }),
    ),
  );
  return { container, onLanguage };
}

describe('SiteHeader', () => {
  it('shows brand, then the sections in site order, then the language switch', () => {
    const { container } = render({ current: 'practice' });
    const header = container.querySelector('header.topbar')!;
    expect(header.querySelector('a.brand')!.getAttribute('href')).toBe('/');
    const tools = [...header.querySelector('.topbar-tools')!.children].map((el) => el.tagName);
    expect(tools).toEqual(['NAV', 'DIV']);
    const links = [...header.querySelectorAll<HTMLAnchorElement>('nav a')].map((a) => [a.textContent, a.getAttribute('href')]);
    expect(links).toEqual([
      ['Lessons', '/theory'],
      ['Review', '/theory/review'],
      ['Practice', '/'],
    ]);
  });

  it.each([
    ['lessons', '/theory'],
    ['review', '/theory/review'],
    ['practice', '/'],
  ] as const)('marks %s as the current page', (current, href) => {
    const { container } = render({ current });
    const marked = container.querySelectorAll('[aria-current="page"]');
    expect(marked).toHaveLength(1);
    expect(marked[0]!.getAttribute('href')).toBe(href);
  });

  it('switches language with EN/VI radios, one Tab stop', () => {
    const { container, onLanguage } = render({ language: 'vi' });
    const vi = container.querySelector<HTMLButtonElement>('button[lang="vi"]')!;
    expect(vi.textContent).toBe('VI');
    // Named by the language and the shown code (what a voice user says).
    expect(vi.getAttribute('role')).toBe('radio');
    expect(vi.getAttribute('aria-label')).toBe('Tiếng Việt (VI)');
    expect(vi.getAttribute('aria-checked')).toBe('true');
    expect(vi.tabIndex).toBe(0);
    const en = container.querySelector<HTMLButtonElement>('button[lang="en"]')!;
    expect(en.tabIndex).toBe(-1);
    act(() => en.click());
    expect(onLanguage).toHaveBeenCalledWith('en');
  });

  it('hands each section click to onNavigate with its href', () => {
    const onNavigate = vi.fn((e: MouseEvent<HTMLAnchorElement>) => e.preventDefault());
    const { container } = render({ onNavigate });
    act(() => container.querySelector<HTMLAnchorElement>('a[href="/theory/review"]')!.click());
    expect(onNavigate).toHaveBeenCalledWith(expect.anything(), '/theory/review');
  });
});
