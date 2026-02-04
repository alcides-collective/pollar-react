import { useState, useEffect, useMemo, useId } from 'react';
import { motion } from 'framer-motion';
import type { Event } from '../../types/events';
import { useImageInSection } from '../../hooks/useSectionImages';

const PLACEHOLDER_IMAGE = '/opengraph-image.jpg';

// Force HTTPS for external images to avoid mixed content warnings
function enforceHttps(url: string): string {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  return url;
}

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

  // Stabilna lista URLi - tylko niepuste stringi, wymuszamy HTTPS
  const imageUrls = useMemo(() => {
    const urls: string[] = [];
    if (event.imageUrl && event.imageUrl.trim()) {
      urls.push(enforceHttps(event.imageUrl));
    }
    event.articles?.forEach(article => {
      if (article.imageUrl && article.imageUrl.trim()) {
        urls.push(enforceHttps(article.imageUrl));
      }
    });
    return urls;
  }, [event.imageUrl, event.articles]);

  // Reset indeksu gdy event się zmienia
  useEffect(() => {
    setCurrentIndex(0);
    setAllFailed(false);
  }, [event.id]);

  const handleError = () => {
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

  // Użyj placeholdera gdy brak obrazków lub wszystkie zawiodły
  const currentImageUrl = allFailed || imageUrls.length === 0
    ? PLACEHOLDER_IMAGE
    : imageUrls[currentIndex];

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
    </motion.div>
  );
}
