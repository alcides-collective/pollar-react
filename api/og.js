import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

// Logo embedded as base64 data URI
const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAArAAAAFNAQAAAADQ22FBAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAACYktHRAAB3YoTpAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+oCAhQcH9uSUqsAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjYtMDItMDJUMDk6Mzg6NTcrMDA6MDANngMXAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDI1LTEyLTIwVDIzOjI0OjU4KzAwOjAwhYt1JQAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyNi0wMi0wMlQyMDoyODozMSswMDowMCkct0wAAAEPSURBVHja7drNbQIxFIVRIwpIyZ7SKCWFROMIJfwNgyPMPCQ759sh4bO7bwMpbdG+pF3ZRMJisVispC0rzVVHjMVisdj3sJICa9/tzYaxWCwW+wcrKbS+DgIWi8X2y0rSudfuy4TFYrHjsZJOBQ0Mi8VisZKGqO0cYLFYLPZZVlKf/W58dz/7+Xwu5v3iHnwcHxywWCwW+wQr6dRlUinl5c6C2ZtlHy6fZywWix2QldRjeeUA5PpNiGSvn01YLBY7EttaECuNVikr0z2WH493imYf7heLxWL7ZV8riJWGamW2wWy+m+X6TH9uxRcWi8UOwlbqi5X+W9e/YL+JXfyh77Py7eVjLBaL7Zet1c5+A/P5gLmuqDd9AAAAAElFTkSuQmCC';

// Type labels
const typeLabels = {
  event: 'WYDARZENIE',
  brief: 'DAILY BRIEF',
  felieton: 'FELIETON',
  default: '',
};

export default async function handler(request) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'Pollar News';
    const type = searchParams.get('type') || 'default';
    const typeLabel = typeLabels[type] || '';

    // Calculate font size based on title length
    const fontSize = title.length > 100 ? 40 : title.length > 80 ? 48 : title.length > 50 ? 56 : 64;

    // Build the HTML structure using React-elements-like objects (not JSX)
    const html = {
      type: 'div',
      props: {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#09090b',
          padding: '60px',
          position: 'relative',
          fontFamily: 'sans-serif',
        },
        children: [
          // Type label
          typeLabel ? {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: 24,
                color: '#a1a1aa',
                marginBottom: '24px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              },
              children: typeLabel,
            },
          } : null,
          // Title
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: fontSize,
                fontWeight: 600,
                color: '#fafafa',
                lineHeight: 1.2,
                maxWidth: '100%',
                flex: 1,
              },
              children: title,
            },
          },
          // Logo in bottom right
          {
            type: 'img',
            props: {
              src: logoDataUri,
              width: 172,
              height: 83,
              style: {
                position: 'absolute',
                bottom: '100px',
                right: '80px',
                opacity: 0.8,
              },
            },
          },
        ].filter(Boolean),
      },
    };

    return new ImageResponse(html, {
      width: 1200,
      height: 630,
    });
  } catch (e) {
    console.error('OG Image generation error:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
