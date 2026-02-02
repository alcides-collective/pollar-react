import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Event } from '../../types/events';

interface EventImageProps {
  event: Event;
  className?: string;
  style?: React.CSSProperties;
  hoverScale?: number;
}

export function EventImage({ event, className, style, hoverScale = 1.02 }: EventImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

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
  }, [event.id]);

  const currentImageUrl = imageUrls[currentIndex];

  const handleError = () => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      if (nextIndex < imageUrls.length) {
        return nextIndex;
      }
      return prev;
    });
  };

  // Brak obrazków - nie renderuj
  if (!currentImageUrl) {
    return null;
  }

  return (
    <motion.img
      key={`${event.id}-${currentIndex}`}
      src={currentImageUrl}
      alt=""
      className={className}
      style={style}
      onError={handleError}
      whileHover={{ scale: hoverScale }}
      transition={{ duration: 0.4 }}
    />
  );
}
