const errorLoggingController = require('express').Router();
const { Op } = require('sequelize');

const { client_error_log } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');

// ═══════════════════════════════════════════════════════════════════════════
// RATE LIMITER — max 10 error logs per IP per minute
// ═══════════════════════════════════════════════════════════════════════════

const logRateStore = new Map();
const LOG_RATE_LIMIT = 10;
const LOG_RATE_WINDOW = 60 * 1000; // 1 minute

// Clean up expired entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of logRateStore) {
        if (now - record.windowStart > LOG_RATE_WINDOW) {
            logRateStore.delete(ip);
        }
    }
}, 5 * 60 * 1000);

const logRateLimiter = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const record = logRateStore.get(ip);

    if (!record || (now - record.windowStart) > LOG_RATE_WINDOW) {
        logRateStore.set(ip, { count: 1, windowStart: now });
        return next();
    }

    if (record.count < LOG_RATE_LIMIT) {
        record.count++;
        return next();
    }

    // Silently accept but don't store — fire-and-forget
    return res.json({ success: true });
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTO-CLEANUP — delete error logs older than 30 days (runs every 6 hours)
// ═══════════════════════════════════════════════════════════════════════════

const RETENTION_DAYS = 30;
const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

const cleanupOldErrorLogs = async () => {
    try {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

        const deleted = await client_error_log.destroy({
            where: { created_at: { [Op.lt]: cutoff } },
        });

        if (deleted > 0) {
            console.log(`errorLogging: Cleaned up ${deleted} old error log records.`);
        }
    } catch (error) {
        console.error('errorLogging: Failed to cleanup old records:', error.message);
    }
};

setInterval(cleanupOldErrorLogs, CLEANUP_INTERVAL);

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/error-logging/log — Log a client-side error (no auth required)
errorLoggingController.post('/log', logRateLimiter, async (req, res) => {
    try {
        const { errorMessage, errorStack, componentStack, url, userAgent, extraInfo } = req.body;

        await client_error_log.create({
            error_message: errorMessage || 'Unknown error',
            error_stack: errorStack || null,
            component_stack: componentStack || null,
            url: url || null,
            user_agent: userAgent || req.headers['user-agent'] || null,
            ip_address: req.ip || null,
            extra_info: extraInfo ? (typeof extraInfo === 'string' ? extraInfo : JSON.stringify(extraInfo)) : null,
        });

        return res.json({ success: true });
    } catch (err) {
        // Don't throw on failure — always return 200
        console.error('Error logging failed:', err);
        return res.json({ success: true });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/error-logging/admin/logs — List logs with pagination & search
errorLoggingController.get('/admin/logs', isAuth, rbac.checkPermission('siteSettings', 'read'), async (req, res, next) => {
    try {
        const { page = 1, limit = 50, search, period = 'all', sort = 'newest' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        // Search filter
        if (search) {
            where[Op.or] = [
                { error_message: { [Op.iLike]: `%${search}%` } },
                { url: { [Op.iLike]: `%${search}%` } },
                { ip_address: { [Op.iLike]: `%${search}%` } },
            ];
        }

        // Period filter
        if (period && period !== 'all') {
            const now = new Date();
            let dateFrom;
            if (period === 'today') {
                dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (period === 'week') {
                dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (period === 'month') {
                dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            }
            if (dateFrom) {
                where.created_at = { [Op.gte]: dateFrom };
            }
        }

        // Sort order
        const order = [['created_at', sort === 'oldest' ? 'ASC' : 'DESC']];

        const { count, rows: logs } = await client_error_log.findAndCountAll({
            where,
            order,
            limit: parseInt(limit),
            offset,
        });

        return res.json({
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/error-logging/admin/logs/:id — Delete single log
errorLoggingController.delete('/admin/logs/:id', isAuth, rbac.checkPermission('siteSettings', 'delete'), async (req, res, next) => {
    try {
        const log = await client_error_log.findByPk(req.params.id);

        if (!log) {
            return res.status(404).json({ message: 'Log not found.' });
        }

        await log.destroy();

        return res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/error-logging/admin/logs — Delete ALL logs
errorLoggingController.delete('/admin/logs', isAuth, rbac.checkPermission('siteSettings', 'delete'), async (req, res, next) => {
    try {
        const deletedCount = await client_error_log.destroy({ where: {}, truncate: true });

        return res.json({ success: true, deletedCount });
    } catch (error) {
        next(error);
    }
});

// GET /api/error-logging/admin/logs/export — Export all logs as JSON
errorLoggingController.get('/admin/logs/export', isAuth, rbac.checkPermission('siteSettings', 'read'), async (req, res, next) => {
    try {
        const logs = await client_error_log.findAll({
            order: [['created_at', 'DESC']],
        });

        const date = new Date().toISOString().split('T')[0];

        res.setHeader('Content-Disposition', `attachment; filename=error-logs-${date}.json`);
        res.setHeader('Content-Type', 'application/json');

        return res.json(logs);
    } catch (error) {
        next(error);
    }
});

module.exports = errorLoggingController;
