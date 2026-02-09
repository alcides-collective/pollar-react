const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;
const STORAGE_KEY = 'pollar_utm';

/**
 * Parse UTM parameters from URL and cache in sessionStorage.
 * Call once at app startup (AppContent), before auth initialization.
 */
export function captureUtmParams(): void {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) utm[key] = val;
  }
  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  }
}

/**
 * Get cached UTM params. Falls back to 'direct' if none captured.
 */
export function getStoredUtm(): { source: string; medium: string; campaign: string } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { source: 'direct', medium: '', campaign: '' };
    const parsed = JSON.parse(raw);
    return {
      source: parsed.utm_source || 'direct',
      medium: parsed.utm_medium || '',
      campaign: parsed.utm_campaign || '',
    };
  } catch {
    return { source: 'direct', medium: '', campaign: '' };
  }
}
