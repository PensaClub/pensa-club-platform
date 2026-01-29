// server/src/controllers/academyMyController.js

const academyMyController = require('express').Router();
const { Op } = require('sequelize');

const {
  course_enrollment,
  student_lesson,
  student_lecture,
  student_seminar,
  course,
  lesson,
  lecture,
  seminar,
  module: courseModule,
  certificate,
  student_test_attempt,
  student,
  mentor,
  user_account,
  user_details,
  sequelize,
} = require('../sequelize/models/index');

const { validateBody, validateQuery } = require('../middlewares/validateRequest');
const {
  paginationSchema,
  lessonProgressUpdateSchema,
} = require('../schemas/academySchemas');

const isAuth = require('../middlewares/isAuth.js');

// Local schemas
const { z } = require('zod');

const myCoursesQuerySchema = paginationSchema.extend({
  status: z.enum(['all', 'active', 'pending', 'completed', 'dropped', 'rejected']).default('all'),
  sortBy: z.enum(['recent', 'newest', 'oldest', 'progress', 'name']).default('recent'),
});

const limitOnlySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(5),
});

const myLecturesQuerySchema = paginationSchema.extend({
  filter: z.enum(['all', 'upcoming', 'past', 'attended']).default('all'),
  sortBy: z.enum(['date', 'title']).default('date'),
});

const mySeminarsQuerySchema = paginationSchema.extend({
  filter: z.enum(['all', 'upcoming', 'past', 'attended', 'pending']).default('all'),
  sortBy: z.enum(['date', 'title']).default('date'),
});

const scheduleQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

// ===============================
// HELPER: Get student by userId
// ===============================
const getStudentByUserId = async (userId) => {
  return await student.findOne({
    where: { userId },
  });
};

// ===============================
// HELPER: Get or create student
// ===============================
const getOrCreateStudent = async (userId) => {
  let studentData = await student.findOne({
    where: { userId },
  });

  if (!studentData) {
    studentData = await student.create({
      userId,
      status: 'active',
    });
  }

  return studentData;
};

// =========================================================
//                    MY STUFF - OVERVIEW
// =========================================================

// ===============================
// GET /api/academy/my/dashboard
// Dashboard с обобщена информация
// ===============================
academyMyController.get('/dashboard', isAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const studentData = await getStudentByUserId(userId);

    if (!studentData) {
      return res.status(200).json({
        success: true,
        dashboard: {
          courses: { enrolled: 0, inProgress: 0, completed: 0 },
          lectures: { registered: 0, attended: 0, upcoming: 0 },
          seminars: { registered: 0, attended: 0, upcoming: 0 },
          certificates: 0,
          totalCredits: 0,
        },
      });
    }

    const studentId = studentData.id;

    // Courses stats
    const enrolledCourses = await course_enrollment.count({
      where: { studentId },
    });

    const inProgressCourses = await course_enrollment.count({
      where: { studentId, status: 'active' },
    });

    const completedCourses = await course_enrollment.count({
      where: { studentId, status: 'completed' },
    });

    // Lectures stats
    const registeredLectures = await student_lecture.count({
      where: { studentId },
    });

    const attendedLectures = await student_lecture.count({
      where: { studentId, attended: true },
    });

    const upcomingLectures = await student_lecture.count({
      where: { studentId },
      include: [
        {
          model: lecture,
          as: 'lecture',
          where: {
            scheduledDate: { [Op.gte]: new Date() },
            status: { [Op.in]: ['scheduled', 'live'] },
          },
          required: true,
        },
      ],
    });

    // Seminars stats
    const registeredSeminars = await student_seminar.count({
      where: { studentId, status: 'approved' },
    });

    const attendedSeminars = await student_seminar.count({
      where: { studentId, attended: true },
    });

    const upcomingSeminars = await student_seminar.count({
      where: { studentId, status: 'approved' },
      include: [
        {
          model: seminar,
          as: 'seminar',
          where: {
            scheduledDate: { [Op.gte]: new Date() },
            status: { [Op.in]: ['scheduled', 'live'] },
          },
          required: true,
        },
      ],
    });

    // Certificates
    const certificatesCount = await certificate.count({
      where: { studentId, status: 'active' },
    });

    // Total credits
    const courseCredits = await course_enrollment.sum('totalCreditsEarned', {
      where: { studentId },
    });

    const lectureCredits = await student_lecture.sum('earnedCredits', {
      where: { studentId },
    });

    const seminarCredits = await student_seminar.sum('earnedCredits', {
      where: { studentId },
    });

    const totalCredits =
      (courseCredits || 0) + (lectureCredits || 0) + (seminarCredits || 0);

    res.status(200).json({
  success: true,
  dashboard: {
    courses: {
      enrolled: enrolledCourses,
      inProgress: inProgressCourses,
      completed: completedCourses,
    },
    lectures: {
      registered: registeredLectures,
      attended: attendedLectures,
      upcoming: upcomingLectures,
    },
    seminars: {
      registered: registeredSeminars,
      attended: attendedSeminars,
      upcoming: upcomingSeminars,
    },
    certificates: certificatesCount,
    // Credits breakdown
    totalCredits,
    totalCreditsEarned: totalCredits,
    creditsFromCourses: courseCredits || 0,
    creditsFromLectures: lectureCredits || 0,
    creditsFromSeminars: seminarCredits || 0,
    creditsFromPresentations: 0, // TODO: добави когато имаш student_presentation credits
  },
});
  } catch (err) {
    console.error('❌ [GET MY DASHBOARD] Error:', err);
    next(err);
  }
});
// ===============================
// ===============================
// GET /api/academy/my/mentor
// Моят текущ ментор
// ===============================
academyMyController.get('/mentor', isAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const studentData = await student.findOne({
      where: { userId },
      attributes: ['currentMentorId'],
      include: [
        {
          model: mentor,
          as: 'currentMentor',
          attributes: [
            'id',
            'name',
            'email',
            'photoUrl',
            'specialization',
            'isOnline',
            'priorityContact',
            'rating',
            'otherContact',
            'status',
          ],
        },
      ],
    });

    if (!studentData || !studentData.currentMentor) {
      return res.status(200).json({
        success: true,
        mentor: null,
      });
    }

    res.status(200).json({
      success: true,
      mentor: studentData.currentMentor,
    });
  } catch (err) {
    console.error('❌ [GET MY MENTOR] Error:', err);
    next(err);
  }
});
// =========================================================
//                    MY COURSES
// =========================================================

// ===============================
// GET /api/academy/my/courses
// Моите курсове
// ===============================
academyMyController.get(
  '/courses',
  isAuth,
  validateQuery(myCoursesQuerySchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { page, limit, status, sortBy } = req.query;

      const offset = (page - 1) * limit;

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          courses: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }

      const where = { studentId: studentData.id };

      if (status && status !== 'all') {
        where.status = status;
      }

      let order = [['lastAccessedAt', 'DESC NULLS LAST']];
      switch (sortBy) {
        case 'newest':
          order = [['enrolledAt', 'DESC']];
          break;
        case 'oldest':
          order = [['enrolledAt', 'ASC']];
          break;
        case 'progress':
          order = [['progressPercentage', 'DESC']];
          break;
        case 'name':
          order = [[{ model: course, as: 'course' }, 'name', 'ASC']];
          break;
      }

      const { count, rows: enrollments } = await course_enrollment.findAndCountAll({
        where,
        include: [
          {
            model: course,
            as: 'course',
            attributes: [
              'id',
              'name',
              'slug',
              'shortDescription',
              'thumbnailUrl',
              'category',
              'difficultyLevel',
              'totalLessons',
              'estimatedHours',
              'durationWeeks',
            ],
            include: [
              {
                model: mentor,
                as: 'mentorInstances',
                attributes: ['id', 'name', 'photoUrl'],
                through: { attributes: [] },
              },
            ],
          },
        ],
        limit,
        offset,
        order,
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      const courses = enrollments.map((e) => ({
        enrollmentId: e.id,
        courseId: e.courseId,
        course: e.course,
        status: e.status,
        progressPercentage: e.progressPercentage,
        completedLessons: e.completedLessons,
        totalCreditsEarned: e.totalCreditsEarned,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        lastAccessedAt: e.lastAccessedAt,
        currentLessonId: e.currentLessonId,
      }));

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
      console.error('❌ [GET MY COURSES] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/my/courses/continue
// Курсове за продължаване (in progress)
// ===============================
academyMyController.get(
  '/courses/continue',
  isAuth,
  validateQuery(limitOnlySchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { limit } = req.query;

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          courses: [],
        });
      }

      const enrollments = await course_enrollment.findAll({
        where: {
          studentId: studentData.id,
          status: 'active',
          // Премахнато: progressPercentage: { [Op.gt]: 0, [Op.lt]: 100 },
          progressPercentage: { [Op.lt]: 100 },  // Всички незавършени
        },
        include: [
          {
            model: course,
            as: 'course',
            attributes: ['id', 'name', 'slug', 'thumbnailUrl', 'totalLessons'],
          },
          {
            model: lesson,
            as: 'currentLesson',
            attributes: ['id', 'title', 'slug'],
          },
        ],
        order: [['lastAccessedAt', 'DESC NULLS LAST']],
        limit,
      });

      res.status(200).json({
        success: true,
        courses: enrollments,
      });
    } catch (err) {
      console.error('❌ [GET CONTINUE COURSES] Error:', err);
      next(err);
    }
  }
);
// =========================================================
//                    MY LECTURES
// =========================================================

// ===============================
// GET /api/academy/my/lectures
// Моите лекции
// ===============================
academyMyController.get(
  '/lectures',
  isAuth,
  validateQuery(myLecturesQuerySchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { page, limit, filter, sortBy } = req.query;

      const offset = (page - 1) * limit;

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          lectures: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }

      const where = { studentId: studentData.id };
      const lectureWhere = {};

      switch (filter) {
        case 'upcoming':
          lectureWhere.scheduledDate = { [Op.gte]: new Date() };
          lectureWhere.status = { [Op.in]: ['scheduled', 'live'] };
          break;
        case 'past':
          lectureWhere.scheduledDate = { [Op.lt]: new Date() };
          break;
        case 'attended':
          where.attended = true;
          break;
      }

      let order = [[{ model: lecture, as: 'lecture' }, 'scheduledDate', 'DESC']];
      if (filter === 'upcoming') {
        order = [[{ model: lecture, as: 'lecture' }, 'scheduledDate', 'ASC']];
      }

      const { count, rows: registrations } = await student_lecture.findAndCountAll({
        where,
        include: [
          {
            model: lecture,
            as: 'lecture',
            where: Object.keys(lectureWhere).length > 0 ? lectureWhere : undefined,
            attributes: [
              'id',
              'title',
              'slug',
              'shortDescription',
              'thumbnailUrl',
              'scheduledDate',
              'scheduledEndDate',
              'durationMinutes',
              'status',
              'isOnline',
              'location',
              'meetingLink',
              'category',
            ],
            include: [
              {
                model: mentor,
                as: 'lecturer',
                attributes: ['id', 'name', 'photoUrl'],
              },
            ],
          },
        ],
        limit,
        offset,
        order,
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      const lectures = registrations.map((r) => ({
        registrationId: r.id,
        lectureId: r.lectureId,
        lecture: r.lecture,
        attended: r.attended,
        attendedAt: r.attendedAt,
        earnedCredits: r.earnedCredits,
        registeredAt: r.createdAt,
      }));

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
      console.error('❌ [GET MY LECTURES] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/my/lectures/upcoming
// Предстоящи лекции
// ===============================
academyMyController.get(
  '/lectures/upcoming',
  isAuth,
  validateQuery(limitOnlySchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { limit } = req.query;

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          lectures: [],
        });
      }

      const registrations = await student_lecture.findAll({
        where: { studentId: studentData.id },
        include: [
          {
            model: lecture,
            as: 'lecture',
            where: {
              scheduledDate: { [Op.gte]: new Date() },
              status: { [Op.in]: ['scheduled', 'live'] },
            },
            attributes: [
              'id',
              'title',
              'slug',
              'thumbnailUrl',
              'scheduledDate',
              'durationMinutes',
              'isOnline',
              'meetingLink',
              'status',
            ],
            include: [
              {
                model: mentor,
                as: 'lecturer',
                attributes: ['id', 'name', 'photoUrl'],
              },
            ],
          },
        ],
        order: [[{ model: lecture, as: 'lecture' }, 'scheduledDate', 'ASC']],
        limit,
      });

      res.status(200).json({
        success: true,
        lectures: registrations,
      });
    } catch (err) {
      console.error('❌ [GET UPCOMING LECTURES] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    MY SEMINARS
// =========================================================

// ===============================
// GET /api/academy/my/seminars
// Моите семинари
// ===============================
academyMyController.get(
  '/seminars',
  isAuth,
  validateQuery(mySeminarsQuerySchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { page, limit, filter, sortBy } = req.query;

      const offset = (page - 1) * limit;

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          seminars: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }

      const where = { studentId: studentData.id };
      const seminarWhere = {};

      switch (filter) {
        case 'upcoming':
          seminarWhere.scheduledDate = { [Op.gte]: new Date() };
          seminarWhere.status = { [Op.in]: ['scheduled', 'live'] };
          where.status = 'approved';
          break;
        case 'past':
          seminarWhere.scheduledDate = { [Op.lt]: new Date() };
          break;
        case 'attended':
          where.attended = true;
          break;
        case 'pending':
          where.status = 'pending';
          break;
      }

      let order = [[{ model: seminar, as: 'seminar' }, 'scheduledDate', 'DESC']];
      if (filter === 'upcoming') {
        order = [[{ model: seminar, as: 'seminar' }, 'scheduledDate', 'ASC']];
      }

      const { count, rows: registrations } = await student_seminar.findAndCountAll({
        where,
        include: [
          {
            model: seminar,
            as: 'seminar',
            where: Object.keys(seminarWhere).length > 0 ? seminarWhere : undefined,
            attributes: [
              'id',
              'title',
              'slug',
              'shortDescription',
              'thumbnailUrl',
              'scheduledDate',
              'scheduledEndDate',
              'durationMinutes',
              'status',
              'seminarType',
              'isOnline',
              'location',
              'meetingLink',
              'category',
            ],
            include: [
              {
                model: mentor,
                as: 'facilitator',
                attributes: ['id', 'name', 'photoUrl'],
              },
            ],
          },
        ],
        limit,
        offset,
        order,
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      const seminars = registrations.map((r) => ({
        registrationId: r.id,
        seminarId: r.seminarId,
        seminar: r.seminar,
        status: r.status,
        attended: r.attended,
        attendedAt: r.attendedAt,
        participationLevel: r.participationLevel,
        earnedCredits: r.earnedCredits,
        registeredAt: r.createdAt,
      }));

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
      console.error('❌ [GET MY SEMINARS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/my/seminars/upcoming
// Предстоящи семинари
// ===============================
academyMyController.get(
  '/seminars/upcoming',
  isAuth,
  validateQuery(limitOnlySchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { limit } = req.query;

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          seminars: [],
        });
      }

      const registrations = await student_seminar.findAll({
        where: {
          studentId: studentData.id,
          status: 'approved',
        },
        include: [
          {
            model: seminar,
            as: 'seminar',
            where: {
              scheduledDate: { [Op.gte]: new Date() },
              status: { [Op.in]: ['scheduled', 'live'] },
            },
            attributes: [
              'id',
              'title',
              'slug',
              'thumbnailUrl',
              'scheduledDate',
              'durationMinutes',
              'seminarType',
              'isOnline',
              'location',
              'meetingLink',
              'status',
            ],
            include: [
              {
                model: mentor,
                as: 'facilitator',
                attributes: ['id', 'name', 'photoUrl'],
              },
            ],
          },
        ],
        order: [[{ model: seminar, as: 'seminar' }, 'scheduledDate', 'ASC']],
        limit,
      });

      res.status(200).json({
        success: true,
        seminars: registrations,
      });
    } catch (err) {
      console.error('❌ [GET UPCOMING SEMINARS] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    MY CERTIFICATES
// =========================================================

// ===============================
// GET /api/academy/my/certificates
// Моите сертификати
// ===============================
academyMyController.get(
  '/certificates',
  isAuth,
  validateQuery(paginationSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { page, limit } = req.query;

      const offset = (page - 1) * limit;

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          certificates: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        });
      }

      const { count, rows: certificates } = await certificate.findAndCountAll({
        where: {
          studentId: studentData.id,
          status: 'active',
        },
        include: [
          {
            model: course,
            as: 'course',
            attributes: ['id', 'name', 'slug', 'thumbnailUrl', 'category', 'difficultyLevel'],
          },
        ],
        limit,
        offset,
        order: [['issuedAt', 'DESC']],
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        certificates,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
        },
      });
    } catch (err) {
      console.error('❌ [GET MY CERTIFICATES] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    MY PROGRESS
// =========================================================

// ===============================
// GET /api/academy/my/progress
// Общ прогрес
// ===============================
academyMyController.get('/progress', isAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const studentData = await getStudentByUserId(userId);

    if (!studentData) {
      return res.status(200).json({
        success: true,
        progress: {
          courses: [],
          recentActivity: [],
          stats: {
            totalCoursesStarted: 0,
            totalCoursesCompleted: 0,
            totalLessonsCompleted: 0,
            totalTimeSpent: 0,
            totalCredits: 0,
            averageScore: 0,
          },
        },
      });
    }

    const studentId = studentData.id;

    const enrollments = await course_enrollment.findAll({
      where: { studentId },
      include: [
        {
          model: course,
          as: 'course',
          attributes: ['id', 'name', 'slug', 'totalLessons'],
        },
      ],
      order: [['lastAccessedAt', 'DESC NULLS LAST']],
    });

    const recentLessons = await student_lesson.findAll({
      where: { studentId },
      include: [
        {
          model: lesson,
          as: 'lesson',
          attributes: ['id', 'title', 'slug', 'courseId'],
          include: [
            {
              model: course,
              as: 'course',
              attributes: ['id', 'name', 'slug'],
            },
          ],
        },
      ],
      order: [['lastAccessedAt', 'DESC']],
      limit: 10,
    });

    const totalCoursesStarted = enrollments.length;
    const totalCoursesCompleted = enrollments.filter((e) => e.status === 'completed').length;

    const totalLessonsCompleted = await student_lesson.count({
      where: { studentId, status: 'completed' },
    });

    const totalTimeSpent = await student_lesson.sum('timeSpentMinutes', {
      where: { studentId },
    });

    const courseCredits = await course_enrollment.sum('totalCreditsEarned', {
      where: { studentId },
    });
    const lectureCredits = await student_lecture.sum('earnedCredits', {
      where: { studentId },
    });
    const seminarCredits = await student_seminar.sum('earnedCredits', {
      where: { studentId },
    });
    const totalCredits = (courseCredits || 0) + (lectureCredits || 0) + (seminarCredits || 0);

    const testAttempts = await student_test_attempt.findAll({
      where: { studentId, status: 'completed' },
      attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avgScore']],
      raw: true,
    });
    const averageScore = Math.round(parseFloat(testAttempts[0]?.avgScore) || 0);

    res.status(200).json({
      success: true,
      progress: {
        courses: enrollments.map((e) => ({
          courseId: e.courseId,
          course: e.course,
          status: e.status,
          progressPercentage: e.progressPercentage,
          completedLessons: e.completedLessons,
          totalLessons: e.course?.totalLessons,
          enrolledAt: e.enrolledAt,
          completedAt: e.completedAt,
          lastAccessedAt: e.lastAccessedAt,
        })),
        recentActivity: recentLessons.map((l) => ({
          lessonId: l.lessonId,
          lesson: l.lesson,
          status: l.status,
          progressPercentage: l.progressPercentage,
          lastAccessedAt: l.lastAccessedAt,
        })),
        stats: {
          totalCoursesStarted,
          totalCoursesCompleted,
          totalLessonsCompleted,
          totalTimeSpent: totalTimeSpent || 0,
          totalCredits,
          averageScore,
        },
      },
    });
  } catch (err) {
    console.error('❌ [GET MY PROGRESS] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/my/progress/course/:courseId
// Прогрес по курс
// ===============================
academyMyController.get('/progress/course/:courseId', isAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const courseId = parseInt(req.params.courseId);

    const studentData = await getStudentByUserId(userId);

    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const enrollment = await course_enrollment.findOne({
      where: {
        studentId: studentData.id,
        courseId,
      },
      include: [
        {
          model: course,
          as: 'course',
          include: [
            {
              model: courseModule,
              as: 'modules',
              include: [
                {
                  model: lesson,
                  as: 'lessons',
                  where: { isPublished: true },
                  required: false,
                  attributes: ['id', 'title', 'slug', 'durationMinutes', 'lessonType'],
                  order: [['sortOrder', 'ASC']],
                },
              ],
              order: [['sortOrder', 'ASC']],
            },
            {
              model: lesson,
              as: 'lessons',
              where: { isPublished: true, moduleId: null },
              required: false,
              attributes: ['id', 'title', 'slug', 'durationMinutes', 'lessonType'],
              order: [['sortOrder', 'ASC']],
            },
          ],
        },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found',
      });
    }

    const lessonProgress = await student_lesson.findAll({
      where: {
        studentId: studentData.id,
        enrollmentId: enrollment.id,
      },
    });

    const progressMap = {};
    lessonProgress.forEach((lp) => {
      progressMap[lp.lessonId] = {
        status: lp.status,
        progressPercentage: lp.progressPercentage,
        completedAt: lp.completedAt,
        timeSpentMinutes: lp.timeSpentMinutes,
        testPassed: lp.testPassed,
        testScore: lp.testScore,
      };
    });

    const courseData = enrollment.course.get({ plain: true });

    if (courseData.modules) {
      courseData.modules = courseData.modules.map((mod) => ({
        ...mod,
        lessons: mod.lessons?.map((les) => ({
          ...les,
          progress: progressMap[les.id] || { status: 'not_started', progressPercentage: 0 },
        })),
      }));
    }

    if (courseData.lessons) {
      courseData.lessons = courseData.lessons.map((les) => ({
        ...les,
        progress: progressMap[les.id] || { status: 'not_started', progressPercentage: 0 },
      }));
    }

    res.status(200).json({
      success: true,
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        progressPercentage: enrollment.progressPercentage,
        completedLessons: enrollment.completedLessons,
        totalCreditsEarned: enrollment.totalCreditsEarned,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        currentLessonId: enrollment.currentLessonId,
      },
      course: courseData,
    });
  } catch (err) {
    console.error('❌ [GET COURSE PROGRESS] Error:', err);
    next(err);
  }
});

// ===============================
// POST /api/academy/my/progress/lesson/:lessonId
// Обновяване на прогрес по урок
// ===============================
academyMyController.post(
  '/progress/lesson/:lessonId',
  isAuth,
  validateBody(lessonProgressUpdateSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const lessonId = parseInt(req.params.lessonId);
      const { watchedSeconds, progressPercentage, videoPosition } = req.body;

      const studentData = await getOrCreateStudent(userId);

      const lessonData = await lesson.findByPk(lessonId, {
        include: [{ model: course, as: 'course' }],
      });

      if (!lessonData) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found',
        });
      }

      let enrollment = null;
      if (!lessonData.isFree) {
        enrollment = await course_enrollment.findOne({
          where: {
            studentId: studentData.id,
            courseId: lessonData.courseId,
            status: 'active',
          },
        });

        if (!enrollment) {
          return res.status(403).json({
            success: false,
            message: 'Must be enrolled in course',
          });
        }
      }

      let progress = await student_lesson.findOne({
        where: {
          studentId: studentData.id,
          lessonId,
        },
      });

      if (!progress) {
        progress = await student_lesson.create({
          studentId: studentData.id,
          lessonId,
          enrollmentId: enrollment?.id || null,
          status: 'in_progress',
          startedAt: new Date(),
          progressPercentage: 0,
          timeSpentMinutes: 0,
        });
      }

      const updates = {
        lastAccessedAt: new Date(),
      };

      if (progressPercentage !== undefined) {
        updates.progressPercentage = Math.min(100, Math.max(progress.progressPercentage, progressPercentage));
      }

      if (watchedSeconds !== undefined) {
        const additionalMinutes = Math.floor(watchedSeconds / 60);
        updates.timeSpentMinutes = (progress.timeSpentMinutes || 0) + additionalMinutes;
      }

      if (videoPosition !== undefined) {
        updates.videoPosition = videoPosition;
      }

      if (progress.status === 'not_started') {
        updates.status = 'in_progress';
        updates.startedAt = new Date();
      }

      await progress.update(updates);

      if (enrollment) {
        await enrollment.update({
          lastAccessedAt: new Date(),
          currentLessonId: lessonId,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Progress updated',
        progress,
      });
    } catch (err) {
      console.error('❌ [UPDATE LESSON PROGRESS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/my/progress/lesson/:lessonId/complete
// Маркиране като завършен
// ===============================
academyMyController.post('/progress/lesson/:lessonId/complete', isAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const lessonId = parseInt(req.params.lessonId);

    const studentData = await getStudentByUserId(userId);

    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const lessonData = await lesson.findByPk(lessonId);

    if (!lessonData) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found',
      });
    }

    const progress = await student_lesson.findOne({
      where: {
        studentId: studentData.id,
        lessonId,
      },
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Start the lesson first',
      });
    }

    if (progress.status === 'completed') {
      return res.status(200).json({
        success: true,
        message: 'Lesson already completed',
        progress,
      });
    }

    if (lessonData.hasTest && !progress.testPassed) {
      return res.status(400).json({
        success: false,
        message: 'Must pass the test first',
      });
    }

    let earnedCredits = lessonData.creditsForCompletion || 0;
    if (progress.testPassed && lessonData.creditsForTest) {
      earnedCredits += lessonData.creditsForTest;
    }

    await progress.update({
      status: 'completed',
      completedAt: new Date(),
      progressPercentage: 100,
      earnedCredits,
    });

    if (progress.enrollmentId) {
      const enrollment = await course_enrollment.findByPk(progress.enrollmentId);

      if (enrollment) {
        const completedCount = await student_lesson.count({
          where: {
            enrollmentId: enrollment.id,
            status: 'completed',
          },
        });

        const totalLessons = await lesson.count({
          where: { courseId: lessonData.courseId, isPublished: true },
        });

        const newProgress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        await enrollment.update({
          completedLessons: completedCount,
          progressPercentage: newProgress,
          totalCreditsEarned: (enrollment.totalCreditsEarned || 0) + earnedCredits,
        });

        if (newProgress >= 100) {
          await enrollment.update({
            status: 'completed',
            completedAt: new Date(),
          });

          await course.increment('completedCount', {
            where: { id: lessonData.courseId },
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Lesson completed',
      progress,
      earnedCredits,
    });
  } catch (err) {
    console.error('❌ [COMPLETE LESSON] Error:', err);
    next(err);
  }
});

// =========================================================
//                    CALENDAR / SCHEDULE
// =========================================================

// ===============================
// GET /api/academy/my/schedule
// Моят график (предстоящи събития)
// ===============================
academyMyController.get(
  '/schedule',
  isAuth,
  validateQuery(scheduleQuerySchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { days } = req.query;

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          schedule: [],
        });
      }

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const upcomingLectures = await student_lecture.findAll({
        where: { studentId: studentData.id },
        include: [
          {
            model: lecture,
            as: 'lecture',
            where: {
              scheduledDate: {
                [Op.gte]: new Date(),
                [Op.lte]: endDate,
              },
              status: { [Op.in]: ['scheduled', 'live'] },
            },
            attributes: ['id', 'title', 'slug', 'scheduledDate', 'durationMinutes', 'isOnline', 'meetingLink'],
          },
        ],
      });

      const upcomingSeminars = await student_seminar.findAll({
        where: {
          studentId: studentData.id,
          status: 'approved',
        },
        include: [
          {
            model: seminar,
            as: 'seminar',
            where: {
              scheduledDate: {
                [Op.gte]: new Date(),
                [Op.lte]: endDate,
              },
              status: { [Op.in]: ['scheduled', 'live'] },
            },
            attributes: ['id', 'title', 'slug', 'scheduledDate', 'durationMinutes', 'isOnline', 'location', 'meetingLink'],
          },
        ],
      });

      const schedule = [
        ...upcomingLectures.map((l) => ({
          type: 'lecture',
          id: l.lecture.id,
          title: l.lecture.title,
          slug: l.lecture.slug,
          date: l.lecture.scheduledDate,
          durationMinutes: l.lecture.durationMinutes,
          isOnline: l.lecture.isOnline,
          meetingLink: l.lecture.meetingLink,
        })),
        ...upcomingSeminars.map((s) => ({
          type: 'seminar',
          id: s.seminar.id,
          title: s.seminar.title,
          slug: s.seminar.slug,
          date: s.seminar.scheduledDate,
          durationMinutes: s.seminar.durationMinutes,
          isOnline: s.seminar.isOnline,
          location: s.seminar.location,
          meetingLink: s.seminar.meetingLink,
        })),
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      res.status(200).json({
        success: true,
        schedule,
      });
    } catch (err) {
      console.error('❌ [GET MY SCHEDULE] Error:', err);
      next(err);
    }
  }
);

module.exports = academyMyController;