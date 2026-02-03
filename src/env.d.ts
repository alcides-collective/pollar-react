/// <reference types="vite/client" />

// Google Analytics gtag type
type GtagCommand = 'config' | 'event' | 'js' | 'set' | 'consent';

interface Window {
  dataLayer: unknown[];
  gtag: (
    command: GtagCommand,
    targetOrAction: string | Date,
    params?: Record<string, unknown>
  ) => void;
}

/**
 * Type definitions for Vite environment variables
 *
 * All VITE_* environment variables should be declared here
 * for proper TypeScript support and autocompletion.
 */
interface ImportMetaEnv {
  /** Base URL for the Pollar API */
  readonly VITE_API_BASE?: string;

  /** Firebase Configuration */
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;

  /** Vite built-in: current mode (development/production) */
  readonly MODE: string;
  /** Vite built-in: base URL */
  readonly BASE_URL: string;
  /** Vite built-in: is production */
  readonly PROD: boolean;
  /** Vite built-in: is development */
  readonly DEV: boolean;
  /** Vite built-in: is SSR */
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
