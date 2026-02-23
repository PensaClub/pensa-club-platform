const { site_setting } = require('../sequelize/models');

// ── Cache for DB settings (avoids hitting DB on every request) ──
let cachedSettings = null;
let cacheTime = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

// ── In-memory store: Map<ip, { count, windowStart }> ──
const store = new Map();

// ── Clean up expired entries every 10 minutes ──
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of store) {
        if (now - record.windowStart > record.windowMs) {
            store.delete(ip);
        }
    }
}, 10 * 60 * 1000);

/**
 * Fetch article limit settings from DB with caching
 */
async function getArticleLimitSettings() {
    const now = Date.now();
    if (cachedSettings && (now - cacheTime) < CACHE_TTL) {
        return cachedSettings;
    }

    try {
        const rows = await site_setting.findAll({
            where: {
                key: [
                    'article_limit_enabled',
                    'article_limit_max_reads',
                    'article_limit_window_hours',
                ],
            },
        });

        const parsed = {};
        rows.forEach((s) => {
            if (s.type === 'boolean') parsed[s.key] = s.value === 'true';
            else if (s.type === 'number') parsed[s.key] = Number(s.value);
            else parsed[s.key] = s.value;
        });

        cachedSettings = {
            enabled: parsed.article_limit_enabled ?? true,
            maxReads: parsed.article_limit_max_reads ?? 1,
            windowHours: parsed.article_limit_window_hours ?? 24,
        };
        cacheTime = now;
    } catch {
        // If DB is unreachable, use defaults (safe — limiter stays active)
        if (!cachedSettings) {
            cachedSettings = { enabled: true, maxReads: 1, windowHours: 24 };
        }
    }

    return cachedSettings;
}

/**
 * Dynamic article rate limiter middleware
 * - Reads config from site_settings table (cached 60s)
 * - Authenticated users always bypass
 * - Guests limited by IP
 */
const rateLimiter = async (req, res, next) => {
    // Authenticated users — unlimited
    if (req.user) return next();

    try {
        const settings = await getArticleLimitSettings();

        // Limiter disabled by admin — pass through
        if (!settings.enabled) return next();

        const ip = req.ip;
        const windowMs = settings.windowHours * 60 * 60 * 1000;
        const now = Date.now();
        const record = store.get(ip);

        // No record or window expired — start fresh
        if (!record || (now - record.windowStart) > record.windowMs) {
            store.set(ip, { count: 1, windowStart: now, windowMs });
            return next();
        }

        // Within limit
        if (record.count < settings.maxReads) {
            record.count++;
            return next();
        }

        // Limit reached — 429
        const resetTime = new Date(record.windowStart + record.windowMs);
        return res.status(429).json({
            message: `Too many requests. Page will be available at ${resetTime.toLocaleString()}`,
            status: 429,
            resetAt: resetTime.toLocaleString(),
        });
    } catch (err) {
        // On error, allow request (fail open)
        return next();
    }
};

/**
 * Invalidate settings cache — call after admin updates site_settings
 */
const invalidateCache = () => {
    cachedSettings = null;
    cacheTime = 0;
};

module.exports = rateLimiter;
module.exports.invalidateCache = invalidateCache;
