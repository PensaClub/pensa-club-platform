// server/src/utils/newsletterClickTracking.js
//
// Wraps outbound links in newsletter HTML with a tracking redirect that
// logs a 'clicked' row in newsletter_logs before 302-ing to the original URL.
//
// Skipped for:
//   - unsubscribe / preferences links (so they work even after unsubscribe)
//   - the tracking pixel (/newsletter/track/:id/:sub)
//   - non-http(s) schemes (mailto:, tel:, etc.)
//   - already-wrapped click URLs (idempotent)

const BASE_URL = process.env.PUBLIC_BASE_URL || 'https://pensa.club';
// Prod NPM only proxies `/api/*` to the backend, so click/track endpoints
// must be hit through the API base. Dev override: PUBLIC_API_BASE_URL.
const API_BASE_URL =
    process.env.PUBLIC_API_BASE_URL || `${BASE_URL.replace(/\/$/, '')}/api`;

const SKIP_PATH_PREFIXES = [
    `${BASE_URL}/subscribe/unsubscribe/`,
    `${BASE_URL}/subscribe/preferences/`,
    `${API_BASE_URL}/newsletter/track/`,
    `${API_BASE_URL}/newsletter/click/`,
    // Legacy paths (without /api) — defensive skip if older emails are reopened.
    `${BASE_URL}/newsletter/track/`,
    `${BASE_URL}/newsletter/click/`,
];

const shouldSkip = (href) => {
    if (!href) return true;
    const lower = href.toLowerCase();
    if (!lower.startsWith('http://') && !lower.startsWith('https://')) return true;
    return SKIP_PATH_PREFIXES.some((p) => href.startsWith(p));
};

const HREF_RE = /href\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

/**
 * Turns relative href values (`/academy/...`, `articles/foo`) into absolute
 * URLs against PUBLIC_BASE_URL. Email clients have no document base, so
 * relative hrefs become broken `http:///...` URLs.
 *
 * Already-absolute URLs (http(s)://, //protocol-relative, mailto:, tel:,
 * #anchor) are returned unchanged.
 */
const absolutizeHref = (href) => {
    if (!href) return href;
    const trimmed = String(href).trim();
    if (!trimmed) return href;
    if (/^(https?:)?\/\//i.test(trimmed)) return href; // http://, https://, //x.com
    if (/^[a-z][a-z0-9+.\-]*:/i.test(trimmed)) return href; // mailto:, tel:, sms:, ...
    if (trimmed.startsWith('#')) return href;
    const baseClean = BASE_URL.replace(/\/$/, '');
    const pathClean = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${baseClean}${pathClean}`;
};

const absolutizeBodyLinks = (html) => {
    if (!html) return '';
    return String(html).replace(HREF_RE, (match, dq, sq) => {
        const href = dq != null ? dq : sq;
        const abs = absolutizeHref(href);
        if (abs === href) return match;
        return `href="${abs}"`;
    });
};

/**
 * Wraps all <a href=""> links in the given HTML with a tracking redirect.
 * @param {string} html
 * @param {number|string} newsletterId
 * @param {number|string} subscriberId
 * @returns {string}
 */
const wrapLinksWithTracking = (html, newsletterId, subscriberId) => {
    if (!html) return '';
    if (!newsletterId || !subscriberId) return String(html);

    return String(html).replace(HREF_RE, (match, dq, sq) => {
        const href = dq != null ? dq : sq;
        if (shouldSkip(href)) return match;
        const encoded = encodeURIComponent(href);
        const newHref = `${API_BASE_URL}/newsletter/click/${newsletterId}/${subscriberId}?to=${encoded}`;
        return `href="${newHref}"`;
    });
};

module.exports = { wrapLinksWithTracking, absolutizeBodyLinks };
