// src/main.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ThemeProvider } from './theme/ThemeProvider';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import QueryProvider from '@/providers/QueryProvider';
import { WebSocketProvider } from '@/providers/WebSocketProvider';
import { ToastProvider } from '@/contexts/ToastContext';
import { UIProvider } from '@/contexts/UIContext'
import { AuthProvider } from '@/contexts/AuthContext';

// Basic PWA service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.PROD) {
      navigator.serviceWorker
        .register('/web/sw.js', { scope: '/web/' })
        .catch(err => {
          console.error('Service worker registration failed', err);
        });
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryProvider>
      <BrowserRouter basename="/web/">
        <UIProvider>
          <AuthProvider>
            <ToastProvider>
              <WebSocketProvider>
                <I18nextProvider i18n={i18n}>
                  <ThemeProvider>
                    <App />
                  </ThemeProvider>
                </I18nextProvider>
              </WebSocketProvider>
            </ToastProvider>
          </AuthProvider>
        </UIProvider>
      </BrowserRouter>
    </QueryProvider>
  </React.StrictMode>
);
