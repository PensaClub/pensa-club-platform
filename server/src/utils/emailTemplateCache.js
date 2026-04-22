// server/src/utils/emailTemplateCache.js
//
// In-memory cache for the global email template (header/footer/logo/colors/
// signature). Loaded lazily and refreshed every CACHE_TTL_MS. Admin PUTs
// call `invalidateTemplate()` to force a fresh read on the next render.

const { DEFAULTS, DEFAULT_KEY } = require('../controllers/emailTemplateController');

const CACHE_TTL_MS = 2 * 60 * 1000; // 2 min

let cache = null;
let cachedAt = 0;

/**
 * Returns the merged template (DB overrides > hardcoded defaults). Always
 * synchronous + always returns a usable object. Kicks off an async refresh
 * if the cache is stale so the NEXT call sees fresh data.
 */
const getTemplate = () => {
    const now = Date.now();
    if (!cache) {
        // First call: return defaults + schedule a load so next calls hit cache
        triggerLoad();
        return { ...DEFAULTS };
    }
    if (now - cachedAt > CACHE_TTL_MS) {
        triggerLoad();
    }
    return cache;
};

const triggerLoad = () => {
    // Fire-and-forget so synchronous callers never block
    loadTemplate().catch((err) => {
        console.error('[emailTemplateCache] load error:', err?.message || err);
    });
};

/**
 * Async refresh. Safe to call manually (e.g. on boot, or from admin PUT).
 */
const loadTemplate = async () => {
    try {
        const { email_template } = require('../sequelize/models');
        const row = await email_template.findOne({
            where: { templateKey: DEFAULT_KEY },
        });
        const data = row ? row.toJSON() : {};
        cache = {
            ...DEFAULTS,
            // Only override defaults when DB has a non-empty value
            ...(data.logoUrl ? { logoUrl: data.logoUrl } : {}),
            ...(data.primaryColor ? { primaryColor: data.primaryColor } : {}),
            ...(data.secondaryColor ? { secondaryColor: data.secondaryColor } : {}),
            ...(data.signature ? { signature: data.signature } : {}),
            ...(data.headerHtml ? { headerHtml: data.headerHtml } : {}),
            ...(data.footerHtml ? { footerHtml: data.footerHtml } : {}),
        };
        cachedAt = Date.now();
    } catch (err) {
        // DB not ready yet / migration pending — keep defaults
        if (!cache) cache = { ...DEFAULTS };
        console.error('[emailTemplateCache] loadTemplate failed:', err?.message || err);
    }
};

const invalidateTemplate = () => {
    cache = null;
    cachedAt = 0;
};

module.exports = {
    getTemplate,
    loadTemplate,
    invalidateTemplate,
};
