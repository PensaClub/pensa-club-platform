/**
 * IP Logger Middleware
 *
 * Logs unique IP visits per day using an in-memory buffer.
 * Flushes to database every 30 seconds to avoid per-request DB writes.
 * Auto-cleans records older than 30 days.
 *
 * Only logs API requests (not static files).
 */

const { Op } = require('sequelize');

// In-memory buffer: Map<ipAddress, { userAgent, path, lastSeen }>
const visitBuffer = new Map();
// Track which IPs we've already seen today (avoid duplicate DB upserts)
const seenToday = new Set();
let lastDayReset = new Date().toDateString();

const FLUSH_INTERVAL = 30 * 1000; // 30 seconds
const CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours
const RETENTION_DAYS = 30;

const ipLogger = (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for']?.split(',')[0]?.trim();
    if (!ip) return next();

    // Reset daily tracking at midnight
    const today = new Date().toDateString();
    if (today !== lastDayReset) {
      seenToday.clear();
      lastDayReset = today;
    }

    // Buffer the visit (overwrite with latest data)
    visitBuffer.set(ip, {
      userAgent: req.headers['user-agent'] || null,
      path: req.originalUrl?.substring(0, 500) || null,
      lastSeen: new Date(),
      isNew: !seenToday.has(ip),
    });
    seenToday.add(ip);
  } catch (error) {
    // Never block requests due to logging errors
  }

  return next();
};

// Flush buffer to database
const flushBuffer = async () => {
  if (visitBuffer.size === 0) return;

  try {
    const { ip_visit } = require('../sequelize/models/index');
    const entries = Array.from(visitBuffer.entries());
    visitBuffer.clear();

    for (const [ipAddress, data] of entries) {
      try {
        const existing = await ip_visit.findOne({ where: { ipAddress } });

        if (existing) {
          await existing.update({
            userAgent: data.userAgent,
            path: data.path,
            visitCount: existing.visitCount + (data.isNew ? 1 : 0),
            lastVisitedAt: data.lastSeen,
          });
        } else {
          await ip_visit.create({
            ipAddress,
            userAgent: data.userAgent,
            path: data.path,
            visitCount: 1,
            lastVisitedAt: data.lastSeen,
          });
        }
      } catch (err) {
        // Skip individual failures silently
      }
    }
  } catch (error) {
    console.error('ipLogger: Failed to flush buffer:', error.message);
  }
};

// Cleanup old records
const cleanupOldRecords = async () => {
  try {
    const { ip_visit } = require('../sequelize/models/index');
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

    const deleted = await ip_visit.destroy({
      where: { lastVisitedAt: { [Op.lt]: cutoff } },
    });

    if (deleted > 0) {
      console.log(`ipLogger: Cleaned up ${deleted} old IP visit records.`);
    }
  } catch (error) {
    console.error('ipLogger: Failed to cleanup old records:', error.message);
  }
};

// Start flush and cleanup intervals
setInterval(flushBuffer, FLUSH_INTERVAL);
setInterval(cleanupOldRecords, CLEANUP_INTERVAL);

module.exports = { ipLogger };
