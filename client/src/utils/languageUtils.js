export const SUPPORTED_LANGS = ['bg', 'en', 'de'];
export const DEFAULT_LANG = 'bg';

// Adds language prefix to path
// localePath('/articles', 'en') → '/en/articles'
// localePath('/articles', 'bg') → '/articles'
export function localePath(path, lang) {
  if (!lang || lang === DEFAULT_LANG) return path;
  return `/${lang}${path}`;
}

// Extracts language from pathname
// '/en/articles' → 'en'
// '/articles' → 'bg'
export function getLangFromPath(pathname) {
  const match = pathname.match(/^\/(en|de)(\/|$)/);
  return match ? match[1] : DEFAULT_LANG;
}

// Strips language prefix from pathname
// '/en/articles' → '/articles'
// '/articles' → '/articles'
export function stripLangFromPath(pathname) {
  return pathname.replace(/^\/(en|de)(\/|$)/, '/$2') || '/';
}
