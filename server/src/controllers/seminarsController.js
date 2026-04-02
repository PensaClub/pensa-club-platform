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
  admin_notification
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

module.exports = seminarsController;