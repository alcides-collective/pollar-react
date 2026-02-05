import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { LocalizedLink } from '../LocalizedLink';

interface AnimatedUnderlineProps {
  children: ReactNode;
  className?: string;
  /** Delay between lines in ms (default: 50ms) */
  staggerDelay?: number;
}

/**
 * Animated underline with staggered per-line effect.
 * Detects text lines and animates each with a slight delay.
 */
export function AnimatedUnderline({
  children,
  className = '',
  staggerDelay = 50,
}: AnimatedUnderlineProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<string[] | null>(null);

  const measureLines = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const text = container.textContent || '';
    if (!text.trim()) return;

    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    // Measure IN-PLACE: temporarily replace content with word spans
    // This ensures we use the exact same styles (font, line-height, width)
    container.textContent = '';
    const wordSpans: HTMLSpanElement[] = [];

    words.forEach((word, i) => {
      if (i > 0) {
        container.appendChild(document.createTextNode(' '));
      }
      const span = document.createElement('span');
      span.textContent = word;
      wordSpans.push(span);
      container.appendChild(span);
    });

    // Force browser to compute layout
    void container.offsetHeight;

    // Measure each word's vertical position to detect line breaks
    const lineGroups: string[][] = [[]];
    let lastTop: number | null = null;

    wordSpans.forEach((span, i) => {
      const rect = span.getBoundingClientRect();
      if (lastTop === null) {
        lastTop = rect.top;
      } else if (rect.top > lastTop + 2) {
        // New line detected (2px tolerance for subpixel rendering)
        lineGroups.push([]);
        lastTop = rect.top;
      }
      lineGroups[lineGroups.length - 1].push(words[i]);
    });

    // Set lines - this triggers re-render with proper line spans
    setLines(lineGroups.map(group => group.join(' ')));
  }, []);

  // Reset lines when children change
  useEffect(() => {
    setLines(null);
  }, [children]);

  // Measure when lines is null (initial or after reset)
  useEffect(() => {
    if (lines === null) {
      // Use requestAnimationFrame to ensure DOM is fully laid out
      const raf = requestAnimationFrame(() => {
        measureLines();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [lines, measureLines]);

  // Re-measure on window resize
  useEffect(() => {
    const handleResize = () => {
      setLines(null); // Reset to trigger re-measurement
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render measurement span (invisible flash, then lines)
  if (lines === null) {
    return (
      <span ref={containerRef} className={`animated-underline ${className}`}>
        {children}
      </span>
    );
  }

  // Render lines with stagger
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span
          key={`${i}-${line.slice(0, 10)}`}
          className="animated-underline-line"
          style={{
            '--line-delay': `${i * staggerDelay}ms`,
          } as React.CSSProperties}
        >
          {line}
          {i < lines.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
}

interface AnimatedLinkProps extends AnimatedUnderlineProps {
  to: string;
  linkClassName?: string;
}

/**
 * Link with animated shimmer gradient underline.
 */
export function AnimatedLink({
  children,
  to,
  className = '',
  linkClassName = '',
  staggerDelay = 50,
}: AnimatedLinkProps) {
  return (
    <LocalizedLink
      to={to}
      className={`group/underline inline-block ${linkClassName}`}
    >
      <AnimatedUnderline className={className} staggerDelay={staggerDelay}>
        {children}
      </AnimatedUnderline>
    </LocalizedLink>
  );
}

interface AnimatedHeadlineProps extends AnimatedUnderlineProps {
  to: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Headline component with animated shimmer gradient underline.
 * Works with multiline text - each line animates with a stagger delay.
 */
export function AnimatedHeadline({
  children,
  to,
  as: Tag = 'h2',
  className = '',
  staggerDelay = 50,
}: AnimatedHeadlineProps) {
  return (
    <LocalizedLink to={to} className="group/underline block">
      <Tag className={`cursor-pointer ${className}`}>
        <AnimatedUnderline staggerDelay={staggerDelay}>
          {children}
        </AnimatedUnderline>
      </Tag>
    </LocalizedLink>
  );
}
