// server/src/controllers/coursesController.js

const coursesController = require('express').Router();
const { Op } = require('sequelize');

const {
  course,
  course_module,
  lesson,
  course_material,
  mentor_course,
  student_course,
  user_account,
  mentor,
  lecture,
  sequelize,
  lesson_material,
  lesson_test,
} = require('../sequelize/models/index');

const { validateBody, validateQuery } = require('../middlewares/validateRequest');
const {
  courseCreateSchema,
  courseUpdateSchema,
  courseQuerySchema,
  moduleCreateSchema,
  moduleUpdateSchema,
  moduleReorderSchema,
  lessonCreateSchema,
  lessonUpdateSchema,
  lessonReorderSchema,
} = require('../schemas/academySchemas');

const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');

// ===============================
// HELPER: Generate slug from title
// ===============================
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9а-яё\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
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

    const existing = await course.findOne({ where });
    if (!existing) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// ===============================
// HELPER: Find course by slug or id
// ===============================
const findCourseBySlugOrId = async (slugOrId) => {
  const where = isNaN(slugOrId)
    ? { slug: slugOrId }
    : { id: parseInt(slugOrId) };
  return await course.findOne({ where });
};

// ===============================
// HELPER: Find lesson by slug or id within course
// ===============================
const findLessonBySlugOrId = async (slugOrId, courseId) => {
  const where = isNaN(slugOrId)
    ? { slug: slugOrId, courseId }
    : { id: parseInt(slugOrId), courseId };
  return await lesson.findOne({ where });
};

// ===============================
// ============ COURSES ============
// ===============================

// ===============================
// GET /api/academy/courses
// Публичен списък с курсове
// ===============================
coursesController.get('/', validateQuery(courseQuerySchema), async (req, res, next) => {
  try {
    const { page, limit, search, category, difficulty, status, sortBy } = req.query;

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const where = {};

    // По подразбиране показваме само публикувани
    if (status === 'published' || !status) {
      where.isDraft = false;
      where.isPublic = true;
    }

    // Filter by category
    if (category && category !== 'all') {
      where.category = category;
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'all') {
      where.difficultyLevel = difficulty;
    }

    // Search
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Sort order
    let order = [['createdAt', 'DESC']];
    switch (sortBy) {
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      case 'name':
        order = [['name', 'ASC']];
        break;
      case 'rating':
        order = [['rating', 'DESC']];
        break;
      case 'popular':
        order = [['enrolledCount', 'DESC']];
        break;
    }

    const { count, rows: courses } = await course.findAndCountAll({
      where,
      include: [
        {
          model: user_account,
          as: 'creator',
          attributes: ['id', 'email'],
        },
        {
          model: mentor_course,
          as: 'instances',
          attributes: ['id', 'mentorId'],
          include: [
            {
              model: mentor,
              as: 'mentor',
              attributes: ['id', 'name', 'photoUrl'],
            },
          ],
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
      courses,
      pagination: {
        page,
        limit,
        total: count,
        totalPages,
      },
    });
  } catch (err) {
    console.error('❌ [GET COURSES] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/courses/admin
// Admin списък (включва drafts)
// ===============================
coursesController.get(
  '/admin',
  isAuth,
  rbac.checkPermission('course', 'update'),
  validateQuery(courseQuerySchema),
  async (req, res, next) => {
    try {
      const { page, limit, search, category, status, sortBy } = req.query;

      const offset = (page - 1) * limit;

      const where = {};

      if (status && status !== 'all') {
        if (status === 'draft') {
          where.isDraft = true;
        } else if (status === 'published') {
          where.isDraft = false;
        }
      }

      if (category && category !== 'all') {
        where.category = category;
      }

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { slug: { [Op.iLike]: `%${search}%` } },
        ];
      }

      let order = [['createdAt', 'DESC']];
      switch (sortBy) {
        case 'oldest':
          order = [['createdAt', 'ASC']];
          break;
        case 'name':
          order = [['name', 'ASC']];
          break;
        case 'popular':
          order = [['enrolledCount', 'DESC']];
          break;
      }

      const { count, rows: courses } = await course.findAndCountAll({
        where,
        include: [
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
        courses,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
        },
      });
    } catch (err) {
      console.error('❌ [GET ADMIN COURSES] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/courses/meta/categories
// Списък с категории
// ===============================
coursesController.get('/meta/categories', async (req, res, next) => {
  try {
    const categories = await course.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      where: {
        category: { [Op.ne]: null },
        isDraft: false,
      },
      raw: true,
    });

    res.status(200).json({
      success: true,
      categories: categories.map((c) => c.category).filter(Boolean),
    });
  } catch (err) {
    console.error('❌ [GET CATEGORIES] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/courses/:slug
// Детайли за курс (по slug)
// ===============================
coursesController.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const courseData = await course.findOne({
      where: { slug },
      include: [
        {
          model: user_account,
          as: 'creator',
          attributes: ['id', 'email'],
        },
        {
          model: course_module,
          as: 'modules',
          include: [
            {
              model: lesson,
              as: 'lessons',
              required: false,
              include: [
                {
                  model: mentor,
                  as: 'mentor',
                  attributes: ['id', 'name', 'photoUrl', 'specialization'],
                },
                {
                  model: lesson_material,
                  as: 'materials',
                  where: { status: 'active' },
                  required: false,
                  attributes: ['id', 'title', 'description', 'materialType', 'fileUrl', 'originalFileName', 'fileSize', 'mimeType', 'externalUrl', 'isDownloadable', 'sortOrder'],
                },
                {
                  model: lesson_test,
                  as: 'tests',
                  required: false,
                  attributes: ['id', 'title', 'description', 'passingScore', 'maxAttempts', 'timeLimitMinutes', 'isPublished'],
                },
              ],
            },
          ],
        },
        {
         model: lesson,
  as: 'lessons',
  where: {
    moduleId: null,
  },
  required: false,  
          required: false,
          include: [
            {
              model: mentor,
              as: 'mentor',
              attributes: ['id', 'name', 'photoUrl', 'specialization'],
            },
            {
              model: lesson_material,
              as: 'materials',
              where: { status: 'active' },
              required: false,
              attributes: ['id', 'title', 'description', 'materialType', 'fileUrl', 'originalFileName', 'fileSize', 'mimeType', 'externalUrl', 'isDownloadable', 'sortOrder'],
            },
            {
              model: lesson_test,
              as: 'tests',
              required: false,
              attributes: ['id', 'title', 'description', 'passingScore', 'maxAttempts', 'timeLimitMinutes', 'isPublished'],
            },
          ],
        },
        {
          model: course_material,
          as: 'materials',
          where: { status: 'active' },
          required: false,
        },
        {
          model: mentor_course,
          as: 'instances',
          include: [
            {
              model: mentor,
              as: 'mentor',
              attributes: ['id', 'name', 'photoUrl', 'specialization'],
            },
          ],
        },
        {
          model: lecture,
          as: 'lectures',
          where: { isPublished: true },
          required: false,
          attributes: [
            'id', 'slug', 'title', 'shortDescription', 'category',
            'lectureType', 'isOnline', 'thumbnailUrl', 'scheduledDate',
            'scheduledEndDate', 'durationMinutes', 'status',
            'maxCredits', 'creditsForAttendance', 'registeredCount',
            'attendedCount', 'rating'
          ],
          include: [
            {
              model: mentor,
              as: 'lecturer',
              attributes: ['id', 'name', 'photoUrl', 'specialization'],
            },
          ],
        },
      ],
    });

    if (!courseData) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.status(200).json({
      success: true,
      course: courseData,
    });
  } catch (err) {
    console.error('❌ [GET COURSE BY SLUG] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/courses/id/:id
// Детайли за курс (по ID - за admin)
// ===============================
coursesController.get(
  '/id/:id',
  isAuth,
  rbac.checkPermission('course', 'update'),
  async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);

      const courseData = await course.findByPk(courseId, {
        include: [
          {
            model: user_account,
            as: 'creator',
            attributes: ['id', 'email'],
          },
          {
            model: course_module,
            as: 'modules',
            include: [
              {
                model: lesson,
                as: 'lessons',
              },
            ],
          },
          {
            model: lesson,
            as: 'lessons',
            where: { moduleId: null },
            required: false,
          },
          {
            model: course_material,
            as: 'materials',
          },
          {
            model: lecture,
            as: 'lectures',
            required: false,
            include: [
              {
                model: mentor,
                as: 'lecturer',
                attributes: ['id', 'name', 'photoUrl'],
              },
            ],
          },
          {
            model: mentor_course,
            as: 'instances',
            include: [
              {
                model: mentor,
                as: 'mentor',
                attributes: ['id', 'name', 'photoUrl'],
              },
            ],
          },
        ],
      });

      if (!courseData) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      res.status(200).json({
        success: true,
        course: courseData,
      });
    } catch (err) {
      console.error('❌ [GET COURSE BY ID] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/courses
// Създаване на курс
// ===============================
coursesController.post(
  '/',
  isAuth,
  rbac.checkPermission('course', 'create'),
  validateBody(courseCreateSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const {
        name,
        shortDescription,
        description,
        category,
        courseType,
        difficultyLevel,
        videoProvider,
        trailerUrl,
        thumbnailUrl,
        durationWeeks,
        estimatedHours,
        startDate,
        endDate,
        maxParticipants,
        requiresApproval,
        isPublic,
        maxCredits,
        creditsForCompletion,
        hasCertificate,
        tags,
        targetAudience,
      } = req.body;

      // Generate unique slug
      const slug = await generateUniqueSlug(name);

      const newCourse = await course.create({
        createdBy: userId,
        slug,
        name,
        shortDescription,
        description,
        category,
        courseType,
        difficultyLevel,
        videoProvider,
        trailerUrl,
        thumbnailUrl,
        durationWeeks,
        estimatedHours,
        startDate,
        endDate,
        maxParticipants,
        requiresApproval,
        isPublic,
        maxCredits,
        creditsForCompletion,
        hasCertificate,
        tags,
        targetAudience,
        isDraft: true,
        status: 'draft',
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        course: newCourse,
      });
    } catch (err) {
      console.error('❌ [CREATE COURSE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/courses/:id
// Редактиране на курс
// ===============================
coursesController.put(
  '/:id',
  isAuth,
  rbac.checkPermission('course', 'update'),
  validateBody(courseUpdateSchema),
  async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);
      const updates = req.body;

      const courseData = await course.findByPk(courseId);

      if (!courseData) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Ако name се променя, обнови slug
      if (updates.name && updates.name !== courseData.name) {
        updates.slug = await generateUniqueSlug(updates.name, courseId);
      }

      await courseData.update(updates);

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        course: courseData,
      });
    } catch (err) {
      console.error('❌ [UPDATE COURSE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/courses/:id
// Изтриване на курс
// ===============================
coursesController.delete(
  '/:id',
  isAuth,
  rbac.checkPermission('course', 'delete'),
  async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);

      const courseData = await course.findByPk(courseId);

      if (!courseData) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      // Проверка дали има записани студенти
      const enrollments = await student_course.count({
        where: { courseId },
      });

      if (enrollments > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete course with ${enrollments} enrolled students. Please remove enrollments first.`,
        });
      }

      await courseData.destroy();

      res.status(200).json({
        success: true,
        message: 'Course deleted successfully',
      });
    } catch (err) {
      console.error('❌ [DELETE COURSE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/courses/:id/publish
// Публикуване на курс
// ===============================
coursesController.post(
  '/:id/publish',
  isAuth,
  rbac.checkPermission('course', 'publish'),
  async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);

      const courseData = await course.findByPk(courseId);

      if (!courseData) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      if (!courseData.isDraft) {
        return res.status(400).json({
          success: false,
          message: 'Course is already published',
        });
      }

      if (!courseData.name || !courseData.category) {
        return res.status(400).json({
          success: false,
          message: 'Course must have name and category before publishing',
        });
      }

      await courseData.update({
        isDraft: false,
        status: 'active',
        publishedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Course published successfully',
        course: courseData,
      });
    } catch (err) {
      console.error('❌ [PUBLISH COURSE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/courses/:id/unpublish
// Скриване на курс
// ===============================
coursesController.post(
  '/:id/unpublish',
  isAuth,
  rbac.checkPermission('course', 'publish'),
  async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);

      const courseData = await course.findByPk(courseId);

      if (!courseData) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      if (courseData.isDraft) {
        return res.status(400).json({
          success: false,
          message: 'Course is already unpublished',
        });
      }

      await courseData.update({
        isDraft: true,
        status: 'draft',
      });

      res.status(200).json({
        success: true,
        message: 'Course unpublished successfully',
        course: courseData,
      });
    } catch (err) {
      console.error('❌ [UNPUBLISH COURSE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/courses/:id/statistics
// Статистики за курс
// ===============================
coursesController.get(
  '/:id/statistics',
  isAuth,
  rbac.checkPermission('course', 'update'),
  async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.id);

      const courseData = await course.findByPk(courseId);

      if (!courseData) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      const totalEnrollments = await student_course.count({ where: { courseId } });
      const completedEnrollments = await student_course.count({ where: { courseId, status: 'completed' } });
      const inProgressEnrollments = await student_course.count({ where: { courseId, status: 'in_progress' } });

      const totalLessons = await lesson.count({ where: { courseId } });
      const publishedLessons = await lesson.count({ where: { courseId, isPublished: true } });
      const totalModules = await course_module.count({ where: { courseId } });

      const progressData = await student_course.findAll({
        where: { courseId },
        attributes: [[sequelize.fn('AVG', sequelize.col('progress')), 'avgProgress']],
        raw: true,
      });

      const averageProgress = Math.round(parseFloat(progressData[0].avgProgress) || 0);
      const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

      res.status(200).json({
        success: true,
        statistics: {
          enrollments: { total: totalEnrollments, completed: completedEnrollments, inProgress: inProgressEnrollments },
          content: { totalModules, totalLessons, publishedLessons },
          performance: { averageProgress, completionRate, rating: parseFloat(courseData.rating) || 0 },
        },
      });
    } catch (err) {
      console.error('❌ [GET COURSE STATISTICS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// ============ MODULES ============
// ===============================

// ===============================
// GET /api/academy/courses/:courseSlug/modules
// ===============================
coursesController.get('/:courseSlug/modules', async (req, res, next) => {
  try {
    const { courseSlug } = req.params;

    const courseData = await findCourseBySlugOrId(courseSlug);

    if (!courseData) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const modules = await course_module.findAll({
      where: { courseId: courseData.id },
      include: [
        {
          model: lesson,
          as: 'lessons',
          attributes: ['id', 'title', 'slug', 'lessonType', 'durationMinutes', 'sortOrder', 'isPublished', 'isFree'],
        },
      ],
      order: [['sortOrder', 'ASC']],
    });

    res.status(200).json({ success: true, modules });
  } catch (err) {
    console.error('❌ [GET MODULES] Error:', err);
    next(err);
  }
});

// ===============================
// POST /api/academy/courses/:courseSlug/modules
// ===============================
coursesController.post(
  '/:courseSlug/modules',
  isAuth,
  rbac.checkPermission('course', 'update'),
  validateBody(moduleCreateSchema),
  async (req, res, next) => {
    try {
      const { courseSlug } = req.params;
      const { title, description, startDate, endDate, estimatedHours } = req.body;

      const courseData = await findCourseBySlugOrId(courseSlug);

      if (!courseData) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const lastModule = await course_module.findOne({
        where: { courseId: courseData.id },
        order: [['sortOrder', 'DESC']],
      });

      const newModule = await course_module.create({
        courseId: courseData.id,
        title,
        description,
        startDate: startDate || null,
        endDate: endDate || null,
        estimatedHours: estimatedHours || null,
        sortOrder: lastModule ? lastModule.sortOrder + 1 : 0,
        status: 'draft',
        isPublished: false,
      });

      res.status(201).json({ success: true, message: 'Module created successfully', module: newModule });
    } catch (err) {
      console.error('❌ [CREATE MODULE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/courses/:courseSlug/modules/:moduleId
// ===============================
coursesController.put(
  '/:courseSlug/modules/:moduleId',
  isAuth,
  rbac.checkPermission('course', 'update'),
  validateBody(moduleUpdateSchema),
  async (req, res, next) => {
    try {
      const { courseSlug } = req.params;
      const moduleId = parseInt(req.params.moduleId);
      const { title, description, isPublished, startDate, endDate, estimatedHours } = req.body;

      const courseData = await findCourseBySlugOrId(courseSlug);

      if (!courseData) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const moduleData = await course_module.findOne({ where: { id: moduleId, courseId: courseData.id } });

      if (!moduleData) {
        return res.status(404).json({ success: false, message: 'Module not found' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (isPublished !== undefined) {
        updates.isPublished = isPublished;
        updates.status = isPublished ? 'active' : 'draft';
      }
      if (startDate !== undefined) updates.startDate = startDate;
      if (endDate !== undefined) updates.endDate = endDate;
      if (estimatedHours !== undefined) updates.estimatedHours = estimatedHours;

      await moduleData.update(updates);

      res.status(200).json({ success: true, message: 'Module updated successfully', module: moduleData });
    } catch (err) {
      console.error('❌ [UPDATE MODULE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/courses/:courseSlug/modules/:moduleId
// ===============================
coursesController.delete(
  '/:courseSlug/modules/:moduleId',
  isAuth,
  rbac.checkPermission('course', 'update'),
  async (req, res, next) => {
    try {
      const { courseSlug } = req.params;
      const moduleId = parseInt(req.params.moduleId);

      const courseData = await findCourseBySlugOrId(courseSlug);

      if (!courseData) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const moduleData = await course_module.findOne({ where: { id: moduleId, courseId: courseData.id } });

      if (!moduleData) {
        return res.status(404).json({ success: false, message: 'Module not found' });
      }

      await lesson.update({ moduleId: null }, { where: { moduleId } });
      await moduleData.destroy();

      res.status(200).json({ success: true, message: 'Module deleted successfully. Lessons moved to course root.' });
    } catch (err) {
      console.error('❌ [DELETE MODULE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/courses/:courseSlug/modules/reorder
// ===============================
coursesController.put(
  '/:courseSlug/modules/reorder',
  isAuth,
  rbac.checkPermission('course', 'update'),
  validateBody(moduleReorderSchema),
  async (req, res, next) => {
    try {
      const { courseSlug } = req.params;
      const { moduleIds } = req.body;

      const courseData = await findCourseBySlugOrId(courseSlug);

      if (!courseData) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const updates = moduleIds.map((id, index) =>
        course_module.update({ sortOrder: index }, { where: { id, courseId: courseData.id } })
      );

      await Promise.all(updates);

      res.status(200).json({ success: true, message: 'Modules reordered successfully' });
    } catch (err) {
      console.error('❌ [REORDER MODULES] Error:', err);
      next(err);
    }
  }
);
// ===============================
// PUT /api/academy/courses/:courseSlug/lessons/reorder
// ===============================
coursesController.put(
  '/:courseSlug/lessons/reorder',
  isAuth,
  rbac.checkPermission('lesson', 'update'),
  validateBody(lessonReorderSchema),
  async (req, res, next) => {
    try {
      const { courseSlug } = req.params;
      const { lessonIds, moduleId } = req.body;

      const courseData = await findCourseBySlugOrId(courseSlug);

      if (!courseData) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const updates = lessonIds.map((id, index) =>
        lesson.update(
          { sortOrder: index, moduleId: moduleId || null },
          { where: { id, courseId: courseData.id } }
        )
      );

      await Promise.all(updates);

      res.status(200).json({ success: true, message: 'Lessons reordered successfully' });
    } catch (err) {
      console.error('❌ [REORDER LESSONS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// ============ LESSONS ============
// ===============================

// ===============================
// GET /api/academy/courses/:courseSlug/lessons
// ===============================
coursesController.get('/:courseSlug/lessons', async (req, res, next) => {
  try {
    const { courseSlug } = req.params;
    const { moduleId } = req.query;

    const courseData = await findCourseBySlugOrId(courseSlug);

    if (!courseData) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const where = { courseId: courseData.id };

    if (moduleId === 'null' || moduleId === 'root') {
      where.moduleId = null;
    } else if (moduleId) {
      where.moduleId = parseInt(moduleId);
    }

    const lessons = await lesson.findAll({
      where,
      include: [
        { model: course_module, as: 'module', attributes: ['id', 'title'] },
        { model: mentor, as: 'mentor', attributes: ['id', 'name', 'photoUrl'] },
      ],
      order: [['sortOrder', 'ASC']],
    });

    res.status(200).json({ success: true, lessons });
  } catch (err) {
    console.error('❌ [GET LESSONS] Error:', err);
    next(err);
  }
});


// ===============================
// GET /api/academy/courses/:courseSlug/lessons/:lessonSlug
// Поддържа и slug, и id за backwards compatibility
// ===============================
coursesController.get('/:courseSlug/lessons/:lessonSlug', async (req, res, next) => {
  try {
    const { courseSlug, lessonSlug } = req.params;

    const courseData = await findCourseBySlugOrId(courseSlug);

    if (!courseData) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const lessonData = await findLessonBySlugOrId(lessonSlug, courseData.id);

    if (!lessonData) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Reload with includes
    const fullLessonData = await lesson.findByPk(lessonData.id, {
      include: [
        { model: course_module, as: 'module', attributes: ['id', 'title'] },
        { model: mentor, as: 'mentor', attributes: ['id', 'name', 'photoUrl', 'specialization'] },
        { model: course, as: 'course', attributes: ['id', 'name', 'slug'] },
      ],
    });

    // Increment view count
    await fullLessonData.increment('viewsCount');

    res.status(200).json({ success: true, lesson: fullLessonData });
  } catch (err) {
    console.error('❌ [GET LESSON] Error:', err);
    next(err);
  }
});

// ===============================
// POST /api/academy/courses/:courseSlug/lessons
// ===============================
coursesController.post(
  '/:courseSlug/lessons',
  isAuth,
  rbac.checkPermission('lesson', 'create'),
  validateBody(lessonCreateSchema),
  async (req, res, next) => {
    try {
      const { courseSlug } = req.params;
      const userId = req.user.userId;

      const courseData = await findCourseBySlugOrId(courseSlug);

      if (!courseData) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const {
        title, description, moduleId, lessonType, videoProvider, videoUrl, liveStreamUrl,
        thumbnailUrl, durationMinutes, scheduledDate, maxCredits, creditsForCompletion,
        creditsForTest, hasTest, testPassingScore, requiresCompletion, prerequisiteLessonId,
        isFree, mentorId,
      } = req.body;

      // Generate unique slug within course
      let baseSlug = generateSlug(title);
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await lesson.findOne({ where: { courseId: courseData.id, slug } });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const lastLesson = await lesson.findOne({
        where: { courseId: courseData.id, moduleId: moduleId || null },
        order: [['sortOrder', 'DESC']],
      });

      const newLesson = await lesson.create({
        courseId: courseData.id,
        moduleId: moduleId || null,
        createdBy: userId,
        slug,
        title,
        description,
        sortOrder: lastLesson ? lastLesson.sortOrder + 1 : 0,
        lessonType,
        videoProvider,
        videoUrl,
        liveStreamUrl,
        thumbnailUrl,
        durationMinutes,
        scheduledDate,
        maxCredits,
        creditsForCompletion,
        creditsForTest,
        hasTest,
        testPassingScore,
        requiresCompletion,
        prerequisiteLessonId,
        isFree,
        mentorId,
        status: 'draft',
        isPublished: false,
      });

      await course.increment('totalLessons', { where: { id: courseData.id } });

      if (moduleId) {
        await course_module.increment('lessonsCount', { where: { id: moduleId } });
      }

      res.status(201).json({ success: true, message: 'Lesson created successfully', lesson: newLesson });
    } catch (err) {
      console.error('❌ [CREATE LESSON] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/courses/:courseSlug/lessons/:lessonSlug
// ===============================
coursesController.put(
  '/:courseSlug/lessons/:lessonSlug',
  isAuth,
  rbac.checkPermission('lesson', 'update'),
  validateBody(lessonUpdateSchema),
  async (req, res, next) => {
    try {
      const { courseSlug, lessonSlug } = req.params;
      const updates = req.body;

      const courseData = await findCourseBySlugOrId(courseSlug);

      if (!courseData) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const lessonData = await findLessonBySlugOrId(lessonSlug, courseData.id);

      if (!lessonData) {
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }

      // Handle module change
      const oldModuleId = lessonData.moduleId;
      const newModuleId = updates.moduleId;

      if (newModuleId !== undefined && newModuleId !== oldModuleId) {
        if (oldModuleId) {
          await course_module.decrement('lessonsCount', { where: { id: oldModuleId } });
        }
        if (newModuleId) {
          await course_module.increment('lessonsCount', { where: { id: newModuleId } });
        }
      }
      await lessonData.update(updates);

      res.status(200).json({ success: true, message: 'Lesson updated successfully', lesson: lessonData });
    } catch (err) {
      console.error('❌ [UPDATE LESSON] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/courses/:courseSlug/lessons/:lessonSlug
// ===============================
coursesController.delete(
  '/:courseSlug/lessons/:lessonSlug',
  isAuth,
  rbac.checkPermission('lesson', 'delete'),
  async (req, res, next) => {
    try {
      const { courseSlug, lessonSlug } = req.params;

      const courseData = await findCourseBySlugOrId(courseSlug);

      if (!courseData) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const lessonData = await findLessonBySlugOrId(lessonSlug, courseData.id);

      if (!lessonData) {
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }

      const moduleId = lessonData.moduleId;

      await lessonData.destroy();

      await course.decrement('totalLessons', { where: { id: courseData.id } });

      if (moduleId) {
        await course_module.decrement('lessonsCount', { where: { id: moduleId } });
      }

      res.status(200).json({ success: true, message: 'Lesson deleted successfully' });
    } catch (err) {
      console.error('❌ [DELETE LESSON] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/courses/:courseSlug/lessons/:lessonSlug/publish
// ===============================
coursesController.post(
  '/:courseSlug/lessons/:lessonSlug/publish',
  isAuth,
  rbac.checkPermission('lesson', 'update'),
  async (req, res, next) => {
    try {
      const { courseSlug, lessonSlug } = req.params;

      const courseData = await findCourseBySlugOrId(courseSlug);

      if (!courseData) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const lessonData = await findLessonBySlugOrId(lessonSlug, courseData.id);

      if (!lessonData) {
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }

      await lessonData.update({
        isPublished: true,
        status: 'active',
        publishedAt: new Date(),
      });

      res.status(200).json({ success: true, message: 'Lesson published successfully', lesson: lessonData });
    } catch (err) {
      console.error('❌ [PUBLISH LESSON] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/courses/:courseSlug/lessons/:lessonSlug/unpublish
// ===============================
coursesController.post(
  '/:courseSlug/lessons/:lessonSlug/unpublish',
  isAuth,
  rbac.checkPermission('lesson', 'update'),
  async (req, res, next) => {
    try {
      const { courseSlug, lessonSlug } = req.params;

      const courseData = await findCourseBySlugOrId(courseSlug);

      if (!courseData) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }

      const lessonData = await findLessonBySlugOrId(lessonSlug, courseData.id);

      if (!lessonData) {
        return res.status(404).json({ success: false, message: 'Lesson not found' });
      }

      await lessonData.update({
        isPublished: false,
        status: 'draft',
      });

      res.status(200).json({ success: true, message: 'Lesson unpublished successfully', lesson: lessonData });
    } catch (err) {
      console.error('❌ [UNPUBLISH LESSON] Error:', err);
      next(err);
    }
  }
);


module.exports = coursesController;