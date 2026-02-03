interface GrainImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  grainOpacity?: number;
  hoverScale?: boolean;
}

export function GrainImage({
  src,
  alt = '',
  className,
  style,
  grainOpacity = 0.25,
  hoverScale = false,
}: GrainImageProps) {
  return (
    <div className={`relative overflow-hidden ${hoverScale ? 'group' : ''}`}>
      <img
        src={src}
        alt={alt}
        className={`${className} ${hoverScale ? 'transition-transform duration-500 ease-out group-hover:scale-[1.02]' : ''}`}
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
