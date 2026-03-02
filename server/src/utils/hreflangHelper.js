const BASE_URL = 'https://pensa.club';

/**
 * Generates hreflang link tags for all supported languages
 * @param {string} path - The page path without language prefix (e.g., '/articles/my-article')
 * @returns {string} - HTML hreflang link tags
 */
function generateHreflangTags(path) {
  return `
  <link rel="alternate" hreflang="bg" href="${BASE_URL}${path}" />
  <link rel="alternate" hreflang="en" href="${BASE_URL}/en${path}" />
  <link rel="alternate" hreflang="de" href="${BASE_URL}/de${path}" />
  <link rel="alternate" hreflang="x-default" href="${BASE_URL}${path}" />`;
}

module.exports = { generateHreflangTags };
