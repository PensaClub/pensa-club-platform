const BASE_URL = 'https://pensa.club';
const LANGUAGES = ['bg', 'en', 'de']; // bg = default (no prefix), en = /en, de = /de

/**
 * Build the full URL for a path in a specific language.
 * @param {string} path - Path without language prefix (e.g., '/articles/my-slug')
 * @param {string} lang - 'bg' | 'en' | 'de'
 */
const buildUrl = (path, lang = 'bg') => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (lang === 'bg') return `${BASE_URL}${cleanPath}`;
    return `${BASE_URL}/${lang}${cleanPath}`;
};

/**
 * Format a Date (or ISO string) as YYYY-MM-DD for <lastmod>.
 */
const formatLastmod = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    try {
        return new Date(date).toISOString().split('T')[0];
    } catch {
        return new Date().toISOString().split('T')[0];
    }
};

/**
 * Escape special XML characters in URL strings.
 */
const escapeXml = (str = '') => {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

/**
 * Generate a single <url> entry with hreflang alternates for all 3 languages.
 * @param {string} path - Path without language prefix
 * @param {object} opts - { lastmod, changefreq, priority }
 */
const generateUrlEntry = (path, { lastmod, changefreq = 'weekly', priority = 0.7 } = {}) => {
    const lastmodStr = formatLastmod(lastmod);
    const alternates = LANGUAGES.map(
        (lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(buildUrl(path, lang))}" />`
    ).join('\n');
    const defaultAlternate = `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(buildUrl(path, 'bg'))}" />`;

    // Generate one entry per language variant (Google recommends this for multi-lang)
    return LANGUAGES.map((lang) => `
  <url>
    <loc>${escapeXml(buildUrl(path, lang))}</loc>
    <lastmod>${lastmodStr}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates}
${defaultAlternate}
  </url>`).join('');
};

/**
 * Wrap a list of <url> entries in the sitemap XML envelope.
 */
const wrapSitemap = (entries) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}
</urlset>`;
};

/**
 * Wrap a list of <sitemap> entries in the sitemap index envelope.
 */
const wrapSitemapIndex = (sitemaps) => {
    const entries = sitemaps.map(
        (s) => `
  <sitemap>
    <loc>${escapeXml(`${BASE_URL}${s.loc}`)}</loc>
    <lastmod>${formatLastmod(s.lastmod)}</lastmod>
  </sitemap>`
    ).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}
</sitemapindex>`;
};

// ─── STATIC PAGES SITEMAP ──────────────────────────────────────────────────────
const STATIC_PAGES = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/about', priority: 0.8, changefreq: 'monthly' },
    { path: '/contact', priority: 0.6, changefreq: 'yearly' },
    { path: '/privacy-policy', priority: 0.3, changefreq: 'yearly' },
    { path: '/telk-rkme-rzi', priority: 0.7, changefreq: 'monthly' },
    { path: '/useful-links', priority: 0.7, changefreq: 'weekly' },
    { path: '/games', priority: 0.6, changefreq: 'monthly' },
    // List pages (important hubs)
    { path: '/articles', priority: 0.9, changefreq: 'daily' },
    { path: '/initiatives', priority: 0.9, changefreq: 'daily' },
    { path: '/projects', priority: 0.9, changefreq: 'weekly' },
    { path: '/publications', priority: 0.9, changefreq: 'weekly' },
    { path: '/stories', priority: 0.9, changefreq: 'weekly' },
    { path: '/clubs', priority: 0.8, changefreq: 'weekly' },
    { path: '/fact-check', priority: 0.9, changefreq: 'weekly' },
    { path: '/academy', priority: 0.9, changefreq: 'weekly' },
    { path: '/academy/courses', priority: 0.9, changefreq: 'weekly' },
    { path: '/academy/seminars', priority: 0.9, changefreq: 'weekly' },
    { path: '/academy/mentors', priority: 0.8, changefreq: 'weekly' },
    { path: '/academy/community', priority: 0.8, changefreq: 'daily' },
    // ReAction program
    { path: '/reaction', priority: 0.9, changefreq: 'monthly' },
    { path: '/reaction/book', priority: 0.8, changefreq: 'monthly' },
];

const generateStaticSitemap = () => {
    const entries = STATIC_PAGES.map((p) =>
        generateUrlEntry(p.path, {
            lastmod: new Date(),
            changefreq: p.changefreq,
            priority: p.priority,
        })
    ).join('');
    return wrapSitemap(entries);
};

// ─── DYNAMIC CONTENT SITEMAPS ──────────────────────────────────────────────────

/**
 * Helper to fetch content and generate sitemap.
 * @param {Object} model - Sequelize model
 * @param {Object} where - Where clause for filtering (e.g., { isDraft: false })
 * @param {string} pathPrefix - URL path prefix (e.g., '/articles/')
 * @param {Object} opts - { priority, changefreq }
 */
const generateContentSitemap = async (model, where, pathPrefix, opts = {}) => {
    const { priority = 0.7, changefreq = 'weekly' } = opts;

    const items = await model.findAll({
        where,
        attributes: ['slug', 'updatedAt'],
        order: [['updatedAt', 'DESC']],
    });

    const entries = items
        .filter((item) => item.slug) // Only include items with valid slugs
        .map((item) =>
            generateUrlEntry(`${pathPrefix}${item.slug}`, {
                lastmod: item.updatedAt,
                changefreq,
                priority,
            })
        )
        .join('');

    return wrapSitemap(entries);
};

// ─── SITEMAP INDEX ─────────────────────────────────────────────────────────────
const generateSitemapIndex = () => {
    const now = new Date();
    const sitemaps = [
        { loc: '/sitemap-static.xml', lastmod: now },
        { loc: '/sitemap-articles.xml', lastmod: now },
        { loc: '/sitemap-initiatives.xml', lastmod: now },
        { loc: '/sitemap-projects.xml', lastmod: now },
        { loc: '/sitemap-publications.xml', lastmod: now },
        { loc: '/sitemap-stories.xml', lastmod: now },
        { loc: '/sitemap-clubs.xml', lastmod: now },
        { loc: '/sitemap-academy.xml', lastmod: now },
        { loc: '/sitemap-factcheck.xml', lastmod: now },
        { loc: '/sitemap-forum.xml', lastmod: now },
    ];
    return wrapSitemapIndex(sitemaps);
};

module.exports = {
    BASE_URL,
    buildUrl,
    generateUrlEntry,
    wrapSitemap,
    wrapSitemapIndex,
    generateStaticSitemap,
    generateContentSitemap,
    generateSitemapIndex,
};
