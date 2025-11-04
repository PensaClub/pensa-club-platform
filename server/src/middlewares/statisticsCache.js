const NodeCache = require('node-cache');

// Cache за statistics - 5 минути TTL (по-кратко от users cache)
const statsCache = new NodeCache({ 
  stdTTL: 300,      // 5 минути standard TTL
  checkperiod: 120  // Проверява на 2 минути за изтекли записи
});

/**
 * Statistics Cache Middleware
 * Кешира GET requests за statistics endpoints
 * 
 * @param {number} duration - Cache TTL в секунди (default: 300 = 5 минути)
 * @returns {Function} Express middleware
 */
const statisticsCache = (duration = 300) => {
  return (req, res, next) => {

    if (req.method !== 'GET') {
      return next();
    }

    // Cache key = full URL + query params
    const cacheKey = req.originalUrl || req.url;

    const cachedResponse = statsCache.get(cacheKey);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Override res.json за да кешираме response-а
    const originalJson = res.json.bind(res);
    
    res.json = (body) => {

      if (body && body.success !== false) {
        statsCache.set(cacheKey, body, duration);
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Clear cache за specific key или всички
 * @param {string} key - Cache key (optional)
 */
const clearStatsCache = (key = null) => {
  if (key) {
    statsCache.del(key);
  } else {
    statsCache.flushAll();
  }
};

/**
 * Get cache statistics
 */
const getCacheStats = () => {
  return {
    keys: statsCache.keys(),
    stats: statsCache.getStats()
  };
};

module.exports = {
  statisticsCache,
  clearStatsCache,
  getCacheStats
};