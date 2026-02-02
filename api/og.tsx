import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

// Logo embedded as base64 data URI
const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArAAAAFNAQAAAADQ22FBAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAAB3YoTpAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+oCAhQcH9uSUqsAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjYtMDItMDJUMDk6Mzg6NTcrMDA6MDANngMXAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDI1LTEyLTIwVDIzOjI0OjU4KzAwOjAwhYt1JQAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyNi0wMi0wMlQyMDoyODozMSswMDowMCkct0wAAAEPSURBVHja7drNbQIxFIVRIwpIyZ7SKCWFROMIJfwNgyPMPCQ759sh4bO7bwMpbdG+pF3ZRMJisVispC0rzVVHjMVisdj3sJICa9/tzYaxWCwW+wcrKbS+DgIWi8X2y0rSudfuy4TFYrHjsZJOBQ0Mi8VisZKGqO0cYLFYLPZZVlKf/W58dz/7+Xwu5v3iHnwcHxywWCwW+wQr6dRlUinl5c6C2ZtlHy6fZywWix2QldRjeeUA5PpNiGSvn01YLBY7EttaECuNVikr0z2WH493imYf7heLxWL7ZV8riJWGamW2wWy+m+X6TH9uxRcWi8UOwlbqi5X+W9e/YL+JXfyh77Py7eVjLBaL7Zet1c5+A/P5gLmuqDd9AAAAAElFTkSuQmCC';

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get('title') || 'Pollar News';
  const type = searchParams.get('type') || 'default'; // event, brief, felieton

  // Type labels
  const typeLabels: Record<string, string> = {
    event: 'Wydarzenie',
    brief: 'Daily Brief',
    felieton: 'Felieton',
    default: '',
  };
  const typeLabel = typeLabels[type] || '';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#09090b',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Type label */}
        {typeLabel && (
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#a1a1aa',
              marginBottom: '24px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {typeLabel}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 80 ? 48 : title.length > 50 ? 56 : 64,
            fontWeight: 600,
            color: '#fafafa',
            lineHeight: 1.2,
            maxWidth: '100%',
            wordWrap: 'break-word',
            flex: 1,
          }}
        >
          {title}
        </div>

        {/* Logo in bottom right */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: '100px',
            right: '80px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoDataUri}
            alt=""
            width={172}
            height={83}
            style={{
              opacity: 0.8,
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
