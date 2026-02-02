import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

// Logo as base64 - will be loaded at build time
const logoUrl = 'https://pollar.news/logo-white.png';

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
            bottom: '60px',
            right: '60px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
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
