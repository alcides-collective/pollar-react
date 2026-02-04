import { useState, useEffect, useMemo, useId } from 'react';
import { motion } from 'framer-motion';
import type { Event } from '../../types/events';
import { useImageInSection } from '../../hooks/useSectionImages';
import { getProxiedImageUrl } from '../../utils/imageProxy';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  // Section image tracking
  const uniqueId = useId();
  const imageId = `event-${event.id}-${uniqueId}`;
  const { priority, onLoad, onError } = useImageInSection(imageId);

  // Determine proxy width based on prop or default
  const proxyWidth = width || 800;

  // Build list of proxied URLs - external images go through /api/image
  // The proxy returns 302 redirect to Firebase Storage URL
  const imageUrls = useMemo(() => {
    const urls: string[] = [];
    if (event.imageUrl && event.imageUrl.trim()) {
      urls.push(getProxiedImageUrl(event.imageUrl, proxyWidth, true));
    }
    event.articles?.forEach(article => {
      if (article.imageUrl && article.imageUrl.trim()) {
        urls.push(getProxiedImageUrl(article.imageUrl, proxyWidth, true));
      }
    });
    return urls;
  }, [event.imageUrl, event.articles, proxyWidth]);

  // Reset when event changes
  useEffect(() => {
    setCurrentIndex(0);
    setAllFailed(false);
  }, [event.id]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    console.warn('[EventImage] Failed to load', {
      eventId: event.id,
      failedSrc: img.src,
      currentIndex,
      totalUrls: imageUrls.length,
    });
    const nextIndex = currentIndex + 1;
    if (nextIndex < imageUrls.length) {
      setCurrentIndex(nextIndex);
    } else {
      setAllFailed(true);
      onError();
    }
  };

  const handleLoad = () => {
    onLoad();
  };

  // Use placeholder when no images or all failed
  const isUsingPlaceholder = allFailed || imageUrls.length === 0;
  const currentImageUrl = isUsingPlaceholder
    ? PLACEHOLDER_IMAGE
    : imageUrls[currentIndex];

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
        key={`${event.id}-${currentIndex}-${allFailed}`}
        src={currentImageUrl}
        alt=""
        className="w-full h-full object-cover"
        loading={priority === 'high' ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={allFailed ? undefined : handleError}
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
