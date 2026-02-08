import sharp from 'sharp';
import { FONT_FAMILY, logoBuffer } from '../config.js';
import { escapeXml } from './text.js';
import { CATEGORY_TRANSLATIONS } from '../data/translations.js';

export async function renderOgImage(res, { title = 'Pollar News', type = 'default', description = '', lang = 'pl', category = '' }) {
  const typeLabels = {
    event: { pl: 'WYDARZENIE', en: 'EVENT', de: 'EREIGNIS' },
    brief: { pl: 'DAILY BRIEF', en: 'DAILY BRIEF', de: 'DAILY BRIEF' },
    felieton: { pl: 'FELIETON', en: 'OPINION', de: 'KOLUMNE' },
    default: { pl: '', en: '', de: '' },
  };

  // Use translated category name if available, otherwise fall back to type label
  let typeLabel;
  if (category && CATEGORY_TRANSLATIONS[category]) {
    typeLabel = (CATEGORY_TRANSLATIONS[category][lang] || CATEGORY_TRANSLATIONS[category].pl || category).toUpperCase();
  } else {
    typeLabel = typeLabels[type]?.[lang] || typeLabels[type]?.pl || '';
  }

  // Calculate font size based on title length
  const fontSize = title.length > 100 ? 40 : title.length > 80 ? 48 : title.length > 50 ? 56 : 64;
  const lineHeight = Math.round(fontSize * 1.2);

  // Wrap text into lines
  const maxCharsPerLine = Math.floor(1080 / (fontSize * 0.5));
  const words = title.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Limit to ~6 lines max
  const maxLines = Math.floor(400 / lineHeight);
  const displayLines = lines.slice(0, maxLines);
  if (lines.length > maxLines && displayLines.length > 0) {
    const lastIndex = displayLines.length - 1;
    const lastLine = displayLines[lastIndex];
    if (lastLine) {
      displayLines[lastIndex] = lastLine.slice(0, -3) + '…';
    }
  }

  // Build SVG
  const width = 1200;
  const height = 630;
  const padding = 60;

  const textY = typeLabel ? 180 : 120;
  const textElements = displayLines
    .map((line, i) => {
      const y = textY + i * lineHeight;
      return `<text x="${padding}" y="${y}" font-size="${fontSize}" font-weight="700" fill="#fafafa">${escapeXml(line)}</text>`;
    })
    .join('\n');

  const typeLabelElement = typeLabel
    ? `<text x="${padding}" y="100" font-size="24" font-weight="600" fill="#a1a1aa" letter-spacing="0.1em">${escapeXml(typeLabel)}</text>`
    : '';

  // Description element - gray text below title with gradient fade
  const descriptionY = textY + displayLines.length * lineHeight + 6;
  const descriptionFontSize = 30;
  const descriptionLineHeight = 38;
  const logoRightMargin = 180; // Space for logo on the right
  const descriptionMaxWidth = width - padding - logoRightMargin;
  const descriptionMaxChars = Math.floor(descriptionMaxWidth / (descriptionFontSize * 0.5));

  // Wrap description into lines
  let descriptionLines = [];
  if (description) {
    const descWords = description.split(' ');
    let descCurrentLine = '';
    for (const word of descWords) {
      const testLine = descCurrentLine ? `${descCurrentLine} ${word}` : word;
      if (testLine.length <= descriptionMaxChars) {
        descCurrentLine = testLine;
      } else {
        if (descCurrentLine) descriptionLines.push(descCurrentLine);
        descCurrentLine = word;
      }
    }
    if (descCurrentLine) descriptionLines.push(descCurrentLine);
    // Limit to 4 lines max for description
    descriptionLines = descriptionLines.slice(0, 4);
  }

  // Build description text elements with gradient opacity
  const descriptionElements = descriptionLines
    .map((line, i) => {
      const y = descriptionY + i * descriptionLineHeight;
      // Opacity decreases for each line (1 -> 0.7 -> 0.4 -> 0.2)
      const opacity = Math.max(0.2, 1 - (i * 0.3));
      return `<text x="${padding}" y="${y}" font-size="${descriptionFontSize}" font-weight="400" fill="#a1a1aa" opacity="${opacity}">${escapeXml(line)}</text>`;
    })
    .join('\n');

  // Font style - uses system fonts configured via fontconfig
  const fontStyle = `text { font-family: ${FONT_FAMILY}; }`;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>${fontStyle}</style>
      <rect width="100%" height="100%" fill="#09090b"/>
      ${typeLabelElement}
      ${textElements}
      ${descriptionElements}
    </svg>
  `;

  try {
    // Generate base image from SVG
    let image = sharp(Buffer.from(svg));

    // Composite logo if available
    if (logoBuffer) {
      const logoHeight = 50;
      const logoWidth = Math.round(logoHeight * 2.07); // aspect ratio 688:333
      const resizedLogo = await sharp(logoBuffer)
        .resize(logoWidth, logoHeight)
        .png()
        .toBuffer();

      image = image.composite([{
        input: resizedLogo,
        top: height - 70 - logoHeight,
        left: width - padding - logoWidth,
      }]);
    }

    const pngBuffer = await image.png().toBuffer();

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=172800, s-maxage=604800');
    res.send(pngBuffer);
  } catch (err) {
    console.error('OG image generation failed:', err);
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
