import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './i18n'
import './index.css'
import App from './App.tsx'

// Initialize Sentry (production only)
if (import.meta.env.PROD) {
  // Expose Sentry globally for console testing
  (window as unknown as { Sentry: typeof Sentry }).Sentry = Sentry

  Sentry.init({
    dsn: 'https://a7ca3a055e9be14f09c3a89e0799f68c@o4510829772603392.ingest.de.sentry.io/4510829773652048',
    environment: 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      Sentry.captureConsoleIntegration({
        levels: ['error'],
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.0,
    replaysOnErrorSampleRate: 1.0,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Network request failed',
      'Load failed',
      'ChunkLoadError',
      // Firebase IndexedDB issues on iOS Safari
      "Failed to execute 'transaction' on 'IDBDatabase'",
      'The database connection is closing',
      // Stale cache after deployment - user has old chunks
      "is not a valid JavaScript MIME type",
    ],
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
