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
}

export function GrainImage({
  src,
  alt = '',
  className,
  style,
  grainOpacity = 0.25,
  hoverScale = false,
  groupHover = false,
}: GrainImageProps) {
  // groupHover uses parent's group class, hoverScale (legacy) creates own group
  const useParentGroup = groupHover || hoverScale;

  return (
    <div className="relative overflow-hidden">
      <img
        src={src}
        alt={alt}
        className={`${className} ${useParentGroup ? 'transition-transform duration-500 ease-out group-hover:scale-[1.02]' : ''}`}
        style={style}
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
