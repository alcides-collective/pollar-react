import { API_BASE } from '../config/api';

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
  // Return empty string for falsy values
  if (!originalUrl) {
    return '';
  }

  // Don't proxy local images (starting with /)
  if (originalUrl.startsWith('/')) {
    return originalUrl;
  }

  // Don't proxy data URLs
  if (originalUrl.startsWith('data:')) {
    return originalUrl;
  }

  // Don't proxy already proxied URLs
  if (originalUrl.includes('/api/image?')) {
    return originalUrl;
  }

  // Don't proxy Firebase Storage URLs (already optimized)
  if (originalUrl.includes('storage.googleapis.com')) {
    return originalUrl;
  }

  // Build proxy URL
  const params = new URLSearchParams({
    url: originalUrl,
    w: Math.min(Math.max(width, 100), 1200).toString(),
    grain: grain ? '1' : '0',
  });

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
