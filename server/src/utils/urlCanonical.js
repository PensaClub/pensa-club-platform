// server/src/utils/urlCanonical.js
//
// Canonicalize external URLs before hashing for the bot crawler dedupe
// table. Goal: same logical article -> same hash regardless of tracking
// params, www prefix, http vs https, trailing slash, or fragment.

const crypto = require('crypto');

const TRACKING_PARAM_RE = /^(utm_.*|fbclid|gclid|mc_cid|mc_eid|igshid|yclid|msclkid|_ga|_gl)$/i;

const isIpHostname = (host) => /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':');

const canonicalize = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    let parsed;
    try {
        parsed = new URL(rawUrl.trim());
    } catch (_) {
        return rawUrl.trim();
    }

    parsed.hostname = parsed.hostname.toLowerCase();
    if (parsed.hostname.startsWith('www.')) {
        parsed.hostname = parsed.hostname.slice(4);
    }

    // Force https unless we're talking to a .local hostname or a literal IP
    // — both of which often serve plain http only.
    if (parsed.protocol === 'http:'
        && !parsed.hostname.endsWith('.local')
        && !isIpHostname(parsed.hostname)) {
        parsed.protocol = 'https:';
    }

    if (parsed.searchParams) {
        const toDelete = [];
        for (const key of parsed.searchParams.keys()) {
            if (TRACKING_PARAM_RE.test(key)) toDelete.push(key);
        }
        toDelete.forEach((k) => parsed.searchParams.delete(k));
    }

    parsed.hash = '';

    let result = parsed.toString();
    // Normalize a trailing slash on the path itself (but not on root "/").
    // URL.toString() preserves whatever was supplied.
    result = result.replace(/\/(\?|$)/, (_m, tail) => (tail || ''));
    if (result.endsWith('/') && parsed.pathname !== '/') {
        result = result.slice(0, -1);
    }
    return result;
};

const urlHash = (rawUrl) => {
    return crypto.createHash('sha256').update(rawUrl).digest('hex');
};

module.exports = { canonicalize, urlHash };
