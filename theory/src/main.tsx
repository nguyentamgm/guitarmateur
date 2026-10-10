import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import '@shared/ui/tokens.css';
import '@shared/ui/base.css';
import '@shared/ui/controls.css';
import '@shared/ui/fretboard.css';
import './ui/theory.css';

// The site-wide service worker (public/sw.js) also serves Theory's shell offline.
if (!import.meta.env.DEV && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('[SW] Registration failed:', err));
  });
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
