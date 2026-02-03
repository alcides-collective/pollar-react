import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Event } from '../../types/events';

const PLACEHOLDER_IMAGE = '/opengraph-image.jpg';

interface EventImageProps {
  event: Event;
  className?: string;
  style?: React.CSSProperties;
  hoverScale?: number;
  grainOpacity?: number;
}

export function EventImage({ event, className, style, hoverScale = 1.02, grainOpacity = 0.25 }: EventImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  // Stabilna lista URLi - tylko niepuste stringi
  const imageUrls = useMemo(() => {
    const urls: string[] = [];
    if (event.imageUrl && event.imageUrl.trim()) {
      urls.push(event.imageUrl);
    }
    event.articles?.forEach(article => {
      if (article.imageUrl && article.imageUrl.trim()) {
        urls.push(article.imageUrl);
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
    }
  };

  // Użyj placeholdera gdy brak obrazków lub wszystkie zawiodły
  const currentImageUrl = allFailed || imageUrls.length === 0
    ? PLACEHOLDER_IMAGE
    : imageUrls[currentIndex];

  return (
    <motion.div
      className={`relative overflow-hidden ${className || ''}`}
      style={style}
      whileHover={{ scale: hoverScale }}
      transition={{ duration: 0.4 }}
    >
      <img
        key={`${event.id}-${currentIndex}-${allFailed}`}
        src={currentImageUrl}
        alt=""
        className="w-full h-full object-cover"
        onError={allFailed ? undefined : handleError}
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
