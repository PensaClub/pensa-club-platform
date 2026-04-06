// server/src/controllers/seminarsController.js

const seminarsController = require('express').Router();
const { Op } = require('sequelize');

const {
  seminar,
  seminar_material,
  seminar_video,
  seminar_review,
  student_seminar,
  course,
  mentor,
  user_account,
  user_details,
  student,
  sequelize,
  user_notification,
  admin_notification,
  seminar_session,
  session_attendance,
} = require('../sequelize/models/index');

const { validateBody, validateQuery } = require('../middlewares/validateRequest');
const {
  seminarCreateSchema,
  seminarUpdateSchema,
  seminarQuerySchema,
  lectureCancelSchema,
  attendanceMarkSchema,
  bulkAttendanceSchema,
} = require('../schemas/academySchemas');

const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');
const { forwardEmailsViaZoho } = require('../utils/zohoEmails');
const seminarEmailTemplates = require('../utils/seminarEmailTemplates');

// ===============================
// HELPER: Generate slug from title
// ===============================
const bulgarianToLatin = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ж': 'zh', 'з': 'z',
  'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
  'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch',
  'ш': 'sh', 'щ': 'sht', 'ъ': 'a', 'ь': 'y', 'ю': 'yu', 'я': 'ya',
};

const transliterate = (text) => {
  if (!text) return '';
  return text.split('').map(char => bulgarianToLatin[char.toLowerCase()] || char).join('');
};

const generateSlug = (title) => {
  if (!title) return '';
  return transliterate(title)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
    .substring(0, 100);
};

// ===============================
// HELPER: Generate unique slug
// ===============================
const generateUniqueSlug = async (title, existingId = null) => {
  let baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const where = { slug };
    if (existingId) {
      where.id = { [Op.ne]: existingId };
    }

    const existing = await seminar.findOne({ where });
    if (!existing) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// ===============================
// GET /api/academy/seminars
// Публичен списък със семинари
// ===============================
seminarsController.get('/', validateQuery(seminarQuerySchema), async (req, res, next) => {
  try {
    const { page, limit, search, category, status, type, sortBy } = req.query;

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const where = {};

    // По подразбиране показваме само публикувани
    where.isPublished = true;
    where.isPublic = true;

    // Time filter — upcoming / completed // НОВО
    if (status === 'upcoming') {
      where.scheduledDate = { [Op.gte]: new Date() };
    } else if (status === 'completed') {
      where.scheduledDate = { [Op.lt]: new Date() };
    }

    // Filter by category
    if (category && category !== 'all') {
      where.category = category;
    }

    // Filter by type
    if (type && type !== 'all') {
      where.seminarType = type;
    }

    // Search
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Sort order
    let order = [['scheduledDate', 'DESC']];
    switch (sortBy) {
      case 'oldest':
        order = [['scheduledDate', 'ASC']];
        break;
      case 'title':
        order = [['title', 'ASC']];
        break;
      case 'rating':
        order = [['rating', 'DESC']];
        break;
      case 'popular':
        order = [['registeredCount', 'DESC']];
        break;
      case 'upcoming':
        order = [['scheduledDate', 'ASC']];
        where.scheduledDate = { [Op.gte]: new Date() };
        break;
    }

    const { count, rows: seminars } = await seminar.findAndCountAll({
      where,
      include: [
        {
          model: mentor,
          as: 'facilitator',
          attributes: ['id', 'name', 'photoUrl', 'specialization'],
        },
        {
          model: course,
          as: 'course',
          attributes: ['id', 'name', 'slug'],
        },
      ],
      attributes: {
        exclude: ['description'],
      },
      limit,
      offset,
      order,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      seminars,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
      },
    });
  } catch (err) {
    console.error('❌ [GET SEMINARS] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/seminars/upcoming
// Предстоящи семинари
// ===============================
seminarsController.get('/upcoming', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const seminars = await seminar.findAll({
      where: {
        isPublished: true,
        isPublic: true,
        status: 'scheduled',
        scheduledDate: { [Op.gte]: new Date() },
      },
      include: [
        {
          model: mentor,
          as: 'facilitator',
          attributes: ['id', 'name', 'photoUrl'],
        },
      ],
      order: [['scheduledDate', 'ASC']],
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      seminars,
    });
  } catch (err) {
    console.error('❌ [GET UPCOMING SEMINARS] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/seminars/meta/categories
// Списък с категории
// ===============================
seminarsController.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await seminar.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      where: {
        category: { [Op.ne]: null },
        isPublished: true,
      },
      raw: true,
    });

    res.status(200).json({
      success: true,
      categories: categories.map((c) => c.category).filter(Boolean),
    });
  } catch (err) {
    console.error('❌ [GET SEMINAR CATEGORIES] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/seminars/meta/types
// Списък с типове семинари
// ===============================
seminarsController.get('/meta/types', async (req, res, next) => {
  try {
    const types = [
      { value: 'workshop', label: 'Уъркшоп' },
      { value: 'discussion', label: 'Дискусия' },
      { value: 'hands_on', label: 'Практическо занятие' },
      { value: 'q_and_a', label: 'Въпроси и отговори' },
    ];

    res.status(200).json({
      success: true,
      types,
    });
  } catch (err) {
    console.error('❌ [GET SEMINAR TYPES] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/seminars/admin
// Admin списък (включва drafts)
// ===============================
seminarsController.get(
  '/admin',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  validateQuery(seminarQuerySchema),
  async (req, res, next) => {
    try {
      const { page, limit, search, category, status, type, sortBy } = req.query;

      const offset = (page - 1) * limit;

      const where = {};

      // Filter by status
      if (status && status !== 'all') {
        if (status === 'draft') {
          where.isPublished = false;
        } else if (status === 'published') {
          where.isPublished = true;
        } else {
          where.status = status;
        }
      }

      // Filter by type
      if (type && type !== 'all') {
        where.seminarType = type;
      }

      if (category && category !== 'all') {
        where.category = category;
      }

      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { slug: { [Op.iLike]: `%${search}%` } },
        ];
      }

      let order = [['createdAt', 'DESC']];
      switch (sortBy) {
        case 'oldest':
          order = [['createdAt', 'ASC']];
          break;
        case 'title':
          order = [['title', 'ASC']];
          break;
        case 'upcoming':
          order = [['scheduledDate', 'ASC']];
          break;
        case 'popular':
          order = [['registeredCount', 'DESC']];
          break;
      }

      const { count, rows: seminars } = await seminar.findAndCountAll({
        where,
        include: [
          {
            model: mentor,
            as: 'facilitator',
            attributes: ['id', 'name', 'photoUrl'],
          },
          {
            model: user_account,
            as: 'creator',
            attributes: ['id', 'email'],
          },
        ],
        limit,
        offset,
        order,
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        seminars,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
        },
      });
    } catch (err) {
      console.error('❌ [GET ADMIN SEMINARS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/admin/statistics
// Агрегирана статистика за всички семинари
// ===============================
seminarsController.get(
  '/admin/statistics',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_guest_attendance } = require('../sequelize/models/index');
      const { period = 'all', type = 'all', status: statusParam = 'all' } = req.query;

      // Period filter
      let dateFilter = {};
      const now = new Date();
      if (period !== 'all') {
        const days = { '7': 7, '30': 30, '180': 180, '365': 365 };
        const d = days[period];
        if (d) {
          const from = new Date(now);
          from.setDate(from.getDate() - d);
          dateFilter = { scheduledDate: { [Op.gte]: from } };
        }
      }

      // Type filter
      let typeFilter = {};
      if (type === 'online') typeFilter = { isOnline: true };
      else if (type === 'inperson') typeFilter = { isOnline: false };

      // Status filter
      let statusFilter = {};
      if (statusParam !== 'all' && ['scheduled', 'completed', 'cancelled', 'live'].includes(statusParam)) {
        statusFilter = { status: statusParam };
      }

      const where = { ...dateFilter, ...typeFilter, ...statusFilter };

      // 1) Overview cards
      const allSeminars = await seminar.findAll({
        where,
        attributes: ['id', 'isOnline', 'registeredCount', 'attendedCount', 'scheduledDate', 'status'],
      });

      const totalSeminars = allSeminars.length;
      const onlineCount = allSeminars.filter(s => s.isOnline).length;
      const inpersonCount = totalSeminars - onlineCount;
      const cancelledCount = allSeminars.filter(s => s.status === 'cancelled').length;
      const completedCount = allSeminars.filter(s => s.status === 'completed').length;

      // Registered attendees
      const seminarIds = allSeminars.map(s => s.id);

      const registeredAttended = seminarIds.length > 0
        ? await student_seminar.count({ where: { seminarId: { [Op.in]: seminarIds }, attended: true } })
        : 0;

      const guestAttended = seminarIds.length > 0
        ? await seminar_guest_attendance.count({ where: { seminarId: { [Op.in]: seminarIds } } })
        : 0;

      const totalAttended = registeredAttended + guestAttended;
      const avgAttendance = totalSeminars > 0 ? Math.round(totalAttended / totalSeminars * 10) / 10 : 0;

      // Total credits
      const creditsResult = seminarIds.length > 0
        ? await student_seminar.findOne({
            where: { seminarId: { [Op.in]: seminarIds } },
            attributes: [[sequelize.fn('SUM', sequelize.col('earned_credits')), 'total']],
            raw: true,
          })
        : { total: 0 };
      const totalCredits = parseInt(creditsResult?.total) || 0;

      // 2) Monthly chart data
      const monthlyRaw = await seminar.findAll({
        where,
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('scheduled_date')), 'month'],
          [sequelize.fn('COUNT', sequelize.col('seminar.id')), 'count'],
        ],
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('scheduled_date'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('scheduled_date')), 'ASC']],
        raw: true,
      });

      // Monthly attendance (registered)
      const monthlyRegAttendance = seminarIds.length > 0
        ? await student_seminar.findAll({
            where: { seminarId: { [Op.in]: seminarIds }, attended: true },
            include: [{
              model: seminar,
              as: 'seminar',
              attributes: [],
              where,
            }],
            attributes: [
              [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('seminar.scheduled_date')), 'month'],
              [sequelize.fn('COUNT', sequelize.col('student_seminar.id')), 'count'],
            ],
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('seminar.scheduled_date'))],
            raw: true,
          })
        : [];

      // Monthly attendance (guests)
      const monthlyGuestAttendance = seminarIds.length > 0
        ? await seminar_guest_attendance.findAll({
            include: [{
              model: seminar,
              as: 'seminar',
              attributes: [],
              where,
            }],
            where: { seminarId: { [Op.in]: seminarIds } },
            attributes: [
              [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('seminar.scheduled_date')), 'month'],
              [sequelize.fn('COUNT', sequelize.col('seminar_guest_attendance.id')), 'count'],
            ],
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('seminar.scheduled_date'))],
            raw: true,
          })
        : [];

      // Merge monthly data
      const monthMap = {};
      monthlyRaw.forEach(r => {
        const key = r.month;
        if (!monthMap[key]) monthMap[key] = { month: key, seminars: 0, registered: 0, guests: 0 };
        monthMap[key].seminars = parseInt(r.count) || 0;
      });
      monthlyRegAttendance.forEach(r => {
        const key = r.month;
        if (!monthMap[key]) monthMap[key] = { month: key, seminars: 0, registered: 0, guests: 0 };
        monthMap[key].registered = parseInt(r.count) || 0;
      });
      monthlyGuestAttendance.forEach(r => {
        const key = r.month;
        if (!monthMap[key]) monthMap[key] = { month: key, seminars: 0, registered: 0, guests: 0 };
        monthMap[key].guests = parseInt(r.count) || 0;
      });
      const monthlyData = Object.values(monthMap)
        .sort((a, b) => new Date(a.month) - new Date(b.month))
        .map(m => ({
          ...m,
          total: m.registered + m.guests,
          label: new Date(m.month).toLocaleDateString('bg-BG', { month: 'short', year: '2-digit' }),
        }));

      // 3) Seminars table data
      const seminarsTable = await seminar.findAll({
        where,
        include: [
          {
            model: mentor,
            as: 'facilitator',
            attributes: ['id', 'name'],
          },
          {
            model: student_seminar,
            as: 'attendances',
            attributes: ['id', 'attended', 'earnedCredits'],
          },
          {
            model: seminar_guest_attendance,
            as: 'guestAttendances',
            attributes: ['id'],
          },
        ],
        attributes: [
          'id', 'title', 'slug', 'isOnline', 'location', 'address',
          'scheduledDate', 'registeredCount', 'attendedCount', 'status',
        ],
        order: [['scheduledDate', 'DESC']],
      });

      const seminarsData = seminarsTable.map(s => {
        const plain = s.get({ plain: true });
        const regAttended = (plain.attendances || []).filter(a => a.attended).length;
        const guestCount = (plain.guestAttendances || []).length;
        const earnedCredits = (plain.attendances || []).reduce((sum, a) => sum + (a.earnedCredits || 0), 0);

        return {
          id: plain.id,
          title: plain.title,
          slug: plain.slug,
          isOnline: plain.isOnline,
          location: plain.location,
          address: plain.address,
          scheduledDate: plain.scheduledDate,
          status: plain.status,
          facilitator: plain.facilitator?.name || null,
          facilitatorId: plain.facilitator?.id || null,
          registeredCount: plain.registeredCount || 0,
          attendedRegistered: regAttended,
          attendedGuests: guestCount,
          attendedTotal: regAttended + guestCount,
          earnedCredits,
        };
      });

      // Unique mentors for filter
      const mentors = [...new Map(
        seminarsData
          .filter(s => s.facilitatorId)
          .map(s => [s.facilitatorId, { id: s.facilitatorId, name: s.facilitator }])
      ).values()];

      res.status(200).json({
        success: true,
        overview: {
          totalSeminars,
          onlineCount,
          inpersonCount,
          totalAttended,
          registeredAttended,
          guestAttended,
          avgAttendance,
          totalCredits,
          cancelledCount,
          completedCount,
        },
        monthlyData,
        seminars: seminarsData,
        mentors,
      });
    } catch (err) {
      console.error('❌ [GET ADMIN SEMINAR STATISTICS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// ===============================
// GET /api/academy/seminars/admin/search-attendee
// Глобално търсене на участник по име/имейл през всички семинари
// ===============================
seminarsController.get(
  '/admin/search-attendee',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_guest_attendance } = require('../sequelize/models/index');
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(200).json({ success: true, results: [] });
      }

      const search = q.trim();
      const likeSearch = `%${search}%`;

      // Search registered attendees
      const registeredResults = await student_seminar.findAll({
        include: [
          {
            model: student,
            as: 'student',
            attributes: ['id'],
            include: [{
              model: user_account,
              as: 'user',
              attributes: ['id', 'email'],
              where: {
                [Op.or]: [
                  { email: { [Op.iLike]: likeSearch } },
                ],
              },
              include: [{
                model: user_details,
                as: 'details',
                attributes: ['firstName', 'lastName', 'phoneNumber'],
                required: false,
              }],
            }],
            required: true,
          },
          {
            model: seminar,
            as: 'seminar',
            attributes: ['id', 'title', 'scheduledDate', 'isOnline', 'location'],
          },
        ],
        attributes: ['id', 'attended', 'earnedCredits', 'status', 'participationLevel', 'createdAt'],
      });

      // Also search by name in user_details
      const registeredByName = await student_seminar.findAll({
        include: [
          {
            model: student,
            as: 'student',
            attributes: ['id'],
            include: [{
              model: user_account,
              as: 'user',
              attributes: ['id', 'email'],
              include: [{
                model: user_details,
                as: 'details',
                attributes: ['firstName', 'lastName', 'phoneNumber'],
                where: {
                  [Op.or]: [
                    { firstName: { [Op.iLike]: likeSearch } },
                    { lastName: { [Op.iLike]: likeSearch } },
                  ],
                },
                required: true,
              }],
            }],
            required: true,
          },
          {
            model: seminar,
            as: 'seminar',
            attributes: ['id', 'title', 'scheduledDate', 'isOnline', 'location'],
          },
        ],
        attributes: ['id', 'attended', 'earnedCredits', 'status', 'participationLevel', 'createdAt'],
      });

      // Search guest attendees
      const guestResults = await seminar_guest_attendance.findAll({
        where: {
          [Op.or]: [
            { guestFirstName: { [Op.iLike]: likeSearch } },
            { guestLastName: { [Op.iLike]: likeSearch } },
            { guestEmail: { [Op.iLike]: likeSearch } },
          ],
        },
        include: [{
          model: seminar,
          as: 'seminar',
          attributes: ['id', 'title', 'scheduledDate', 'isOnline', 'location'],
        }],
        attributes: ['id', 'guestFirstName', 'guestLastName', 'guestEmail', 'guestPhone', 'participationLevel', 'createdAt'],
      });

      // Merge and deduplicate registered results
      const seenRegIds = new Set();
      const allRegistered = [...registeredResults, ...registeredByName].filter(r => {
        if (seenRegIds.has(r.id)) return false;
        seenRegIds.add(r.id);
        return true;
      });

      // Format results
      const results = [];

      allRegistered.forEach(r => {
        const plain = r.get({ plain: true });
        const user = plain.student?.user;
        results.push({
          type: 'registered',
          firstName: user?.details?.firstName || '',
          lastName: user?.details?.lastName || '',
          email: user?.email || '',
          phone: user?.details?.phoneNumber || '',
          seminarId: plain.seminar?.id,
          seminarTitle: plain.seminar?.title,
          seminarDate: plain.seminar?.scheduledDate,
          seminarIsOnline: plain.seminar?.isOnline,
          seminarLocation: plain.seminar?.location,
          attended: plain.attended,
          earnedCredits: plain.earnedCredits || 0,
          status: plain.status,
          participationLevel: plain.participationLevel,
          registeredAt: plain.createdAt,
        });
      });

      guestResults.forEach(g => {
        const plain = g.get({ plain: true });
        results.push({
          type: 'guest',
          firstName: plain.guestFirstName,
          lastName: plain.guestLastName,
          email: plain.guestEmail || '',
          phone: plain.guestPhone || '',
          seminarId: plain.seminar?.id,
          seminarTitle: plain.seminar?.title,
          seminarDate: plain.seminar?.scheduledDate,
          seminarIsOnline: plain.seminar?.isOnline,
          seminarLocation: plain.seminar?.location,
          attended: true,
          participationLevel: plain.participationLevel,
          registeredAt: plain.createdAt,
        });
      });

      // Sort by date descending
      results.sort((a, b) => new Date(b.seminarDate || 0) - new Date(a.seminarDate || 0));

      res.status(200).json({ success: true, results, total: results.length });
    } catch (err) {
      console.error('❌ [SEARCH ATTENDEE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/admin/send-email
// Изпращане на лично съобщение до участник в семинар
// ===============================
seminarsController.post(
  '/admin/send-email',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { to, recipientName, subject, message } = req.body;

      if (!to || !subject || !message) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: to, subject, message',
        });
      }

      // Get sender name
      const sender = await user_account.findByPk(req.user.userId, {
        include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
      });
      const senderName = sender?.details
        ? `${sender.details.firstName || ''} ${sender.details.lastName || ''}`.trim()
        : 'Екипът на DigiBridge Academy';

      const emailData = seminarEmailTemplates.personalMessage({
        recipientName: recipientName || '',
        subject,
        message,
        senderName,
      });

      await forwardEmailsViaZoho({
        userEmail: sender?.email,
        subject: emailData.subject,
        toAddresses: to,
        formattedBody: emailData.html,
      });

      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (err) {
      console.error('❌ [SEND SEMINAR EMAIL] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/admin/export-report
// PDF доклад за семинари
// ===============================
seminarsController.get(
  '/admin/export-report',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_guest_attendance } = require('../sequelize/models/index');
      const PDFDocument = require('pdfkit');
      const path = require('path');
      const fs = require('fs');
      const { period = 'all', type = 'all', status: statusParam = 'all', month: qMonth, year: qYear } = req.query;

      // Build where (same as statistics endpoint)
      let dateFilter = {};
      const now = new Date();
      if (qMonth && qYear) {
        // Specific month/year filter (for monthly reports)
        const m = parseInt(qMonth);
        const y = parseInt(qYear);
        if (m >= 1 && m <= 12 && y >= 2020) {
          const startDate = new Date(y, m - 1, 1);
          const endDate = new Date(y, m, 0, 23, 59, 59);
          dateFilter = { scheduledDate: { [Op.between]: [startDate, endDate] } };
        }
      } else if (period !== 'all') {
        const days = { '7': 7, '30': 30, '180': 180, '365': 365 };
        const d = days[period];
        if (d) {
          const from = new Date(now);
          from.setDate(from.getDate() - d);
          dateFilter = { scheduledDate: { [Op.gte]: from } };
        }
      }
      let typeFilter = {};
      if (type === 'online') typeFilter = { isOnline: true };
      else if (type === 'inperson') typeFilter = { isOnline: false };
      let statusFilter = {};
      if (statusParam !== 'all' && ['scheduled', 'completed', 'cancelled', 'live'].includes(statusParam)) {
        statusFilter = { status: statusParam };
      }
      const where = { ...dateFilter, ...typeFilter, ...statusFilter };

      // Fetch seminars
      const seminarsData = await seminar.findAll({
        where,
        include: [
          { model: mentor, as: 'facilitator', attributes: ['id', 'name'] },
          { model: student_seminar, as: 'attendances', attributes: ['id', 'attended', 'earnedCredits'] },
          { model: seminar_guest_attendance, as: 'guestAttendances', attributes: ['id'] },
        ],
        attributes: ['id', 'title', 'isOnline', 'location', 'scheduledDate', 'registeredCount', 'status'],
        order: [['scheduledDate', 'DESC']],
      });

      const rows = seminarsData.map(s => {
        const plain = s.get({ plain: true });
        const regAtt = (plain.attendances || []).filter(a => a.attended).length;
        const guestAtt = (plain.guestAttendances || []).length;
        const credits = (plain.attendances || []).reduce((sum, a) => sum + (a.earnedCredits || 0), 0);
        return {
          date: plain.scheduledDate ? new Date(plain.scheduledDate).toLocaleDateString('bg-BG') : '—',
          title: plain.title || '',
          location: plain.isOnline ? 'Онлайн' : (plain.location || '—'),
          facilitator: plain.facilitator?.name || '—',
          registered: plain.registeredCount || 0,
          regAttended: regAtt,
          guestAttended: guestAtt,
          total: regAtt + guestAtt,
          credits,
          status: plain.status,
        };
      });

      // Overview
      const totalSeminars = rows.length;
      const totalAttended = rows.reduce((s, r) => s + r.total, 0);
      const totalCredits = rows.reduce((s, r) => s + r.credits, 0);

      // Period label
      const periodLabels = { '7': '7 дни', '30': '30 дни', '180': '6 месеца', '365': '1 година', 'all': 'Всички' };
      const typeLabels = { 'all': 'Всички', 'online': 'Онлайн', 'inperson': 'Присъствени' };

      // Generate PDF
      const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="seminar-report-${new Date().toISOString().slice(0, 10)}.pdf"`);
      doc.pipe(res);

      // Font
      const fontPath = path.join(__dirname, '..', 'fonts', 'DejaVuSans.ttf');
      const hasFont = fs.existsSync(fontPath);
      if (hasFont) doc.registerFont('CyrFont', fontPath);
      const font = hasFont ? 'CyrFont' : 'Helvetica';

      // Header with logos
      const cifLogoPath = path.join(__dirname, '..', '..', '..', 'client', 'public', 'images', 'partners', 'CIF_logo_black_rgb.png');
      const pensaLogoPath = path.join(__dirname, '..', '..', '..', 'client', 'public', 'images', 'homePage', 'logo-2.png');
      const headerY = 30;
      const pageW = doc.page.width;

      if (fs.existsSync(cifLogoPath)) {
        doc.image(cifLogoPath, 40, headerY, { height: 40 });
      }
      doc.font(font).fontSize(13).fillColor('#1f2937');
      doc.text('DigiBridge Academy', 0, headerY + 5, { align: 'center', width: pageW });
      doc.font(font).fontSize(8).fillColor('#6b7280');
      doc.text('Фондация ПЕНСА', 0, headerY + 22, { align: 'center', width: pageW });
      if (fs.existsSync(pensaLogoPath)) {
        doc.image(pensaLogoPath, pageW - 40 - 40, headerY, { height: 40 });
      }

      doc.y = headerY + 50;
      doc.moveDown(0.5);
      doc.font(font).fontSize(12).fillColor('#8b2040').text('Доклад за семинари', { align: 'center' });
      doc.font(font).fontSize(8).fillColor('#6b7280').text(`Генериран: ${new Date().toLocaleString('bg-BG')}`, { align: 'center' });
      doc.moveDown(1);

      // Overview box
      doc.font(font).fontSize(9).fillColor('#374151');
      doc.text(`Период: ${periodLabels[period] || period}    |    Тип: ${typeLabels[type] || type}    |    Семинари: ${totalSeminars}    |    Присъствали: ${totalAttended}    |    Кредити: ${totalCredits}`, { align: 'center' });
      doc.moveDown(1);

      // Table
      const headers = ['Дата', 'Заглавие', 'Място', 'Лектор', 'Записани', 'Рег.', 'Гости', 'Общо', 'Кредити'];
      const colWidths = [55, 120, 70, 75, 40, 35, 35, 35, 45];
      const pageWidth = doc.page.width - 80;
      const totalW = colWidths.reduce((a, b) => a + b, 0);
      const scale = pageWidth / totalW;
      const sw = colWidths.map(w => Math.floor(w * scale));
      const startX = 40;
      let y = doc.y + 5;
      const rh = 18;

      // Header row
      doc.fontSize(7).font(font);
      let x = startX;
      headers.forEach((h, i) => {
        doc.rect(x, y, sw[i], rh).fillAndStroke('#8b2040', '#8b2040');
        doc.fillColor('#fff').text(h, x + 3, y + 4, { width: sw[i] - 6, height: rh - 4, ellipsis: true });
        x += sw[i];
      });
      y += rh;

      // Data rows
      doc.font(font).fontSize(6.5);
      rows.forEach((row, ri) => {
        if (y + rh > doc.page.height - 40) {
          doc.addPage({ size: 'A4', margin: 40 });
          y = 40;
        }
        const bg = ri % 2 === 0 ? '#ffffff' : '#f5f3f0';
        const vals = [row.date, row.title, row.location, row.facilitator, row.registered, row.regAttended, row.guestAttended, row.total, row.credits];
        x = startX;
        vals.forEach((v, ci) => {
          doc.rect(x, y, sw[ci], rh).fillAndStroke(bg, '#ddd');
          doc.fillColor('#222').text(String(v), x + 3, y + 4, { width: sw[ci] - 6, height: rh - 4, ellipsis: true });
          x += sw[ci];
        });
        y += rh;
      });

      doc.end();
    } catch (err) {
      console.error('❌ [EXPORT REPORT] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/admin/export-attendees/:id
// PDF списък присъстващи за конкретен семинар
// ===============================
seminarsController.get(
  '/admin/export-attendees/:id',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_guest_attendance } = require('../sequelize/models/index');
      const PDFDocument = require('pdfkit');
      const path = require('path');
      const fs = require('fs');
      const seminarId = parseInt(req.params.id);

      const seminarData = await seminar.findByPk(seminarId, {
        attributes: ['id', 'title', 'scheduledDate', 'location', 'isOnline'],
        include: [{ model: mentor, as: 'facilitator', attributes: ['name'] }],
      });

      if (!seminarData) {
        return res.status(404).json({ success: false, message: 'Seminar not found' });
      }

      // Registered
      const registered = await student_seminar.findAll({
        where: { seminarId },
        include: [{
          model: student, as: 'student', attributes: ['id'],
          include: [{
            model: user_account, as: 'user', attributes: ['email'],
            include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName', 'phoneNumber'] }],
          }],
        }],
        attributes: ['id', 'status', 'attended'],
      });

      // Guests
      const guests = await seminar_guest_attendance.findAll({
        where: { seminarId },
        attributes: ['id', 'guestFirstName', 'guestLastName', 'guestEmail', 'guestPhone'],
      });

      // Build rows
      const allRows = [];
      registered.forEach(r => {
        const p = r.get({ plain: true });
        const u = p.student?.user;
        allRows.push({
          name: `${u?.details?.firstName || ''} ${u?.details?.lastName || ''}`.trim() || '—',
          email: u?.email || '—',
          phone: u?.details?.phoneNumber || '—',
          type: 'Платформа',
        });
      });
      guests.forEach(g => {
        const p = g.get({ plain: true });
        allRows.push({
          name: `${p.guestFirstName || ''} ${p.guestLastName || ''}`.trim() || '—',
          email: p.guestEmail || '—',
          phone: p.guestPhone || '—',
          type: 'Гост',
        });
      });

      const dateStr = seminarData.scheduledDate
        ? new Date(seminarData.scheduledDate).toLocaleDateString('bg-BG', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';

      // Generate PDF
      const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="attendees-${seminarId}-${new Date().toISOString().slice(0, 10)}.pdf"`);
      doc.pipe(res);

      const fontPath = path.join(__dirname, '..', 'fonts', 'DejaVuSans.ttf');
      const hasFont = fs.existsSync(fontPath);
      if (hasFont) doc.registerFont('CyrFont', fontPath);
      const font = hasFont ? 'CyrFont' : 'Helvetica';

      // Header with logos
      const cifLogoPath = path.join(__dirname, '..', '..', '..', 'client', 'public', 'images', 'partners', 'CIF_logo_black_rgb.png');
      const pensaLogoPath = path.join(__dirname, '..', '..', '..', 'client', 'public', 'images', 'homePage', 'logo-2.png');
      const headerY = 30;
      const pageW = doc.page.width;

      if (fs.existsSync(cifLogoPath)) {
        doc.image(cifLogoPath, 40, headerY, { height: 40 });
      }
      doc.font(font).fontSize(13).fillColor('#1f2937');
      doc.text('DigiBridge Academy', 0, headerY + 5, { align: 'center', width: pageW });
      doc.font(font).fontSize(8).fillColor('#6b7280');
      doc.text('Фондация ПЕНСА', 0, headerY + 22, { align: 'center', width: pageW });
      if (fs.existsSync(pensaLogoPath)) {
        doc.image(pensaLogoPath, pageW - 40 - 40, headerY, { height: 40 });
      }

      doc.y = headerY + 50;
      doc.moveDown(0.5);
      doc.font(font).fontSize(12).fillColor('#8b2040').text('Списък на участници', { align: 'center' });
      doc.moveDown(0.5);

      // Seminar info
      doc.font(font).fontSize(10).fillColor('#374151').text(seminarData.title, { align: 'center' });
      doc.font(font).fontSize(8).fillColor('#6b7280');
      doc.text(`Дата: ${dateStr}    |    Място: ${seminarData.isOnline ? 'Онлайн' : (seminarData.location || '—')}    |    Лектор: ${seminarData.facilitator?.name || '—'}`, { align: 'center' });
      doc.text(`Общо участници: ${allRows.length} (${registered.length} регистрирани + ${guests.length} гости)`, { align: 'center' });
      doc.moveDown(1);

      // Table
      const headers = ['№', 'Име', 'Имейл', 'Телефон', 'Тип'];
      const colWidths = [25, 140, 160, 90, 60];
      const pageWidth = doc.page.width - 80;
      const totalW = colWidths.reduce((a, b) => a + b, 0);
      const scale = pageWidth / totalW;
      const sw = colWidths.map(w => Math.floor(w * scale));
      const startX = 40;
      let y = doc.y + 5;
      const rh = 18;

      // Header
      doc.fontSize(7).font(font);
      let x = startX;
      headers.forEach((h, i) => {
        doc.rect(x, y, sw[i], rh).fillAndStroke('#8b2040', '#8b2040');
        doc.fillColor('#fff').text(h, x + 3, y + 4, { width: sw[i] - 6, height: rh - 4, ellipsis: true });
        x += sw[i];
      });
      y += rh;

      // Data
      doc.font(font).fontSize(7);
      allRows.forEach((row, ri) => {
        if (y + rh > doc.page.height - 40) {
          doc.addPage({ size: 'A4', margin: 40 });
          y = 40;
        }
        const bg = ri % 2 === 0 ? '#ffffff' : '#f5f3f0';
        const vals = [ri + 1, row.name, row.email, row.phone, row.type];
        x = startX;
        vals.forEach((v, ci) => {
          doc.rect(x, y, sw[ci], rh).fillAndStroke(bg, '#ddd');
          doc.fillColor('#222').text(String(v), x + 3, y + 4, { width: sw[ci] - 6, height: rh - 4, ellipsis: true });
          x += sw[ci];
        });
        y += rh;
      });

      doc.end();
    } catch (err) {
      console.error('❌ [EXPORT ATTENDEES] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/:id/attendance-list
// Качване на физически списък
// ===============================
seminarsController.post(
  '/:id/attendance-list',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_attendance_list } = require('../sequelize/models/index');
      const seminarId = parseInt(req.params.id);
      const { fileUrl, fileName, fileType, fileSize, notes } = req.body;

      if (!fileUrl || !fileName) {
        return res.status(400).json({ success: false, message: 'fileUrl and fileName are required' });
      }

      const record = await seminar_attendance_list.create({
        seminarId,
        uploadedBy: req.user.userId,
        fileUrl,
        fileName,
        fileType: fileType || null,
        fileSize: fileSize || null,
        notes: notes || null,
      });

      res.status(201).json({ success: true, record });
    } catch (err) {
      console.error('❌ [CREATE ATTENDANCE LIST] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/:id/attendance-lists
// Списък качени физически списъци
// ===============================
seminarsController.get(
  '/:id/attendance-lists',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_attendance_list } = require('../sequelize/models/index');
      const seminarId = parseInt(req.params.id);

      const lists = await seminar_attendance_list.findAll({
        where: { seminarId },
        include: [{
          model: user_account,
          as: 'uploader',
          attributes: ['id', 'email'],
          include: [{ model: user_details, as: 'details', attributes: ['firstName', 'lastName'] }],
        }],
        order: [['createdAt', 'DESC']],
      });

      const data = lists.map(l => {
        const plain = l.get({ plain: true });
        return {
          ...plain,
          uploaderName: plain.uploader?.details
            ? `${plain.uploader.details.firstName || ''} ${plain.uploader.details.lastName || ''}`.trim()
            : plain.uploader?.email || '—',
        };
      });

      res.status(200).json({ success: true, lists: data });
    } catch (err) {
      console.error('❌ [GET ATTENDANCE LISTS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/seminars/:id/attendance-list/:listId
// Изтриване на физически списък
// ===============================
seminarsController.delete(
  '/:id/attendance-list/:listId',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_attendance_list } = require('../sequelize/models/index');
      const listId = parseInt(req.params.listId);

      const record = await seminar_attendance_list.findByPk(listId);
      if (!record) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }

      await record.destroy();
      res.status(200).json({ success: true, message: 'Deleted' });
    } catch (err) {
      console.error('❌ [DELETE ATTENDANCE LIST] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/admin/library/seminars
// Paginated seminars list with media counts per type
// ===============================
seminarsController.get(
  '/admin/library/seminars',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_media } = require('../sequelize/models/index');
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 15;
      const offset = (page - 1) * limit;
      const { search, mentorId } = req.query;

      const where = {};
      if (search) {
        where.title = { [Op.iLike]: `%${search}%` };
      }
      if (mentorId) {
        where.facilitatorId = parseInt(mentorId);
      }

      const { count, rows } = await seminar.findAndCountAll({
        where,
        attributes: ['id', 'title', 'slug', 'scheduledDate', 'isOnline', 'location', 'status'],
        include: [
          { model: mentor, as: 'facilitator', attributes: ['id', 'name'], required: false },
        ],
        order: [['scheduledDate', 'DESC']],
        limit,
        offset,
        distinct: true,
      });

      const seminarIds = rows.map(s => s.id);

      // Get media counts per type for all seminars in one query
      let mediaCounts = {};
      if (seminarIds.length > 0) {
        const counts = await seminar_media.findAll({
          where: { seminarId: { [Op.in]: seminarIds } },
          attributes: [
            'seminarId',
            'mediaType',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          ],
          group: ['seminarId', 'mediaType'],
          raw: true,
        });

        for (const row of counts) {
          if (!mediaCounts[row.seminarId]) {
            mediaCounts[row.seminarId] = { photos: 0, videos: 0, documents: 0, presentations: 0 };
          }
          const type = row.mediaType;
          if (type === 'photo') mediaCounts[row.seminarId].photos = parseInt(row.count);
          else if (type === 'video') mediaCounts[row.seminarId].videos = parseInt(row.count);
          else if (type === 'document') mediaCounts[row.seminarId].documents = parseInt(row.count);
          else if (type === 'presentation') mediaCounts[row.seminarId].presentations = parseInt(row.count);
        }
      }

      // Get attendance list counts
      let attendanceListCounts = {};
      if (seminarIds.length > 0) {
        const { seminar_attendance_list } = require('../sequelize/models/index');
        if (seminar_attendance_list) {
          const alCounts = await seminar_attendance_list.findAll({
            where: { seminarId: { [Op.in]: seminarIds } },
            attributes: [
              'seminarId',
              [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            ],
            group: ['seminarId'],
            raw: true,
          });
          for (const row of alCounts) {
            attendanceListCounts[row.seminarId] = parseInt(row.count);
          }
        }
      }

      const seminars = rows.map(s => {
        const plain = s.get({ plain: true });
        const counts = mediaCounts[plain.id] || { photos: 0, videos: 0, documents: 0, presentations: 0 };
        counts.attendanceLists = attendanceListCounts[plain.id] || 0;
        return {
          id: plain.id,
          title: plain.title,
          slug: plain.slug,
          scheduledDate: plain.scheduledDate,
          isOnline: plain.isOnline,
          location: plain.location,
          facilitator: plain.facilitator?.name || null,
          status: plain.status,
          mediaCounts: counts,
        };
      });

      res.status(200).json({
        success: true,
        seminars,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (err) {
      console.error('❌ [GET LIBRARY SEMINARS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/:id/media
// All media for a seminar, optionally filtered by type
// ===============================
seminarsController.get(
  '/:id/media',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_media } = require('../sequelize/models/index');
      const seminarId = parseInt(req.params.id);

      const seminarRecord = await seminar.findByPk(seminarId);
      if (!seminarRecord) {
        return res.status(404).json({ success: false, message: 'Seminar not found' });
      }

      const { type } = req.query;
      const where = { seminarId };
      const validTypes = ['photo', 'video', 'document', 'presentation'];
      if (type && type !== 'all' && validTypes.includes(type)) {
        where.mediaType = type;
      }

      const media = await seminar_media.findAll({
        where,
        include: [
          {
            model: user_account,
            as: 'uploader',
            attributes: ['id'],
            include: [
              {
                model: user_details,
                as: 'details',
                attributes: ['firstName', 'lastName'],
                required: false,
              },
            ],
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      const result = media.map(m => {
        const plain = m.get({ plain: true });
        const uploaderDetail = plain.uploader?.details;
        return {
          ...plain,
          uploaderName: uploaderDetail
            ? `${uploaderDetail.firstName || ''} ${uploaderDetail.lastName || ''}`.trim()
            : null,
        };
      });

      res.status(200).json({ success: true, media: result });
    } catch (err) {
      console.error('❌ [GET SEMINAR MEDIA] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/:id/media
// Upload media record for a seminar
// ===============================
seminarsController.post(
  '/:id/media',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_media } = require('../sequelize/models/index');
      const seminarId = parseInt(req.params.id);

      const seminarRecord = await seminar.findByPk(seminarId);
      if (!seminarRecord) {
        return res.status(404).json({ success: false, message: 'Seminar not found' });
      }

      const { mediaType, fileUrl, fileName, fileType, fileSize, thumbnailUrl, youtubeVideoId, notes } = req.body;

      // Validate mediaType
      const validTypes = ['photo', 'video', 'document', 'presentation'];
      if (!mediaType || !validTypes.includes(mediaType)) {
        return res.status(400).json({ success: false, message: 'Invalid mediaType. Must be one of: photo, video, document, presentation' });
      }

      // Validate required fields
      if (!fileUrl) {
        return res.status(400).json({ success: false, message: 'fileUrl is required' });
      }
      if (!fileName) {
        return res.status(400).json({ success: false, message: 'fileName is required' });
      }

      const record = await seminar_media.create({
        seminarId,
        uploadedBy: req.user.userId,
        mediaType,
        fileUrl,
        fileName,
        fileType: fileType || null,
        fileSize: fileSize ? parseInt(fileSize) : null,
        thumbnailUrl: thumbnailUrl || null,
        youtubeVideoId: youtubeVideoId || null,
        notes: notes || null,
      });

      res.status(201).json({ success: true, data: record });
    } catch (err) {
      console.error('❌ [POST SEMINAR MEDIA] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/seminars/:id/media/:mediaId
// Delete a media record from a seminar
// ===============================
seminarsController.delete(
  '/:id/media/:mediaId',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_media } = require('../sequelize/models/index');
      const seminarId = parseInt(req.params.id);
      const mediaId = parseInt(req.params.mediaId);

      const record = await seminar_media.findByPk(mediaId);
      if (!record) {
        return res.status(404).json({ success: false, message: 'Media record not found' });
      }

      // Verify media belongs to the correct seminar
      if (record.seminarId !== seminarId) {
        return res.status(400).json({ success: false, message: 'Media does not belong to this seminar' });
      }

      // If video with YouTube ID, try to delete from YouTube (fire-and-forget)
      if (record.mediaType === 'video' && record.youtubeVideoId) {
        (async () => {
          try {
            const { deleteVideo, setCredentials } = require('../utils/youtubeService');
            const p = require('path');
            const f = require('fs');
            const tDir = p.join(__dirname, '../../youtube-tokens');
            const tFile = f.existsSync(tDir) && f.statSync(tDir).isDirectory()
              ? p.join(tDir, 'tokens.json') : p.join(__dirname, '../../youtube-tokens.json');
            if (f.existsSync(tFile)) {
              setCredentials(JSON.parse(f.readFileSync(tFile, 'utf8')));
              await deleteVideo(record.youtubeVideoId);
            }
          } catch (e) { console.error('YT delete skip:', e?.message); }
        })();
      }

      await record.destroy();
      res.status(200).json({ success: true, message: 'Media deleted successfully' });
    } catch (err) {
      console.error('❌ [DELETE SEMINAR MEDIA] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/admin/reports
// Paginated monthly reports
// ===============================
seminarsController.get(
  '/admin/reports',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_monthly_report } = require('../sequelize/models/index');
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;

      const where = {};
      if (req.query.year) {
        where.year = parseInt(req.query.year);
      }

      const { count, rows } = await seminar_monthly_report.findAndCountAll({
        where,
        include: [
          {
            model: user_account,
            as: 'generator',
            attributes: ['id'],
            include: [
              {
                model: user_details,
                as: 'details',
                attributes: ['firstName', 'lastName'],
                required: false,
              },
            ],
            required: false,
          },
        ],
        order: [['year', 'DESC'], ['month', 'DESC']],
        limit,
        offset,
      });

      const reports = rows.map(r => {
        const plain = r.get({ plain: true });
        const generatorDetail = plain.generator?.details;
        return {
          ...plain,
          generatorName: generatorDetail
            ? `${generatorDetail.firstName || ''} ${generatorDetail.lastName || ''}`.trim()
            : null,
        };
      });

      res.status(200).json({
        success: true,
        reports,
        pagination: {
          total: count,
          page,
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (err) {
      console.error('❌ [GET REPORTS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/admin/reports/generate
// Генерира месечен доклад — изчислява stats за месеца и записва metadata
// ===============================
seminarsController.post(
  '/admin/reports/generate',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_monthly_report, seminar_guest_attendance } = require('../sequelize/models/index');
      const { month, year } = req.body;

      const parsedMonth = parseInt(month);
      if (!parsedMonth || parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ success: false, message: 'Month must be between 1 and 12' });
      }

      const parsedYear = parseInt(year);
      if (!parsedYear || parsedYear < 2020 || parsedYear > 2100) {
        return res.status(400).json({ success: false, message: 'Year must be between 2020 and 2100' });
      }

      // Check duplicate
      const existing = await seminar_monthly_report.findOne({
        where: { month: parsedMonth, year: parsedYear },
      });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Report for this month/year already exists' });
      }

      // Calculate stats for the month
      const startDate = new Date(parsedYear, parsedMonth - 1, 1);
      const endDate = new Date(parsedYear, parsedMonth, 0, 23, 59, 59);

      const monthSeminars = await seminar.findAll({
        where: { scheduledDate: { [Op.between]: [startDate, endDate] } },
        attributes: ['id'],
      });
      const seminarIds = monthSeminars.map(s => s.id);

      let attendeesCount = 0;
      let creditsCount = 0;
      if (seminarIds.length > 0) {
        const regAttended = await student_seminar.count({ where: { seminarId: { [Op.in]: seminarIds }, attended: true } });
        const guestAttended = await seminar_guest_attendance.count({ where: { seminarId: { [Op.in]: seminarIds } } });
        attendeesCount = regAttended + guestAttended;

        const creditsResult = await student_seminar.findOne({
          where: { seminarId: { [Op.in]: seminarIds } },
          attributes: [[sequelize.fn('SUM', sequelize.col('earned_credits')), 'total']],
          raw: true,
        });
        creditsCount = parseInt(creditsResult?.total) || 0;
      }

      const record = await seminar_monthly_report.create({
        month: parsedMonth,
        year: parsedYear,
        fileUrl: '',
        generatedBy: req.user.userId,
        seminarsCount: seminarIds.length,
        attendeesCount,
        creditsCount,
      });

      res.status(201).json({ success: true, data: record });
    } catch (err) {
      console.error('❌ [POST GENERATE REPORT] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/admin/reports/auto-generate
// Автоматично генерира доклади за всички минали месеци без запис
// ===============================
seminarsController.post(
  '/admin/reports/auto-generate',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_monthly_report, seminar_guest_attendance } = require('../sequelize/models/index');

      // Find earliest seminar date
      const earliest = await seminar.findOne({
        attributes: ['scheduledDate'],
        order: [['scheduledDate', 'ASC']],
        where: { scheduledDate: { [Op.ne]: null } },
      });

      if (!earliest) {
        return res.status(200).json({ success: true, generated: 0, message: 'No seminars found' });
      }

      const startDate = new Date(earliest.scheduledDate);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // Generate for each month from earliest to last completed month
      let generated = 0;
      let checkYear = startDate.getFullYear();
      let checkMonth = startDate.getMonth() + 1;

      while (checkYear < currentYear || (checkYear === currentYear && checkMonth < currentMonth)) {
        // Check if already exists
        const exists = await seminar_monthly_report.findOne({
          where: { month: checkMonth, year: checkYear },
        });

        if (!exists) {
          const mStart = new Date(checkYear, checkMonth - 1, 1);
          const mEnd = new Date(checkYear, checkMonth, 0, 23, 59, 59);

          const monthSeminars = await seminar.findAll({
            where: { scheduledDate: { [Op.between]: [mStart, mEnd] } },
            attributes: ['id'],
          });
          const ids = monthSeminars.map(s => s.id);

          if (ids.length > 0) {
            const regAtt = await student_seminar.count({ where: { seminarId: { [Op.in]: ids }, attended: true } });
            const guestAtt = await seminar_guest_attendance.count({ where: { seminarId: { [Op.in]: ids } } });

            const creditsRes = await student_seminar.findOne({
              where: { seminarId: { [Op.in]: ids } },
              attributes: [[sequelize.fn('SUM', sequelize.col('earned_credits')), 'total']],
              raw: true,
            });

            await seminar_monthly_report.create({
              month: checkMonth,
              year: checkYear,
              fileUrl: '',
              generatedBy: null,
              seminarsCount: ids.length,
              attendeesCount: regAtt + guestAtt,
              creditsCount: parseInt(creditsRes?.total) || 0,
            });
            generated++;
          }
        }

        // Next month
        checkMonth++;
        if (checkMonth > 12) { checkMonth = 1; checkYear++; }
      }

      res.status(200).json({ success: true, generated });
    } catch (err) {
      console.error('❌ [AUTO GENERATE REPORTS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/seminars/admin/reports/:reportId
// Delete a monthly report
// ===============================
seminarsController.delete(
  '/admin/reports/:reportId',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_monthly_report } = require('../sequelize/models/index');
      const reportId = parseInt(req.params.reportId);

      const record = await seminar_monthly_report.findByPk(reportId);
      if (!record) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      await record.destroy();
      res.status(200).json({ success: true, message: 'Report deleted successfully' });
    } catch (err) {
      console.error('❌ [DELETE REPORT] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/admin/attendance-detail/:id
// Детайлен списък присъстващи за конкретен семинар
// ===============================
seminarsController.get(
  '/admin/attendance-detail/:id',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { seminar_guest_attendance } = require('../sequelize/models/index');
      const seminarId = parseInt(req.params.id);

      const seminarData = await seminar.findByPk(seminarId, {
        attributes: ['id', 'title'],
      });

      if (!seminarData) {
        return res.status(404).json({ success: false, message: 'Seminar not found' });
      }

      // Registered attendees
      const registered = await student_seminar.findAll({
        where: { seminarId },
        include: [
          {
            model: student,
            as: 'student',
            attributes: ['id'],
            include: [{
              model: user_account,
              as: 'user',
              attributes: ['id', 'email'],
              include: [{
                model: user_details,
                as: 'details',
                attributes: ['firstName', 'lastName', 'phoneNumber'],
              }],
            }],
          },
        ],
        attributes: [
          'id', 'attended', 'attendedAt', 'earnedCredits', 'status',
          'participationLevel', 'notes', 'createdAt',
        ],
        order: [['createdAt', 'DESC']],
      });

      const registeredData = registered.map(r => {
        const plain = r.get({ plain: true });
        const user = plain.student?.user;
        return {
          id: plain.id,
          type: 'registered',
          firstName: user?.details?.firstName || '',
          lastName: user?.details?.lastName || '',
          email: user?.email || '',
          phone: user?.details?.phoneNumber || '',
          attended: plain.attended,
          attendedAt: plain.attendedAt,
          earnedCredits: plain.earnedCredits || 0,
          status: plain.status,
          participationLevel: plain.participationLevel,
          notes: plain.notes,
          registeredAt: plain.createdAt,
        };
      });

      // Guest attendees
      const guests = await seminar_guest_attendance.findAll({
        where: { seminarId },
        include: [
          {
            model: user_account,
            as: 'markedByUser',
            attributes: ['id', 'email'],
            required: false,
            include: [{
              model: user_details,
              as: 'details',
              attributes: ['firstName', 'lastName'],
            }],
          },
          {
            model: user_account,
            as: 'convertedUser',
            attributes: ['id', 'email'],
            required: false,
          },
        ],
        attributes: [
          'id', 'guestFirstName', 'guestLastName', 'guestEmail', 'guestPhone',
          'participationLevel', 'markedBy', 'convertedToUserId', 'createdAt',
        ],
        order: [['createdAt', 'DESC']],
      });

      const guestsData = guests.map(g => {
        const plain = g.get({ plain: true });
        const markerName = plain.markedByUser?.details
          ? `${plain.markedByUser.details.firstName || ''} ${plain.markedByUser.details.lastName || ''}`.trim()
          : plain.markedByUser?.email || null;

        return {
          id: plain.id,
          type: 'guest',
          firstName: plain.guestFirstName,
          lastName: plain.guestLastName,
          email: plain.guestEmail || '',
          phone: plain.guestPhone || '',
          participationLevel: plain.participationLevel,
          markedByName: markerName,
          convertedToUserId: plain.convertedToUserId,
          convertedEmail: plain.convertedUser?.email || null,
          registeredAt: plain.createdAt,
        };
      });

      // Combined "all" list
      const allAttendees = [
        ...registeredData,
        ...guestsData,
      ].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

      res.status(200).json({
        success: true,
        seminar: { id: seminarData.id, title: seminarData.title },
        all: allAttendees,
        registered: registeredData,
        guests: guestsData,
        counts: {
          all: allAttendees.length,
          registered: registeredData.length,
          guests: guestsData.length,
        },
      });
    } catch (err) {
      console.error('❌ [GET ATTENDANCE DETAIL] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/mentor/my
// Семинари на текущия ментор
// ===============================
seminarsController.get(
  '/mentor/my',
  isAuth,
  async (req, res, next) => {
    try {
      const userId = parseInt(req.user.userId);

      // Find the mentor record for this user
      const mentorRecord = await mentor.findOne({ where: { userId } });
      if (!mentorRecord) {
        return res.status(200).json({ success: true, seminars: [] });
      }

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const seminars = await seminar.findAll({
        where: {
          mentorId: mentorRecord.id,
          [Op.or]: [
            { scheduledDate: { [Op.gte]: thirtyDaysAgo } },
            { status: 'live' }
          ]
        },
        include: [
          {
            model: student_seminar,
            as: 'attendances',
            attributes: ['id', 'studentId', 'attended', 'participationLevel', 'earnedCredits', 'attendedAt', 'status'],
            required: false,
            include: [{
              model: student,
              as: 'student',
              attributes: ['id', 'avatar'],
              include: [{
                model: user_account,
                as: 'user',
                attributes: ['id', 'email'],
                include: [{
                  model: user_details,
                  as: 'details',
                  attributes: ['username', 'imageURL'],
                }]
              }]
            }]
          }
        ],
        order: [['scheduledDate', 'ASC']],
      });

      // Format attendances with names
      const formatted = seminars.map(s => {
        const plain = s.get({ plain: true });
        plain.attendances = (plain.attendances || []).map(a => ({
          id: a.id,
          studentId: a.studentId,
          attended: a.attended,
          participationLevel: a.participationLevel,
          earnedCredits: a.earnedCredits,
          attendedAt: a.attendedAt,
          status: a.status,
          name: a.student?.user?.details?.username || a.student?.user?.email?.split('@')[0] || `Студент #${a.studentId}`,
          avatar: a.student?.user?.details?.imageURL || a.student?.avatar || null,
          email: a.student?.user?.email || null,
        }));
        return plain;
      });

      res.json({ success: true, seminars: formatted });
    } catch (err) {
      console.error('❌ [GET MENTOR SEMINARS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/checkin/:seminarId
// Quick check-in via QR code
// ===============================
seminarsController.post('/checkin/:seminarId', isAuth, async (req, res, next) => {
    try {
        const seminarId = parseInt(req.params.seminarId);
        const userId = req.user.userId;

        const seminarData = await seminar.findByPk(seminarId);
        if (!seminarData) {
            return res.status(404).json({ success: false, message: 'Seminar not found' });
        }

        // Find student record
        const studentRecord = await student.findOne({ where: { userId } });
        if (!studentRecord) {
            return res.status(403).json({ success: false, message: 'Student record not found' });
        }

        // Check if already attended
        let attendance = await student_seminar.findOne({
            where: { seminarId, studentId: studentRecord.id }
        });

        if (attendance && attendance.attended) {
            return res.json({ success: true, message: 'Already checked in', alreadyAttended: true });
        }

        // Calculate credits (admins and mentors don't earn credits)
        const userRole = req.user.role;
        const isAdminOrMentor = userRole === 'admin' || (req.user.isMentor === true);
        let earnedCredits = isAdminOrMentor ? 0 : (seminarData.creditsForAttendance || 0);

        if (!attendance) {
            attendance = await student_seminar.create({
                seminarId,
                studentId: studentRecord.id,
                status: 'approved',
                attended: true,
                attendedAt: new Date(),
                participationLevel: 'passive',
                earnedCredits,
            });
        } else {
            await attendance.update({
                attended: true,
                attendedAt: new Date(),
                participationLevel: attendance.participationLevel || 'passive',
                earnedCredits,
            });
        }

        // Update count
        const attendedCount = await student_seminar.count({
            where: { seminarId, attended: true },
        });
        await seminarData.update({ attendedCount });

        res.json({ success: true, message: 'Checked in successfully', earnedCredits });
    } catch (err) {
        console.error('❌ [QR CHECKIN] Error:', err);
        next(err);
    }
});

// ===============================
// ADMIN REVIEW MANAGEMENT
// ===============================

// GET /api/academy/seminars/reviews/admin
// Admin: get all reviews (filterable by status)
seminarsController.get(
  '/reviews/admin',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { status: filterStatus } = req.query;
      const whereClause = {};
      if (filterStatus) whereClause.status = filterStatus;

      const reviews = await seminar_review.findAll({
        where: whereClause,
        include: [
          {
            model: seminar,
            as: 'seminar',
            attributes: ['id', 'title', 'slug']
          },
          {
            model: student,
            as: 'student',
            attributes: ['id'],
            include: [{
              model: user_account,
              as: 'user',
              attributes: ['id', 'email'],
              include: [{
                model: user_details,
                as: 'details',
                attributes: ['username', 'imageURL']
              }]
            }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      const formatted = reviews.map(r => ({
        id: r.id,
        seminarId: r.seminarId,
        seminarTitle: r.seminar?.title || '',
        seminarSlug: r.seminar?.slug || '',
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        createdAt: r.createdAt,
        author: {
          name: r.student?.user?.details?.username || r.student?.user?.email?.split('@')[0] || 'Unknown',
          avatar: r.student?.user?.details?.imageURL || null,
          email: r.student?.user?.email || ''
        }
      }));

      res.json({ success: true, reviews: formatted });
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
      next(err);
    }
  }
);

// POST /api/academy/seminars/reviews/:reviewId/approve
seminarsController.post(
  '/reviews/:reviewId/approve',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const review = await seminar_review.findByPk(req.params.reviewId);
      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

      await review.update({ status: 'approved' });

      // Recalculate avg rating with only approved reviews
      const approvedReviews = await seminar_review.findAll({
        where: { seminarId: review.seminarId, status: 'approved' },
        attributes: ['rating']
      });
      const avg = approvedReviews.length > 0
        ? Math.round((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length) * 10) / 10
        : null;
      await seminar.update({ rating: avg }, { where: { id: review.seminarId } });

      // Notify user that review was approved
      try {
        const studentRecord = await student.findByPk(review.studentId, {
            include: [{ model: user_account, as: 'user', attributes: ['id'] }]
        });
        const seminarData = await seminar.findByPk(review.seminarId, { attributes: ['title', 'slug'] });
        if (studentRecord?.user?.id) {
            await user_notification.create({
                userId: studentRecord.user.id,
                type: 'seminar_review_approved',
                title: 'Отзивът ви е одобрен',
                message: `Вашият отзив за "${seminarData?.title || 'семинар'}" беше одобрен и е публикуван.`,
                data: { seminarId: review.seminarId, slug: seminarData?.slug }
            });
        }
      } catch (notifErr) {
        console.error('Failed to create review approval notification:', notifErr);
      }

      res.json({ success: true, message: 'Review approved' });
    } catch (err) {
      console.error('Error approving review:', err);
      next(err);
    }
  }
);

// DELETE /api/academy/seminars/reviews/:reviewId
seminarsController.delete(
  '/reviews/:reviewId',
  isAuth,
  rbac.checkPermission('seminar', 'delete'),
  async (req, res, next) => {
    try {
      const review = await seminar_review.findByPk(req.params.reviewId);
      if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

      const seminarId = review.seminarId;
      await review.destroy();

      // Recalculate avg rating
      const approvedReviews = await seminar_review.findAll({
        where: { seminarId, status: 'approved' },
        attributes: ['rating']
      });
      const avg = approvedReviews.length > 0
        ? Math.round((approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length) * 10) / 10
        : null;
      await seminar.update({ rating: avg }, { where: { id: seminarId } });

      res.json({ success: true, message: 'Review deleted' });
    } catch (err) {
      console.error('Error deleting review:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/:slug
// Детайли за семинар (по slug)
// ===============================
seminarsController.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const isId = /^\d+$/.test(slug);
    const where = isId ? { id: parseInt(slug) } : { slug };

    const seminarData = await seminar.findOne({
      where,
      include: [
        {
          model: mentor,
          as: 'facilitator',
          attributes: ['id', 'name', 'photoUrl', 'specialization', 'email'],
        },
        {
          model: course,
          as: 'course',
          attributes: ['id', 'name', 'slug', 'category'],
        },
        {
          model: user_account,
          as: 'creator',
          attributes: ['id', 'email'],
        },
        {
          model: seminar_material,
          as: 'materials',
          where: { status: 'active' },
          required: false,
        },
      ],
    });

    if (!seminarData) {
      return res.status(404).json({
        success: false,
        message: 'Seminar not found',
      });
    }

    await seminarData.increment('viewsCount');

    res.status(200).json({
      success: true,
      seminar: seminarData,
    });
  } catch (err) {
    console.error('❌ [GET SEMINAR BY SLUG] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/seminars/id/:id
// Детайли за семинар (по ID - за admin)
// ===============================
seminarsController.get(
  '/id/:id',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);

      const seminarData = await seminar.findByPk(seminarId, {
        include: [
          {
            model: mentor,
            as: 'facilitator',
            attributes: ['id', 'name', 'photoUrl', 'specialization', 'email'],
          },
          {
            model: course,
            as: 'course',
            attributes: ['id', 'name', 'slug'],
          },
          {
            model: user_account,
            as: 'creator',
            attributes: ['id', 'email'],
          },
          {
            model: seminar_material,
            as: 'materials',
          },
          {
            model: student_seminar,
            as: 'attendances',
            include: [
              {
                model: student,
                as: 'student',
                attributes: ['id', 'userId'],
                include: [
                  {
                    model: user_account,
                    as: 'user',
                    attributes: ['email'],
                    include: [
                      {
                        model: user_details,
                        as: 'details',
                        attributes: ['username', 'firstName', 'lastName'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      res.status(200).json({
        success: true,
        seminar: seminarData,
      });
    } catch (err) {
      console.error('❌ [GET SEMINAR BY ID] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars
// Създаване на семинар
// ===============================
seminarsController.post(
  '/',
  isAuth,
  rbac.checkPermission('seminar', 'create'),
  validateBody(seminarCreateSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;

      const {
        title,
        shortDescription,
        description,
        category,
        courseId,
        mentorId,
        seminarType,
        isOnline,
        location,
        address,
        meetingLink,
        meetingPassword,
        secondaryLink,
        videoProvider,
        videoUrl,
        thumbnailUrl,
        scheduledDate,
        scheduledEndDate,
        durationMinutes,
        timezone,
        maxParticipants,
        minParticipants,
        requiresRegistration,
        requiresApproval,
        isPublic,
        maxCredits,
        creditsForAttendance,
        creditsForParticipation,
        creditsForTest,
        hasTest,
        testPassingScore,
        hasAssignment,
        assignmentDescription,
        tags,
        prerequisites,
        whatToBring,
      } = req.body;

      const slug = await generateUniqueSlug(title);

      const newSeminar = await seminar.create({
        createdBy: userId,
        courseId: courseId || null,
        mentorId: mentorId || null,
        slug,
        title,
        shortDescription,
        description,
        category,
        seminarType,
        isOnline,
        location,
        address,
        meetingLink,
        meetingPassword,
        secondaryLink,
        videoProvider,
        videoUrl,
        thumbnailUrl,
        scheduledDate,
        scheduledEndDate,
        durationMinutes,
        timezone,
        maxParticipants,
        minParticipants,
        requiresRegistration,
        requiresApproval,
        isPublic,
        maxCredits,
        creditsForAttendance,
        creditsForParticipation,
        creditsForTest,
        hasTest,
        testPassingScore,
        hasAssignment,
        assignmentDescription,
        tags,
        prerequisites,
        whatToBring,
        status: 'scheduled',
        isPublished: false,
      });

      res.status(201).json({
        success: true,
        message: 'Seminar created successfully',
        seminar: newSeminar,
      });
    } catch (err) {
      console.error('❌ [CREATE SEMINAR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/seminars/:id
// Редактиране на семинар
// ===============================
seminarsController.put(
  '/:id',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  validateBody(seminarUpdateSchema),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);
      const updates = req.body;

      const seminarData = await seminar.findByPk(seminarId);

      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      if (updates.title && updates.title !== seminarData.title) {
        updates.slug = await generateUniqueSlug(updates.title, seminarId);
      }

      await seminarData.update(updates);

      res.status(200).json({
        success: true,
        message: 'Seminar updated successfully',
        seminar: seminarData,
      });
    } catch (err) {
      console.error('❌ [UPDATE SEMINAR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/seminars/:id
// Изтриване на семинар
// ===============================
seminarsController.delete(
  '/:id',
  isAuth,
  rbac.checkPermission('seminar', 'delete'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);

      const seminarData = await seminar.findByPk(seminarId);

      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      // Delete all registrations, guest attendances, and related data first
      await student_seminar.destroy({ where: { seminarId } });

      try {
        const { seminar_guest_attendance } = require('../sequelize/models/index');
        await seminar_guest_attendance.destroy({ where: { seminarId } });
      } catch (e) {}

      try {
        const { seminar_review } = require('../sequelize/models/index');
        await seminar_review.destroy({ where: { seminar_id: seminarId } });
      } catch (e) {}

      await seminarData.destroy();

      res.status(200).json({
        success: true,
        message: 'Seminar deleted successfully',
      });
    } catch (err) {
      console.error('❌ [DELETE SEMINAR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/:id/publish
// Публикуване на семинар
// ===============================
seminarsController.post(
  '/:id/publish',
  isAuth,
  rbac.checkPermission('seminar', 'publish'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);

      const seminarData = await seminar.findByPk(seminarId);

      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      if (seminarData.isPublished) {
        return res.status(400).json({
          success: false,
          message: 'Seminar is already published',
        });
      }

      if (!seminarData.title || !seminarData.scheduledDate) {
        return res.status(400).json({
          success: false,
          message: 'Seminar must have title and scheduled date before publishing',
        });
      }

      await seminarData.update({
        isPublished: true,
        publishedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Seminar published successfully',
        seminar: seminarData,
      });
    } catch (err) {
      console.error('❌ [PUBLISH SEMINAR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/:id/unpublish
// Скриване на семинар
// ===============================
seminarsController.post(
  '/:id/unpublish',
  isAuth,
  rbac.checkPermission('seminar', 'publish'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);

      const seminarData = await seminar.findByPk(seminarId);

      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      if (!seminarData.isPublished) {
        return res.status(400).json({
          success: false,
          message: 'Seminar is already unpublished',
        });
      }

      await seminarData.update({
        isPublished: false,
      });

      res.status(200).json({
        success: true,
        message: 'Seminar unpublished successfully',
        seminar: seminarData,
      });
    } catch (err) {
      console.error('❌ [UNPUBLISH SEMINAR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/:id/cancel
// Отмяна на семинар
// ===============================
seminarsController.post(
  '/:id/cancel',
  isAuth,
  rbac.checkPermission('seminar', 'cancel'),
  validateBody(lectureCancelSchema),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);
      const { reason } = req.body;

      const seminarData = await seminar.findByPk(seminarId);

      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      if (seminarData.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Seminar is already cancelled',
        });
      }

      if (seminarData.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a completed seminar',
        });
      }

      await seminarData.update({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason || null,
      });

      res.status(200).json({
        success: true,
        message: 'Seminar cancelled successfully',
        seminar: seminarData,
      });
    } catch (err) {
      console.error('❌ [CANCEL SEMINAR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/:id/complete
// Маркиране като завършен
// ===============================
seminarsController.post(
  '/:id/complete',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);

      const seminarData = await seminar.findByPk(seminarId);

      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      if (seminarData.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Seminar is already completed',
        });
      }

      if (seminarData.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Cannot complete a cancelled seminar',
        });
      }

      await seminarData.update({
        status: 'completed',
      });

      res.status(200).json({
        success: true,
        message: 'Seminar marked as completed',
        seminar: seminarData,
      });
    } catch (err) {
      console.error('❌ [COMPLETE SEMINAR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/:id/start
// Започване на live семинар
// ===============================
seminarsController.post(
  '/:id/start',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);

      const seminarData = await seminar.findByPk(seminarId);

      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      if (seminarData.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Cannot start a cancelled seminar',
        });
      }

      await seminarData.update({
        status: 'live',
      });

      res.status(200).json({
        success: true,
        message: 'Seminar started',
        seminar: seminarData,
      });
    } catch (err) {
      console.error('❌ [START SEMINAR] Error:', err);
      next(err);
    }
  }
);

// POST /api/academy/seminars/:id/stop
// Спиране на live → връща на scheduled
// ===============================
seminarsController.post(
  '/:id/stop',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);
      const seminarData = await seminar.findByPk(seminarId);

      if (!seminarData) {
        return res.status(404).json({ success: false, message: 'Seminar not found' });
      }

      await seminarData.update({ status: 'scheduled' });

      res.status(200).json({ success: true, message: 'Seminar stopped', seminar: seminarData });
    } catch (err) {
      console.error('❌ [STOP SEMINAR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/:id/statistics
// Статистики за семинар
// ===============================
seminarsController.get(
  '/:id/statistics',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);

      const seminarData = await seminar.findByPk(seminarId);

      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      const totalRegistrations = await student_seminar.count({ where: { seminarId } });
      const attendedCount = await student_seminar.count({ where: { seminarId, attended: true } });
      const approvedRegistrations = await student_seminar.count({ where: { seminarId, status: 'approved' } });
      const pendingRegistrations = await student_seminar.count({ where: { seminarId, status: 'pending' } });

      const creditsData = await student_seminar.findAll({
        where: { seminarId },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('earned_credits')), 'totalCredits'],
          [sequelize.fn('AVG', sequelize.col('earned_credits')), 'avgCredits'],
        ],
        raw: true,
      });

      const totalCreditsAwarded = parseInt(creditsData[0].totalCredits) || 0;
      const avgCreditsPerStudent = parseFloat(creditsData[0].avgCredits) || 0;
      const attendanceRate = totalRegistrations > 0 ? Math.round((attendedCount / totalRegistrations) * 100) : 0;

      const materialsCount = await seminar_material.count({ where: { seminarId } });

      const meetsMinParticipants = seminarData.minParticipants
        ? approvedRegistrations >= seminarData.minParticipants
        : true;

      res.status(200).json({
        success: true,
        statistics: {
          registrations: {
            total: totalRegistrations,
            approved: approvedRegistrations,
            pending: pendingRegistrations,
            attended: attendedCount,
            attendanceRate,
          },
          participants: {
            min: seminarData.minParticipants,
            max: seminarData.maxParticipants,
            current: approvedRegistrations,
            meetsMinimum: meetsMinParticipants,
            spotsLeft: seminarData.maxParticipants
              ? Math.max(0, seminarData.maxParticipants - approvedRegistrations)
              : null,
          },
          credits: {
            totalAwarded: totalCreditsAwarded,
            averagePerStudent: Math.round(avgCreditsPerStudent * 100) / 100,
            maxPossible: seminarData.maxCredits,
          },
          content: {
            materialsCount,
            hasTest: seminarData.hasTest,
            hasAssignment: seminarData.hasAssignment,
            hasVideo: !!seminarData.videoUrl,
          },
          views: seminarData.viewsCount,
          rating: parseFloat(seminarData.rating) || 0,
        },
      });
    } catch (err) {
      console.error('❌ [GET SEMINAR STATISTICS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/:id/attendees
// Списък с участници
// ===============================
seminarsController.get(
  '/:id/attendees',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);
      const { status } = req.query;

      const where = { seminarId };
      if (status && status !== 'all') {
        where.status = status;
      }

      const attendees = await student_seminar.findAll({
        where,
        include: [
          {
            model: student,
            as: 'student',
            attributes: ['id', 'avatar', 'userId'],
            include: [
              {
                model: user_account,
                as: 'user',
                attributes: ['email'],
                include: [
                  {
                    model: user_details,
                    as: 'details',
                    attributes: ['username', 'firstName', 'lastName', 'imageURL'],
                  },
                ],
              },
            ],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      const formattedAttendees = attendees.map((a) => {
        const data = a.get({ plain: true });
        const studentData = data.student;
        const userDetails = studentData?.user?.details || {};

        const name =
          userDetails.username ||
          `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() ||
          studentData?.user?.email?.split('@')[0] ||
          'Unknown';

        return {
          id: data.id,
          studentId: data.studentId,
          name,
          email: studentData?.user?.email,
          avatar: studentData?.avatar || userDetails.imageURL,
          status: data.status,
          attended: data.attended,
          attendedAt: data.attendedAt,
          participationLevel: data.participationLevel,
          earnedCredits: data.earnedCredits,
          registeredAt: data.createdAt,
        };
      });

      res.status(200).json({
        success: true,
        attendees: formattedAttendees,
        total: formattedAttendees.length,
      });
    } catch (err) {
      console.error('❌ [GET ATTENDEES] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/:id/attendees/:attendeeId/approve
// Одобряване на регистрация
// ===============================
seminarsController.post(
  '/:id/attendees/:attendeeId/approve',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);
      const attendeeId = parseInt(req.params.attendeeId);

      const seminarData = await seminar.findByPk(seminarId);
      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      const attendance = await student_seminar.findOne({
        where: { id: attendeeId, seminarId },
      });

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found',
        });
      }

      if (seminarData.maxParticipants) {
        const approvedCount = await student_seminar.count({
          where: { seminarId, status: 'approved' },
        });

        if (approvedCount >= seminarData.maxParticipants) {
          return res.status(400).json({
            success: false,
            message: 'Seminar is full',
          });
        }
      }

       await attendance.update({
        status: 'approved',
        approvedBy: req.user.userId,
        approvedAt: new Date(), 
      });

      const registeredCount = await student_seminar.count({
        where: { seminarId, status: 'approved' },
      });

      await seminarData.update({ registeredCount });

      // Send registration confirmation email
      try {
        const studentData = await student.findByPk(attendance.studentId, {
          include: [{
            model: user_account,
            as: 'user',
            attributes: ['email'],
            include: [{
              model: user_details,
              as: 'details',
              attributes: ['username'],
            }],
          }],
        });

        if (studentData?.user?.email) {
          const template = await seminarEmailTemplates.registrationConfirmation({
            userName: studentData.user.details?.username || studentData.user.email.split('@')[0],
            seminarTitle: seminarData.title,
            scheduledDate: seminarData.scheduledDate,
            location: seminarData.location,
            isOnline: seminarData.isOnline,
            meetingLink: seminarData.meetingLink,
            meetingPassword: seminarData.meetingPassword,
            mentorName: null,
            slug: seminarData.slug,
          });

          await forwardEmailsViaZoho({
            userEmail: 'info@pensa.club',
            subject: template.subject,
            body: '',
            toAddresses: studentData.user.email,
            formattedBody: template.html,
          });
        }
      } catch (emailErr) {
        console.error('Failed to send seminar registration email:', emailErr);
      }

      res.status(200).json({
        success: true,
        message: 'Registration approved',
        attendance,
      });
    } catch (err) {
      console.error('❌ [APPROVE REGISTRATION] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/:id/attendees/:attendeeId/reject
// Отхвърляне на регистрация
// ===============================
seminarsController.post(
  '/:id/attendees/:attendeeId/reject',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  validateBody(lectureCancelSchema),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);
      const attendeeId = parseInt(req.params.attendeeId);
      const { reason } = req.body;

      const attendance = await student_seminar.findOne({
        where: { id: attendeeId, seminarId },
      });

      if (!attendance) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found',
        });
      }

      await attendance.update({
        status: 'rejected',
        rejectionReason: reason || null,
      });

      res.status(200).json({
        success: true,
        message: 'Registration rejected',
        attendance,
      });
    } catch (err) {
      console.error('❌ [REJECT REGISTRATION] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/:id/attendees/:studentId/mark-attended
// Маркиране на присъствие
// ===============================
seminarsController.post(
  '/:id/attendees/:studentId/mark-attended',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  validateBody(attendanceMarkSchema),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);
      const studentId = parseInt(req.params.studentId);
      const { participationLevel } = req.body;

      const seminarData = await seminar.findByPk(seminarId);
      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      let attendance = await student_seminar.findOne({
        where: { seminarId, studentId },
      });

      // Check if student is admin or mentor (they don't earn credits)
      const attendeeStudent = await student.findByPk(studentId, { attributes: ['userId'] });
      let isAttendeePrivileged = false;
      if (attendeeStudent) {
        const attendeeUser = await user_account.findByPk(attendeeStudent.userId, { attributes: ['role'] });
        if (attendeeUser?.role === 'admin') isAttendeePrivileged = true;
        else {
          const isMentorRecord = await mentor.findOne({ where: { userId: attendeeStudent.userId, status: 'active' }, attributes: ['id'] });
          if (isMentorRecord) isAttendeePrivileged = true;
        }
      }

      let earnedCredits = isAttendeePrivileged ? 0 : (seminarData.creditsForAttendance || 0);
      if (!isAttendeePrivileged) {
        if (participationLevel === 'active') {
          earnedCredits += seminarData.creditsForParticipation || 0;
        } else if (participationLevel === 'moderate') {
          earnedCredits += Math.floor((seminarData.creditsForParticipation || 0) / 2);
        }
      }

      if (!attendance) {
        attendance = await student_seminar.create({
          seminarId,
          studentId,
          status: 'approved',
          attended: true,
          attendedAt: new Date(),
          participationLevel: participationLevel || 'passive',
          earnedCredits,
        });
      } else if (attendance.attended) {
        // Already attended — recalculate credits based on new participation level
        // but only if attendedAt is today (same-day adjustments allowed)
        const attendedDate = new Date(attendance.attendedAt);
        const today = new Date();
        const isSameDay = attendedDate.toDateString() === today.toDateString();

        if (isSameDay && participationLevel) {
          // Recalculate credits with new level
          await attendance.update({
            participationLevel,
            earnedCredits,
          });
        } else {
          // Different day — only update level, no credit changes
          await attendance.update({
            participationLevel: participationLevel || attendance.participationLevel || 'passive',
          });
        }
      } else {
        // First time marking as attended — award credits
        await attendance.update({
          attended: true,
          attendedAt: new Date(),
          participationLevel: participationLevel || attendance.participationLevel || 'passive',
          earnedCredits,
        });
      }

      const attendedCount = await student_seminar.count({
        where: { seminarId, attended: true },
      });

      await seminarData.update({ attendedCount });

      // Notify user about attendance
      try {
        const studentRecord = await student.findByPk(studentId, {
          include: [{ model: user_account, as: 'user', attributes: ['id'] }]
        });
        if (studentRecord?.user?.id) {
          await user_notification.create({
            userId: studentRecord.user.id,
            type: 'seminar_attended',
            title: 'Присъствие записано',
            message: `Присъствието ви на "${seminarData.title}" е записано. ${earnedCredits > 0 ? `Получихте ${earnedCredits} кредити.` : ''}`,
            data: { seminarId, earnedCredits, slug: seminarData.slug }
          });
        }
      } catch (notifErr) {
        console.error('Failed to create attendance notification:', notifErr);
      }

      res.status(200).json({
        success: true,
        message: 'Attendance marked successfully',
        attendance,
      });
    } catch (err) {
      console.error('❌ [MARK ATTENDED] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/:id/attendees/mark-all
// Маркиране на присъствие за всички
// ===============================
seminarsController.post(
  '/:id/attendees/mark-all',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  validateBody(bulkAttendanceSchema),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);
      const { studentIds, participationLevel } = req.body;

      const seminarData = await seminar.findByPk(seminarId);
      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      let earnedCredits = seminarData.creditsForAttendance || 0;
      if (participationLevel === 'active') {
        earnedCredits += seminarData.creditsForParticipation || 0;
      } else if (participationLevel === 'moderate') {
        earnedCredits += Math.floor((seminarData.creditsForParticipation || 0) / 2);
      }

      await student_seminar.update(
        {
          attended: true,
          attendedAt: new Date(),
          participationLevel,
          earnedCredits,
        },
        {
          where: {
            seminarId,
            studentId: studentIds,
          },
        }
      );

      // Zero out credits for admin/mentor students
      const privilegedStudents = await student.findAll({
        where: { id: studentIds },
        attributes: ['id', 'userId'],
        include: [{ model: user_account, as: 'user', attributes: ['role'] }],
      });
      const privilegedIds = [];
      for (const s of privilegedStudents) {
        if (s.user?.role === 'admin') { privilegedIds.push(s.id); continue; }
        const isMentorRec = await mentor.findOne({ where: { userId: s.userId, status: 'active' }, attributes: ['id'] });
        if (isMentorRec) privilegedIds.push(s.id);
      }
      if (privilegedIds.length > 0) {
        await student_seminar.update({ earnedCredits: 0 }, { where: { seminarId, studentId: privilegedIds } });
      }

      const attendedCount = await student_seminar.count({
        where: { seminarId, attended: true },
      });

      await seminarData.update({ attendedCount });

      res.status(200).json({
        success: true,
        message: `Marked ${studentIds.length} students as attended`,
        attendedCount,
      });
    } catch (err) {
      console.error('❌ [MARK ALL ATTENDED] Error:', err);
      next(err);
    }
  }
);
// ===============================
// POST /api/academy/seminars/:id/attendees/bulk-approve
// Масово одобрение на регистрации
// ===============================
seminarsController.post(
  '/:id/attendees/bulk-approve',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);
      const { attendeeIds } = req.body;

      if (!Array.isArray(attendeeIds) || attendeeIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'attendeeIds must be a non-empty array',
        });
      }

      const seminarData = await seminar.findByPk(seminarId);
      if (!seminarData) {
        return res.status(404).json({ success: false, message: 'Seminar not found' });
      }

      // Провери за свободни места
      if (seminarData.maxParticipants) {
        const approvedCount = await student_seminar.count({
          where: { seminarId, status: 'approved' },
        });
        const spotsLeft = seminarData.maxParticipants - approvedCount;
        if (attendeeIds.length > spotsLeft) {
          return res.status(400).json({
            success: false,
            message: `Only ${spotsLeft} spots left, cannot approve ${attendeeIds.length} registrations`,
          });
        }
      }

      await student_seminar.update(
        {
          status: 'approved',
          approvedBy: req.user.userId,
          approvedAt: new Date(),
        },
        {
          where: {
            id: attendeeIds,
            seminarId,
            status: 'pending',
          },
        }
      );

      const registeredCount = await student_seminar.count({
        where: { seminarId, status: 'approved' },
      });
      await seminarData.update({ registeredCount });

      res.status(200).json({
        success: true,
        message: `Approved ${attendeeIds.length} registrations`,
        registeredCount,
      });
    } catch (err) {
      console.error('❌ [BULK APPROVE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/:id/search-students
// Търсене на потребители за attendance UI
// ===============================
seminarsController.get(
  '/:id/search-students',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);
      const { q } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(200).json({ success: true, students: [] });
      }

      const searchTerm = `%${q.trim()}%`;

      // Search ALL users by email or username (not just students)
      const results = await user_account.findAll({
        attributes: ['id', 'email'],
        where: {
          [Op.or]: [
            { email: { [Op.iLike]: searchTerm } },
            { '$details.username$': { [Op.iLike]: searchTerm } },
          ],
        },
        include: [
          {
            model: user_details,
            as: 'details',
            attributes: ['username', 'imageURL'],
            required: false,
          },
        ],
        limit: 15,
        subQuery: false,
      });

      // Find or note student records for each user
      const userIds = results.map(r => r.id);
      const studentRecords = await student.findAll({
        where: { userId: userIds },
        attributes: ['id', 'userId', 'avatar'],
      });
      const studentMap = {};
      studentRecords.forEach(s => { studentMap[s.userId] = s; });

      // Check existing attendance
      const studentIds = studentRecords.map(s => s.id);
      const existingAttendances = await student_seminar.findAll({
        where: { seminarId, studentId: studentIds },
        attributes: ['studentId', 'status', 'attended'],
      });
      const attendanceMap = {};
      existingAttendances.forEach(a => {
        attendanceMap[a.studentId] = { status: a.status, attended: a.attended };
      });

      const students = results.map(r => {
        const data = r.get({ plain: true });
        const details = data.details || {};
        const studentRecord = studentMap[data.id];
        const sId = studentRecord?.id || null;
        return {
          studentId: sId,
          userId: data.id,
          name: details.username || data.email?.split('@')[0] || 'Unknown',
          email: data.email,
          avatar: studentRecord?.avatar || details.imageURL,
          hasStudentRecord: !!studentRecord,
          seminarStatus: sId ? (attendanceMap[sId]?.status || null) : null,
          alreadyAttended: sId ? (attendanceMap[sId]?.attended || false) : false,
        };
      });

      res.status(200).json({ success: true, students });
    } catch (err) {
      console.error('❌ [SEARCH STUDENTS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/:id/attendance/bulk-mixed
// Записване на присъствие: платформени потребители + гости
// ===============================
seminarsController.post(
  '/:id/attendance/bulk-mixed',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);
      const userId = req.user.userId;
      const { platformAttendees, guests } = req.body;

      const seminarData = await seminar.findByPk(seminarId);
      if (!seminarData) {
        return res.status(404).json({ success: false, message: 'Seminar not found' });
      }

      // Load SMS settings once for the whole handler
      const { sendRegistrationSms, getSmsSettings } = require('../utils/smsService');
      const smsSettings = await getSmsSettings();

      let markedCount = 0;
      let guestCount = 0;

      // Платформени потребители
      if (Array.isArray(platformAttendees) && platformAttendees.length > 0) {
        for (const att of platformAttendees) {
          let { studentId, userId: attUserId, participationLevel } = att;

          // If no studentId, find or create student record by userId
          if (!studentId && attUserId) {
            let studentRecord = await student.findOne({ where: { userId: attUserId } });
            if (!studentRecord) {
              studentRecord = await student.create({ userId: attUserId, status: 'active' });
            }
            studentId = studentRecord.id;

            // Upgrade role to student if not privileged
            const userAcc = await user_account.findByPk(attUserId, { attributes: ['id', 'role'] });
            if (userAcc && ['user', 'guest'].includes(userAcc.role)) {
              await userAcc.update({ role: 'student' });
            }
          }

          if (!studentId) {
            continue; // Skip if we still can't determine studentId
          }

          let attendance = await student_seminar.findOne({
            where: { seminarId, studentId },
          });

          // Ако вече е присъствал — записваме пак за отчетност но БЕЗ нови кредити
          if (attendance && attendance.attended) {
            // Обновяваме само participationLevel ако е подаден, кредити НЕ се дават повторно
            if (participationLevel && participationLevel !== attendance.participationLevel) {
              await attendance.update({
                participationLevel,
              });
            }
            markedCount++;
            continue;
          }

          // Check if this user is admin/mentor (no credits)
          let isAttPrivileged = false;
          const attStudentRec = await student.findByPk(studentId, { attributes: ['userId'] });
          if (attStudentRec) {
            const attUser = await user_account.findByPk(attStudentRec.userId, { attributes: ['role'] });
            if (attUser?.role === 'admin') isAttPrivileged = true;
            else {
              const attMentor = await mentor.findOne({ where: { userId: attStudentRec.userId, status: 'active' }, attributes: ['id'] });
              if (attMentor) isAttPrivileged = true;
            }
          }

          // Първо присъствие — изчисли кредити
          let earnedCredits = isAttPrivileged ? 0 : (seminarData.creditsForAttendance || 0);
          if (!isAttPrivileged) {
            if (participationLevel === 'active') {
              earnedCredits += seminarData.creditsForParticipation || 0;
            } else if (participationLevel === 'moderate') {
              earnedCredits += Math.floor((seminarData.creditsForParticipation || 0) / 2);
            }
          }

          if (!attendance) {
            await student_seminar.create({
              seminarId,
              studentId,
              status: 'approved',
              attended: true,
              attendedAt: new Date(),
              participationLevel: participationLevel || 'passive',
              earnedCredits,
              approvedBy: userId,
              approvedAt: new Date(),
            });
          } else {
            // Записан е (registered) но не е присъствал — маркираме
            await attendance.update({
              attended: true,
              attendedAt: new Date(),
              participationLevel: participationLevel || 'passive',
              earnedCredits,
            });
          }
          // Send email to platform user
          try {
            const userAcc = await user_account.findOne({
              where: { id: attUserId || (await student.findByPk(studentId, { attributes: ['userId'] }))?.userId },
              attributes: ['email'],
              include: [{ model: user_details, as: 'details', attributes: ['username'] }]
            });
            if (userAcc?.email) {
              const template = await seminarEmailTemplates.registrationConfirmation({
                userName: userAcc.details?.username || userAcc.email.split('@')[0],
                seminarTitle: seminarData.title,
                scheduledDate: seminarData.scheduledDate,
                location: seminarData.location,
                isOnline: seminarData.isOnline,
                meetingLink: seminarData.meetingLink,
            meetingPassword: seminarData.meetingPassword,
                mentorName: null,
                slug: seminarData.slug
              });
              await forwardEmailsViaZoho({
                userEmail: 'info@pensa.club',
                subject: template.subject,
                body: '',
                toAddresses: userAcc.email,
                formattedBody: template.html,
              });
            }
          } catch (emailErr) {
            console.error('Failed to send registration email from bulk-mixed:', emailErr);
          }

          // Send SMS if user has phone and sms_on_registration is enabled
          try {
            if (smsSettings.sms_enabled !== 'false' && smsSettings.sms_on_registration !== 'false') {
              const userDetsForSms = await user_details.findOne({ where: { userId: userAcc.id }, attributes: ['phone'] });
              if (userDetsForSms?.phone && userDetsForSms.phone.length >= 8) {
                await sendRegistrationSms(
                  userDetsForSms.phone, seminarData.title, seminarData.scheduledDate,
                  seminarData.location, seminarData.isOnline, smsSettings.sms_registration_template
                );
              }
            }
          } catch (smsErr) {
            console.error('SMS send failed:', smsErr);
          }

          markedCount++;
        }
      }

      // Гости без профил
      if (Array.isArray(guests) && guests.length > 0) {
        const { seminar_guest_attendance } = require('../sequelize/models/index');

        for (const guest of guests) {
          // Проверка дали гост с това име вече е бил записан
          const existingGuest = await seminar_guest_attendance.findOne({
            where: {
              seminarId,
              guestFirstName: guest.firstName,
              guestLastName: guest.lastName,
            },
          });

          if (existingGuest) {
            // Вече е присъствал — записваме за отчетност но без кредити
            // Обновяваме само participationLevel ако е подаден
            if (guest.participationLevel && guest.participationLevel !== existingGuest.participationLevel) {
              await existingGuest.update({
                participationLevel: guest.participationLevel,
              });
            }
            guestCount++;
            continue;
          }

          await seminar_guest_attendance.create({
            seminarId,
            guestFirstName: guest.firstName,
            guestLastName: guest.lastName,
            guestPhone: guest.phone || null,
            guestEmail: guest.email || null,
            participationLevel: guest.participationLevel || 'passive',
            markedBy: userId,
          });

          // Send email to guest if email provided
          if (guest.email) {
            try {
              const template = await seminarEmailTemplates.guestNotification({
                guestName: `${guest.firstName} ${guest.lastName}`,
                seminarTitle: seminarData.title,
                scheduledDate: seminarData.scheduledDate,
                location: seminarData.location,
                isOnline: seminarData.isOnline,
                meetingLink: seminarData.meetingLink,
                meetingPassword: seminarData.meetingPassword,
                mentorName: null,
                slug: seminarData.slug,
              });

              await forwardEmailsViaZoho({
                userEmail: 'info@pensa.club',
                subject: template.subject,
                body: '',
                toAddresses: guest.email,
                formattedBody: template.html,
              });
            } catch (emailErr) {
              console.error('Failed to send guest email:', emailErr);
            }
          }

          // Send SMS to guest if phone provided and sms_on_registration is enabled
          if (guest.phone && guest.phone.length >= 8 && smsSettings.sms_enabled !== 'false' && smsSettings.sms_on_registration !== 'false') {
            try {
              await sendRegistrationSms(
                guest.phone, seminarData.title, seminarData.scheduledDate,
                seminarData.location, seminarData.isOnline, smsSettings.sms_registration_template
              );
            } catch (smsErr) {
              console.error('Guest SMS failed:', smsErr);
            }
          }

          guestCount++;
        }
      }
      // Обнови статистиките
      const attendedCount = await student_seminar.count({
        where: { seminarId, attended: true },
      });
      const { seminar_guest_attendance: sgaModel } = require('../sequelize/models/index');
      const guestTotal = await sgaModel.count({ where: { seminarId } });

      await seminarData.update({ attendedCount: attendedCount + guestTotal });

      // Admin notification
      try {
        await admin_notification.create({
          type: 'seminar_attendance_recorded',
          title: 'Присъствие записано',
          message: `Записано присъствие за семинар "${seminarData.title}": ${markedCount} от платформата, ${guestCount} гости`,
          data: { seminarId, platformCount: markedCount, guestCount }
        });
      } catch (notifErr) {
        console.error('Failed to create admin notification:', notifErr);
      }

      res.status(200).json({
        success: true,
        message: `Marked ${markedCount} platform users and ${guestCount} guests`,
        stats: {
          platformAttended: markedCount,
          guestsAdded: guestCount,
          totalAttended: attendedCount + guestTotal,
        },
      });
    } catch (err) {
      console.error('❌ [BULK MIXED ATTENDANCE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/seminars/:id/attendance/full
// Пълен списък: записани + присъствали (платформени + гости)
// ===============================
seminarsController.get(
  '/:id/attendance/full',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const seminarId = parseInt(req.params.id);

      // ALL platform registrations (both attended and not)
      const platformAttendees = await student_seminar.findAll({
        where: { seminarId },
        include: [{
          model: student,
          as: 'student',
          attributes: ['id', 'avatar', 'userId'],
          include: [{
            model: user_account,
            as: 'user',
            attributes: ['email'],
            include: [{
              model: user_details,
              as: 'details',
              attributes: ['username', 'imageURL'], // ПРОМЕНЕНО — махнати firstName, lastName, phone
            }],
          }],
        }],
        order: [['attendedAt', 'DESC']],
      });

      const formattedPlatform = platformAttendees.map(a => {
        const data = a.get({ plain: true });
        const details = data.student?.user?.details || {};
        return {
          type: 'platform',
          id: data.id,
          studentId: data.studentId,
          name: details.username || data.student?.user?.email?.split('@')[0] || 'Unknown',
          email: data.student?.user?.email,
          avatar: data.student?.avatar || details.imageURL,
          participationLevel: data.participationLevel,
          earnedCredits: data.earnedCredits,
          attendedAt: data.attendedAt,
          attended: data.attended,
          status: data.status,
        };
      });

      // Гости
      const { seminar_guest_attendance } = require('../sequelize/models/index');
      const guestAttendees = await seminar_guest_attendance.findAll({
        where: { seminarId },
        order: [['createdAt', 'DESC']],
      });

      const formattedGuests = guestAttendees.map(g => {
        const data = g.get({ plain: true });
        return {
          type: 'guest',
          id: data.id,
          name: `${data.guestFirstName} ${data.guestLastName}`,
          email: data.guestEmail || null, // НОВО
          phone: data.guestPhone,
          participationLevel: data.participationLevel,
          attendedAt: data.createdAt,
        };
      });

      // Split: "attended today" stay in participants list, "attended before today" go to attended list
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isAttendedBeforeToday = (a) => {
        if (!a.attended || !a.attendedAt) return false;
        const attendedDate = new Date(a.attendedAt);
        attendedDate.setHours(0, 0, 0, 0);
        return attendedDate < today;
      };

      // Participants = all registered + attended today (still active for today's session)
      const registered = formattedPlatform.filter(a => !isAttendedBeforeToday(a));
      // Attended = attended before today (previous days)
      const attended = [...formattedPlatform.filter(a => isAttendedBeforeToday(a)), ...formattedGuests.filter(g => {
        const gDate = new Date(g.attendedAt);
        gDate.setHours(0, 0, 0, 0);
        return gDate < today;
      })];

      res.status(200).json({
        success: true,
        attendees: [...formattedPlatform, ...formattedGuests], // backwards compat
        registered,
        attended,
        stats: {
          registered: registered.length,
          attended: attended.length,
          guests: formattedGuests.length,
          total: formattedPlatform.length + formattedGuests.length,
        },
      });
    } catch (err) {
      console.error('❌ [FULL ATTENDANCE] Error:', err);
      next(err);
    }
  }
);
// ===============================
// REVIEWS
// ===============================

// GET /api/academy/seminars/:id/reviews
seminarsController.get('/:id/reviews', async (req, res, next) => {
    try {
        const reviews = await seminar_review.findAll({
            where: { seminarId: req.params.id, status: 'approved' },
            include: [{
                model: student,
                as: 'student',
                attributes: ['id'],
                include: [{
                    model: user_account,
                    as: 'user',
                    attributes: ['id'],
                    include: [{
                        model: user_details,
                        as: 'details',
                        attributes: ['username', 'imageURL']
                    }]
                }]
            }],
            order: [['createdAt', 'DESC']]
        });

        const formatted = reviews.map(r => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            author: {
                name: r.student?.user?.details?.username || 'Анонимен',
                avatar: r.student?.user?.details?.imageURL || null
            }
        }));

        const avgRating = reviews.length > 0
            ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
            : null;

        res.json({ success: true, reviews: formatted, avgRating, totalReviews: reviews.length });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        next(err);
    }
});

// POST /api/academy/seminars/:id/reviews
seminarsController.post('/:id/reviews', isAuth, async (req, res, next) => {
    try {
        const seminarId = parseInt(req.params.id);
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        const studentRecord = await student.findOne({ where: { userId: req.user.userId } });
        if (!studentRecord) {
            return res.status(403).json({ success: false, message: 'Student record not found' });
        }

        // Check if already reviewed
        const existing = await seminar_review.findOne({
            where: { seminarId, studentId: studentRecord.id }
        });

        if (existing) {
            await existing.update({ rating, comment: comment || null, status: 'pending' });
            return res.json({ success: true, message: 'Review updated (pending approval)', review: existing });
        }

        const review = await seminar_review.create({
            seminarId,
            studentId: studentRecord.id,
            rating,
            comment: comment || null,
            status: 'pending'
        });

        // Notify admin about new review
        try {
            const seminarData = await seminar.findByPk(seminarId, { attributes: ['title', 'slug'] });
            await admin_notification.create({
                type: 'seminar_new_review',
                title: 'Нов отзив за семинар',
                message: `Нов отзив (${rating}/5) за "${seminarData?.title || 'семинар'}" чака одобрение.`,
                data: { seminarId, reviewId: review.id, rating, url: '/academy/admin/seminar-reviews' }
            });
        } catch (notifErr) {
            console.error('Failed to create admin notification for review:', notifErr);
        }

        res.status(201).json({ success: true, message: 'Review created (pending approval)', review });
    } catch (err) {
        console.error('Error creating review:', err);
        next(err);
    }
});

// ===============================
// VIDEO MANAGEMENT
// ===============================

// GET /api/academy/seminars/:id/videos
seminarsController.get(
  '/:id/videos',
  async (req, res, next) => {
    try {
      const videos = await seminar_video.findAll({
        where: { seminarId: req.params.id },
        order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']],
      });
      res.json({ success: true, videos });
    } catch (err) {
      console.error('❌ [GET SEMINAR VIDEOS] Error:', err);
      next(err);
    }
  }
);

// POST /api/academy/seminars/:id/videos
seminarsController.post(
  '/:id/videos',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const sem = await seminar.findByPk(req.params.id);
      if (!sem) {
        return res.status(404).json({ success: false, message: 'Seminar not found' });
      }

      const { title, videoUrl, videoProvider, thumbnailUrl, durationMinutes } = req.body;
      if (!videoUrl) {
        return res.status(400).json({ success: false, message: 'videoUrl is required' });
      }

      const maxOrder = await seminar_video.max('sortOrder', { where: { seminarId: sem.id } });

      const video = await seminar_video.create({
        seminarId: sem.id,
        title: title || null,
        videoUrl,
        videoProvider: videoProvider || 'custom',
        thumbnailUrl: thumbnailUrl || null,
        durationMinutes: durationMinutes || null,
        sortOrder: (maxOrder || 0) + 1,
      });

      res.status(201).json({ success: true, video });
    } catch (err) {
      console.error('❌ [ADD SEMINAR VIDEO] Error:', err);
      next(err);
    }
  }
);

// DELETE /api/academy/seminars/:id/videos/:videoId
seminarsController.delete(
  '/:id/videos/:videoId',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const video = await seminar_video.findOne({
        where: { id: req.params.videoId, seminarId: req.params.id },
      });
      if (!video) {
        return res.status(404).json({ success: false, message: 'Video not found' });
      }

      // If YouTube video, also delete from YouTube
      if (video.videoUrl && (video.videoProvider === 'youtube' || video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be'))) {
        try {
          const { extractVideoId, deleteVideo, setCredentials } = require('../utils/youtubeService');
          const fs = require('fs');
          const path = require('path');
          const tokensFile = path.join(__dirname, '../../youtube-tokens.json');
          if (fs.existsSync(tokensFile)) {
            const tokens = JSON.parse(fs.readFileSync(tokensFile, 'utf8'));
            setCredentials(tokens);
            const ytVideoId = extractVideoId(video.videoUrl);
            if (ytVideoId) {
              await deleteVideo(ytVideoId);
              console.log(`✅ Deleted YouTube video: ${ytVideoId}`);
            }
          }
        } catch (ytErr) {
          console.error('Failed to delete from YouTube (continuing):', ytErr.message);
        }
      }

      await video.destroy();
      res.json({ success: true, message: 'Video deleted' });
    } catch (err) {
      console.error('❌ [DELETE SEMINAR VIDEO] Error:', err);
      next(err);
    }
  }
);

// PUT /api/academy/seminars/:id/videos/reorder
seminarsController.put(
  '/:id/videos/reorder',
  isAuth,
  rbac.checkPermission('seminar', 'update'),
  async (req, res, next) => {
    try {
      const { videoIds } = req.body;
      if (!Array.isArray(videoIds)) {
        return res.status(400).json({ success: false, message: 'videoIds must be an array' });
      }

      for (let i = 0; i < videoIds.length; i++) {
        await seminar_video.update(
          { sortOrder: i },
          { where: { id: videoIds[i], seminarId: req.params.id } }
        );
      }

      res.json({ success: true, message: 'Videos reordered' });
    } catch (err) {
      console.error('❌ [REORDER SEMINAR VIDEOS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/seminars/invite
// Изпращане на покани по имейл
// ===============================
seminarsController.post('/invite', isAuth, rbac.checkPermission('seminar', 'update'), async (req, res, next) => {
  try {
    const { emails, seminarTitle, meetingLink, meetingPassword, scheduledDate } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'emails array is required' });
    }

    const { forwardEmailsViaZoho } = require('../utils/zohoEmails');
    const seminarEmailTemplates = require('../utils/seminarEmailTemplates');

    let sent = 0;
    for (const email of emails) {
      try {
        const template = seminarEmailTemplates.seminarInvite({
          seminarTitle, scheduledDate, meetingLink, meetingPassword,
        });

        await forwardEmailsViaZoho({
          userEmail: 'info@pensa.club',
          subject: template.subject,
          body: '',
          toAddresses: email,
          formattedBody: template.html,
        });
        sent++;
      } catch (err) {
        console.error(`Error sending invite to ${email}:`, err.message);
      }
    }

    res.json({ success: true, sent, total: emails.length });
  } catch (err) {
    next(err);
  }
});

// ===============================
// SEMINAR SESSIONS — CRUD
// ===============================

// GET /api/academy/seminars/:id/sessions
seminarsController.get('/:id/sessions', async (req, res, next) => {
  try {
    const seminarId = parseInt(req.params.id);
    const sessions = await seminar_session.findAll({
      where: { seminarId },
      order: [['date', 'ASC'], ['startTime', 'ASC']],
      include: [{
        model: session_attendance,
        as: 'attendances',
        attributes: ['id', 'studentId', 'guestAttendanceId', 'registered', 'attended'],
      }],
    });

    const enriched = sessions.map(s => ({
      ...s.toJSON(),
      registeredCount: s.attendances?.filter(a => a.registered).length || 0,
      attendedCount: s.attendances?.filter(a => a.attended).length || 0,
    }));

    res.json({ sessions: enriched });
  } catch (err) {
    next(err);
  }
});

// POST /api/academy/seminars/:id/sessions — sync sessions (create/update/keep)
seminarsController.post('/:id/sessions', isAuth, rbac.checkPermission('seminar', 'update'), async (req, res, next) => {
  try {
    const seminarId = parseInt(req.params.id);
    const { sessions: sessionsData } = req.body;

    if (!Array.isArray(sessionsData) || sessionsData.length === 0) {
      return res.status(400).json({ success: false, message: 'sessions array is required' });
    }

    const seminarData = await seminar.findByPk(seminarId);
    if (!seminarData) {
      return res.status(404).json({ success: false, message: 'Seminar not found' });
    }

    // Get existing session IDs
    const existingSessions = await seminar_session.findAll({ where: { seminarId }, attributes: ['id'] });
    const existingIds = existingSessions.map(s => s.id);

    // IDs from client (sessions that should remain)
    const clientIds = sessionsData.filter(s => s.id).map(s => s.id);

    // Delete sessions that are no longer in the client list (only if no attendances)
    for (const existingId of existingIds) {
      if (!clientIds.includes(existingId)) {
        const hasAttendances = await session_attendance.count({ where: { sessionId: existingId } });
        if (hasAttendances === 0) {
          await seminar_session.destroy({ where: { id: existingId } });
        }
      }
    }

    const result = [];
    const processedIds = new Set();
    for (const s of sessionsData) {
      if (!s.date || !s.startTime) continue;

      if (s.id && existingIds.includes(s.id)) {
        // Update existing session
        const existing = await seminar_session.findByPk(s.id);
        if (existing) {
          await existing.update({
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime || null,
            location: s.location || seminarData.location || null,
            maxParticipants: s.maxParticipants || null,
            notes: s.notes || null,
          });
          result.push(existing);
        }
        processedIds.add(s.id);
      } else if (!s.id) {
        // Check if session with same date+time already exists (prevent duplicates)
        const dup = await seminar_session.findOne({
          where: { seminarId, date: s.date, startTime: s.startTime },
        });
        if (dup) { result.push(dup); continue; }

        // Create new session
        const session = await seminar_session.create({
          seminarId,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime || null,
          location: s.location || seminarData.location || null,
          maxParticipants: s.maxParticipants || null,
          notes: s.notes || null,
        });
        result.push(session);
      }
    }

    res.status(201).json({ success: true, sessions: result });
  } catch (err) {
    next(err);
  }
});

// PUT /api/academy/seminars/:id/sessions/:sessionId
seminarsController.put('/:id/sessions/:sessionId', isAuth, rbac.checkPermission('seminar', 'update'), async (req, res, next) => {
  try {
    const session = await seminar_session.findByPk(req.params.sessionId);
    if (!session || session.seminarId !== parseInt(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const { date, startTime, endTime, location, maxParticipants, notes } = req.body;
    if (date) session.date = date;
    if (startTime) session.startTime = startTime;
    if (endTime !== undefined) session.endTime = endTime;
    if (location !== undefined) session.location = location;
    if (maxParticipants !== undefined) session.maxParticipants = maxParticipants;
    if (notes !== undefined) session.notes = notes;
    await session.save();

    res.json({ success: true, session });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/academy/seminars/:id/sessions/:sessionId
seminarsController.delete('/:id/sessions/:sessionId', isAuth, rbac.checkPermission('seminar', 'update'), async (req, res, next) => {
  try {
    const session = await seminar_session.findByPk(req.params.sessionId);
    if (!session || session.seminarId !== parseInt(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    await session.destroy();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/academy/seminars/:id/sessions/:sessionId/cancel
seminarsController.post('/:id/sessions/:sessionId/cancel', isAuth, rbac.checkPermission('seminar', 'update'), async (req, res, next) => {
  try {
    const session = await seminar_session.findByPk(req.params.sessionId);
    if (!session || session.seminarId !== parseInt(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const { reason } = req.body;

    await session.update({
      cancelled: true,
      cancelReason: reason || null,
      cancelledBy: req.user.userId,
      cancelledAt: new Date(),
    });

    // Notify registered attendees
    const attendees = await session_attendance.findAll({
      where: { sessionId: session.id, registered: true },
      include: [
        { model: require('../sequelize/models/index').student, as: 'student', attributes: ['userId'] },
        { model: require('../sequelize/models/index').seminar_guest_attendance, as: 'guestAttendance', attributes: ['guestEmail', 'guestPhone', 'guestFirstName'] },
      ],
    });

    const seminarData = await seminar.findByPk(session.seminarId, { attributes: ['title', 'slug'] });
    const dateStr = new Date(session.date).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });

    for (const att of attendees) {
      try {
        if (att.studentId && att.student?.userId) {
          // Platform user — email + notification
          const userAcc = await user_account.findByPk(att.student.userId, { attributes: ['email'] });
          if (userAcc?.email) {
            const { forwardEmailsViaZoho } = require('../utils/zohoEmails');
            const { paragraph, greeting, infoTable, infoRow } = require('../utils/reActionEmailTemplates');
            const seminarEmailTemplates = require('../utils/seminarEmailTemplates');

            const body = greeting('') +
              paragraph(`Уведомяваме ви, че сесията на <strong>${dateStr}</strong> от семинар "${seminarData?.title}" е <strong style="color:#ef4444;">отменена</strong>.`) +
              (reason ? infoTable(infoRow('Причина', reason)) : '') +
              paragraph('Извиняваме се за неудобството.') +
              `<p style="color:#374151;font-size:15px;line-height:1.7;margin:16px 0 0;">С уважение,<br><strong style="color:#0d9488;">Екипът на DigiBridge Academy</strong></p>`;

            await forwardEmailsViaZoho({
              userEmail: 'info@pensa.club',
              subject: `Отменена сесия: ${seminarData?.title} — ${dateStr}`,
              body: '', toAddresses: userAcc.email,
              formattedBody: require('../utils/seminarEmailTemplates').wrapAcademyTemplate ? body : body,
            }).catch(() => {});
          }
        } else if (att.guestAttendanceId && att.guestAttendance) {
          // Guest — email if available
          if (att.guestAttendance.guestEmail) {
            const { forwardEmailsViaZoho } = require('../utils/zohoEmails');
            const { paragraph, greeting, infoTable, infoRow } = require('../utils/reActionEmailTemplates');

            const body = greeting(att.guestAttendance.guestFirstName || '') +
              paragraph(`Сесията на <strong>${dateStr}</strong> от семинар "${seminarData?.title}" е <strong style="color:#ef4444;">отменена</strong>.`) +
              (reason ? infoTable(infoRow('Причина', reason)) : '') +
              `<p style="color:#374151;font-size:15px;">Извиняваме се за неудобството.</p>`;

            await forwardEmailsViaZoho({
              userEmail: 'info@pensa.club',
              subject: `Отменена сесия: ${seminarData?.title} — ${dateStr}`,
              body: '', toAddresses: att.guestAttendance.guestEmail,
              formattedBody: body,
            }).catch(() => {});
          }
          // SMS if phone
          if (att.guestAttendance.guestPhone && att.guestAttendance.guestPhone.length >= 8) {
            try {
              const { sendSms, getSmsSettings } = require('../utils/smsService');
              const smsSettings = await getSmsSettings();
              if (smsSettings.sms_enabled !== 'false') {
                // Simple cancel SMS
              }
            } catch {}
          }
        }
      } catch (notifErr) {
        console.error('Cancel notification error:', notifErr.message);
      }
    }

    res.json({ success: true, message: 'Session cancelled' });
  } catch (err) {
    next(err);
  }
});

// ===============================
// POST /api/academy/seminars/:id/guest-register
// Публично записване като гост (без auth)
// ===============================
seminarsController.post('/:id/guest-register', async (req, res, next) => {
  try {
    const { seminar_guest_attendance } = require('../sequelize/models/index');
    const seminarId = parseInt(req.params.id);
    const { firstName, lastName, email, phone } = req.body;

    // Validation
    if (!firstName || !lastName || firstName.trim().length < 2 || lastName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Име и фамилия са задължителни (мин. 2 символа)' });
    }

    const seminarData = await seminar.findByPk(seminarId);
    if (!seminarData) {
      return res.status(404).json({ success: false, message: 'Семинарът не е намерен' });
    }

    if (!seminarData.isPublished || !seminarData.isPublic) {
      return res.status(400).json({ success: false, message: 'Семинарът не е достъпен за записване' });
    }

    if (seminarData.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Семинарът е отменен' });
    }

    if (seminarData.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Семинарът вече е приключил' });
    }

    // Check capacity
    if (seminarData.maxParticipants) {
      const { student_seminar: ss } = require('../sequelize/models/index');
      const registered = await ss.count({ where: { seminarId, status: { [Op.in]: ['pending', 'approved'] } } });
      const guests = await seminar_guest_attendance.count({ where: { seminarId } });
      if (registered + guests >= seminarData.maxParticipants) {
        return res.status(400).json({ success: false, message: 'Семинарът е пълен' });
      }
    }

    // Check duplicate guest (by name OR by email)
    const duplicateWhere = {
      seminarId,
      [Op.or]: [
        { guestFirstName: firstName.trim(), guestLastName: lastName.trim() },
        ...(email?.trim() ? [{ guestEmail: email.trim() }] : []),
      ],
    };
    const existing = await seminar_guest_attendance.findOne({ where: duplicateWhere });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Вече сте записани за този семинар' });
    }

    // Check if already registered as platform user (by email)
    if (email?.trim()) {
      const { student_seminar: ss, student: studentModel } = require('../sequelize/models/index');
      const existingUser = await user_account.findOne({ where: { email: email.trim() }, attributes: ['id'] });
      if (existingUser) {
        const existingStudent = await studentModel.findOne({ where: { userId: existingUser.id }, attributes: ['id'] });
        if (existingStudent) {
          const existingReg = await ss.findOne({ where: { studentId: existingStudent.id, seminarId } });
          if (existingReg) {
            return res.status(400).json({ success: false, message: 'Вече сте записани с този имейл. Влезте в акаунта си.' });
          }
        }
      }
    }

    // Create guest attendance record
    const guestRecord = await seminar_guest_attendance.create({
      seminarId,
      guestFirstName: firstName.trim(),
      guestLastName: lastName.trim(),
      guestEmail: email?.trim() || null,
      guestPhone: phone?.trim() || null,
      participationLevel: 'passive',
      markedBy: null,
    });

    // Register for specific sessions if sessionIds provided
    const { sessionIds } = req.body;
    if (Array.isArray(sessionIds) && sessionIds.length > 0) {
      for (const sessionId of sessionIds) {
        const session = await seminar_session.findByPk(sessionId);
        if (session && session.seminarId === seminarId) {
          await session_attendance.findOrCreate({
            where: { sessionId, guestAttendanceId: guestRecord.id },
            defaults: { sessionId, guestAttendanceId: guestRecord.id, registered: true, attended: false },
          });
        }
      }
    }

    // Increment registered count
    await seminarData.increment('registeredCount');

    // Send email notification (if email provided)
    if (email?.trim()) {
      try {
        const { forwardEmailsViaZoho } = require('../utils/zohoEmails');
        const seminarEmailTemplates = require('../utils/seminarEmailTemplates');

        const template = await seminarEmailTemplates.guestNotification({
          guestName: `${firstName.trim()} ${lastName.trim()}`,
          seminarTitle: seminarData.title,
          scheduledDate: seminarData.scheduledDate,
          location: seminarData.location,
          isOnline: seminarData.isOnline,
          meetingLink: seminarData.meetingLink,
          meetingPassword: seminarData.meetingPassword,
          mentorName: null,
          slug: seminarData.slug,
        });

        await forwardEmailsViaZoho({
          userEmail: 'info@pensa.club',
          subject: template.subject,
          body: '',
          toAddresses: email.trim(),
          formattedBody: template.html,
        });
      } catch (emailErr) {
        console.error('Guest email error:', emailErr.message);
      }
    }

    // Send SMS (if phone provided and SMS enabled)
    if (phone?.trim() && phone.trim().length >= 8) {
      try {
        const { sendRegistrationSms, getSmsSettings } = require('../utils/smsService');
        const smsSettings = await getSmsSettings();
        if (smsSettings.sms_enabled !== 'false' && smsSettings.sms_on_registration !== 'false') {
          await sendRegistrationSms(
            phone.trim(), seminarData.title, seminarData.scheduledDate,
            seminarData.location, seminarData.isOnline, smsSettings.sms_registration_template
          );
        }
      } catch (smsErr) {
        console.error('Guest SMS error:', smsErr.message);
      }
    }

    res.status(201).json({ success: true, message: 'Записахте се успешно!' });
  } catch (err) {
    console.error('❌ [GUEST REGISTER] Error:', err);
    next(err);
  }
});

module.exports = seminarsController;