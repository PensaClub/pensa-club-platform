const rateLimiterConfig = {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    message: (req, res) => {
        const resetTime = new Date(Date.now() + res.getHeader('RateLimit-Reset') * 1000);
        return {
            message: `Too many requests. Page will be available at ${resetTime.toLocaleString()}`,
            status: 429,
            resetAt: resetTime.toLocaleString(),
        };
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
};

module.exports = rateLimiterConfig;
