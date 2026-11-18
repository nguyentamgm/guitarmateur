import { act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { UI } from '../../i18n';
import { Ctx, type TheoryContext } from '../context';
import { SessionSettingsBar, SessionSettingsProvider } from './SessionSettings';
import { useSessionStrumSpeed, useSetSessionStrumSpeed } from './sessionSettingsContext';

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

function click(el: Element | null) {
  act(() => {
    el?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function TestConsumer() {
  const speed = useSessionStrumSpeed();
  const setSpeed = useSetSessionStrumSpeed();
  return (
    <div>
      <span className="speed-display">{speed}</span>
      <button type="button" className="set-slow" onClick={() => setSpeed('slow')}>
        {UI.en.session.strumSpeeds.slow}
      </button>
      <button type="button" className="set-fast" onClick={() => setSpeed('fast')}>
        {UI.en.session.strumSpeeds.fast}
      </button>
    </div>
  );
}

const mockCtx: TheoryContext = {
  lang: 'en',
  ui: UI.en,
  setLang: () => {},
  player: {
    pluck: () => {},
    mute: () => {},
    click: () => {},
    setEnabled: () => {},
    now: () => 0,
    setLevels: () => {},
    cancel: () => {},
    enabled: true,
  },
  navigate: () => {},
  recordQuiz: () => {},
  toggleSessionTick: () => {},
};

describe('SessionSettings', () => {
  it('provides default strumSpeed and updates on setter', () => {
    localStorage.clear();
    const c = render(
      <SessionSettingsProvider>
        <TestConsumer />
      </SessionSettingsProvider>,
    );

    expect(c.querySelector('.speed-display')!.textContent).toBe('medium');

    click(c.querySelector('.set-slow'));
    expect(c.querySelector('.speed-display')!.textContent).toBe('slow');
    expect(localStorage.getItem('theory.strumSpeed')).toBe('slow');

    click(c.querySelector('.set-fast'));
    expect(c.querySelector('.speed-display')!.textContent).toBe('fast');
    expect(localStorage.getItem('theory.strumSpeed')).toBe('fast');
  });

  it('renders nothing when settings is undefined or empty', () => {
    const c1 = render(
      <Ctx.Provider value={mockCtx}>
        <SessionSettingsProvider>
          <SessionSettingsBar settings={undefined} />
        </SessionSettingsProvider>
      </Ctx.Provider>,
    );
    expect(c1.querySelector('.session-settings-bar')).toBeNull();

    const c2 = render(
      <Ctx.Provider value={mockCtx}>
        <SessionSettingsProvider>
          <SessionSettingsBar settings={[]} />
        </SessionSettingsProvider>
      </Ctx.Provider>,
    );
    expect(c2.querySelector('.session-settings-bar')).toBeNull();
  });

  it('renders strum speed radio chips when settings has strumSpeed', () => {
    const c = render(
      <Ctx.Provider value={mockCtx}>
        <SessionSettingsProvider>
          <SessionSettingsBar settings={['strumSpeed']} />
        </SessionSettingsProvider>
      </Ctx.Provider>,
    );

    const bar = c.querySelector('.session-settings-bar')!;
    expect(bar).not.toBeNull();
    const radioButtons = bar.querySelectorAll('[role="radio"]');
    expect(radioButtons).toHaveLength(3);
    expect([...radioButtons].map((b) => b.textContent)).toEqual(['Slow', 'Medium', 'Fast']);
  });
});
