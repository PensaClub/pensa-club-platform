const rateLimit = require('express-rate-limit');
const rateLimiterConfig = require('../config/rateLimiterConfig');

const rateLimiter = rateLimit({
    ...rateLimiterConfig,
    max: (req) => {
        // If user exists (authenticated) - unlimited else 1 request per window
        return req.user ? Infinity : 1;
    },
});

module.exports = rateLimiter;
