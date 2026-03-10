// server/src/controllers/seminarsController.js

const seminarsController = require('express').Router();
const { Op } = require('sequelize');

const {
  seminar,
  seminar_material,
  student_seminar,
  course,
  mentor,
  user_account,
  user_details,
  student,
  sequelize
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
    if (status === 'published' || !status) {
      where.isPublished = true;
      where.isPublic = true;
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

      const registrations = await student_seminar.count({
        where: { seminarId },
      });

      if (registrations > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete seminar with ${registrations} registered students. Please remove registrations first or cancel the seminar.`,
        });
      }

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

      if (seminarData.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          message: `Cannot start seminar with status: ${seminarData.status}`,
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
      });

      const registeredCount = await student_seminar.count({
        where: { seminarId, status: 'approved' },
      });

      await seminarData.update({ registeredCount });

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

      let earnedCredits = seminarData.creditsForAttendance || 0;
      if (participationLevel === 'active') {
        earnedCredits += seminarData.creditsForParticipation || 0;
      } else if (participationLevel === 'moderate') {
        earnedCredits += Math.floor((seminarData.creditsForParticipation || 0) / 2);
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
      } else {
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

module.exports = seminarsController;