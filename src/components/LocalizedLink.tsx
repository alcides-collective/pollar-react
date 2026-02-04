import { Link, NavLink } from 'react-router-dom';
import type { LinkProps, NavLinkProps } from 'react-router-dom';
import { useLanguage } from '../stores/languageStore';

/**
 * A Link component that automatically adds the language prefix to the path.
 * Polish (default) has no prefix, English uses /en/, German uses /de/.
 */
export function LocalizedLink({ to, ...props }: LinkProps) {
  const language = useLanguage();
  const prefix = language !== 'pl' ? `/${language}` : '';
  const localizedTo = typeof to === 'string' ? prefix + to : to;

  return <Link to={localizedTo} {...props} />;
}

/**
 * A NavLink component that automatically adds the language prefix to the path.
 * Useful for navigation menus where you need active state styling.
 */
export function LocalizedNavLink({ to, ...props }: NavLinkProps) {
  const language = useLanguage();
  const prefix = language !== 'pl' ? `/${language}` : '';
  const localizedTo = typeof to === 'string' ? prefix + to : to;

  return <NavLink to={localizedTo} {...props} />;
}
