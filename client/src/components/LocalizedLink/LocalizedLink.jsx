import { Link, NavLink, useResolvedPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { localePath, stripLangFromPath } from '../../utils/languageUtils';

// Converts any link target (absolute OR relative) into a language-prefixed
// absolute path.
//
// The tricky case: relative targets like `to="users-admin"` used inside a
// nested route (e.g. Profile admin sidebar). React Router natively resolves
// these against the PARENT ROUTE, not the current URL — so we lean on
// `useResolvedPath` to get the same absolute path RR would have used, then
// strip any leftover language prefix and re-apply the current language.
//
// Without this, relative links worked by accident on BG (React Router's own
// resolver is fine) but broke on EN/DE because the old code blindly prepended
// `/en` to a relative string — producing nonsense like `/enusers-admin`.
function useLocalizedTo(to) {
  const { i18n } = useTranslation();

  // Always call the hook — React rules. We only use the result when `to` is
  // a string; objects are passed through unchanged.
  const resolved = useResolvedPath(typeof to === 'string' ? to : '.');

  if (typeof to !== 'string') return to;

  // Absolute path — just localize directly.
  if (to.startsWith('/')) {
    return localePath(to, i18n.language);
  }

  // Relative path — useResolvedPath already gave us the absolute URL,
  // including any `/en` or `/de` prefix from the current location. Strip
  // that and re-apply the CURRENT language so a language switch still works.
  const absolute = stripLangFromPath(resolved.pathname);
  return localePath(absolute, i18n.language);
}

export const LocalizedLink = ({ to, ...props }) => {
  const localizedTo = useLocalizedTo(to);
  return <Link to={localizedTo} {...props} />;
};

export const LocalizedNavLink = ({ to, ...props }) => {
  const localizedTo = useLocalizedTo(to);
  return <NavLink to={localizedTo} {...props} />;
};
