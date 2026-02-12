import { useState, useEffect, useMemo, useId } from 'react';
import { motion } from 'framer-motion';
import type { Event } from '../../types/events';
import { useImageInSection } from '../../hooks/useSectionImages';
import { getProxiedImageUrlWithFallbacks } from '../../utils/imageProxy';

const PLACEHOLDER_IMAGE = '/opengraph-image.jpg';

interface EventImageProps {
  event: Event;
  className?: string;
  style?: React.CSSProperties;
  /** Scale factor on direct hover (uses motion.whileHover). Set to 1 to disable. */
  hoverScale?: number;
  grainOpacity?: number;
  /** Enable scale on parent group hover (requires parent with 'group' class) */
  groupHover?: boolean;
  /** Enable shadow on hover (defaults to true when groupHover is enabled) */
  hoverShadow?: boolean;
  /** Image width for preventing CLS */
  width?: number;
  /** Image height for preventing CLS */
  height?: number;
}

export function EventImage({ event, className, style, hoverScale = 1.02, grainOpacity = 0.25, groupHover = false, hoverShadow, width, height }: EventImageProps) {
  const [failed, setFailed] = useState(false);

  // Section image tracking
  const uniqueId = useId();
  const imageId = `event-${event.id}-${uniqueId}`;
  const { priority, onLoad, onError } = useImageInSection(imageId);

  // Determine proxy width based on prop or default
  const proxyWidth = width || 800;

  // Build single proxy URL with primary + up to 5 fallback URLs
  // Backend tries each in order, returns first working image or 404
  const proxiedImageUrl = useMemo(() => {
    const primaryUrl = event.imageUrl?.trim() || null;
    const fallbackUrls = (event.articles || [])
      .map(a => a.imageUrl?.trim() || null)
      .filter(Boolean) as string[];

    return getProxiedImageUrlWithFallbacks(primaryUrl, fallbackUrls, proxyWidth, true);
  }, [event.imageUrl, event.articles, proxyWidth]);

  // Reset when event changes
  useEffect(() => {
    setFailed(false);
  }, [event.id]);

  const handleError = () => {
    setFailed(true);
    onError();
  };

  // Use placeholder when no images or all failed
  const isUsingPlaceholder = failed || !proxiedImageUrl;
  const currentImageUrl = isUsingPlaceholder
    ? PLACEHOLDER_IMAGE
    : proxiedImageUrl;

  // Only show CSS grain overlay for local images (placeholder)
  // External images have grain baked in by the proxy
  const showGrainOverlay = isUsingPlaceholder;

  // Use CSS group-hover when groupHover is enabled, otherwise use motion.whileHover
  const useGroupHover = groupHover;
  const showShadow = hoverShadow ?? groupHover;
  const groupHoverClass = useGroupHover
    ? `transition-all duration-500 ease-out group-hover:scale-[1.02]${showShadow ? ' group-hover:shadow-xl' : ''}`
    : (showShadow ? 'transition-shadow duration-500 group-hover:shadow-xl' : '');

  return (
    <motion.div
      className={`relative overflow-hidden ${className || ''} ${groupHoverClass}`}
      style={style}
      whileHover={useGroupHover ? undefined : { scale: hoverScale }}
      transition={useGroupHover ? undefined : { duration: 0.4 }}
    >
      <img
        key={`${event.id}-${failed}`}
        src={currentImageUrl}
        alt=""
        className="w-full h-full object-cover"
        loading={priority === 'high' ? 'eager' : 'lazy'}
        fetchPriority={priority === 'high' ? 'high' : undefined}
        onLoad={onLoad}
        onError={isUsingPlaceholder ? undefined : handleError}
        width={width}
        height={height}
      />
      {showGrainOverlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(/grain.webp)',
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
            opacity: grainOpacity,
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </motion.div>
  );
}
