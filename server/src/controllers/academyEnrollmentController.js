// server/src/controllers/academyEnrollmentController.js

const academyEnrollmentController = require('express').Router();
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
  course_module,
  student,
  mentor,
  user_account,
  user_details,
  certificate,
  sequelize,
} = require('../sequelize/models/index');

const { validateBody, validateQuery } = require('../middlewares/validateRequest');
const {
  paginationSchema,
  enrollmentApproveRejectSchema,
  lessonProgressUpdateSchema,
} = require('../schemas/academySchemas');

const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');

// Query schema за enrollments
const enrollmentQuerySchema = paginationSchema.extend({
  status: require('zod').z.enum(['all', 'active', 'pending', 'completed', 'dropped', 'rejected']).default('all'),
  sortBy: require('zod').z.enum(['newest', 'oldest', 'progress', 'recent-activity']).default('newest'),
});

// Query schema за admin students
const adminStudentsQuerySchema = paginationSchema.extend({
  status: require('zod').z.enum(['all', 'active', 'pending', 'completed', 'dropped', 'rejected']).default('all'),
  search: require('zod').z.string().optional(),
});

// ===============================
// HELPER: Calculate course progress
// ===============================
const calculateCourseProgress = async (enrollmentId, courseId) => {
  const totalLessons = await lesson.count({
    where: {
      courseId,
      isPublished: true,
    },
  });

  if (totalLessons === 0) return 0;

  const completedLessons = await student_lesson.count({
    where: {
      enrollmentId,
      status: 'completed',
    },
  });

  return Math.round((completedLessons / totalLessons) * 100);
};

// ===============================
// HELPER: Check course completion
// ===============================
const checkCourseCompletion = async (enrollmentId, courseId) => {
  const courseData = await course.findByPk(courseId);
  if (!courseData) return false;

  const requiredLessons = await lesson.findAll({
    where: {
      courseId,
      isPublished: true,
      requiresCompletion: true,
    },
    attributes: ['id'],
  });

  if (requiredLessons.length === 0) {
    const anyCompleted = await student_lesson.count({
      where: { enrollmentId, status: 'completed' },
    });
    return anyCompleted > 0;
  }

  const requiredLessonIds = requiredLessons.map((l) => l.id);

  const completedRequiredLessons = await student_lesson.count({
    where: {
      enrollmentId,
      lessonId: requiredLessonIds,
      status: 'completed',
    },
  });

  return completedRequiredLessons >= requiredLessons.length;
};

// ===============================
// HELPER: Get student by userId
// ===============================
const getStudentByUserId = async (userId) => {
  return await student.findOne({
    where: { userId },
  });
};

// =========================================================
//                    COURSE ENROLLMENTS
// =========================================================

// ===============================
// GET /api/academy/enrollment/courses
// Моите записвания (за студента)
// ===============================
academyEnrollmentController.get(
  '/courses',
  isAuth,
  validateQuery(enrollmentQuerySchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { page, limit, status, sortBy } = req.query;

      const offset = (page - 1) * limit;

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          enrollments: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        });
      }

      const where = { studentId: studentData.id };

      if (status && status !== 'all') {
        where.status = status;
      }

      let order = [['createdAt', 'DESC']];
      switch (sortBy) {
        case 'oldest':
          order = [['createdAt', 'ASC']];
          break;
        case 'progress':
          order = [['progressPercentage', 'DESC']];
          break;
        case 'recent-activity':
          order = [['lastAccessedAt', 'DESC']];
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
            ],
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
        enrollments,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
        },
      });
    } catch (err) {
      console.error('❌ [GET MY ENROLLMENTS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/enrollment/courses/:courseId
// Детайли за моето записване
// ===============================
academyEnrollmentController.get(
  '/courses/:courseId',
  isAuth,
  async (req, res, next) => {
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
                model: course_module,
                as: 'modules',
                include: [
                  {
                    model: lesson,
                    as: 'lessons',
                    where: { isPublished: true },
                    required: false,
                  },
                ],
              },
              {
                model: lesson,
                as: 'lessons',
                where: {
                  isPublished: true,
                  moduleId: null,
                },
                required: false,
              },
            ],
          },
          {
            model: student_lesson,
            as: 'lessonProgress',
            include: [
              {
                model: lesson,
                as: 'lesson',
                attributes: ['id', 'title', 'slug'],
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

      await enrollment.update({
        lastAccessedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        enrollment,
      });
    } catch (err) {
      console.error('❌ [GET ENROLLMENT DETAILS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/enrollment/courses/:courseId/enroll
// Записване в курс
// ===============================
academyEnrollmentController.post(
  '/courses/:courseId/enroll',
  isAuth,
  rbac.checkPermission('enrollment', 'create'),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const courseId = parseInt(req.params.courseId);

      const courseData = await course.findByPk(courseId);

      if (!courseData) {
        return res.status(404).json({
          success: false,
          message: 'Course not found',
        });
      }

      if (courseData.isDraft || !courseData.isPublic) {
        return res.status(400).json({
          success: false,
          message: 'Course is not available for enrollment',
        });
      }

      // Get user account first to check role
      const userAccount = await user_account.findByPk(userId);
      if (!userAccount) {
        return res.status(404).json({
          success: false,
          message: 'User account not found',
        });
      }

      // Privileged roles that should NOT be downgraded to student
      const privilegedRoles = ['admin', 'moderator', 'mentor'];
      const isPrivileged = privilegedRoles.includes(userAccount.role);

      let studentData = await getStudentByUserId(userId);

      if (!studentData) {
        studentData = await student.create({
          userId,
          status: 'active',
        });
      }

      // Only upgrade role if user is 'user' or 'guest' (NOT privileged)
      if (!isPrivileged && ['user', 'guest'].includes(userAccount.role)) {
        await userAccount.update({ role: 'student' });
      }

      const existingEnrollment = await course_enrollment.findOne({
        where: {
          studentId: studentData.id,
          courseId,
        },
      });

      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: 'Already enrolled in this course',
          enrollment: existingEnrollment,
        });
      }

      if (courseData.maxParticipants) {
        const currentEnrollments = await course_enrollment.count({
          where: {
            courseId,
            status: { [Op.in]: ['active', 'completed'] },
          },
        });

        if (currentEnrollments >= courseData.maxParticipants) {
          return res.status(400).json({
            success: false,
            message: 'Course is full',
          });
        }
      }

      // Privileged users get auto-approved, regular users follow course settings
      const initialStatus = isPrivileged ? 'active' : (courseData.requiresApproval ? 'pending' : 'active');

      const enrollment = await course_enrollment.create({
        studentId: studentData.id,
        courseId,
        status: initialStatus,
        enrolledAt: new Date(),
        progressPercentage: 0,
        completedLessons: 0,
        totalCreditsEarned: 0,
      });

      await courseData.increment('enrolledCount');

      res.status(201).json({
        success: true,
        message:
          initialStatus === 'pending'
            ? 'Enrollment request submitted. Waiting for approval.'
            : 'Successfully enrolled in course',
        enrollment,
      });
    } catch (err) {
      console.error('❌ [ENROLL IN COURSE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/enrollment/courses/:courseId/unenroll
// Отписване от курс
// ===============================
academyEnrollmentController.post(
  '/courses/:courseId/unenroll',
  isAuth,
  async (req, res, next) => {
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
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found',
        });
      }

      if (enrollment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot unenroll from a completed course',
        });
      }

      await enrollment.update({
        status: 'dropped',
        droppedAt: new Date(),
      });

      const courseData = await course.findByPk(courseId);
      if (courseData && courseData.enrolledCount > 0) {
        await courseData.decrement('enrolledCount');
      }

      res.status(200).json({
        success: true,
        message: 'Successfully unenrolled from course',
      });
    } catch (err) {
      console.error('❌ [UNENROLL FROM COURSE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/enrollment/courses/:courseId/check
// Проверка дали е записан
// ===============================
academyEnrollmentController.get(
  '/courses/:courseId/check',
  isAuth,
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const courseId = parseInt(req.params.courseId);

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          enrolled: false,
          enrollment: null,
        });
      }

      const enrollment = await course_enrollment.findOne({
        where: {
          studentId: studentData.id,
          courseId,
        },
      });

      res.status(200).json({
        success: true,
        enrolled: !!enrollment && enrollment.status === 'active',
        enrollment,
      });
    } catch (err) {
      console.error('❌ [CHECK ENROLLMENT] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    LESSON PROGRESS
// =========================================================

// ===============================
// POST /api/academy/enrollment/lessons/:lessonId/start
// Започване на урок
// ===============================
academyEnrollmentController.post(
  '/lessons/:lessonId/start',
  isAuth,
  async (req, res, next) => {
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

      const lessonData = await lesson.findByPk(lessonId, {
        include: [{ model: course, as: 'course' }],
      });

      if (!lessonData) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found',
        });
      }

      const enrollment = await course_enrollment.findOne({
        where: {
          studentId: studentData.id,
          courseId: lessonData.courseId,
          status: 'active',
        },
      });

      if (!enrollment) {
        if (!lessonData.isFree) {
          return res.status(403).json({
            success: false,
            message: 'Must be enrolled in course to access this lesson',
          });
        }
      }

      if (lessonData.prerequisiteLessonId && enrollment) {
        const prerequisiteCompleted = await student_lesson.findOne({
          where: {
            enrollmentId: enrollment.id,
            lessonId: lessonData.prerequisiteLessonId,
            status: 'completed',
          },
        });

        if (!prerequisiteCompleted) {
          return res.status(400).json({
            success: false,
            message: 'Must complete prerequisite lesson first',
          });
        }
      }

      let progress = await student_lesson.findOne({
        where: {
          studentId: studentData.id,
          lessonId,
          enrollmentId: enrollment?.id || null,
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
      } else if (progress.status === 'not_started') {
        await progress.update({
          status: 'in_progress',
          startedAt: new Date(),
        });
      }

      if (enrollment) {
        await enrollment.update({
          lastAccessedAt: new Date(),
          currentLessonId: lessonId,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lesson started',
        progress,
      });
    } catch (err) {
      console.error('❌ [START LESSON] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/enrollment/lessons/:lessonId/progress
// Обновяване на прогрес
// ===============================
academyEnrollmentController.post(
  '/lessons/:lessonId/progress',
  isAuth,
  validateBody(lessonProgressUpdateSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const lessonId = parseInt(req.params.lessonId);
      const { progressPercentage, watchedSeconds, videoPosition } = req.body;

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found',
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
          message: 'Lesson progress not found. Start the lesson first.',
        });
      }

      const updates = {};

      if (progressPercentage !== undefined) {
        updates.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
      }

      if (watchedSeconds !== undefined) {
        // Convert seconds to minutes and add to existing time
        const additionalMinutes = Math.floor(watchedSeconds / 60);
        updates.timeSpentMinutes = (progress.timeSpentMinutes || 0) + additionalMinutes;
      }

      if (videoPosition !== undefined) {
        updates.videoPosition = videoPosition;
      }

      updates.lastAccessedAt = new Date();

      await progress.update(updates);

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
// POST /api/academy/enrollment/lessons/:lessonId/complete
// Завършване на урок
// ===============================
academyEnrollmentController.post(
  '/lessons/:lessonId/complete',
  isAuth,
  async (req, res, next) => {
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
          message: 'Lesson progress not found. Start the lesson first.',
        });
      }

      if (progress.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Lesson already completed',
        });
      }

      if (lessonData.hasTest && !progress.testPassed) {
        return res.status(400).json({
          success: false,
          message: 'Must pass the test to complete this lesson',
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
          const newProgress = await calculateCourseProgress(
            enrollment.id,
            lessonData.courseId
          );

          const completedCount = await student_lesson.count({
            where: {
              enrollmentId: enrollment.id,
              status: 'completed',
            },
          });

          await enrollment.update({
            progressPercentage: newProgress,
            completedLessons: completedCount,
            totalCreditsEarned: (enrollment.totalCreditsEarned || 0) + earnedCredits,
          });

          const isCompleted = await checkCourseCompletion(
            enrollment.id,
            lessonData.courseId
          );

          if (isCompleted && enrollment.status !== 'completed') {
            await enrollment.update({
              status: 'completed',
              completedAt: new Date(),
              progressPercentage: 100,
            });

            const courseData = await course.findByPk(lessonData.courseId);
            if (courseData) {
              await courseData.increment('completedCount');
            }
          }
        }
      }

      res.status(200).json({
        success: true,
        message: 'Lesson completed successfully',
        progress,
        earnedCredits,
      });
    } catch (err) {
      console.error('❌ [COMPLETE LESSON] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/enrollment/lessons/:lessonId/progress
// Статус на урок
// ===============================
academyEnrollmentController.get(
  '/lessons/:lessonId/progress',
  isAuth,
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const lessonId = parseInt(req.params.lessonId);

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          progress: null,
        });
      }

      const progress = await student_lesson.findOne({
        where: {
          studentId: studentData.id,
          lessonId,
        },
        include: [
          {
            model: lesson,
            as: 'lesson',
            attributes: ['id', 'title', 'slug', 'hasTest', 'creditsForCompletion'],
          },
        ],
      });

      res.status(200).json({
        success: true,
        progress,
      });
    } catch (err) {
      console.error('❌ [GET LESSON PROGRESS] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    LECTURE REGISTRATIONS
// =========================================================

// ===============================
// GET /api/academy/enrollment/lectures
// Моите лекции
// ===============================
academyEnrollmentController.get('/lectures', isAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status = 'all', upcoming = false } = req.query;

    const studentData = await getStudentByUserId(userId);

    if (!studentData) {
      return res.status(200).json({
        success: true,
        registrations: [],
      });
    }

    const where = { studentId: studentData.id };

    const lectureWhere = {};
    if (upcoming === 'true') {
      lectureWhere.scheduledDate = { [Op.gte]: new Date() };
    }

    const registrations = await student_lecture.findAll({
      where,
      include: [
        {
          model: lecture,
          as: 'lecture',
          where: lectureWhere,
          attributes: [
            'id',
            'title',
            'slug',
            'shortDescription',
            'thumbnailUrl',
            'scheduledDate',
            'durationMinutes',
            'status',
            'isOnline',
            'meetingLink',
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
    });

    res.status(200).json({
      success: true,
      registrations,
    });
  } catch (err) {
    console.error('❌ [GET MY LECTURES] Error:', err);
    next(err);
  }
});

// ===============================
// POST /api/academy/enrollment/lectures/:lectureId/register
// Записване за лекция
// ===============================
academyEnrollmentController.post(
  '/lectures/:lectureId/register',
  isAuth,
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const lectureId = parseInt(req.params.lectureId);

      const lectureData = await lecture.findByPk(lectureId);

      if (!lectureData) {
        return res.status(404).json({
          success: false,
          message: 'Lecture not found',
        });
      }

      if (!lectureData.isPublished || !lectureData.isPublic) {
        return res.status(400).json({
          success: false,
          message: 'Lecture is not available for registration',
        });
      }

      if (lectureData.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Lecture has been cancelled',
        });
      }

      if (lectureData.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Lecture has already ended',
        });
      }

      // Get user account first to check role
      const userAccount = await user_account.findByPk(userId);
      if (!userAccount) {
        return res.status(404).json({
          success: false,
          message: 'User account not found',
        });
      }

      // Privileged roles that should NOT be downgraded to student
      const privilegedRoles = ['admin', 'moderator', 'mentor'];
      const isPrivileged = privilegedRoles.includes(userAccount.role);

      let studentData = await getStudentByUserId(userId);

      if (!studentData) {
        studentData = await student.create({
          userId,
          status: 'active',
        });
      }

      // Only upgrade role if user is 'user' or 'guest' (NOT privileged)
      if (!isPrivileged && ['user', 'guest'].includes(userAccount.role)) {
        await userAccount.update({ role: 'student' });
      }

      const existingRegistration = await student_lecture.findOne({
        where: {
          studentId: studentData.id,
          lectureId,
        },
      });

      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          message: 'Already registered for this lecture',
          registration: existingRegistration,
        });
      }

      if (lectureData.maxParticipants) {
        const currentRegistrations = await student_lecture.count({
          where: { lectureId },
        });

        if (currentRegistrations >= lectureData.maxParticipants) {
          return res.status(400).json({
            success: false,
            message: 'Lecture is full',
          });
        }
      }

      const registration = await student_lecture.create({
        studentId: studentData.id,
        lectureId,
        attended: false,
        earnedCredits: 0,
      });

      await lectureData.increment('registeredCount');

      res.status(201).json({
        success: true,
        message: 'Successfully registered for lecture',
        registration,
      });
    } catch (err) {
      console.error('❌ [REGISTER FOR LECTURE] Error:', err);
      next(err);
    }
  }
);
// ===============================
// POST /api/academy/enrollment/lectures/:lectureId/unregister
// Отписване от лекция
// ===============================
academyEnrollmentController.post(
  '/lectures/:lectureId/unregister',
  isAuth,
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const lectureId = parseInt(req.params.lectureId);

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found',
        });
      }

      const registration = await student_lecture.findOne({
        where: {
          studentId: studentData.id,
          lectureId,
        },
      });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found',
        });
      }

      const lectureData = await lecture.findByPk(lectureId);

      if (lectureData.status === 'live' || lectureData.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot unregister from a lecture that has started or ended',
        });
      }

      await registration.destroy();

      if (lectureData.registeredCount > 0) {
        await lectureData.decrement('registeredCount');
      }

      res.status(200).json({
        success: true,
        message: 'Successfully unregistered from lecture',
      });
    } catch (err) {
      console.error('❌ [UNREGISTER FROM LECTURE] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/enrollment/lectures/:lectureId/check
// Проверка за регистрация
// ===============================
academyEnrollmentController.get(
  '/lectures/:lectureId/check',
  isAuth,
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const lectureId = parseInt(req.params.lectureId);

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          registered: false,
          registration: null,
        });
      }

      const registration = await student_lecture.findOne({
        where: {
          studentId: studentData.id,
          lectureId,
        },
      });

      res.status(200).json({
        success: true,
        registered: !!registration,
        registration,
      });
    } catch (err) {
      console.error('❌ [CHECK LECTURE REGISTRATION] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    SEMINAR REGISTRATIONS
// =========================================================

// ===============================
// GET /api/academy/enrollment/seminars
// Моите семинари
// ===============================
academyEnrollmentController.get('/seminars', isAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status = 'all', upcoming = false } = req.query;

    const studentData = await getStudentByUserId(userId);

    if (!studentData) {
      return res.status(200).json({
        success: true,
        registrations: [],
      });
    }

    const where = { studentId: studentData.id };

    if (status !== 'all') {
      where.status = status;
    }

    const seminarWhere = {};
    if (upcoming === 'true') {
      seminarWhere.scheduledDate = { [Op.gte]: new Date() };
    }

    const registrations = await student_seminar.findAll({
      where,
      include: [
        {
          model: seminar,
          as: 'seminar',
          where: seminarWhere,
          attributes: [
            'id',
            'title',
            'slug',
            'shortDescription',
            'thumbnailUrl',
            'scheduledDate',
            'durationMinutes',
            'status',
            'seminarType',
            'isOnline',
            'location',
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
    });

    res.status(200).json({
      success: true,
      registrations,
    });
  } catch (err) {
    console.error('❌ [GET MY SEMINARS] Error:', err);
    next(err);
  }
});

// ===============================
// POST /api/academy/enrollment/seminars/:seminarId/register
// Записване за семинар
// ===============================
academyEnrollmentController.post(
  '/seminars/:seminarId/register',
  isAuth,
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const seminarId = parseInt(req.params.seminarId);

      const seminarData = await seminar.findByPk(seminarId);

      if (!seminarData) {
        return res.status(404).json({
          success: false,
          message: 'Seminar not found',
        });
      }

      if (!seminarData.isPublished || !seminarData.isPublic) {
        return res.status(400).json({
          success: false,
          message: 'Seminar is not available for registration',
        });
      }

      if (seminarData.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Seminar has been cancelled',
        });
      }

      if (seminarData.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Seminar has already ended',
        });
      }

      // Get user account first to check role
      const userAccount = await user_account.findByPk(userId);
      if (!userAccount) {
        return res.status(404).json({
          success: false,
          message: 'User account not found',
        });
      }

      // Privileged roles that should NOT be downgraded to student
      const privilegedRoles = ['admin', 'moderator', 'mentor'];
      const isPrivileged = privilegedRoles.includes(userAccount.role);

      let studentData = await getStudentByUserId(userId);

      if (!studentData) {
        studentData = await student.create({
          userId,
          status: 'active',
        });
      }

      // Only upgrade role if user is 'user' or 'guest' (NOT privileged)
      if (!isPrivileged && ['user', 'guest'].includes(userAccount.role)) {
        await userAccount.update({ role: 'student' });
      }

      const existingRegistration = await student_seminar.findOne({
        where: {
          studentId: studentData.id,
          seminarId,
        },
      });

      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          message: 'Already registered for this seminar',
          registration: existingRegistration,
        });
      }

      if (seminarData.maxParticipants) {
        const currentRegistrations = await student_seminar.count({
          where: {
            seminarId,
            status: { [Op.in]: ['pending', 'approved'] },
          },
        });

        if (currentRegistrations >= seminarData.maxParticipants) {
          return res.status(400).json({
            success: false,
            message: 'Seminar is full',
          });
        }
      }

      // Privileged users get auto-approved, regular users follow seminar settings
      const initialStatus = isPrivileged ? 'approved' : (seminarData.requiresApproval ? 'pending' : 'approved');

      const registration = await student_seminar.create({
        studentId: studentData.id,
        seminarId,
        status: initialStatus,
        attended: false,
        earnedCredits: 0,
      });

      if (initialStatus === 'approved') {
        await seminarData.increment('registeredCount');
      }

      res.status(201).json({
        success: true,
        message:
          initialStatus === 'pending'
            ? 'Registration request submitted. Waiting for approval.'
            : 'Successfully registered for seminar',
        registration,
      });
    } catch (err) {
      console.error('❌ [REGISTER FOR SEMINAR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/enrollment/seminars/:seminarId/unregister
// Отписване от семинар
// ===============================
academyEnrollmentController.post(
  '/seminars/:seminarId/unregister',
  isAuth,
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const seminarId = parseInt(req.params.seminarId);

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found',
        });
      }

      const registration = await student_seminar.findOne({
        where: {
          studentId: studentData.id,
          seminarId,
        },
      });

      if (!registration) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found',
        });
      }

      const seminarData = await seminar.findByPk(seminarId);

      if (seminarData.status === 'live' || seminarData.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot unregister from a seminar that has started or ended',
        });
      }

      const wasApproved = registration.status === 'approved';

      await registration.destroy();

      if (wasApproved && seminarData.registeredCount > 0) {
        await seminarData.decrement('registeredCount');
      }

      res.status(200).json({
        success: true,
        message: 'Successfully unregistered from seminar',
      });
    } catch (err) {
      console.error('❌ [UNREGISTER FROM SEMINAR] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/enrollment/seminars/:seminarId/check
// Проверка за регистрация
// ===============================
academyEnrollmentController.get(
  '/seminars/:seminarId/check',
  isAuth,
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const seminarId = parseInt(req.params.seminarId);

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(200).json({
          success: true,
          registered: false,
          registration: null,
        });
      }

      const registration = await student_seminar.findOne({
        where: {
          studentId: studentData.id,
          seminarId,
        },
      });

      res.status(200).json({
        success: true,
        registered: !!registration,
        approved: registration?.status === 'approved',
        registration,
      });
    } catch (err) {
      console.error('❌ [CHECK SEMINAR REGISTRATION] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    ADMIN ENDPOINTS
// =========================================================

// ===============================
// GET /api/academy/enrollment/admin/courses/:courseId/students
// Записани студенти в курс (admin)
// ===============================
academyEnrollmentController.get(
  '/admin/courses/:courseId/students',
  isAuth,
  rbac.checkPermission('enrollment', 'read'),
  validateQuery(adminStudentsQuerySchema),
  async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const { page, limit, status, search } = req.query;

      const offset = (page - 1) * limit;

      const where = { courseId };

      if (status && status !== 'all') {
        where.status = status;
      }

      const { count, rows: enrollments } = await course_enrollment.findAndCountAll({
        where,
        include: [
          {
            model: student,
            as: 'student',
            include: [
              {
                model: user_account,
                as: 'user',
                attributes: ['email'],
                where: search
                  ? {
                    email: { [Op.iLike]: `%${search}%` },
                  }
                  : undefined,
                required: !!search,
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
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      const formattedEnrollments = enrollments.map((e) => {
        const data = e.get({ plain: true });
        const studentData = data.student;
        const userDetails = studentData?.user?.details || {};

        return {
          id: data.id,
          studentId: data.studentId,
          name:
            userDetails.username ||
            `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() ||
            studentData?.user?.email?.split('@')[0] ||
            'Unknown',
          email: studentData?.user?.email,
          avatar: userDetails.imageURL || studentData?.avatar,
          status: data.status,
          progressPercentage: data.progressPercentage,
          completedLessons: data.completedLessons,
          totalCreditsEarned: data.totalCreditsEarned,
          enrolledAt: data.enrolledAt,
          completedAt: data.completedAt,
          lastAccessedAt: data.lastAccessedAt,
        };
      });

      res.status(200).json({
        success: true,
        enrollments: formattedEnrollments,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
        },
      });
    } catch (err) {
      console.error('❌ [GET COURSE STUDENTS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/enrollment/admin/courses/:courseId/students/:studentId/approve
// Одобряване на записване
// ===============================
academyEnrollmentController.post(
  '/admin/courses/:courseId/students/:studentId/approve',
  isAuth,
  rbac.checkPermission('enrollment', 'update'),
  async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = parseInt(req.params.studentId);

      const enrollment = await course_enrollment.findOne({
        where: { courseId, studentId },
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found',
        });
      }

      if (enrollment.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Enrollment is not pending approval',
        });
      }

      await enrollment.update({
        status: 'active',
      });

      const courseData = await course.findByPk(courseId);
      if (courseData) {
        await courseData.increment('enrolledCount');
      }

      res.status(200).json({
        success: true,
        message: 'Enrollment approved',
        enrollment,
      });
    } catch (err) {
      console.error('❌ [APPROVE ENROLLMENT] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/enrollment/admin/courses/:courseId/students/:studentId/reject
// Отхвърляне на записване
// ===============================
academyEnrollmentController.post(
  '/admin/courses/:courseId/students/:studentId/reject',
  isAuth,
  rbac.checkPermission('enrollment', 'update'),
  validateBody(enrollmentApproveRejectSchema),
  async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = parseInt(req.params.studentId);
      const { reason } = req.body;

      const enrollment = await course_enrollment.findOne({
        where: { courseId, studentId },
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found',
        });
      }

      await enrollment.update({
        status: 'rejected',
        rejectionReason: reason || null,
      });

      res.status(200).json({
        success: true,
        message: 'Enrollment rejected',
        enrollment,
      });
    } catch (err) {
      console.error('❌ [REJECT ENROLLMENT] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/enrollment/admin/courses/:courseId/students/:studentId
// Премахване на записване (admin)
// ===============================
academyEnrollmentController.delete(
  '/admin/courses/:courseId/students/:studentId',
  isAuth,
  rbac.checkPermission('enrollment', 'delete'),
  async (req, res, next) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = parseInt(req.params.studentId);

      const enrollment = await course_enrollment.findOne({
        where: { courseId, studentId },
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found',
        });
      }

      await enrollment.destroy();

      const courseData = await course.findByPk(courseId);
      if (courseData && courseData.enrolledCount > 0) {
        await courseData.decrement('enrolledCount');
      }

      res.status(200).json({
        success: true,
        message: 'Enrollment removed',
      });
    } catch (err) {
      console.error('❌ [REMOVE ENROLLMENT] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/enrollment/stats/overview
// Общи статистики (admin)
// ===============================
academyEnrollmentController.get(
  '/stats/overview',
  isAuth,
  rbac.checkPermission('enrollment', 'read'),
  async (req, res, next) => {
    try {
      const totalEnrollments = await course_enrollment.count();
      const activeEnrollments = await course_enrollment.count({
        where: { status: 'active' },
      });
      const completedEnrollments = await course_enrollment.count({
        where: { status: 'completed' },
      });

      const lectureRegistrations = await student_lecture.count();
      const lectureAttendees = await student_lecture.count({
        where: { attended: true },
      });

      const seminarRegistrations = await student_seminar.count();
      const seminarAttendees = await student_seminar.count({
        where: { attended: true },
      });

      const activeStudents = await student.count({
        where: { status: 'active' },
      });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentEnrollments = await course_enrollment.count({
        where: {
          createdAt: { [Op.gte]: thirtyDaysAgo },
        },
      });

      res.status(200).json({
        success: true,
        statistics: {
          courses: {
            totalEnrollments,
            activeEnrollments,
            completedEnrollments,
            completionRate:
              totalEnrollments > 0
                ? Math.round((completedEnrollments / totalEnrollments) * 100)
                : 0,
          },
          lectures: {
            totalRegistrations: lectureRegistrations,
            totalAttendees: lectureAttendees,
            attendanceRate:
              lectureRegistrations > 0
                ? Math.round((lectureAttendees / lectureRegistrations) * 100)
                : 0,
          },
          seminars: {
            totalRegistrations: seminarRegistrations,
            totalAttendees: seminarAttendees,
            attendanceRate:
              seminarRegistrations > 0
                ? Math.round((seminarAttendees / seminarRegistrations) * 100)
                : 0,
          },
          students: {
            totalActive: activeStudents,
            recentEnrollments,
          },
        },
      });
    } catch (err) {
      console.error('❌ [GET ENROLLMENT STATS] Error:', err);
      next(err);
    }
  }
);

module.exports = academyEnrollmentController;