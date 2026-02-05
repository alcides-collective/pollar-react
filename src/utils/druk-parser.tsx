import { LocalizedLink } from '../components/LocalizedLink';

interface TitlePart {
  text: string;
  drukNr?: string;
}

/**
 * Parse title and extract druk references for linking
 * Handles formats like:
 * - (druk nr 2179)
 * - (druki nr 1944, 2009, 2013 i 2014)
 */
export function parseDrukReferences(title: string): TitlePart[] {
  const pattern = /\(?(druk[i]?\s+nr\s+)([\d\w\-\s,i]+)\)?/gi;
  const parts: TitlePart[] = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(title)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({ text: title.slice(lastIndex, match.index) });
    }

    // Parse the druk numbers (can include letters like "2055-A")
    const numbersStr = match[2];
    const numbers = numbersStr
      .split(/[,]\s*|\s+i\s+/)
      .map(n => n.trim())
      .filter(n => /^[\d\w\-]+$/.test(n));

    // Add prefix
    const hasOpenParen = title[match.index] === '(';
    if (hasOpenParen) parts.push({ text: '(' });
    parts.push({ text: match[1] });

    // Add each number as a link
    numbers.forEach((num, i) => {
      if (i > 0) {
        if (numbersStr.includes(',')) {
          parts.push({ text: ', ' });
        } else {
          parts.push({ text: ' i ' });
        }
      }
      parts.push({ text: num, drukNr: num });
    });

    // Check for closing paren
    if (match[0].endsWith(')')) {
      parts.push({ text: ')' });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < title.length) {
    parts.push({ text: title.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ text: title }];
}

/**
 * Render title with druk links
 */
export function TitleWithDrukLinks({
  title,
  className = '',
  linkClassName = 'text-blue-600 hover:underline font-mono'
}: {
  title: string;
  className?: string;
  linkClassName?: string;
}) {
  const parts = parseDrukReferences(title);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.drukNr ? (
          <LocalizedLink
            key={i}
            to={`/sejm/druki/${part.drukNr}`}
            className={linkClassName}
            onClick={(e) => e.stopPropagation()}
          >
            {part.text}
          </LocalizedLink>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  );
}
