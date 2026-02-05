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
  /** Image width for preventing CLS */
  width?: number;
  /** Image height for preventing CLS */
  height?: number;
  /** Fetch priority for LCP images */
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Override loading strategy */
  loading?: 'eager' | 'lazy';
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
  width,
  height,
  fetchPriority,
  loading: loadingProp,
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
        className="absolute inset-0 w-full h-full object-cover"
        loading={loadingProp ?? (priority === 'high' ? 'eager' : 'lazy')}
        fetchPriority={fetchPriority}
        onLoad={onLoad}
        onError={onError}
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
    </div>
  );
}
