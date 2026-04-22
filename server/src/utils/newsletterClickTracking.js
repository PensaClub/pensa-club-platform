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

const SKIP_PATH_PREFIXES = [
    `${BASE_URL}/subscribe/unsubscribe/`,
    `${BASE_URL}/subscribe/preferences/`,
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
        const newHref = `${BASE_URL}/newsletter/click/${newsletterId}/${subscriberId}?to=${encoded}`;
        return `href="${newHref}"`;
    });
};

module.exports = { wrapLinksWithTracking };
