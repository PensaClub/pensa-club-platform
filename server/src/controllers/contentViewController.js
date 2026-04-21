// server/src/controllers/contentViewController.js

const contentViewController = require('express').Router();
const crypto = require('crypto');
const { Op, fn, col, literal } = require('sequelize');
const {
  content_view,
  article,
  course,
  seminar,
  initiative,
  project,
  publication,
  Club,
} = require('../sequelize/models');
const { isBotUserAgent } = require('../utils/botUserAgent');
const isAuth = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');

const ALLOWED_TYPES = new Set([
  'article',
  'seminar',
  'course',
  'initiative',
  'project',
  'publication',
  'club',
]);

const DEDUPE_WINDOW_MS = 30 * 60 * 1000;

const getClientIp = (req) => {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) {
    return fwd.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || null;
};

const hashIp = (ip) => {
  if (!ip) return null;
  return crypto.createHash('sha256').update(String(ip)).digest('hex');
};

const TYPE_TO_MODEL = {
  article,
  course,
  seminar,
  initiative,
  project,
  publication,
  club: Club,
};

// Shared aggregate used by the admin endpoint and by the monthly aggregator.
const getTopByType = async ({ contentType, from, to, limit = 3 }) => {
  if (!ALLOWED_TYPES.has(contentType)) return [];
  const where = { contentType, isBot: false };
  if (from) where.createdAt = { ...(where.createdAt || {}), [Op.gte]: from };
  if (to) where.createdAt = { ...(where.createdAt || {}), [Op.lt]: to };

  const rows = await content_view.findAll({
    attributes: ['contentId', [fn('COUNT', col('id')), 'views']],
    where,
    group: ['content_id'],
    order: [[literal('views'), 'DESC']],
    limit,
    raw: true,
  });

  return rows.map((r) => ({
    contentId: Number(r.contentId),
    views: Number(r.views) || 0,
  }));
};

const resolveContentForType = async (contentType, ids) => {
  const model = TYPE_TO_MODEL[contentType];
  if (!model || ids.length === 0) return new Map();

  const attrsByType = {
    article: ['id', 'slug', 'title'],
    seminar: ['id', 'slug', 'title', 'thumbnailUrl', 'scheduledDate'],
    course: ['id', 'slug', 'name', 'thumbnailUrl'],
    initiative: ['id', 'slug', 'title'],
    project: ['id', 'slug', 'title'],
    publication: ['id', 'slug', 'title'],
    club: ['id', 'slug', 'name'],
  };

  const rows = await model.findAll({
    where: { id: { [Op.in]: ids } },
    attributes: attrsByType[contentType] || ['id', 'slug'],
    raw: true,
  });

  const normalized = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title || r.name || null,
    thumbnailUrl: r.thumbnailUrl || null,
    scheduledDate: r.scheduledDate || null,
  }));

  return new Map(normalized.map((r) => [r.id, r]));
};

// POST /track/view — public, records a view after bot/dedupe checks.
contentViewController.post('/view', async (req, res) => {
  try {
    const { contentType, contentId } = req.body || {};
    if (!contentType || !ALLOWED_TYPES.has(contentType)) {
      return res.status(400).json({ error: 'INVALID_CONTENT_TYPE' });
    }
    const parsedId = Number(contentId);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ error: 'INVALID_CONTENT_ID' });
    }

    const userAgent = req.headers['user-agent'] || null;
    const referer = req.headers.referer || req.headers.referrer || null;
    const userId = req.user?.userId || null;
    const ipHash = hashIp(getClientIp(req));

    if (isBotUserAgent(userAgent)) {
      return res.json({ recorded: false, reason: 'BOT' });
    }

    if (ipHash) {
      const since = new Date(Date.now() - DEDUPE_WINDOW_MS);
      const recent = await content_view.findOne({
        where: {
          contentType,
          contentId: parsedId,
          ipHash,
          createdAt: { [Op.gte]: since },
        },
        attributes: ['id'],
      });
      if (recent) {
        return res.json({ recorded: false, reason: 'DEDUPE' });
      }
    }

    await content_view.create({
      contentType,
      contentId: parsedId,
      userId,
      ipHash,
      userAgent: userAgent ? String(userAgent).slice(0, 2000) : null,
      referer: referer ? String(referer).slice(0, 500) : null,
      isBot: false,
    });

    return res.json({ recorded: true });
  } catch (error) {
    console.error('trackView error:', error.message);
    return res.status(500).json({ error: 'TRACK_FAILED' });
  }
});

// GET /track/top — admin-only, returns enriched top content.
contentViewController.get(
  '/top',
  isAuth,
  rbac.checkPermission('contentAnalytics', 'read'),
  async (req, res) => {
    try {
      const { type, from, to, limit } = req.query || {};
      if (!type || !ALLOWED_TYPES.has(type)) {
        return res.status(400).json({ error: 'INVALID_TYPE' });
      }
      const parsedLimit = Math.max(1, Math.min(Number(limit) || 10, 50));
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;

      const top = await getTopByType({
        contentType: type,
        from: fromDate,
        to: toDate,
        limit: parsedLimit,
      });

      const ids = top.map((r) => r.contentId);
      const map = await resolveContentForType(type, ids);

      const enriched = top
        .map(({ contentId, views }) => {
          const row = map.get(contentId);
          if (!row) return null;
          return { ...row, views };
        })
        .filter(Boolean);

      return res.json({ items: enriched });
    } catch (error) {
      console.error('getTopContent error:', error.message);
      return res.status(500).json({ error: 'TOP_FETCH_FAILED' });
    }
  }
);

module.exports = contentViewController;
module.exports.getTopByType = getTopByType;
module.exports.resolveContentForType = resolveContentForType;
