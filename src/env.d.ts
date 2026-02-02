/// <reference types="vite/client" />

/**
 * Type definitions for Vite environment variables
 *
 * All VITE_* environment variables should be declared here
 * for proper TypeScript support and autocompletion.
 */
interface ImportMetaEnv {
  /** Base URL for the Pollar API */
  readonly VITE_API_BASE?: string;

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
