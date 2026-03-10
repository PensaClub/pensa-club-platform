const factCheckController = require('express').Router();
const { Op } = require('sequelize');

const { fact_check_module, fact_check_signal, admin_notification } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');
const { createSignalSchema, createModuleSchema, updateModuleSchema, updateSignalSchema } = require('../schemas/factCheck.schema');
const { handlePersonalEmail } = require('../utils/clubUtils');

// ═══════════════════════════════════════════════════════════════════════════
// ANTI-SPAM — signal submissions
// ═══════════════════════════════════════════════════════════════════════════

// In-memory rate limiter: max 3 signals per hour per IP
const signalRateStore = new Map();
const SIGNAL_RATE_LIMIT = 3;
const SIGNAL_RATE_WINDOW = 60 * 60 * 1000; // 1 hour

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of signalRateStore) {
    if (now - record.windowStart > SIGNAL_RATE_WINDOW) {
      signalRateStore.delete(ip);
    }
  }
}, 10 * 60 * 1000);

const signalRateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const record = signalRateStore.get(ip);

  if (!record || (now - record.windowStart) > SIGNAL_RATE_WINDOW) {
    signalRateStore.set(ip, { count: 1, windowStart: now });
    return next();
  }

  if (record.count < SIGNAL_RATE_LIMIT) {
    record.count++;
    return next();
  }

  const remainingMs = SIGNAL_RATE_WINDOW - (now - record.windowStart);
  const remainingMinutes = Math.ceil(remainingMs / 60000);

  return res.status(429).json({
    message: 'Too many signals submitted. Please try again later.',
    statusCode: 429,
    remainingMinutes,
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const generateSlug = (text) => {
  const translitMap = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
    'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sht', 'ъ': 'a',
    'ь': '', 'ю': 'yu', 'я': 'ya',
  };

  return text
    .toLowerCase()
    .split('')
    .map((c) => translitMap[c] || c)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200)
    .replace(/^-|-$/g, '');
};

const ensureUniqueSlug = async (baseSlug) => {
  let slug = baseSlug;
  let counter = 1;
  while (await fact_check_module.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/fact-check/modules — Published modules with pagination & filters
factCheckController.get('/modules', async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, verdict, search, sort = 'newest' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = { status: 'published' };
    if (category) where.category = category;
    if (verdict) where.verdict = verdict;
    if (search) {
      where[Op.or] = [
        { claimText: { [Op.iLike]: `%${search}%` } },
        { verification: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const order = sort === 'views' ? [['viewsCount', 'DESC']] : [['createdAt', 'DESC']];

    const { count, rows: modules } = await fact_check_module.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset,
      attributes: ['id', 'slug', 'verdict', 'category', 'claimText', 'verification', 'viewsCount', 'createdAt'],
    });

    return res.json({
      success: true,
      modules,
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

// GET /api/fact-check/modules/:slug — Module detail
factCheckController.get('/modules/:slug', async (req, res, next) => {
  try {
    const module = await fact_check_module.findOne({
      where: { slug: req.params.slug, status: 'published' },
    });

    if (!module) {
      return res.status(404).json({ message: 'Module not found.' });
    }

    // Increment views
    await module.increment('viewsCount');

    return res.json({ success: true, module });
  } catch (error) {
    next(error);
  }
});

// GET /api/fact-check/categories — Unique categories from published modules
factCheckController.get('/categories', async (req, res, next) => {
  try {
    const categories = await fact_check_module.findAll({
      where: { status: 'published' },
      attributes: ['category'],
      group: ['category'],
      order: [['category', 'ASC']],
      raw: true,
    });

    return res.json({
      success: true,
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/fact-check/stats — Public statistics
factCheckController.get('/stats', async (req, res, next) => {
  try {
    const totalModules = await fact_check_module.count({ where: { status: 'published' } });
    const totalSignals = await fact_check_signal.count({ where: { isConfidential: false, status: { [Op.notIn]: ['dismissed'] } } });
    const resolvedSignals = await fact_check_signal.count({ where: { status: 'resolved' } });

    return res.json({
      success: true,
      stats: {
        totalModules,
        totalSignals,
        resolvedSignals,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/fact-check/feed — Unified public feed (modules + signals)
factCheckController.get('/feed', async (req, res, next) => {
  try {
    const { page = 1, limit = 12, type = 'all', category, verdict, search, sort = 'newest' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit);

    let moduleRows = [];
    let signalRows = [];

    // --- MODULES ---
    const includeModules = type === 'all' || type === 'modules';
    if (includeModules) {
      const moduleWhere = { status: 'published' };
      if (category) moduleWhere.category = category;
      if (verdict) moduleWhere.verdict = verdict;
      if (search) {
        moduleWhere[Op.or] = [
          { claimText: { [Op.iLike]: `%${search}%` } },
          { verification: { [Op.iLike]: `%${search}%` } },
          { category: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const result = await fact_check_module.findAll({
        where: moduleWhere,
        attributes: ['id', 'slug', 'verdict', 'category', 'claimText', 'verification', 'viewsCount', 'createdAt'],
        raw: true,
      });
      moduleRows = result.map((m) => ({ ...m, _itemType: 'module' }));
    }

    // --- SIGNALS ---
    const includeSignals = (type === 'all' || type === 'signals') && !category;
    if (includeSignals) {
      const signalWhere = {
        isConfidential: false,
        status: { [Op.notIn]: ['dismissed'] },
      };
      if (search) {
        signalWhere[Op.or] = [
          { claimText: { [Op.iLike]: `%${search}%` } },
          { city: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const result = await fact_check_signal.findAll({
        where: signalWhere,
        attributes: ['id', 'claimText', 'sourceType', 'city', 'status', 'relatedModuleId', 'createdAt'],
        include: [{
          model: fact_check_module,
          as: 'module',
          attributes: ['slug', 'verdict'],
          required: false,
        }],
      });
      signalRows = result.map((s) => {
        const plain = s.get({ plain: true });
        return {
          id: plain.id,
          claimText: plain.claimText,
          sourceType: plain.sourceType,
          city: plain.city,
          status: plain.status,
          relatedModuleId: plain.relatedModuleId,
          moduleSlug: plain.module?.slug || null,
          verdict: plain.module?.verdict || null,
          createdAt: plain.createdAt,
          _itemType: 'signal',
        };
      });

      // Filter by verdict if requested (applies to resolved signals too)
      if (verdict) {
        signalRows = signalRows.filter((s) => s.verdict === verdict);
      }
    }

    // --- MERGE & SORT ---
    // Hide modules that are already represented by a linked signal (no duplicates)
    const linkedModuleIds = new Set(signalRows.map((s) => s.relatedModuleId).filter(Boolean));
    moduleRows = moduleRows.filter((m) => !linkedModuleIds.has(m.id));

    let items = [...moduleRows, ...signalRows];
    if (sort === 'views') {
      items.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    } else {
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const total = items.length;
    const paginatedItems = items.slice(offset, offset + parsedLimit);

    return res.json({
      success: true,
      items: paginatedItems,
      pagination: {
        total,
        page: parseInt(page),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/fact-check/signals — Submit a signal (no auth required)
factCheckController.post('/signals', signalRateLimiter, async (req, res, next) => {
  try {
    // Honeypot check — bots fill hidden fields, humans don't
    if (req.body._hp) {
      return res.status(201).json({ success: true, message: 'Signal received successfully.' });
    }

    // Timestamp check — reject if form was submitted in under 5 seconds
    if (req.body._t) {
      const elapsed = Date.now() - Number(req.body._t);
      if (elapsed < 5000) {
        return res.status(201).json({ success: true, message: 'Signal received successfully.' });
      }
    }

    const validated = createSignalSchema.parse(req.body);

    // Clean empty strings to null
    if (validated.reporterEmail === '') validated.reporterEmail = null;
    if (validated.city === '') validated.city = null;

    const signal = await fact_check_signal.create(validated);

    // Create admin notification
    try {
      await admin_notification.create({
        type: 'fact_check_signal',
        title: 'Нов сигнал за проверка на факти',
        message: `Подаден е нов сигнал: "${validated.claimText.substring(0, 100)}..."`,
        data: {
          signalId: signal.id,
          claimText: validated.claimText.substring(0, 200),
          sourceType: validated.sourceType,
          city: validated.city,
        },
      });
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
    }

    // Send email notification
    try {
      await handlePersonalEmail({
        from: validated.reporterEmail || 'noreply@pensa.club',
        to: 'pensa.club@gmail.com',
        subject: '📋 Нов сигнал за проверка на факти',
        message: `Нов сигнал за проверка на факти:\n\nТвърдение: ${validated.claimText}\n\nИзточник: ${validated.sourceType}\nГрад: ${validated.city || 'Не е посочен'}\nИмейл: ${validated.reporterEmail || 'Не е посочен'}\nПоверително: ${validated.isConfidential ? 'Да' : 'Не'}`,
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    return res.status(201).json({
      success: true,
      message: 'Signal received successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS — Signals
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/fact-check/admin/signals
factCheckController.get('/admin/signals', isAuth, rbac.checkPermission('factCheckSignal', 'read'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { claimText: { [Op.iLike]: `%${search}%` } },
        { city: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: signals } = await fact_check_signal.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      include: [{ model: fact_check_module, as: 'module', attributes: ['id', 'slug', 'claimText', 'verdict'] }],
    });

    return res.json({
      success: true,
      signals,
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

// GET /api/fact-check/admin/signals/:id
factCheckController.get('/admin/signals/:id', isAuth, rbac.checkPermission('factCheckSignal', 'read'), async (req, res, next) => {
  try {
    const signal = await fact_check_signal.findByPk(req.params.id, {
      include: [{ model: fact_check_module, as: 'module', attributes: ['id', 'slug', 'claimText', 'verdict'] }],
    });

    if (!signal) return res.status(404).json({ message: 'Signal not found.' });

    return res.json({ success: true, signal });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/fact-check/admin/signals/:id
factCheckController.patch('/admin/signals/:id', isAuth, rbac.checkPermission('factCheckSignal', 'update'), async (req, res, next) => {
  try {
    const validated = updateSignalSchema.parse(req.body);
    const signal = await fact_check_signal.findByPk(req.params.id);

    if (!signal) return res.status(404).json({ message: 'Signal not found.' });

    await signal.update(validated);

    return res.json({ success: true, signal });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/fact-check/admin/signals/:id
factCheckController.delete('/admin/signals/:id', isAuth, rbac.checkPermission('factCheckSignal', 'delete'), async (req, res, next) => {
  try {
    const signal = await fact_check_signal.findByPk(req.params.id);

    if (!signal) return res.status(404).json({ message: 'Signal not found.' });

    await signal.destroy();

    return res.json({ success: true, message: 'Signal deleted.' });
  } catch (error) {
    next(error);
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS — Modules
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/fact-check/admin/modules
factCheckController.get('/admin/modules', isAuth, rbac.checkPermission('factCheckModule', 'read'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { claimText: { [Op.iLike]: `%${search}%` } },
        { verification: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows: modules } = await fact_check_module.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    return res.json({
      success: true,
      modules,
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

// POST /api/fact-check/admin/modules
factCheckController.post('/admin/modules', isAuth, rbac.checkPermission('factCheckModule', 'create'), async (req, res, next) => {
  try {
    const validated = createModuleSchema.parse(req.body);

    // Generate unique slug from claim text
    const baseSlug = generateSlug(validated.claimText);
    const slug = await ensureUniqueSlug(baseSlug || 'fact-check');

    // Clean empty strings to null
    if (validated.sourceUrl === '') validated.sourceUrl = null;
    if (validated.sourceName === '') validated.sourceName = null;
    if (validated.pdfUrl === '') validated.pdfUrl = null;

    const module = await fact_check_module.create({ ...validated, slug });

    return res.status(201).json({ success: true, module });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/fact-check/admin/modules/:id
factCheckController.patch('/admin/modules/:id', isAuth, rbac.checkPermission('factCheckModule', 'update'), async (req, res, next) => {
  try {
    const validated = updateModuleSchema.parse(req.body);
    const module = await fact_check_module.findByPk(req.params.id);

    if (!module) return res.status(404).json({ message: 'Module not found.' });

    // Clean empty strings to null
    if (validated.sourceUrl === '') validated.sourceUrl = null;
    if (validated.sourceName === '') validated.sourceName = null;
    if (validated.pdfUrl === '') validated.pdfUrl = null;

    await module.update(validated);

    return res.json({ success: true, module });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/fact-check/admin/modules/:id
factCheckController.delete('/admin/modules/:id', isAuth, rbac.checkPermission('factCheckModule', 'delete'), async (req, res, next) => {
  try {
    const module = await fact_check_module.findByPk(req.params.id);

    if (!module) return res.status(404).json({ message: 'Module not found.' });

    await module.destroy();

    return res.json({ success: true, message: 'Module deleted.' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/fact-check/admin/modules/:id/publish
factCheckController.patch('/admin/modules/:id/publish', isAuth, rbac.checkPermission('factCheckModule', 'publish'), async (req, res, next) => {
  try {
    const module = await fact_check_module.findByPk(req.params.id);

    if (!module) return res.status(404).json({ message: 'Module not found.' });

    await module.update({ status: 'published' });

    return res.json({ success: true, module });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/fact-check/admin/modules/:id/hide
factCheckController.patch('/admin/modules/:id/hide', isAuth, rbac.checkPermission('factCheckModule', 'update'), async (req, res, next) => {
  try {
    const module = await fact_check_module.findByPk(req.params.id);

    if (!module) return res.status(404).json({ message: 'Module not found.' });

    await module.update({ status: 'hidden' });

    return res.json({ success: true, module });
  } catch (error) {
    next(error);
  }
});

module.exports = factCheckController;
