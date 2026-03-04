// server/src/controllers/lecturesController.js

const lecturesController = require('express').Router();
const { Op } = require('sequelize');

const {
  lecture,
  lecture_material,
  student_lecture,
  course,
  mentor,
  course_module,
  mentor_lecture,
  user_account,
  user_details,
  student,
  sequelize
} = require('../sequelize/models/index');

const { validateBody, validateQuery } = require('../middlewares/validateRequest');
const {
  lectureCreateSchema,
  lectureUpdateSchema,
  lectureQuerySchema,
  lectureCancelSchema,
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

    const existing = await lecture.findOne({ where });
    if (!existing) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
// ===============================  
// HELPER: Backward compat — добавя виртуално `lecturer` поле от mentorAssignments
// ===============================
const addLecturerCompat = (lectureJSON) => {
  if (!lectureJSON) return lectureJSON;
  const assignments = lectureJSON.mentorAssignments || [];
  const lead = assignments.find(ma => ma.isLead) || assignments[0] || null;
  lectureJSON.lecturer = lead ? lead.mentor : null;
  return lectureJSON;
};
// ===============================
// GET /api/academy/lectures
// Публичен списък с лекции
// ===============================
lecturesController.get('/', validateQuery(lectureQuerySchema), async (req, res, next) => {
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
      where.lectureType = type;
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

    const { count, rows: lectures } = await lecture.findAndCountAll({ // ПРОМЕНЕНО
      where,
      include: [
        { // ПРОМЕНЕНО — mentorAssignments вместо единичен lecturer
          model: mentor_lecture,
          as: 'mentorAssignments',
          include: [{
            model: mentor,
            as: 'mentor',
            attributes: ['id', 'name', 'photoUrl', 'specialization'],
          }],
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

    const lecturesWithCompat = lectures.map(l => addLecturerCompat(l.toJSON()));

    res.status(200).json({
      success: true,
      lectures: lecturesWithCompat, 
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
      },
    });
  } catch (err) {
    console.error('❌ [GET LECTURES] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/lectures/upcoming
// Предстоящи лекции
// ===============================
lecturesController.get('/upcoming', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

     const lectures = await lecture.findAll({ 
      where: {
        isPublished: true,
        isPublic: true,
        status: 'scheduled',
        scheduledDate: { [Op.gte]: new Date() },
      },
      include: [
        { 
          model: mentor_lecture,
          as: 'mentorAssignments',
          include: [{
            model: mentor,
            as: 'mentor',
            attributes: ['id', 'name', 'photoUrl'],
          }],
        },
      ],
      order: [['scheduledDate', 'ASC']],
      limit: parseInt(limit),
    });

    const lecturesWithCompat = lectures.map(l => addLecturerCompat(l.toJSON()));

    res.status(200).json({
      success: true,
      lectures: lecturesWithCompat, 
    })
  } catch (err) {
    console.error('❌ [GET UPCOMING LECTURES] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/lectures/meta/categories
// Списък с категории
// ===============================
lecturesController.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await lecture.findAll({
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
    console.error('❌ [GET LECTURE CATEGORIES] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/lectures/admin
// Admin списък (включва drafts)
// ===============================
lecturesController.get(
  '/admin',
  isAuth,
  rbac.checkPermission('lecture', 'update'),
  validateQuery(lectureQuerySchema),
  async (req, res, next) => {
    try {
      const { page, limit, search, category, status, sortBy } = req.query;

      const offset = (page - 1) * limit;

      const where = {};

      // Filter by status
      if (status && status !== 'all') {
        if (status === 'draft') {
          where.isPublished = false;
        } else if (status === 'published') {
          where.isPublished = true;
        } else {
          where.status = status; // scheduled, live, completed, cancelled
        }
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

      const { count, rows: lectures } = await lecture.findAndCountAll({
        where,
        include: [
          { // ПРОМЕНЕНО
            model: mentor_lecture,
            as: 'mentorAssignments',
            include: [{
              model: mentor,
              as: 'mentor',
              attributes: ['id', 'name', 'photoUrl'],
            }],
          },
          {
            model: course_module,
            as: 'module',
            attributes: ['id', 'title'],
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
        lectures,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
        },
      });
    } catch (err) {
      console.error('❌ [GET ADMIN LECTURES] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/lectures/:slug
// Детайли за лекция (по slug)
// ===============================
lecturesController.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Проверка дали е ID или slug
    const isId = /^\d+$/.test(slug);

    const where = isId ? { id: parseInt(slug) } : { slug };

    const lectureData = await lecture.findOne({
      where,
      include: [
        {
          model: mentor_lecture,
          as: 'mentorAssignments',
          include: [{
            model: mentor,
            as: 'mentor',
            attributes: ['id', 'name', 'photoUrl', 'specialization', 'email'],
          }],
        },
        {
          model: course,
          as: 'course',
          attributes: ['id', 'name', 'slug', 'category'],
        },
        {
          model: course_module,
          as: 'module',
          attributes: ['id', 'title', 'sortOrder'],
        },
        {
          model: user_account,
          as: 'creator',
          attributes: ['id', 'email'],
        },
        {
          model: lecture_material,
          as: 'materials',
          where: { status: 'active' },
          required: false,
        },
      ],
    });

    if (!lectureData) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    // Increment views
    await lectureData.increment('viewsCount');


    const lectureJSON = addLecturerCompat(lectureData.toJSON());

    res.status(200).json({
      success: true,
      lecture: lectureJSON, 
    });
  } catch (err) {
    console.error('❌ [GET LECTURE BY SLUG] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/lectures/id/:id
// Детайли за лекция (по ID - за admin)
// ===============================
lecturesController.get(
  '/id/:id',
  isAuth,
  rbac.checkPermission('lecture', 'update'),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);

      const lectureData = await lecture.findByPk(lectureId, {
        include: [
          {
            model: mentor_lecture,
            as: 'mentorAssignments',
            include: [{
              model: mentor,
              as: 'mentor',
              attributes: ['id', 'name', 'photoUrl', 'specialization', 'email'],
            }],
          },
          {
            model: course,
            as: 'course',
            attributes: ['id', 'name', 'slug'],
          },
          {
            model: course_module,
            as: 'module',
            attributes: ['id', 'title', 'sortOrder'],
          },
          {
            model: user_account,
            as: 'creator',
            attributes: ['id', 'email'],
          },
          {
            model: lecture_material,
            as: 'materials',
          },
          {
            model: student_lecture,
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

      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      res.status(200).json({
        success: true,
        lecture: lectureData,
      });
    } catch (err) {
      console.error('❌ [GET LECTURE BY ID] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/lectures
// Създаване на лекция
// ===============================
lecturesController.post(
  '/',
  isAuth,
  rbac.checkPermission('lecture', 'create'),
  validateBody(lectureCreateSchema),
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
        moduleId,
        lectureType,
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
        requiresRegistration,
        isPublic,
        isFree,
        maxCredits,
        creditsForAttendance,
        creditsForTest,
        hasTest,
        testPassingScore,
        tags,
         learningPoints, 
      } = req.body;

      // Generate unique slug
      const slug = await generateUniqueSlug(title);

      const newLecture = await lecture.create({
        createdBy: userId,
        courseId: courseId || null,
        moduleId: moduleId || null,
        mentorId: mentorId || null,
        slug,
        title,
        shortDescription,
        description,
        category,
        lectureType,
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
        requiresRegistration,
        isPublic,
        isFree,
        maxCredits,
        creditsForAttendance,
        creditsForTest,
        hasTest,
        testPassingScore,
        tags,
        learningPoints: learningPoints || [],
        status: 'scheduled',
        isPublished: false,
      });

      res.status(201).json({
        success: true,
        message: 'Lecture created successfully',
        lecture: newLecture,
      });
    } catch (err) {
      console.error('❌ [CREATE LECTURE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/lectures/:id
// Редактиране на лекция
// ===============================
lecturesController.put(
  '/:id',
  isAuth,
  rbac.checkPermission('lecture', 'update'),
  validateBody(lectureUpdateSchema),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);
      const updates = req.body;

      const lectureData = await lecture.findByPk(lectureId);

      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      // Ако title се променя, обнови slug
      if (updates.title && updates.title !== lectureData.title) {
        updates.slug = await generateUniqueSlug(updates.title, lectureId);
      }

      await lectureData.update(updates);

      res.status(200).json({
        success: true,
        message: 'Lecture updated successfully',
        lecture: lectureData,
      });
    } catch (err) {
      console.error('❌ [UPDATE LECTURE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/lectures/:id
// Изтриване на лекция
// ===============================
lecturesController.delete(
  '/:id',
  isAuth,
  rbac.checkPermission('lecture', 'delete'),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);

      const lectureData = await lecture.findByPk(lectureId);

      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      // Проверка дали има записани студенти
      const registrations = await student_lecture.count({
        where: { lectureId },
      });

      if (registrations > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete lecture with ${registrations} registered students. Please remove registrations first or cancel the lecture.`,
        });
      }

      await lectureData.destroy();

      res.status(200).json({
        success: true,
        message: 'Lecture deleted successfully',
      });
    } catch (err) {
      console.error('❌ [DELETE LECTURE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/lectures/:id/publish
// Публикуване на лекция
// ===============================
lecturesController.post(
  '/:id/publish',
  isAuth,
  rbac.checkPermission('lecture', 'publish'),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);

      const lectureData = await lecture.findByPk(lectureId);

      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      if (lectureData.isPublished) {
        return res.status(400).json({
          success: false,
          message: 'Lecture is already published',
        });
      }

      if (!lectureData.title || !lectureData.scheduledDate) {
        return res.status(400).json({
          success: false,
          message: 'Lecture must have title and scheduled date before publishing',
        });
      }

      await lectureData.update({
        isPublished: true,
        publishedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Lecture published successfully',
        lecture: lectureData,
      });
    } catch (err) {
      console.error('❌ [PUBLISH LECTURE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/lectures/:id/unpublish
// Скриване на лекция
// ===============================
lecturesController.post(
  '/:id/unpublish',
  isAuth,
  rbac.checkPermission('lecture', 'publish'),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);

      const lectureData = await lecture.findByPk(lectureId);

      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      if (!lectureData.isPublished) {
        return res.status(400).json({
          success: false,
          message: 'Lecture is already unpublished',
        });
      }

      await lectureData.update({
        isPublished: false,
      });

      res.status(200).json({
        success: true,
        message: 'Lecture unpublished successfully',
        lecture: lectureData,
      });
    } catch (err) {
      console.error('❌ [UNPUBLISH LECTURE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/lectures/:id/cancel
// Отмяна на лекция
// ===============================
lecturesController.post(
  '/:id/cancel',
  isAuth,
  rbac.checkPermission('lecture', 'cancel'),
  validateBody(lectureCancelSchema),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);
      const { reason } = req.body;

      const lectureData = await lecture.findByPk(lectureId);

      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      if (lectureData.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Lecture is already cancelled',
        });
      }

      if (lectureData.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a completed lecture',
        });
      }

      await lectureData.update({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason || null,
      });

      res.status(200).json({
        success: true,
        message: 'Lecture cancelled successfully',
        lecture: lectureData,
      });
    } catch (err) {
      console.error('❌ [CANCEL LECTURE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/lectures/:id/complete
// Маркиране като завършена
// ===============================
lecturesController.post(
  '/:id/complete',
  isAuth,
  rbac.checkPermission('lecture', 'update'),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);

      const lectureData = await lecture.findByPk(lectureId);

      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      if (lectureData.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Lecture is already completed',
        });
      }

      if (lectureData.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Cannot complete a cancelled lecture',
        });
      }

      await lectureData.update({
        status: 'completed',
      });

      res.status(200).json({
        success: true,
        message: 'Lecture marked as completed',
        lecture: lectureData,
      });
    } catch (err) {
      console.error('❌ [COMPLETE LECTURE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/lectures/:id/start
// Започване на live лекция
// ===============================
lecturesController.post(
  '/:id/start',
  isAuth,
  rbac.checkPermission('lecture', 'update'),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);

      const lectureData = await lecture.findByPk(lectureId);

      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      if (lectureData.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          message: `Cannot start lecture with status: ${lectureData.status}`,
        });
      }

      await lectureData.update({
        status: 'live',
      });

      res.status(200).json({
        success: true,
        message: 'Lecture started',
        lecture: lectureData,
      });
    } catch (err) {
      console.error('❌ [START LECTURE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/lectures/:id/statistics
// Статистики за лекция
// ===============================
lecturesController.get(
  '/:id/statistics',
  isAuth,
  rbac.checkPermission('lecture', 'update'),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);

      const lectureData = await lecture.findByPk(lectureId);

      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      const totalRegistrations = await student_lecture.count({ where: { lectureId } });
      const attendedCount = await student_lecture.count({ where: { lectureId, attended: true } });

      const creditsData = await student_lecture.findAll({
        where: { lectureId },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('earned_credits')), 'totalCredits'],
          [sequelize.fn('AVG', sequelize.col('earned_credits')), 'avgCredits'],
        ],
        raw: true,
      });

      const totalCreditsAwarded = parseInt(creditsData[0].totalCredits) || 0;
      const avgCreditsPerStudent = parseFloat(creditsData[0].avgCredits) || 0;
      const attendanceRate = totalRegistrations > 0 ? Math.round((attendedCount / totalRegistrations) * 100) : 0;

      const materialsCount = await lecture_material.count({ where: { lectureId } });

      res.status(200).json({
        success: true,
        statistics: {
          registrations: { total: totalRegistrations, attended: attendedCount, attendanceRate },
          credits: {
            totalAwarded: totalCreditsAwarded,
            averagePerStudent: Math.round(avgCreditsPerStudent * 100) / 100,
            maxPossible: lectureData.maxCredits,
          },
          content: { materialsCount, hasTest: lectureData.hasTest, hasVideo: !!lectureData.videoUrl },
          views: lectureData.viewsCount,
          rating: parseFloat(lectureData.rating) || 0,
        },
      });
    } catch (err) {
      console.error('❌ [GET LECTURE STATISTICS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/lectures/:id/attendees
// Списък с присъстващи
// ===============================
lecturesController.get(
  '/:id/attendees',
  isAuth,
  rbac.checkPermission('lecture', 'update'),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);

      const attendees = await student_lecture.findAll({
        where: { lectureId },
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
          registered: true,
          attended: data.attended,
          attendedAt: data.attendedAt,
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
// POST /api/academy/lectures/:id/attendees/:studentId/mark-attended
// Маркиране на присъствие
// ===============================
lecturesController.post(
  '/:id/attendees/:studentId/mark-attended',
  isAuth,
  rbac.checkPermission('lecture', 'update'),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);
      const studentId = parseInt(req.params.studentId);

      const lectureData = await lecture.findByPk(lectureId);
      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      let attendance = await student_lecture.findOne({
        where: { lectureId, studentId },
      });

      if (!attendance) {
        attendance = await student_lecture.create({
          lectureId,
          studentId,
          attended: true,
          attendedAt: new Date(),
          earnedCredits: lectureData.creditsForAttendance,
        });
      } else {
        await attendance.update({
          attended: true,
          attendedAt: new Date(),
          earnedCredits: lectureData.creditsForAttendance,
        });
      }

      const attendedCount = await student_lecture.count({
        where: { lectureId, attended: true },
      });

      await lectureData.update({ attendedCount });

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
// POST /api/academy/lectures/:id/attendees/mark-all
// Маркиране на присъствие за всички
// ===============================
lecturesController.post(
  '/:id/attendees/mark-all',
  isAuth,
  rbac.checkPermission('lecture', 'update'),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);
      const { studentIds } = req.body;

      const lectureData = await lecture.findByPk(lectureId);
      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      if (!Array.isArray(studentIds)) {
        return res.status(400).json({
          success: false,
          message: 'studentIds must be an array',
        });
      }

      await student_lecture.update(
        {
          attended: true,
          attendedAt: new Date(),
          earnedCredits: lectureData.creditsForAttendance,
        },
        {
          where: {
            lectureId,
            studentId: studentIds,
          },
        }
      );

      const attendedCount = await student_lecture.count({
        where: { lectureId, attended: true },
      });

      await lectureData.update({ attendedCount });

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
// POST /api/academy/lectures/:id/register
// Регистрация за лекция
// ===============================
lecturesController.post(
  '/:id/register',
  isAuth,
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);
      const userId = req.user.userId;

      // Намери лекцията
      const lectureData = await lecture.findByPk(lectureId);
      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      // Провери статуса
      if (lectureData.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Cannot register for a cancelled lecture',
        });
      }

      if (lectureData.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot register for a completed lecture',
        });
      }

      // Намери студента
      const studentData = await student.findOne({ where: { userId } });
      if (!studentData) {
        return res.status(400).json({
          success: false,
          message: 'Student profile not found',
        });
      }

      // Провери дали вече е регистриран
      const existingRegistration = await student_lecture.findOne({
        where: { lectureId, studentId: studentData.id },
      });

      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          message: 'Already registered for this lecture',
        });
      }

      // Провери лимита за участници
      if (lectureData.maxParticipants) {
        const currentCount = await student_lecture.count({ where: { lectureId } });
        if (currentCount >= lectureData.maxParticipants) {
          return res.status(400).json({
            success: false,
            message: 'Lecture is full',
          });
        }
      }

      // Създай регистрация
      const registration = await student_lecture.create({
        lectureId,
        studentId: studentData.id,
        attended: false,
        earnedCredits: 0,
      });

      // Обнови броя регистрации
      const registeredCount = await student_lecture.count({ where: { lectureId } });
      await lectureData.update({ registeredCount });

      res.status(201).json({
        success: true,
        message: 'Successfully registered for lecture',
        registration,
      });
    } catch (err) {
      console.error('❌ [REGISTER LECTURE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/lectures/:id/register
// Отписване от лекция
// ===============================
lecturesController.delete(
  '/:id/register',
  isAuth,
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);
      const userId = req.user.userId;

      const studentData = await student.findOne({ where: { userId } });
      if (!studentData) {
        return res.status(400).json({
          success: false,
          message: 'Student profile not found',
        });
      }

      const registration = await student_lecture.findOne({
        where: { lectureId, studentId: studentData.id },
      });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found',
        });
      }

      await registration.destroy();

      // Обнови броя регистрации
      const registeredCount = await student_lecture.count({ where: { lectureId } });
      await lecture.update({ registeredCount }, { where: { id: lectureId } });

      res.status(200).json({
        success: true,
        message: 'Successfully unregistered from lecture',
      });
    } catch (err) {
      console.error('❌ [UNREGISTER LECTURE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/lectures/:id/registration-status
// Статус на регистрация
// ===============================
lecturesController.get(
  '/:id/registration-status',
  isAuth,
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);
      const userId = req.user.userId;

      const studentData = await student.findOne({ where: { userId } });
      if (!studentData) {
        return res.status(200).json({
          success: true,
          isRegistered: false,
          registration: null,
        });
      }

      const registration = await student_lecture.findOne({
        where: { lectureId, studentId: studentData.id },
      });

      res.status(200).json({
        success: true,
        isRegistered: !!registration,
        registration,
      });
    } catch (err) {
      console.error('❌ [REGISTRATION STATUS] Error:', err);
      next(err);
    }
  }
);
// ===============================
// POST /api/academy/lectures/:id/mentors
// Добавяне на ментор към лекция
// ===============================
lecturesController.post( // НОВО
  '/:id/mentors',
  isAuth,
  rbac.checkPermission('lecture', 'update'),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);
      const { mentorId, role, isLead } = req.body;

      if (!mentorId) {
        return res.status(400).json({ success: false, message: 'mentorId is required' });
      }

      const lectureData = await lecture.findByPk(lectureId);
      if (!lectureData) {
        return res.status(404).json({ success: false, message: 'Lecture not found' });
      }

      const existing = await mentor_lecture.findOne({ where: { lectureId, mentorId } });

      if (isLead) {
        await mentor_lecture.update({ isLead: false }, { where: { lectureId } });
      }
      let record;
      if (existing) {
        // Вече е назначен — обнови го
        await existing.update({
          role: role || existing.role,
          isLead: isLead !== undefined ? isLead : existing.isLead,
        });
        record = existing;
      } else {
        // Нов — създай
        record = await mentor_lecture.create({
          lectureId,
          mentorId,
          role: role || 'lecturer',
          isLead: isLead || false,
        });
      }

      const result = await mentor_lecture.findByPk(record.id, {
        include: [{ model: mentor, as: 'mentor', attributes: ['id', 'name', 'photoUrl', 'specialization', 'email'] }],
      });


      res.status(existing ? 200 : 201).json({
        success: true,
        message: existing ? 'Mentor updated' : 'Mentor added to lecture',
        mentorLecture: result,
      });
    } catch (err) {
      console.error('❌ [ADD LECTURE MENTOR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/lectures/:id/mentors/:mentorLectureId
// Обновяване на ментор в лекция
// ===============================
lecturesController.put( // НОВО
  '/:id/mentors/:mentorLectureId',
  isAuth,
  rbac.checkPermission('lecture', 'update'),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);
      const mentorLectureId = parseInt(req.params.mentorLectureId);
      const { role, isLead } = req.body;

      const record = await mentor_lecture.findOne({ where: { id: mentorLectureId, lectureId } });
      if (!record) {
        return res.status(404).json({ success: false, message: 'Mentor assignment not found' });
      }

      if (isLead) {
        await mentor_lecture.update({ isLead: false }, { where: { lectureId, id: { [Op.ne]: mentorLectureId } } });
      }

      await record.update({ role: role ?? record.role, isLead: isLead ?? record.isLead });

      const result = await mentor_lecture.findByPk(mentorLectureId, {
        include: [{ model: mentor, as: 'mentor', attributes: ['id', 'name', 'photoUrl', 'specialization', 'email'] }],
      });

      res.status(200).json({ success: true, message: 'Mentor updated', mentorLecture: result });
    } catch (err) {
      console.error('❌ [UPDATE LECTURE MENTOR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/lectures/:id/mentors/:mentorLectureId
// Премахване на ментор от лекция
// ===============================
lecturesController.delete( // НОВО
  '/:id/mentors/:mentorLectureId',
  isAuth,
  rbac.checkPermission('lecture', 'update'),
  async (req, res, next) => {
    try {
      const lectureId = parseInt(req.params.id);
      const mentorLectureId = parseInt(req.params.mentorLectureId);

      const record = await mentor_lecture.findOne({ where: { id: mentorLectureId, lectureId } });
      if (!record) {
        return res.status(404).json({ success: false, message: 'Mentor assignment not found' });
      }

      const wasLead = record.isLead;
      await record.destroy();

      if (wasLead) {
        const nextMentor = await mentor_lecture.findOne({ where: { lectureId }, order: [['createdAt', 'ASC']] });
        if (nextMentor) await nextMentor.update({ isLead: true });
      }

      res.status(200).json({ success: true, message: 'Mentor removed from lecture' });
    } catch (err) {
      console.error('❌ [DELETE LECTURE MENTOR] Error:', err);
      next(err);
    }
  }
);
module.exports = lecturesController;