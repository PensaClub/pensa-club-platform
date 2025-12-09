// server/src/controllers/academyTestsController.js

const academyTestsController = require('express').Router();
const { Op } = require('sequelize');

const {
  lesson_test,
  test_question,
  test_answer,
  student_test_attempt,
  test_attempt_answer,
  lesson,
  lecture,
  seminar,
  course,
  student,
  student_lesson,
  course_enrollment,
  user_account,
  user_details,
  sequelize,
} = require('../sequelize/models/index');
const test = lesson_test;
const test_attempt = student_test_attempt;
const { validateBody, validateQuery } = require('../middlewares/validateRequest');
const {
  paginationSchema,
  testCreateSchema,
  testUpdateSchema,
  questionCreateSchema,
  questionUpdateSchema,
  questionReorderSchema,
  testAnswerSchema,
} = require('../schemas/academySchemas');

const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');

// Local query schemas
const { z } = require('zod');

const testQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  type: z.enum(['quiz', 'exam', 'practice', 'survey', 'all']).optional(),
  status: z.enum(['published', 'draft', 'all']).default('all'),
  entityType: z.enum(['lesson', 'lecture', 'seminar', 'course', 'all']).optional(),
});

const testAttemptsQuerySchema = paginationSchema.extend({
  status: z.enum(['in_progress', 'completed', 'all']).default('all'),
});

// ===============================
// HELPER: Shuffle array (Fisher-Yates)
// ===============================
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ===============================
// HELPER: Calculate test score
// ===============================
const calculateTestScore = async (attemptId) => {
  const attempt = await test_attempt.findByPk(attemptId, {
    include: [
      {
        model: test_attempt_answer,
        as: 'attemptAnswers',
        include: [
          {
            model: test_question,
            as: 'question',
          },
          {
            model: test_answer,
            as: 'selectedAnswer',
          },
        ],
      },
      {
        model: test,
        as: 'test',
      },
    ],
  });

  if (!attempt) return null;

  let totalPoints = 0;
  let earnedPoints = 0;
  let correctAnswers = 0;
  let wrongAnswers = 0;

  for (const answer of attempt.attemptAnswers) {
    const question = answer.question;
    const points = question.points || 1;
    totalPoints += points;

    if (question.questionType === 'multiple_choice' || question.questionType === 'single_choice' || question.questionType === 'single') {
      if (answer.selectedAnswer && answer.selectedAnswer.isCorrect) {
        earnedPoints += points;
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    } else if (question.questionType === 'true_false') {
      if (answer.selectedAnswer && answer.selectedAnswer.isCorrect) {
        earnedPoints += points;
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    } else if (question.questionType === 'text') {
      if (answer.isCorrect) {
        earnedPoints += points;
        correctAnswers++;
      } else if (answer.isCorrect === false) {
        wrongAnswers++;
      }
    } else if (question.questionType === 'multiple') {
      // За multiple choice - проверяваме дали е верен
      if (answer.selectedAnswer && answer.selectedAnswer.isCorrect) {
        earnedPoints += points;
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    }
  }

  const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const passed = scorePercentage >= (attempt.test.passingScore || 60);

  return {
    totalPoints,
    earnedPoints,
    scorePercentage,
    correctAnswers,
    wrongAnswers,
    totalQuestions: attempt.attemptAnswers.length,
    passed,
  };
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
//                    TEST CRUD (Admin/Mentor)
// =========================================================

// ===============================
// GET /api/academy/tests
// Списък с тестове (admin)
// ===============================
academyTestsController.get(
  '/',
  isAuth,
  rbac.checkPermission('test', 'read'),
  validateQuery(testQuerySchema),
  async (req, res, next) => {
    try {
      const { page, limit, search, type, status, entityType } = req.query;

      const offset = (page - 1) * limit;

      const where = {};

      if (status === 'published') {
        where.isPublished = true;
      } else if (status === 'draft') {
        where.isPublished = false;
      }

      if (type && type !== 'all') {
        where.testType = type;
      }

      if (entityType && entityType !== 'all') {
        if (entityType === 'lesson') {
          where.lessonId = { [Op.ne]: null };
        } else if (entityType === 'lecture') {
          where.lectureId = { [Op.ne]: null };
        } else if (entityType === 'seminar') {
          where.seminarId = { [Op.ne]: null };
        } else if (entityType === 'course') {
          where.courseId = { [Op.ne]: null };
          where.lessonId = null;
        }
      }

      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { count, rows: tests } = await test.findAndCountAll({
        where,
        include: [
          {
            model: lesson,
            as: 'lesson',
            attributes: ['id', 'title', 'slug'],
          },
          {
            model: lecture,
            as: 'lecture',
            attributes: ['id', 'title', 'slug'],
          },
          {
            model: seminar,
            as: 'seminar',
            attributes: ['id', 'title', 'slug'],
          },
          {
            model: course,
            as: 'course',
            attributes: ['id', 'name', 'slug'],
          },
        ],
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT COUNT(*) FROM test_questions 
                WHERE test_questions.test_id = "lesson_test".id
              )`),
              'questionsCount',
            ],
            [
              sequelize.literal(`(
                SELECT COUNT(*) FROM student_test_attempts 
                WHERE student_test_attempts.test_id = "lesson_test".id
              )`),
              'attemptsCount',
            ],
          ],
        },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        tests,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
        },
      });
    } catch (err) {
      console.error('❌ [GET TESTS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/tests/:id
// Детайли за тест (admin)
// ===============================
academyTestsController.get(
  '/:id',
  isAuth,
  rbac.checkPermission('test', 'read'),
  async (req, res, next) => {
    try {
      const testId = parseInt(req.params.id);

      const testData = await test.findByPk(testId, {
        include: [
          {
            model: test_question,
            as: 'questions',
            include: [
              {
                model: test_answer,
                as: 'answerOptions',
              },
            ],
            order: [['sortOrder', 'ASC']],
          },
          {
            model: lesson,
            as: 'lesson',
            attributes: ['id', 'title', 'slug', 'courseId'],
          },
          {
            model: lecture,
            as: 'lecture',
            attributes: ['id', 'title', 'slug'],
          },
          {
            model: seminar,
            as: 'seminar',
            attributes: ['id', 'title', 'slug'],
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
        ],
      });

      if (!testData) {
        return res.status(404).json({
          success: false,
          message: 'Test not found',
        });
      }

      res.status(200).json({
        success: true,
        test: testData,
      });
    } catch (err) {
      console.error('❌ [GET TEST] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/tests
// Създаване на тест
// ===============================
academyTestsController.post(
  '/',
  isAuth,
  rbac.checkPermission('test', 'create'),
  validateBody(testCreateSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;

      const {
        title,
        description,
        instructions,
        testType,
        courseId,
        lessonId,
        lectureId,
        seminarId,
        timeLimitMinutes,
        passingScore,
        maxAttempts,
        shuffleQuestions,
        shuffleAnswers,
        showCorrectAnswers,
        showScore,
        allowReview,
        maxCredits,
        creditsForPassing,
      } = req.body;

      const newTest = await test.create({
        createdBy: userId,
        title,
        description,
        instructions,
        testType,
        courseId: courseId || null,
        lessonId: lessonId || null,
        lectureId: lectureId || null,
        seminarId: seminarId || null,
        timeLimitMinutes,
        passingScore,
        maxAttempts,
        shuffleQuestions,
        shuffleAnswers,
        showCorrectAnswers,
        showScore,
        allowReview,
        maxCredits,
        creditsForPassing,
        isPublished: false,
        totalQuestions: 0,
        totalPoints: 0,
      });

      res.status(201).json({
        success: true,
        message: 'Test created successfully',
        test: newTest,
      });
    } catch (err) {
      console.error('❌ [CREATE TEST] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/tests/:id
// Редактиране на тест
// ===============================
academyTestsController.put(
  '/:id',
  isAuth,
  rbac.checkPermission('test', 'update'),
  validateBody(testUpdateSchema),
  async (req, res, next) => {
    try {
      const testId = parseInt(req.params.id);
      const updates = req.body;

      const testData = await test.findByPk(testId);

      if (!testData) {
        return res.status(404).json({
          success: false,
          message: 'Test not found',
        });
      }

      await testData.update(updates);

      res.status(200).json({
        success: true,
        message: 'Test updated successfully',
        test: testData,
      });
    } catch (err) {
      console.error('❌ [UPDATE TEST] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/tests/:id
// Изтриване на тест
// ===============================
academyTestsController.delete(
  '/:id',
  isAuth,
  rbac.checkPermission('test', 'delete'),
  async (req, res, next) => {
    try {
      const testId = parseInt(req.params.id);

      const testData = await test.findByPk(testId);

      if (!testData) {
        return res.status(404).json({
          success: false,
          message: 'Test not found',
        });
      }

      const attemptsCount = await test_attempt.count({
        where: { testId },
      });

      if (attemptsCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete test with ${attemptsCount} attempts. Archive it instead.`,
        });
      }

      const questions = await test_question.findAll({
        where: { testId },
      });

      for (const question of questions) {
        await test_answer.destroy({
          where: { questionId: question.id },
        });
      }

      await test_question.destroy({
        where: { testId },
      });

      await testData.destroy();

      res.status(200).json({
        success: true,
        message: 'Test deleted successfully',
      });
    } catch (err) {
      console.error('❌ [DELETE TEST] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/tests/:id/publish
// Публикуване на тест
// ===============================
academyTestsController.post(
  '/:id/publish',
  isAuth,
  rbac.checkPermission('test', 'update'),
  async (req, res, next) => {
    try {
      const testId = parseInt(req.params.id);

      const testData = await test.findByPk(testId);

      if (!testData) {
        return res.status(404).json({
          success: false,
          message: 'Test not found',
        });
      }

      const questionsCount = await test_question.count({
        where: { testId },
      });

      if (questionsCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot publish test without questions',
        });
      }

      await testData.update({
        isPublished: true,
        publishedAt: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Test published successfully',
        test: testData,
      });
    } catch (err) {
      console.error('❌ [PUBLISH TEST] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/tests/:id/unpublish
// Скриване на тест
// ===============================
academyTestsController.post(
  '/:id/unpublish',
  isAuth,
  rbac.checkPermission('test', 'update'),
  async (req, res, next) => {
    try {
      const testId = parseInt(req.params.id);

      const testData = await test.findByPk(testId);

      if (!testData) {
        return res.status(404).json({
          success: false,
          message: 'Test not found',
        });
      }

      await testData.update({
        isPublished: false,
      });

      res.status(200).json({
        success: true,
        message: 'Test unpublished successfully',
        test: testData,
      });
    } catch (err) {
      console.error('❌ [UNPUBLISH TEST] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    QUESTIONS CRUD
// =========================================================

// ===============================
// GET /api/academy/tests/:testId/questions
// Списък с въпроси
// ===============================
academyTestsController.get(
  '/:testId/questions',
  isAuth,
  rbac.checkPermission('test', 'read'),
  async (req, res, next) => {
    try {
      const testId = parseInt(req.params.testId);

      const questions = await test_question.findAll({
        where: { testId },
        include: [
          {
            model: test_answer,
            as: 'answerOptions',
          },
        ],
        order: [['sortOrder', 'ASC']],
      });

      res.status(200).json({
        success: true,
        questions,
      });
    } catch (err) {
      console.error('❌ [GET QUESTIONS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/tests/:testId/questions
// Добавяне на въпрос
// ===============================
academyTestsController.post(
  '/:testId/questions',
  isAuth,
  rbac.checkPermission('test', 'update'),
  validateBody(questionCreateSchema),
  async (req, res, next) => {
    try {
      const testId = parseInt(req.params.testId);

      const {
        questionText,
        questionType,
        explanation,
        hint,
        points,
        imageUrl,
        answers,
      } = req.body;

      const testData = await test.findByPk(testId);

      if (!testData) {
        return res.status(404).json({
          success: false,
          message: 'Test not found',
        });
      }

      const maxSortOrder = await test_question.max('sortOrder', {
        where: { testId },
      });

      const question = await test_question.create({
        testId,
        questionText,
        questionType,
        explanation,
        hint,
        points,
        imageUrl,
        sortOrder: (maxSortOrder || 0) + 1,
      });

      if (answers && answers.length > 0) {
        for (let i = 0; i < answers.length; i++) {
          await test_answer.create({
            questionId: question.id,
            answerText: answers[i].answerText,
            isCorrect: answers[i].isCorrect || false,
            explanation: answers[i].explanation,
            sortOrder: i + 1,
          });
        }
      }

      const totalQuestions = await test_question.count({ where: { testId } });
      const totalPoints = await test_question.sum('points', { where: { testId } });

      await testData.update({
        totalQuestions,
        totalPoints: totalPoints || 0,
      });

      const questionWithAnswers = await test_question.findByPk(question.id, {
        include: [{ model: test_answer, as: 'answerOptions' }],
      });

      res.status(201).json({
        success: true,
        message: 'Question added successfully',
        question: questionWithAnswers,
      });
    } catch (err) {
      console.error('❌ [ADD QUESTION] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/tests/:testId/questions/:questionId
// Редактиране на въпрос
// ===============================
academyTestsController.put(
  '/:testId/questions/:questionId',
  isAuth,
  rbac.checkPermission('test', 'update'),
  validateBody(questionUpdateSchema),
  async (req, res, next) => {
    try {
      const testId = parseInt(req.params.testId);
      const questionId = parseInt(req.params.questionId);

      const { questionText, questionType, explanation, hint, points, imageUrl, answers } = req.body;

      const question = await test_question.findOne({
        where: { id: questionId, testId },
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found',
        });
      }

      const updates = {};
      if (questionText !== undefined) updates.questionText = questionText;
      if (questionType !== undefined) updates.questionType = questionType;
      if (explanation !== undefined) updates.explanation = explanation;
      if (hint !== undefined) updates.hint = hint;
      if (points !== undefined) updates.points = points;
      if (imageUrl !== undefined) updates.imageUrl = imageUrl;

      await question.update(updates);

      if (answers && Array.isArray(answers)) {
        await test_answer.destroy({
          where: { questionId },
        });

        for (let i = 0; i < answers.length; i++) {
          await test_answer.create({
            questionId,
            answerText: answers[i].answerText,
            isCorrect: answers[i].isCorrect || false,
            explanation: answers[i].explanation,
            sortOrder: i + 1,
          });
        }
      }

      const testData = await test.findByPk(testId);
      const totalPoints = await test_question.sum('points', { where: { testId } });
      await testData.update({ totalPoints: totalPoints || 0 });

      const questionWithAnswers = await test_question.findByPk(questionId, {
        include: [{ model: test_answer, as: 'answerOptions' }],
      });

      res.status(200).json({
        success: true,
        message: 'Question updated successfully',
        question: questionWithAnswers,
      });
    } catch (err) {
      console.error('❌ [UPDATE QUESTION] Error:', err);
      next(err);
    }
  }
);

// ===============================
// DELETE /api/academy/tests/:testId/questions/:questionId
// Изтриване на въпрос
// ===============================
academyTestsController.delete(
  '/:testId/questions/:questionId',
  isAuth,
  rbac.checkPermission('test', 'update'),
  async (req, res, next) => {
    try {
      const testId = parseInt(req.params.testId);
      const questionId = parseInt(req.params.questionId);

      const question = await test_question.findOne({
        where: { id: questionId, testId },
      });

      if (!question) {
        return res.status(404).json({
          success: false,
          message: 'Question not found',
        });
      }

      await test_answer.destroy({
        where: { questionId },
      });

      await question.destroy();

      const testData = await test.findByPk(testId);
      const totalQuestions = await test_question.count({ where: { testId } });
      const totalPoints = await test_question.sum('points', { where: { testId } });

      await testData.update({
        totalQuestions,
        totalPoints: totalPoints || 0,
      });

      res.status(200).json({
        success: true,
        message: 'Question deleted successfully',
      });
    } catch (err) {
      console.error('❌ [DELETE QUESTION] Error:', err);
      next(err);
    }
  }
);

// ===============================
// PUT /api/academy/tests/:testId/questions/reorder
// Пренареждане на въпроси
// ===============================
academyTestsController.put(
  '/:testId/questions/reorder',
  isAuth,
  rbac.checkPermission('test', 'update'),
  validateBody(questionReorderSchema),
  async (req, res, next) => {
    try {
      const testId = parseInt(req.params.testId);
      const { questionIds } = req.body;

      for (let i = 0; i < questionIds.length; i++) {
        await test_question.update(
          { sortOrder: i + 1 },
          { where: { id: questionIds[i], testId } }
        );
      }

      res.status(200).json({
        success: true,
        message: 'Questions reordered successfully',
      });
    } catch (err) {
      console.error('❌ [REORDER QUESTIONS] Error:', err);
      next(err);
    }
  }
);

// =========================================================
//                    TEST TAKING (Student)
// =========================================================

// ===============================
// GET /api/academy/tests/:id/preview
// Преглед на тест (за студент)
// ===============================
academyTestsController.get('/:id/preview', isAuth, async (req, res, next) => {
  try {
    const testId = parseInt(req.params.id);
    const userId = req.user.userId;

    const testData = await test.findByPk(testId, {
      attributes: [
        'id',
        'title',
        'description',
        'instructions',
        'testType',
        'timeLimitMinutes',
        'passingScore',
        'maxAttempts',
        'totalQuestions',
        'totalPoints',
        'maxCredits',
        'creditsForPassing',
      ],
    });

    if (!testData) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    const studentData = await getStudentByUserId(userId);
    let previousAttempts = [];
    let attemptsRemaining = testData.maxAttempts;

    if (studentData) {
      previousAttempts = await test_attempt.findAll({
        where: {
          testId,
          studentId: studentData.id,
        },
        attributes: ['id', 'status', 'scorePercentage', 'passed', 'startedAt', 'completedAt'],
        order: [['createdAt', 'DESC']],
      });

      attemptsRemaining = Math.max(0, testData.maxAttempts - previousAttempts.length);
    }

    res.status(200).json({
      success: true,
      test: testData,
      previousAttempts,
      attemptsRemaining,
      canAttempt: attemptsRemaining > 0,
    });
  } catch (err) {
    console.error('❌ [PREVIEW TEST] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/academy/tests/lesson/:lessonId/status
// Статус на теста за урок + история на опити
// ===============================
academyTestsController.get('/lesson/:lessonId/status', isAuth, async (req, res, next) => {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Намери теста за този урок
    const testData = await test.findOne({
      where: { lessonId, isPublished: true },
      attributes: [
        'id', 'title', 'description', 'totalQuestions', 'totalPoints',
        'passingScore', 'maxAttempts', 'timeLimitMinutes', 
        'maxCredits', 'creditsForPassing', 'shuffleQuestions', 'shuffleAnswers',
        'showCorrectAnswers', 'showScore', 'allowReview'
      ]
    });

    if (!testData) {
      return res.status(404).json({
        success: false,
        message: 'Test not found for this lesson',
      });
    }

    // Privileged users - винаги могат
    const privilegedRoles = ['admin', 'moderator', 'mentor'];
    const isPrivileged = privilegedRoles.includes(userRole);

    const studentData = await getStudentByUserId(userId);

    // Ако няма студентски профил - няма опити
    if (!studentData) {
      return res.status(200).json({
        success: true,
        test: testData,
        attempts: [],
        bestAttempt: null,
        lastAttempt: null,
        hasPassedTest: false,
        activeAttempt: null,
        canStartNew: true,
        totalAttempts: 0,
        remainingAttempts: testData.maxAttempts || null,
        isPrivileged,
      });
    }

    // Вземи всички опити на този студент
    const attempts = await test_attempt.findAll({
      where: {
        testId: testData.id,
        studentId: studentData.id,
      },
      attributes: [
        'id', 'attemptNumber', 'status', 'scorePercentage', 'passed',
        'earnedPoints', 'totalPoints', 'correctAnswers', 'wrongAnswers',
        'startedAt', 'completedAt', 'earnedCredits'
      ],
      order: [['attemptNumber', 'DESC']],
    });

    // Намери активен (in_progress) опит
    const activeAttempt = attempts.find(a => a.status === 'in_progress') || null;

    // Филтрирай завършените опити
    const completedAttempts = attempts.filter(a => a.status === 'completed');

    // Намери най-добър резултат
    let bestAttempt = null;
    if (completedAttempts.length > 0) {
      bestAttempt = completedAttempts.reduce((best, current) => 
        (current.scorePercentage > best.scorePercentage) ? current : best
      );
    }

    // Последен опит
    const lastAttempt = completedAttempts.length > 0 ? completedAttempts[0] : null;

    // Дали е преминал някога
    const hasPassedTest = completedAttempts.some(a => a.passed);

    // Може ли да започне нов опит
    // null или 0 maxAttempts = безкрайни опити
    const hasUnlimitedAttempts = !testData.maxAttempts || testData.maxAttempts === 0;
    const canStartNew = !activeAttempt && (hasUnlimitedAttempts || attempts.length < testData.maxAttempts);

    // Оставащи опити
    const remainingAttempts = hasUnlimitedAttempts 
      ? null  // null означава безкрайни
      : Math.max(0, testData.maxAttempts - attempts.length);

    res.status(200).json({
      success: true,
      test: testData,
      attempts: attempts.map(a => a.get({ plain: true })),
      bestAttempt: bestAttempt ? bestAttempt.get({ plain: true }) : null,
      lastAttempt: lastAttempt ? lastAttempt.get({ plain: true }) : null,
      hasPassedTest,
      activeAttempt: activeAttempt ? activeAttempt.get({ plain: true }) : null,
      canStartNew,
      totalAttempts: attempts.length,
      remainingAttempts,
      isPrivileged,
    });
  } catch (err) {
    console.error('❌ [GET TEST STATUS] Error:', err);
    next(err);
  }
});

// ===============================
// POST /api/academy/tests/:id/start
// Започване на тест
// ===============================
academyTestsController.post('/:id/start', isAuth, async (req, res, next) => {
  try {
    const testId = parseInt(req.params.id);
    const userId = req.user.userId;

    const testData = await test.findByPk(testId);

    if (!testData) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    if (!testData.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Test is not available',
      });
    }

    let studentData = await getStudentByUserId(userId);

    if (!studentData) {
      studentData = await student.create({
        userId,
        status: 'active',
      });
    }

    const existingAttempts = await test_attempt.count({
      where: {
        testId,
        studentId: studentData.id,
      },
    });

    if (testData.maxAttempts && existingAttempts >= testData.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached',
      });
    }

    const inProgressAttempt = await test_attempt.findOne({
      where: {
        testId,
        studentId: studentData.id,
        status: 'in_progress',
      },
    });

    if (inProgressAttempt) {
      const questions = await getQuestionsForAttempt(testData, inProgressAttempt.id);

      return res.status(200).json({
        success: true,
        message: 'Continuing existing attempt',
        attempt: inProgressAttempt,
        questions,
        timeRemaining: calculateTimeRemaining(inProgressAttempt, testData),
      });
    }

    const attempt = await test_attempt.create({
      testId,
      studentId: studentData.id,
      status: 'in_progress',
      startedAt: new Date(),
      attemptNumber: existingAttempts + 1,
    });

    const questions = await getQuestionsForAttempt(testData, attempt.id);

    res.status(201).json({
      success: true,
      message: 'Test started',
      attempt,
      questions,
      timeLimit: testData.timeLimitMinutes,
    });
  } catch (err) {
    console.error('❌ [START TEST] Error:', err);
    next(err);
  }
});

// Helper: Get questions for attempt
const getQuestionsForAttempt = async (testData, attemptId) => {
  let questions = await test_question.findAll({
    where: { testId: testData.id },
    include: [
      {
        model: test_answer,
        as: 'answerOptions',
        attributes: ['id', 'answerText', 'sortOrder'],
      },
    ],
    order: [['sortOrder', 'ASC']],
  });

  questions = questions.map((q) => q.get({ plain: true }));

  if (testData.shuffleQuestions) {
    questions = shuffleArray(questions);
  }

  if (testData.shuffleAnswers) {
    questions = questions.map((q) => ({
      ...q,
      answerOptions: shuffleArray(q.answerOptions),
    }));
  }

  const submittedAnswers = await test_attempt_answer.findAll({
    where: { attemptId },
    attributes: ['questionId', 'answerId', 'textAnswer'],
  });

  const submittedMap = {};
  submittedAnswers.forEach((sa) => {
    submittedMap[sa.questionId] = {
      answerId: sa.answerId,
      textAnswer: sa.textAnswer,
    };
  });

  questions = questions.map((q) => ({
    ...q,
    submittedAnswer: submittedMap[q.id] || null,
  }));

  return questions;
};

// Helper: Calculate time remaining
const calculateTimeRemaining = (attempt, testData) => {
  if (!testData.timeLimitMinutes) return null;

  const startTime = new Date(attempt.startedAt).getTime();
  const timeLimit = testData.timeLimitMinutes * 60 * 1000;
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, timeLimit - elapsed);

  return Math.floor(remaining / 1000);
};

// ===============================
// POST /api/academy/tests/:id/answer
// Отговор на въпрос
// ===============================
academyTestsController.post(
  '/:id/answer',
  isAuth,
  validateBody(testAnswerSchema),
  async (req, res, next) => {
    try {
      const testId = parseInt(req.params.id);
      const userId = req.user.userId;
      const { questionId, answerId, textAnswer } = req.body;

      const studentData = await getStudentByUserId(userId);

      if (!studentData) {
        return res.status(404).json({
          success: false,
          message: 'Student profile not found',
        });
      }

      const attempt = await test_attempt.findOne({
        where: {
          testId,
          studentId: studentData.id,
          status: 'in_progress',
        },
      });

      if (!attempt) {
        return res.status(400).json({
          success: false,
          message: 'No active test attempt found',
        });
      }

      const testData = await test.findByPk(testId);
      if (testData.timeLimitMinutes) {
        const timeRemaining = calculateTimeRemaining(attempt, testData);
        if (timeRemaining <= 0) {
          await submitAttempt(attempt.id);

          return res.status(400).json({
            success: false,
            message: 'Time limit exceeded. Test has been submitted.',
          });
        }
      }

      const existingAnswer = await test_attempt_answer.findOne({
        where: {
          attemptId: attempt.id,
          questionId,
        },
      });

      if (existingAnswer) {
        await existingAnswer.update({
          answerId: answerId || null,
          textAnswer: textAnswer || null,
          answeredAt: new Date(),
        });
      } else {
        await test_attempt_answer.create({
          attemptId: attempt.id,
          questionId,
          answerId: answerId || null,
          textAnswer: textAnswer || null,
          answeredAt: new Date(),
        });
      }

      res.status(200).json({
        success: true,
        message: 'Answer saved',
      });
    } catch (err) {
      console.error('❌ [SAVE ANSWER] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/tests/:id/submit
// Предаване на тест
// ===============================
academyTestsController.post('/:id/submit', isAuth, async (req, res, next) => {
  try {
    const testId = parseInt(req.params.id);
    const userId = req.user.userId;

    const studentData = await getStudentByUserId(userId);

    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const attempt = await test_attempt.findOne({
      where: {
        testId,
        studentId: studentData.id,
        status: 'in_progress',
      },
    });

    if (!attempt) {
      return res.status(400).json({
        success: false,
        message: 'No active test attempt found',
      });
    }

    const result = await submitAttempt(attempt.id);

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      result,
    });
  } catch (err) {
    console.error('❌ [SUBMIT TEST] Error:', err);
    next(err);
  }
});

// Helper: Submit attempt and calculate score
const submitAttempt = async (attemptId) => {
  const attempt = await test_attempt.findByPk(attemptId, {
    include: [{ model: test, as: 'test' }],
  });

  if (!attempt) return null;

  const answers = await test_attempt_answer.findAll({
    where: { attemptId },
    include: [
      {
        model: test_question,
        as: 'question',
      },
    ],
  });

  for (const answer of answers) {
    if (answer.answerId) {
      const selectedAnswer = await test_answer.findByPk(answer.answerId);
      if (selectedAnswer) {
        await answer.update({
          isCorrect: selectedAnswer.isCorrect,
          pointsEarned: selectedAnswer.isCorrect ? (answer.question?.points || 1) : 0,
        });
      }
    }
  }

  const score = await calculateTestScore(attemptId);

  await attempt.update({
    status: 'completed',
    completedAt: new Date(),
    scorePercentage: score.scorePercentage,
    earnedPoints: score.earnedPoints,
    totalPoints: score.totalPoints,
    correctAnswers: score.correctAnswers,
    wrongAnswers: score.wrongAnswers,
    passed: score.passed,
    earnedCredits: score.passed ? (attempt.test.creditsForPassing || attempt.test.maxCredits || 0) : 0,
  });

  if (attempt.test.lessonId) {
    const lessonProgress = await student_lesson.findOne({
      where: {
        studentId: attempt.studentId,
        lessonId: attempt.test.lessonId,
      },
    });

    if (lessonProgress) {
      await lessonProgress.update({
        testPassed: score.passed,
        testScore: score.scorePercentage,
        testCompletedAt: new Date(),
      });
    }
  }

  return {
    attemptId,
    ...score,
    earnedCredits: score.passed ? (attempt.test.creditsForPassing || attempt.test.maxCredits || 0) : 0,
  };
};

// ===============================
// GET /api/academy/tests/:id/result/:attemptId
// Резултат от опит
// ===============================
academyTestsController.get('/:id/result/:attemptId', isAuth, async (req, res, next) => {
  try {
    const testId = parseInt(req.params.id);
    const attemptId = parseInt(req.params.attemptId);
    const userId = req.user.userId;

    const studentData = await getStudentByUserId(userId);

    const attempt = await test_attempt.findOne({
      where: {
        id: attemptId,
        testId,
        ...(studentData ? { studentId: studentData.id } : {}),
      },
      include: [
        {
          model: test,
          as: 'test',
          attributes: [
            'id',
            'title',
            'passingScore',
            'showCorrectAnswers',
            'showScore',
            'allowReview',
          ],
        },
      ],
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found',
      });
    }

    const isOwner = studentData && attempt.studentId === studentData.id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'mentor';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const response = {
      success: true,
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        passed: attempt.passed,
        earnedCredits: attempt.earnedCredits,
      },
    };

    if (attempt.test.showScore || isAdmin) {
      response.attempt.scorePercentage = attempt.scorePercentage;
      response.attempt.earnedPoints = attempt.earnedPoints;
      response.attempt.totalPoints = attempt.totalPoints;
      response.attempt.correctAnswers = attempt.correctAnswers;
      response.attempt.wrongAnswers = attempt.wrongAnswers;
    }

    if ((attempt.test.allowReview || isAdmin) && attempt.status === 'completed') {
      const answers = await test_attempt_answer.findAll({
        where: { attemptId },
        include: [
          {
            model: test_question,
            as: 'question',
            include: [
              {
                model: test_answer,
                as: 'answerOptions',
                attributes: attempt.test.showCorrectAnswers || isAdmin
                  ? ['id', 'answerText', 'isCorrect', 'explanation']
                  : ['id', 'answerText'],
              },
            ],
          },
          {
            model: test_answer,
            as: 'selectedAnswer',
            attributes: ['id', 'answerText'],
          },
        ],
      });

      response.answers = answers.map((a) => ({
        questionId: a.questionId,
        questionText: a.question.questionText,
        questionType: a.question.questionType,
        selectedAnswerId: a.answerId,
        selectedAnswerText: a.selectedAnswer?.answerText,
        textAnswer: a.textAnswer,
        isCorrect: attempt.test.showCorrectAnswers || isAdmin ? a.isCorrect : undefined,
        explanation:
          attempt.test.showCorrectAnswers || isAdmin ? a.question.explanation : undefined,
        answerOptions: a.question.answerOptions,
      }));
    }

    res.status(200).json(response);
  } catch (err) {
    console.error('❌ [GET TEST RESULT] Error:', err);
    next(err);
  }
});

// =========================================================
//                    ADMIN: ATTEMPTS MANAGEMENT
// =========================================================

// ===============================
// GET /api/academy/tests/:id/attempts
// Всички опити за тест (admin)
// ===============================
academyTestsController.get(
  '/:id/attempts',
  isAuth,
  rbac.checkPermission('test', 'read'),
  validateQuery(testAttemptsQuerySchema),
  async (req, res, next) => {
    try {
      const testId = parseInt(req.params.id);
      const { page, limit, status } = req.query;

      const offset = (page - 1) * limit;

      const where = { testId };

      if (status && status !== 'all') {
        where.status = status;
      }

      const { count, rows: attempts } = await test_attempt.findAndCountAll({
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
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      const formattedAttempts = attempts.map((a) => {
        const data = a.get({ plain: true });
        const studentInfo = data.student;
        const userDetails = studentInfo?.user?.details || {};

        return {
          id: data.id,
          studentId: data.studentId,
          studentName:
            userDetails.username ||
            `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() ||
            studentInfo?.user?.email?.split('@')[0] ||
            'Unknown',
          studentEmail: studentInfo?.user?.email,
          status: data.status,
          attemptNumber: data.attemptNumber,
          scorePercentage: data.scorePercentage,
          earnedPoints: data.earnedPoints,
          totalPoints: data.totalPoints,
          correctAnswers: data.correctAnswers,
          wrongAnswers: data.wrongAnswers,
          passed: data.passed,
          startedAt: data.startedAt,
          completedAt: data.completedAt,
        };
      });

      res.status(200).json({
        success: true,
        attempts: formattedAttempts,
        pagination: {
          page,
          limit,
          total: count,
          totalPages,
        },
      });
    } catch (err) {
      console.error('❌ [GET TEST ATTEMPTS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// GET /api/academy/tests/:id/statistics
// Статистики за тест
// ===============================
academyTestsController.get(
  '/:id/statistics',
  isAuth,
  rbac.checkPermission('test', 'read'),
  async (req, res, next) => {
    try {
      const testId = parseInt(req.params.id);

      const testData = await test.findByPk(testId);

      if (!testData) {
        return res.status(404).json({
          success: false,
          message: 'Test not found',
        });
      }

      const totalAttempts = await test_attempt.count({
        where: { testId },
      });

      const completedAttempts = await test_attempt.count({
        where: { testId, status: 'completed' },
      });

      const passedAttempts = await test_attempt.count({
        where: { testId, passed: true },
      });

      const scoreData = await test_attempt.findAll({
        where: { testId, status: 'completed' },
        attributes: [
          [sequelize.fn('AVG', sequelize.col('score_percentage')), 'avgScore'],
          [sequelize.fn('MIN', sequelize.col('score_percentage')), 'minScore'],
          [sequelize.fn('MAX', sequelize.col('score_percentage')), 'maxScore'],
        ],
        raw: true,
      });

      const questionStats = await test_attempt_answer.findAll({
        include: [
          {
            model: test_question,
            as: 'question',
            where: { testId },
            attributes: ['id', 'questionText'],
          },
        ],
        attributes: [
          'questionId',
          [sequelize.fn('COUNT', sequelize.col('test_attempt_answer.id')), 'totalAnswers'],
          [
            sequelize.fn(
              'SUM',
              sequelize.literal("CASE WHEN is_correct = true THEN 1 ELSE 0 END")
            ),
            'correctAnswers',
          ],
        ],
        group: ['questionId', 'question.id'],
        raw: true,
      });

      const formattedQuestionStats = questionStats.map((qs) => ({
        questionId: qs.questionId,
        questionText: qs['question.questionText'],
        totalAnswers: parseInt(qs.totalAnswers),
        correctAnswers: parseInt(qs.correctAnswers) || 0,
        correctRate:
          qs.totalAnswers > 0
            ? Math.round((parseInt(qs.correctAnswers || 0) / parseInt(qs.totalAnswers)) * 100)
            : 0,
      }));

      res.status(200).json({
        success: true,
        statistics: {
          attempts: {
            total: totalAttempts,
            completed: completedAttempts,
            inProgress: totalAttempts - completedAttempts,
            passed: passedAttempts,
            failed: completedAttempts - passedAttempts,
            passRate: completedAttempts > 0 ? Math.round((passedAttempts / completedAttempts) * 100) : 0,
          },
          scores: {
            average: Math.round(parseFloat(scoreData[0]?.avgScore) || 0),
            min: parseInt(scoreData[0]?.minScore) || 0,
            max: parseInt(scoreData[0]?.maxScore) || 0,
          },
          questions: formattedQuestionStats,
        },
      });
    } catch (err) {
      console.error('❌ [GET TEST STATISTICS] Error:', err);
      next(err);
    }
  }
);

// ===============================
// POST /api/academy/tests/attempts/:attemptId/reset
// Reset на опит (admin)
// ===============================
academyTestsController.post(
  '/attempts/:attemptId/reset',
  isAuth,
  rbac.checkPermission('test', 'update'),
  async (req, res, next) => {
    try {
      const attemptId = parseInt(req.params.attemptId);

      const attempt = await test_attempt.findByPk(attemptId);

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message: 'Attempt not found',
        });
      }

      await test_attempt_answer.destroy({
        where: { attemptId },
      });

      await attempt.destroy();

      res.status(200).json({
        success: true,
        message: 'Attempt reset successfully',
      });
    } catch (err) {
      console.error('❌ [RESET ATTEMPT] Error:', err);
      next(err);
    }
  }
);
// ===============================
// POST /api/academy/tests/lesson/:lessonId/start
// Започване на тест по lessonId
// ===============================
academyTestsController.post('/lesson/:lessonId/start', isAuth, async (req, res, next) => {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Намери теста за този урок с информация за урока
    const testData = await test.findOne({
      where: { lessonId, isPublished: true },
      include: [{
        model: lesson,
        as: 'lesson',
        attributes: ['id', 'courseId', 'isFree']
      }]
    });

    if (!testData) {
      return res.status(404).json({
        success: false,
        message: 'Test not found for this lesson',
      });
    }

    // Privileged users (admin/mentor/moderator) - skip enrollment check
    const privilegedRoles = ['admin', 'moderator', 'mentor'];
    const isPrivileged = privilegedRoles.includes(userRole);

    let studentData = await getStudentByUserId(userId);

    // За privileged users - създай student profile ако няма
    if (isPrivileged && !studentData) {
      studentData = await student.create({
        userId,
        status: 'active',
      });
    }

    // ========== ENROLLMENT CHECK ==========
    if (!isPrivileged) {
      if (!studentData) {
        return res.status(403).json({
          success: false,
          message: 'Трябва да сте записани в курса, за да решите теста',
        });
      }

      const enrollment = await course_enrollment.findOne({
        where: {
          studentId: studentData.id,
          courseId: testData.lesson.courseId,
          status: 'active'
        }
      });

      // Ако урокът НЕ е безплатен и няма enrollment - забрани
      if (!testData.lesson.isFree && !enrollment) {
        return res.status(403).json({
          success: false,
          message: 'Трябва да сте записани в курса, за да решите теста',
        });
      }
    }
    // ======================================

    const existingAttempts = await test_attempt.count({
      where: {
        testId: testData.id,
        studentId: studentData.id,
      },
    });

    if (existingAttempts >= testData.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached',
      });
    }

    const inProgressAttempt = await test_attempt.findOne({
      where: {
        testId: testData.id,
        studentId: studentData.id,
        status: 'in_progress',
      },
    });

    if (inProgressAttempt) {
      const questions = await getQuestionsForAttempt(testData, inProgressAttempt.id);

      return res.status(200).json({
        success: true,
        message: 'Continuing existing attempt',
        attempt: inProgressAttempt,
        test: testData,
        questions,
        timeRemaining: calculateTimeRemaining(inProgressAttempt, testData),
      });
    }

    const attempt = await test_attempt.create({
      testId: testData.id,
      studentId: studentData.id,
      status: 'in_progress',
      startedAt: new Date(),
      attemptNumber: existingAttempts + 1,
    });

    const questions = await getQuestionsForAttempt(testData, attempt.id);

    res.status(201).json({
      success: true,
      message: 'Test started',
      attempt,
      test: testData,
      questions,
      timeLimit: testData.timeLimitMinutes,
    });
  } catch (err) {
    console.error('❌ [START TEST BY LESSON] Error:', err);
    next(err);
  }
});

// Backend - добави преди другите GET endpoints
academyTestsController.get('/lesson/:lessonId/attempt', isAuth, async (req, res, next) => {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.user.userId;

    const testData = await test.findOne({
      where: { lessonId, isPublished: true }
    });

    if (!testData) {
      return res.status(404).json({
        success: false,
        message: 'Test not found for this lesson',
      });
    }

    const studentData = await getStudentByUserId(userId);

    if (!studentData) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
      });
    }

    const attempt = await test_attempt.findOne({
      where: {
        testId: testData.id,
        studentId: studentData.id,
        status: 'in_progress',
      },
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'No active attempt found',
      });
    }

    const questions = await getQuestionsForAttempt(testData, attempt.id);

    res.status(200).json({
      success: true,
      test: testData,
      attempt,
      questions,
      timeRemaining: calculateTimeRemaining(attempt, testData),
    });
  } catch (err) {
    console.error('❌ [GET ATTEMPT BY LESSON] Error:', err);
    next(err);
  }
});

module.exports = academyTestsController;