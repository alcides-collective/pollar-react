/**
 * Centralized API configuration
 *
 * All API-related configuration should be imported from this file.
 * This provides a single source of truth for API URLs and settings.
 */

/**
 * Base URL for the Pollar API
 * - Uses VITE_API_BASE environment variable if set
 * - Falls back to Railway production URL
 */
export const API_BASE = import.meta.env.VITE_API_BASE || 'https://pollar.up.railway.app/api';

/**
 * Base URL for the Sejm API (Polish Parliament)
 * Direct access - they support CORS
 */
export const SEJM_API_BASE = 'https://api.sejm.gov.pl/sejm/term10';

/**
 * API configuration object
 */
export const apiConfig = {
  /** Base URL for all API requests */
  baseUrl: API_BASE,
  /** Sejm API base URL */
  sejmBaseUrl: SEJM_API_BASE,
  /** Default request timeout in milliseconds */
  timeout: 30000,
  /** Cache TTL in milliseconds (5 minutes) */
  cacheTTL: 5 * 60 * 1000,
} as const;

/**
 * Build a full API URL from an endpoint path
 * @param endpoint - The API endpoint (e.g., '/events', '/brief')
 * @returns Full URL string
 */
export function buildApiUrl(endpoint: string): string {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${normalizedEndpoint}`;
}

/**
 * Build a full Sejm API URL from an endpoint path
 * @param endpoint - The Sejm API endpoint (e.g., 'clubs', 'MPs')
 * @returns Full URL string
 */
export function buildSejmApiUrl(endpoint: string): string {
  // Remove leading slash if present
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${SEJM_API_BASE}/${normalizedEndpoint}`;
}
