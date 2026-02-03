import { useId } from 'react';
import { useImageInSection } from '../../hooks/useSectionImages';

interface GrainImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  grainOpacity?: number;
  /** @deprecated Use groupHover instead for parent-based hover */
  hoverScale?: boolean;
  /** Enable scale on parent group hover (requires parent with 'group' class) */
  groupHover?: boolean;
  /** Enable shadow on hover (defaults to true when groupHover is enabled) */
  hoverShadow?: boolean;
}

export function GrainImage({
  src,
  alt = '',
  className,
  style,
  grainOpacity = 0.25,
  hoverScale = false,
  groupHover = false,
  hoverShadow,
}: GrainImageProps) {
  // Section image tracking
  const uniqueId = useId();
  const imageId = `grain-${src}-${uniqueId}`;
  const { priority, onLoad, onError } = useImageInSection(imageId);

  // groupHover uses parent's group class, hoverScale (legacy) creates own group
  const useParentGroup = groupHover || hoverScale;
  const showShadow = hoverShadow ?? useParentGroup;

  const hoverClasses = useParentGroup
    ? `transition-all duration-500 ease-out group-hover:scale-[1.02]${showShadow ? ' group-hover:shadow-xl' : ''}`
    : '';

  return (
    <div className={`relative overflow-hidden ${className} ${hoverClasses}`} style={style}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading={priority === 'high' ? 'eager' : 'lazy'}
        onLoad={onLoad}
        onError={onError}
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
    </div>
  );
}
