import { API_BASE } from '../config/api';

const MAX_FALLBACK_URLS = 6;

/** Check if a URL should be proxied (external, not already proxied/cached) */
function isProxiableUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  if (url.startsWith('/')) return false;
  if (url.startsWith('data:')) return false;
  if (url.includes('/api/image?')) return false;
  if (url.includes('storage.googleapis.com')) return false;
  return true;
}

/**
 * Build a proxied image URL that goes through our image optimization endpoint.
 *
 * Features:
 * - Converts to AVIF (with WebP fallback based on Accept header)
 * - Resizes to specified width
 * - Applies grain texture overlay
 * - Caches in Firebase Storage for 7 days
 *
 * @param originalUrl - The original external image URL
 * @param width - Target width (default: 800, max: 1200)
 * @param grain - Whether to apply grain overlay (default: true)
 * @returns Proxied image URL or original URL for local images
 */
export function getProxiedImageUrl(
  originalUrl: string | undefined | null,
  width: number = 800,
  grain: boolean = true
): string {
  if (!originalUrl) return '';
  if (!isProxiableUrl(originalUrl)) return originalUrl;

  const params = new URLSearchParams({
    url: originalUrl,
    w: Math.min(Math.max(width, 100), 1200).toString(),
    grain: grain ? '1' : '0',
  });

  return `${API_BASE}/image?${params}`;
}

/**
 * Build a proxied image URL with fallback URLs baked in.
 * The backend tries each URL in order and returns the first that works.
 *
 * @param primaryUrl - The primary image URL to try first
 * @param fallbackUrls - Additional URLs to try if the primary fails
 * @param width - Target width (default: 800, max: 1200)
 * @param grain - Whether to apply grain overlay (default: true)
 * @returns Proxied image URL with multiple url params, or empty string
 */
export function getProxiedImageUrlWithFallbacks(
  primaryUrl: string | undefined | null,
  fallbackUrls: (string | undefined | null)[],
  width: number = 800,
  grain: boolean = true
): string {
  const candidates: string[] = [];

  if (primaryUrl && isProxiableUrl(primaryUrl)) {
    candidates.push(primaryUrl);
  }

  for (const url of fallbackUrls) {
    if (url && isProxiableUrl(url) && !candidates.includes(url)) {
      candidates.push(url);
      if (candidates.length >= MAX_FALLBACK_URLS) break;
    }
  }

  if (candidates.length === 0) {
    // No proxiable candidates — return the first valid direct URL (e.g. Firebase Storage,
    // already-proxied, or local paths) instead of dropping it and showing the placeholder.
    const allUrls = [primaryUrl, ...fallbackUrls];
    for (const url of allUrls) {
      if (url && url.trim()) return url.trim();
    }
    return '';
  }

  const params = new URLSearchParams();
  for (const url of candidates) {
    params.append('url', url);
  }
  params.set('w', Math.min(Math.max(width, 100), 1200).toString());
  params.set('grain', grain ? '1' : '0');

  return `${API_BASE}/image?${params}`;
}

/**
 * Standard image widths for different contexts
 */
export const IMAGE_WIDTHS = {
  /** Thumbnail size for carousels, small cards */
  thumbnail: 200,
  /** Medium size for event cards */
  medium: 600,
  /** Large size for hero sections, detail pages */
  large: 1200,
} as const;

/**
 * Get proxied URL with preset width
 */
export function getProxiedThumbnail(url: string | undefined | null, grain = true): string {
  return getProxiedImageUrl(url, IMAGE_WIDTHS.thumbnail, grain);
}

export function getProxiedMedium(url: string | undefined | null, grain = true): string {
  return getProxiedImageUrl(url, IMAGE_WIDTHS.medium, grain);
}

export function getProxiedLarge(url: string | undefined | null, grain = true): string {
  return getProxiedImageUrl(url, IMAGE_WIDTHS.large, grain);
}
