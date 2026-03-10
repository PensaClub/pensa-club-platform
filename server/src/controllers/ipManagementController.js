const ipManagementController = require('express').Router();
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { ip_visit, blocked_ip, whitelisted_ip, user_account } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const { invalidateBlockedIpsCache, invalidateWhitelistCache, isWhitelisted } = require('../middlewares/ipBlocker');

/**
 * Verify admin password for sensitive operations (system IP changes).
 * Returns true if valid, sends error response and returns false if not.
 */
const verifyAdminPassword = async (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ message: 'Password is required for this operation.' });
    return false;
  }
  const adminUser = await user_account.findByPk(req.user.userId);
  if (!adminUser) {
    res.status(404).json({ message: 'User not found.' });
    return false;
  }
  const isValid = await bcrypt.compare(password, adminUser.password);
  if (!isValid) {
    res.status(403).json({ message: 'Invalid password.' });
    return false;
  }
  return true;
};

// ═══════════════════════════════════════════════════════════════════════════
// Helper — get date cutoff for period filter
// ═══════════════════════════════════════════════════════════════════════════

const getPeriodCutoff = (period) => {
  const now = new Date();
  switch (period) {
    case 'today': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case 'week': {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return start;
    }
    case 'month': {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return start;
    }
    default:
      return null;
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// GET /admin/ip-management/stats — IP visit statistics
// ═══════════════════════════════════════════════════════════════════════════

ipManagementController.get('/stats', isAuth, rbac.checkPermission('siteSettings', 'update'), async (req, res, next) => {
  try {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date(now);
    monthStart.setDate(monthStart.getDate() - 30);

    const [todayCount, weekCount, monthCount, totalCount, todayVisits, weekVisits, monthVisits] = await Promise.all([
      ip_visit.count({ where: { lastVisitedAt: { [Op.gte]: todayStart } } }),
      ip_visit.count({ where: { lastVisitedAt: { [Op.gte]: weekStart } } }),
      ip_visit.count({ where: { lastVisitedAt: { [Op.gte]: monthStart } } }),
      ip_visit.count(),
      ip_visit.sum('visitCount', { where: { lastVisitedAt: { [Op.gte]: todayStart } } }),
      ip_visit.sum('visitCount', { where: { lastVisitedAt: { [Op.gte]: weekStart } } }),
      ip_visit.sum('visitCount', { where: { lastVisitedAt: { [Op.gte]: monthStart } } }),
    ]);

    return res.json({
      success: true,
      stats: {
        today: { uniqueIps: todayCount, totalVisits: todayVisits || 0 },
        week: { uniqueIps: weekCount, totalVisits: weekVisits || 0 },
        month: { uniqueIps: monthCount, totalVisits: monthVisits || 0 },
        total: totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /admin/ip-management/visits — List IP visits (paginated + period filter)
// ═══════════════════════════════════════════════════════════════════════════

ipManagementController.get('/visits', isAuth, rbac.checkPermission('siteSettings', 'update'), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search, period } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    // Period filter
    const cutoff = getPeriodCutoff(period);
    if (cutoff) {
      where.lastVisitedAt = { [Op.gte]: cutoff };
    }

    if (search) {
      where[Op.or] = [
        { ipAddress: { [Op.iLike]: `%${search}%` } },
        { userAgent: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: visits } = await ip_visit.findAndCountAll({
      where,
      order: [['lastVisitedAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const visitsWithFlags = visits.map((v) => {
      const plain = v.get({ plain: true });
      plain.isWhitelisted = isWhitelisted(plain.ipAddress);
      return plain;
    });

    return res.json({
      success: true,
      visits: visitsWithFlags,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /admin/ip-management/blocked — List blocked IPs
// ═══════════════════════════════════════════════════════════════════════════

ipManagementController.get('/blocked', isAuth, rbac.checkPermission('siteSettings', 'update'), async (req, res, next) => {
  try {
    const blockedIps = await blocked_ip.findAll({
      order: [['blockedAt', 'DESC']],
    });

    return res.json({ success: true, blockedIps });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /admin/ip-management/block — Block an IP
// ═══════════════════════════════════════════════════════════════════════════

ipManagementController.post('/block', isAuth, rbac.checkPermission('siteSettings', 'update'), async (req, res, next) => {
  try {
    const { ipAddress, reason, password } = req.body;

    if (!ipAddress || typeof ipAddress !== 'string') {
      return res.status(400).json({ message: 'IP address is required.' });
    }

    const trimmedIp = ipAddress.trim();

    if (!trimmedIp.match(/^[\d.:a-fA-F]+$/)) {
      return res.status(400).json({ message: 'Invalid IP address format.' });
    }

    // If password is provided, verify it (required from signals page)
    if (password) {
      const isValid = await verifyAdminPassword(req, res);
      if (!isValid) return;
    }

    // If IP is whitelisted, remove it from whitelist first (requires password)
    if (isWhitelisted(trimmedIp)) {
      if (!password) {
        return res.status(400).json({ message: 'Password is required for this operation.', requiresPassword: true });
      }

      const whitelistEntry = await whitelisted_ip.findOne({ where: { ipAddress: trimmedIp } });
      if (whitelistEntry) {
        await whitelistEntry.destroy();
        invalidateWhitelistCache();
      }
    }

    // Check if already blocked
    const existing = await blocked_ip.findOne({ where: { ipAddress: trimmedIp } });
    if (existing) {
      return res.status(409).json({ message: 'This IP is already blocked.' });
    }

    const entry = await blocked_ip.create({
      ipAddress: trimmedIp,
      reason: reason || null,
      blockedBy: req.user?.userId || null,
      blockedAt: new Date(),
    });

    invalidateBlockedIpsCache();

    return res.status(201).json({ success: true, blockedIp: entry });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// DELETE /admin/ip-management/unblock/:id — Unblock an IP
// ═══════════════════════════════════════════════════════════════════════════

ipManagementController.delete('/unblock/:id', isAuth, rbac.checkPermission('siteSettings', 'update'), async (req, res, next) => {
  try {
    // If password is provided, verify it (required from signals page)
    if (req.body?.password) {
      const isValid = await verifyAdminPassword(req, res);
      if (!isValid) return;
    }

    const entry = await blocked_ip.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Blocked IP not found.' });
    }

    await entry.destroy();
    invalidateBlockedIpsCache();

    return res.json({ success: true, message: 'IP unblocked.' });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GET /admin/ip-management/whitelist — List all whitelisted IPs
// ═══════════════════════════════════════════════════════════════════════════

ipManagementController.get('/whitelist', isAuth, rbac.checkPermission('siteSettings', 'update'), async (req, res, next) => {
  try {
    const whitelistEntries = await whitelisted_ip.findAll({
      order: [['isSystem', 'DESC'], ['createdAt', 'DESC']],
    });

    return res.json({ success: true, whitelist: whitelistEntries });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /admin/ip-management/whitelist — Add IP to whitelist
// ═══════════════════════════════════════════════════════════════════════════

ipManagementController.post('/whitelist', isAuth, rbac.checkPermission('siteSettings', 'update'), async (req, res, next) => {
  try {
    const { ipAddress, label } = req.body;

    if (!ipAddress || typeof ipAddress !== 'string') {
      return res.status(400).json({ message: 'IP address is required.' });
    }

    const trimmedIp = ipAddress.trim();

    if (!trimmedIp.match(/^[\d.:a-fA-F]+$/)) {
      return res.status(400).json({ message: 'Invalid IP address format.' });
    }

    const existing = await whitelisted_ip.findOne({ where: { ipAddress: trimmedIp } });
    if (existing) {
      return res.status(409).json({ message: 'This IP is already whitelisted.' });
    }

    const entry = await whitelisted_ip.create({
      ipAddress: trimmedIp,
      label: label || null,
      isSystem: false,
      addedBy: req.user?.userId || null,
    });

    // If this IP was blocked, remove it from blocklist
    const blockedEntry = await blocked_ip.findOne({ where: { ipAddress: trimmedIp } });
    if (blockedEntry) {
      await blockedEntry.destroy();
      invalidateBlockedIpsCache();
    }

    invalidateWhitelistCache();

    return res.status(201).json({ success: true, whitelistEntry: entry });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// DELETE /admin/ip-management/whitelist/:id — Remove IP from whitelist
// Always requires password confirmation
// ═══════════════════════════════════════════════════════════════════════════

ipManagementController.delete('/whitelist/:id', isAuth, rbac.checkPermission('siteSettings', 'update'), async (req, res, next) => {
  try {
    const entry = await whitelisted_ip.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Whitelist entry not found.' });
    }

    // Always require password
    const password = req.body?.password;
    if (!password) {
      return res.status(400).json({ message: 'Password is required for this operation.', requiresPassword: true });
    }
    const adminUser = await user_account.findByPk(req.user.userId);
    if (!adminUser || !(await bcrypt.compare(password, adminUser.password))) {
      return res.status(403).json({ message: 'Invalid password.' });
    }

    await entry.destroy();
    invalidateWhitelistCache();

    return res.json({ success: true, message: 'IP removed from whitelist.' });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// POST /admin/ip-management/whitelist/:id/block — Remove from whitelist & block
// Always requires password confirmation
// ═══════════════════════════════════════════════════════════════════════════

ipManagementController.post('/whitelist/:id/block', isAuth, rbac.checkPermission('siteSettings', 'update'), async (req, res, next) => {
  try {
    const { reason } = req.body;
    const entry = await whitelisted_ip.findByPk(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Whitelist entry not found.' });
    }

    // Always require password
    const isValid = await verifyAdminPassword(req, res);
    if (!isValid) return;

    const ip = entry.ipAddress;

    // Remove from whitelist
    await entry.destroy();
    invalidateWhitelistCache();

    // Block it
    const existingBlocked = await blocked_ip.findOne({ where: { ipAddress: ip } });
    if (!existingBlocked) {
      await blocked_ip.create({
        ipAddress: ip,
        reason: reason || null,
        blockedBy: req.user?.userId || null,
        blockedAt: new Date(),
      });
      invalidateBlockedIpsCache();
    }

    return res.json({ success: true, message: 'IP removed from whitelist and blocked.' });
  } catch (error) {
    next(error);
  }
});

module.exports = ipManagementController;
