import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './ui/App';
import '@shared/ui/tokens.css';
import '@shared/ui/base.css';
import '@shared/ui/controls.css';
import '@shared/ui/fretboard.css';
import './ui/global.css';
import { registerServiceWorker } from './sw';

if (!import.meta.env.DEV) {
  registerServiceWorker();
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
