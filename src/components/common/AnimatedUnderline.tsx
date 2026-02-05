import { type ReactNode } from 'react';
import { LocalizedLink } from '../LocalizedLink';

interface AnimatedUnderlineProps {
  children: ReactNode;
  className?: string;
}

/**
 * Standalone animated text with shimmer gradient underline.
 * - Text has subtle diagonal shimmer gradient (always visible)
 * - Underline appears on hover with the same gradient
 */
export function AnimatedUnderline({
  children,
  className = '',
}: AnimatedUnderlineProps) {
  return (
    <span className={`animated-underline ${className}`}>
      {children}
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
}: AnimatedLinkProps) {
  return (
    <LocalizedLink
      to={to}
      className={`group/underline inline-block ${linkClassName}`}
    >
      <span className={`animated-underline ${className}`}>
        {children}
      </span>
    </LocalizedLink>
  );
}

interface AnimatedHeadlineProps extends AnimatedUnderlineProps {
  to: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Headline component with animated shimmer gradient underline.
 * Works with multiline text.
 */
export function AnimatedHeadline({
  children,
  to,
  as: Tag = 'h2',
  className = '',
}: AnimatedHeadlineProps) {
  return (
    <LocalizedLink to={to} className="group/underline block">
      <Tag className={`cursor-pointer ${className}`}>
        <span className="animated-underline">
          {children}
        </span>
      </Tag>
    </LocalizedLink>
  );
}
