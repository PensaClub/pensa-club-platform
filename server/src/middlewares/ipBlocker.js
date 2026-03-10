/**
 * IP Blocker Middleware
 *
 * Checks incoming requests against a blocklist stored in the database.
 * Uses in-memory cache (refreshed every 60 seconds) for performance.
 *
 * FAIL-SAFE: If the database is unreachable or any error occurs,
 * the middleware ALLOWS the request through (never blocks on error).
 *
 * WHITELIST: System IPs (hardcoded, never removable) + DB-managed IPs.
 */

// System IPs that are ALWAYS whitelisted and cannot be removed via UI
const SYSTEM_IPS = [
  '78.154.13.95',       // Admin IP
  '127.0.0.1',          // Localhost IPv4
  '::1',                // Localhost IPv6
  '185.123.188.236',    // VPS public IP
  '172.17.0.1',         // Docker bridge gateway
  '172.18.0.1',         // dlwb_default gateway
  '172.19.0.1',         // nginx-proxy gateway
  '172.19.0.4',         // NPM container
  '172.19.0.3',         // Client container
  '172.19.0.2',         // Server container
  '172.18.0.2',         // DB container
];

// In-memory caches
let blockedIpsCache = new Set();
let whitelistedIpsCache = new Set(SYSTEM_IPS);
let lastBlockedCacheRefresh = 0;
let lastWhitelistCacheRefresh = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

const isWhitelisted = (ip) => {
  if (!ip) return true; // No IP = don't block
  if (whitelistedIpsCache.has(ip)) return true;
  if (ip.startsWith('127.')) return true;
  if (ip === '::ffff:127.0.0.1') return true;
  return false;
};

const refreshBlockedCache = async () => {
  try {
    const { blocked_ip } = require('../sequelize/models/index');
    const blocked = await blocked_ip.findAll({ attributes: ['ipAddress'], raw: true });
    blockedIpsCache = new Set(blocked.map((b) => b.ipAddress));
    lastBlockedCacheRefresh = Date.now();
  } catch (error) {
    console.error('ipBlocker: Failed to refresh blocked cache:', error.message);
  }
};

const refreshWhitelistCache = async () => {
  try {
    const { whitelisted_ip } = require('../sequelize/models/index');
    const whitelist = await whitelisted_ip.findAll({ attributes: ['ipAddress'], raw: true });
    const dbIps = whitelist.map((w) => w.ipAddress);
    // Merge system IPs + DB IPs
    whitelistedIpsCache = new Set([...SYSTEM_IPS, ...dbIps]);
    lastWhitelistCacheRefresh = Date.now();
  } catch (error) {
    // FAIL-SAFE: keep system IPs at minimum
    console.error('ipBlocker: Failed to refresh whitelist cache:', error.message);
    whitelistedIpsCache = new Set(SYSTEM_IPS);
  }
};

const ipBlocker = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();

    // Refresh whitelist cache if stale
    if (Date.now() - lastWhitelistCacheRefresh > CACHE_TTL) {
      await refreshWhitelistCache();
    }

    // Whitelisted IPs always pass
    if (isWhitelisted(ip)) return next();

    // Refresh blocked cache if stale
    if (Date.now() - lastBlockedCacheRefresh > CACHE_TTL) {
      await refreshBlockedCache();
    }

    // Check blocklist
    if (blockedIpsCache.has(ip)) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    return next();
  } catch (error) {
    // FAIL-SAFE: on any error, allow the request
    console.error('ipBlocker: Error in middleware:', error.message);
    return next();
  }
};

// Export for cache invalidation from admin endpoints
const invalidateBlockedIpsCache = () => {
  lastBlockedCacheRefresh = 0;
};

const invalidateWhitelistCache = () => {
  lastWhitelistCacheRefresh = 0;
};

module.exports = {
  ipBlocker,
  invalidateBlockedIpsCache,
  invalidateWhitelistCache,
  SYSTEM_IPS,
  isWhitelisted,
};
