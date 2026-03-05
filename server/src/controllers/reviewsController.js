// server/src/controllers/reviewsController.js

const reviewsController = require('express').Router();
const { Op } = require('sequelize');

const { review, user_account, mentor, course, lecture, sequelize, user_details, user_notification, admin_notification } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');
const {
  createAcademyReviewSchema,
  createMentorReviewSchema,
  createCourseReviewSchema,
  createLectureReviewSchema,
  rejectReviewSchema
} = require('../schemas/reviews.schema');

// ✅ IMPORT SERVICES
const { calculateAndUpdateMentorRating } = require('../services/mentorReviewService');
const { calculateAndUpdateCourseRating } = require('../services/courseReviewService');
const { calculateAndUpdateLectureRating } = require('../services/lectureReviewService');

// ===============================
// POST /api/reviews/academy
// Създаване на review за академията
// ===============================
reviewsController.post('/academy', isAuth, async (req, res, next) => {
  try {
    const validationResult = createAcademyReviewSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors
      });
    }

    const userId = req.user.userId;

    const existingReview = await review.findOne({
      where: {
        userId,
        reviewType: 'academy',
        targetId: null
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for the academy.'
      });
    }

    const reviewData = {
      userId,
      reviewType: 'academy',
      targetId: null,
      ...validationResult.data,
      status: 'pending'
    };

    const newReview = await review.create(reviewData);
    
    await admin_notification.create({
      type: 'academy_review',
      title: 'Ново ревю за академията',
      message: `${reviewData.name} остави ревю с ${reviewData.rating} ${reviewData.rating === 1 ? 'звезда' : 'звезди'}`,
      data: {
        reviewId: newReview.id,
        reviewerName: reviewData.name,
        reviewerEmail: reviewData.email,
        rating: reviewData.rating,
        role: reviewData.role
      },
      read: false
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will be reviewed by our team.',
      review: newReview
    });

  } catch (err) {
    console.error('❌ [CREATE ACADEMY REVIEW] Error:', err);
    next(err);
  }
});

// ===============================
// POST /api/reviews/mentor/:mentorId
// Създаване на review за ментор
// ===============================
reviewsController.post('/mentor/:mentorId', isAuth, async (req, res, next) => {
  try {
    const mentorId = parseInt(req.params.mentorId);
    const userId = req.user.userId;

    // ✅ ВАЛИДАЦИЯ
    const validationResult = createMentorReviewSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors
      });
    }

    // ✅ ПРОВЕРИ ДАЛИ МЕНТОРА СЪЩЕСТВУВА
    const mentorData = await mentor.findByPk(mentorId);

    if (!mentorData) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // ✅ ПРОВЕРИ ДАЛИ USER ВЕЧЕ ИМА REVIEW ЗА ТОЗИ МЕНТОР
    const existingReview = await review.findOne({
      where: {
        userId,
        reviewType: 'mentor',
        targetId: mentorId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this mentor.'
      });
    }

    // ✅ СЪЗДАЙ REVIEW
    const reviewData = {
      userId,
      reviewType: 'mentor',
      targetId: mentorId,
      ...validationResult.data,
      status: 'pending'
    };

    const newReview = await review.create(reviewData);

    // ✅ СЪЗДАЙ ADMIN NOTIFICATION
    await admin_notification.create({
      type: 'mentor_review',
      title: 'Ново ревю за ментор',
      message: `${reviewData.name} остави ревю за ментор ${mentorData.name} с ${reviewData.rating} ${reviewData.rating === 1 ? 'звезда' : 'звезди'}`,
      data: {
        reviewId: newReview.id,
        mentorId: mentorId,
        mentorName: mentorData.name,
        reviewerName: reviewData.name,
        reviewerEmail: reviewData.email,
        rating: reviewData.rating,
        role: reviewData.role
      },
      read: false
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will be reviewed by our team.',
      review: newReview
    });

  } catch (err) {
    console.error('❌ [CREATE MENTOR REVIEW] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/reviews/mentor/:mentorId/approved
// Вземи одобрени reviews за ментор
// ===============================
reviewsController.get('/mentor/:mentorId/approved', async (req, res, next) => {
  try {
    const mentorId = parseInt(req.params.mentorId);
    const { limit = 10 } = req.query;

    const reviews = await review.findAll({
      where: {
        reviewType: 'mentor',
        targetId: mentorId,
        status: 'approved'
      },
      include: [
        {
          model: user_account,
          as: 'user',
          attributes: ['id', 'email'],
          include: [
            {
              model: user_details,
              as: 'details',
              attributes: ['imageURL', 'firstName', 'lastName', 'username']
            }
          ]
        }
      ],
      order: [['approved_at', 'DESC']],
      limit: parseInt(limit)
    });

    const reviewsWithImages = reviews.map(r => {
      const reviewJson = r.get({ plain: true });
      
      return {
        id: reviewJson.id,
        userId: reviewJson.userId,
        name: reviewJson.name,
        email: reviewJson.email,
        role: reviewJson.role,
        rating: reviewJson.rating,
        text: reviewJson.text,
        status: reviewJson.status,
        approvedAt: reviewJson.approvedAt,
        createdAt: reviewJson.created_at,
        imageUrl: reviewJson.user?.details?.imageURL || null,
        user: {
          id: reviewJson.user?.id,
          email: reviewJson.user?.email,
          name: [reviewJson.user?.details?.firstName, reviewJson.user?.details?.lastName].filter(Boolean).join(' ') || reviewJson.user?.details?.username || reviewJson.name || null,
          username: reviewJson.user?.details?.username
        }
      };
    });

    res.status(200).json({
      success: true,
      reviews: reviewsWithImages,
      total: reviewsWithImages.length
    });

  } catch (err) {
    console.error('❌ [GET MENTOR APPROVED REVIEWS] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/reviews/mentor/:mentorId/stats
// Вземи rating статистики за ментор
// ===============================
reviewsController.get('/mentor/:mentorId/stats', async (req, res, next) => {
  try {
    const mentorId = parseInt(req.params.mentorId);

    // ✅ ВЗЕМИ MENTOR DATA
    const mentorData = await mentor.findByPk(mentorId, {
      attributes: ['id', 'name', 'reviewsCount', 'reviewsAvgRating', 'rating']
    });

    if (!mentorData) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }

    // ✅ ВЗЕМИ RATING DISTRIBUTION
    const ratingDistribution = await review.findAll({
      where: {
        reviewType: 'mentor',
        targetId: mentorId,
        status: 'approved'
      },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']],
      raw: true
    });

    // ✅ FORMAT DISTRIBUTION
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    ratingDistribution.forEach(item => {
      distribution[item.rating] = parseInt(item.count);
    });

    res.status(200).json({
      success: true,
      stats: {
        mentorId: mentorData.id,
        mentorName: mentorData.name,
        totalReviews: mentorData.reviewsCount,
        averageRating: parseFloat(mentorData.reviewsAvgRating),
        ratingDistribution: distribution
      }
    });

  } catch (err) {
    console.error('❌ [GET MENTOR STATS] Error:', err);
    next(err);
  }
});
// ===============================
// GET /api/reviews/mentor/:mentorId/user-status
// Провери дали user има review за този ментор
// ===============================
reviewsController.get('/mentor/:mentorId/user-status', isAuth, async (req, res, next) => {
  try {
    const mentorId = parseInt(req.params.mentorId);
    const userId = req.user.userId;

    const existingReview = await review.findOne({
      where: {
        userId,
        reviewType: 'mentor',
        targetId: mentorId
      }
    });

    res.status(200).json({
      success: true,
      hasReview: !!existingReview,
      review: existingReview || null
    });

  } catch (err) {
    console.error('❌ [CHECK USER MENTOR REVIEW STATUS] Error:', err);
    next(err);
  }
});

// ===============================
// POST /api/reviews/course/:courseId
// Създаване на review за курс
// ===============================
reviewsController.post('/course/:courseId', isAuth, async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const userId = req.user.userId;

    // ✅ ВАЛИДАЦИЯ
    const validationResult = createCourseReviewSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors
      });
    }

    // ✅ ПРОВЕРИ ДАЛИ КУРСЪТ СЪЩЕСТВУВА
    const courseData = await course.findByPk(courseId);

    if (!courseData) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // ✅ ПРОВЕРИ ДАЛИ USER ВЕЧЕ ИМА REVIEW ЗА ТОЗИ КУРС
    const existingReview = await review.findOne({
      where: {
        userId,
        reviewType: 'course',
        targetId: courseId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this course.'
      });
    }

    // ✅ СЪЗДАЙ REVIEW
    const reviewData = {
      userId,
      reviewType: 'course',
      targetId: courseId,
      ...validationResult.data,
      status: 'pending'
    };

    const newReview = await review.create(reviewData);

    // ✅ СЪЗДАЙ ADMIN NOTIFICATION
    await admin_notification.create({
      type: 'course_review',
      title: 'Ново ревю за курс',
      message: `${reviewData.name} остави ревю за курс "${courseData.name}" с ${reviewData.rating} ${reviewData.rating === 1 ? 'звезда' : 'звезди'}`,
      data: {
        reviewId: newReview.id,
        courseId: courseId,
        courseName: courseData.name,
        reviewerName: reviewData.name,
        reviewerEmail: reviewData.email,
        rating: reviewData.rating,
        role: reviewData.role
      },
      read: false
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will be reviewed by our team.',
      review: newReview
    });

  } catch (err) {
    console.error('❌ [CREATE COURSE REVIEW] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/reviews/course/:courseId/approved
// Вземи одобрени reviews за курс
// ===============================
reviewsController.get('/course/:courseId/approved', async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const { limit = 10 } = req.query;

    const reviews = await review.findAll({
      where: {
        reviewType: 'course',
        targetId: courseId,
        status: 'approved'
      },
      include: [
        {
          model: user_account,
          as: 'user',
          attributes: ['id', 'email'],
          include: [
            {
              model: user_details,
              as: 'details',
              attributes: ['imageURL', 'firstName', 'lastName', 'username']
            }
          ]
        }
      ],
      order: [['approved_at', 'DESC']],
      limit: parseInt(limit)
    });

    const reviewsWithImages = reviews.map(r => {
      const reviewJson = r.get({ plain: true });

      return {
        id: reviewJson.id,
        userId: reviewJson.userId,
        name: reviewJson.name,
        email: reviewJson.email,
        role: reviewJson.role,
        rating: reviewJson.rating,
        text: reviewJson.text,
        status: reviewJson.status,
        approvedAt: reviewJson.approvedAt,
        createdAt: reviewJson.created_at,
        imageUrl: reviewJson.user?.details?.imageURL || null,
        user: {
          id: reviewJson.user?.id,
          email: reviewJson.user?.email,
          name: [reviewJson.user?.details?.firstName, reviewJson.user?.details?.lastName].filter(Boolean).join(' ') || reviewJson.user?.details?.username || reviewJson.name || null,
          username: reviewJson.user?.details?.username
        }
      };
    });

    res.status(200).json({
      success: true,
      reviews: reviewsWithImages,
      total: reviewsWithImages.length
    });

  } catch (err) {
    console.error('❌ [GET COURSE APPROVED REVIEWS] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/reviews/course/:courseId/stats
// Вземи rating статистики за курс
// ===============================
reviewsController.get('/course/:courseId/stats', async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId);

    // ✅ ВЗЕМИ COURSE DATA
    const courseData = await course.findByPk(courseId, {
      attributes: ['id', 'name', 'rating']
    });

    if (!courseData) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // ✅ ВЗЕМИ RATING DISTRIBUTION
    const ratingDistribution = await review.findAll({
      where: {
        reviewType: 'course',
        targetId: courseId,
        status: 'approved'
      },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']],
      raw: true
    });

    // ✅ FORMAT DISTRIBUTION
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    let totalReviews = 0;
    ratingDistribution.forEach(item => {
      distribution[item.rating] = parseInt(item.count);
      totalReviews += parseInt(item.count);
    });

    res.status(200).json({
      success: true,
      stats: {
        courseId: courseData.id,
        courseName: courseData.name,
        totalReviews,
        averageRating: courseData.rating ? parseFloat(courseData.rating) : 0,
        ratingDistribution: distribution
      }
    });

  } catch (err) {
    console.error('❌ [GET COURSE STATS] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/reviews/course/:courseId/user-status
// Провери дали user има review за този курс
// ===============================
reviewsController.get('/course/:courseId/user-status', isAuth, async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const userId = req.user.userId;

    const existingReview = await review.findOne({
      where: {
        userId,
        reviewType: 'course',
        targetId: courseId
      }
    });

    res.status(200).json({
      success: true,
      hasReview: !!existingReview,
      review: existingReview || null
    });

  } catch (err) {
    console.error('❌ [CHECK USER COURSE REVIEW STATUS] Error:', err);
    next(err);
  }
});

// ===============================
// POST /api/reviews/lecture/:lectureId
// Създаване на review за лекция
// ===============================
reviewsController.post('/lecture/:lectureId', isAuth, async (req, res, next) => {
  try {
    const lectureId = parseInt(req.params.lectureId);
    const userId = req.user.userId;

    // ✅ ВАЛИДАЦИЯ
    const validationResult = createLectureReviewSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors
      });
    }

    // ✅ ПРОВЕРИ ДАЛИ ЛЕКЦИЯТА СЪЩЕСТВУВА
    const lectureData = await lecture.findByPk(lectureId);

    if (!lectureData) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    // ✅ ПРОВЕРИ ДАЛИ USER ВЕЧЕ ИМА REVIEW ЗА ТАЗИ ЛЕКЦИЯ
    const existingReview = await review.findOne({
      where: {
        userId,
        reviewType: 'lecture',
        targetId: lectureId
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this lecture.'
      });
    }

    // ✅ СЪЗДАЙ REVIEW
    const reviewData = {
      userId,
      reviewType: 'lecture',
      targetId: lectureId,
      ...validationResult.data,
      status: 'pending'
    };

    const newReview = await review.create(reviewData);

    // ✅ СЪЗДАЙ ADMIN NOTIFICATION
    await admin_notification.create({
      type: 'lecture_review',
      title: 'Ново ревю за лекция',
      message: `${reviewData.name} остави ревю за лекция "${lectureData.title}" с ${reviewData.rating} ${reviewData.rating === 1 ? 'звезда' : 'звезди'}`,
      data: {
        reviewId: newReview.id,
        lectureId: lectureId,
        lectureTitle: lectureData.title,
        reviewerName: reviewData.name,
        reviewerEmail: reviewData.email,
        rating: reviewData.rating,
        role: reviewData.role
      },
      read: false
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will be reviewed by our team.',
      review: newReview
    });

  } catch (err) {
    console.error('❌ [CREATE LECTURE REVIEW] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/reviews/lecture/:lectureId/approved
// Вземи одобрени reviews за лекция
// ===============================
reviewsController.get('/lecture/:lectureId/approved', async (req, res, next) => {
  try {
    const lectureId = parseInt(req.params.lectureId);
    const { limit = 10 } = req.query;

    const reviews = await review.findAll({
      where: {
        reviewType: 'lecture',
        targetId: lectureId,
        status: 'approved'
      },
      include: [
        {
          model: user_account,
          as: 'user',
          attributes: ['id', 'email'],
          include: [
            {
              model: user_details,
              as: 'details',
              attributes: ['imageURL', 'firstName', 'lastName', 'username']
            }
          ]
        }
      ],
      order: [['approved_at', 'DESC']],
      limit: parseInt(limit)
    });

    const reviewsWithImages = reviews.map(r => {
      const reviewJson = r.get({ plain: true });

      return {
        id: reviewJson.id,
        userId: reviewJson.userId,
        name: reviewJson.name,
        email: reviewJson.email,
        role: reviewJson.role,
        rating: reviewJson.rating,
        text: reviewJson.text,
        status: reviewJson.status,
        approvedAt: reviewJson.approvedAt,
        createdAt: reviewJson.created_at,
        imageUrl: reviewJson.user?.details?.imageURL || null,
        user: {
          id: reviewJson.user?.id,
          email: reviewJson.user?.email,
          name: [reviewJson.user?.details?.firstName, reviewJson.user?.details?.lastName].filter(Boolean).join(' ') || reviewJson.user?.details?.username || reviewJson.name || null,
          username: reviewJson.user?.details?.username
        }
      };
    });

    res.status(200).json({
      success: true,
      reviews: reviewsWithImages,
      total: reviewsWithImages.length
    });

  } catch (err) {
    console.error('❌ [GET LECTURE APPROVED REVIEWS] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/reviews/lecture/:lectureId/stats
// Вземи rating статистики за лекция
// ===============================
reviewsController.get('/lecture/:lectureId/stats', async (req, res, next) => {
  try {
    const lectureId = parseInt(req.params.lectureId);

    // ✅ ВЗЕМИ LECTURE DATA
    const lectureData = await lecture.findByPk(lectureId, {
      attributes: ['id', 'title', 'rating']
    });

    if (!lectureData) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    // ✅ ВЗЕМИ RATING DISTRIBUTION
    const ratingDistribution = await review.findAll({
      where: {
        reviewType: 'lecture',
        targetId: lectureId,
        status: 'approved'
      },
      attributes: [
        'rating',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['rating'],
      order: [['rating', 'DESC']],
      raw: true
    });

    // ✅ FORMAT DISTRIBUTION
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    let totalReviews = 0;
    ratingDistribution.forEach(item => {
      distribution[item.rating] = parseInt(item.count);
      totalReviews += parseInt(item.count);
    });

    res.status(200).json({
      success: true,
      stats: {
        lectureId: lectureData.id,
        lectureTitle: lectureData.title,
        totalReviews,
        averageRating: lectureData.rating ? parseFloat(lectureData.rating) : 0,
        ratingDistribution: distribution
      }
    });

  } catch (err) {
    console.error('❌ [GET LECTURE STATS] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/reviews/lecture/:lectureId/user-status
// Провери дали user има review за тази лекция
// ===============================
reviewsController.get('/lecture/:lectureId/user-status', isAuth, async (req, res, next) => {
  try {
    const lectureId = parseInt(req.params.lectureId);
    const userId = req.user.userId;

    const existingReview = await review.findOne({
      where: {
        userId,
        reviewType: 'lecture',
        targetId: lectureId
      }
    });

    res.status(200).json({
      success: true,
      hasReview: !!existingReview,
      review: existingReview || null
    });

  } catch (err) {
    console.error('❌ [CHECK USER LECTURE REVIEW STATUS] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/reviews/academy/approved
// Вземи одобрени reviews за академията
// ===============================
reviewsController.get('/academy/approved', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const reviews = await review.findAll({
      where: {
        reviewType: 'academy',
        targetId: null,
        status: 'approved'
      },
      include: [
        {
          model: user_account,
          as: 'user',
          attributes: ['id', 'email'],
          include: [
            {
              model: user_details,
              as: 'details',
              attributes: ['imageURL', 'firstName', 'lastName', 'username']
            }
          ]
        }
      ],
      order: [['approved_at', 'DESC']],
      limit: parseInt(limit)
    });

    const reviewsWithImages = reviews.map(r => {
      const reviewJson = r.get({ plain: true });
      
      return {
        id: reviewJson.id,
        userId: reviewJson.userId,
        reviewType: reviewJson.reviewType,
        targetId: reviewJson.targetId,
        name: reviewJson.name,
        email: reviewJson.email,
        role: reviewJson.role,
        rating: reviewJson.rating,
        text: reviewJson.text,
        status: reviewJson.status,
        rejectionReason: reviewJson.rejectionReason,
        approvedAt: reviewJson.approvedAt,
        approvedBy: reviewJson.approvedBy,
        rejectedAt: reviewJson.rejectedAt,
        rejectedBy: reviewJson.rejectedBy,
        createdAt: reviewJson.created_at,
        updatedAt: reviewJson.updated_at,
        imageUrl: reviewJson.user?.details?.imageURL || null,
        user: {
          id: reviewJson.user?.id,
          email: reviewJson.user?.email,
          username: reviewJson.user?.details?.username
        }
      };
    });

    res.status(200).json({
      success: true,
      reviews: reviewsWithImages,
      total: reviewsWithImages.length
    });

  } catch (err) {
    console.error('❌ [GET APPROVED REVIEWS] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/reviews/academy/user-status
// Провери дали user има review
// ===============================
reviewsController.get('/academy/user-status', isAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const existingReview = await review.findOne({
      where: {
        userId,
        reviewType: 'academy',
        targetId: null
      }
    });

    res.status(200).json({
      success: true,
      hasReview: !!existingReview,
      review: existingReview || null
    });

  } catch (err) {
    console.error('❌ [CHECK USER REVIEW STATUS] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/reviews/my
// Вземи всички reviews на текущия потребител
// ===============================
reviewsController.get('/my', isAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const reviews = await review.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
      limit: 50
    });

    const enrichedReviews = await Promise.all(reviews.map(async (r) => {
      const reviewJson = r.get({ plain: true });
      let targetName = null;

      if (reviewJson.targetId) {
        if (reviewJson.reviewType === 'course') {
          const courseData = await course.findByPk(reviewJson.targetId, { attributes: ['id', 'title'] });
          targetName = courseData?.title || null;
        } else if (reviewJson.reviewType === 'lecture') {
          const lectureData = await lecture.findByPk(reviewJson.targetId, { attributes: ['id', 'title'] });
          targetName = lectureData?.title || null;
        } else if (reviewJson.reviewType === 'mentor') {
          const mentorData = await mentor.findByPk(reviewJson.targetId, {
            attributes: ['id', 'name']
          });
          targetName = mentorData?.name || null;
        }
      }

      return {
        id: reviewJson.id,
        reviewType: reviewJson.reviewType,
        targetId: reviewJson.targetId,
        targetName,
        name: reviewJson.name,
        email: reviewJson.email,
        role: reviewJson.role,
        rating: reviewJson.rating,
        text: reviewJson.text,
        status: reviewJson.status,
        rejectionReason: reviewJson.rejectionReason,
        createdAt: reviewJson.created_at,
        updatedAt: reviewJson.updated_at
      };
    }));

    res.status(200).json({
      success: true,
      reviews: enrichedReviews,
      total: enrichedReviews.length
    });

  } catch (err) {
    console.error('[GET MY REVIEWS] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/reviews/admin/all
// Вземи всички reviews с филтри (ADMIN/MODERATOR)
// ===============================
reviewsController.get('/admin/all', isAuth, rbac.checkPermission('review', 'read'), async (req, res, next) => {
  try {
    const { status, reviewType, limit = 50 } = req.query;

    const whereClause = {};
    if (status && status !== 'all') whereClause.status = status;
    if (reviewType && reviewType !== 'all') whereClause.reviewType = reviewType;

    const reviews = await review.findAll({
      where: whereClause,
      include: [
        {
          model: user_account,
          as: 'user',
          attributes: ['id', 'email'],
          include: [
            {
              model: user_details,
              as: 'details',
              attributes: ['imageURL', 'firstName', 'lastName', 'username']
            }
          ]
        },
        {
          model: user_account,
          as: 'approver',
          attributes: ['id', 'email'],
          include: [
            {
              model: user_details,
              as: 'details',
              attributes: ['firstName', 'lastName', 'username']
            }
          ]
        },
        {
          model: user_account,
          as: 'rejecter',
          attributes: ['id', 'email'],
          include: [
            {
              model: user_details,
              as: 'details',
              attributes: ['firstName', 'lastName', 'username']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    const reviewsWithImages = await Promise.all(reviews.map(async (r) => {
      const reviewJson = r.get({ plain: true });

      let targetName = null;
      if (reviewJson.targetId) {
        if (reviewJson.reviewType === 'course') {
          const courseData = await course.findByPk(reviewJson.targetId, { attributes: ['id', 'title'] });
          targetName = courseData?.title || null;
        } else if (reviewJson.reviewType === 'lecture') {
          const lectureData = await lecture.findByPk(reviewJson.targetId, { attributes: ['id', 'title'] });
          targetName = lectureData?.title || null;
        } else if (reviewJson.reviewType === 'mentor') {
          const mentorData = await mentor.findByPk(reviewJson.targetId, { attributes: ['id', 'name'] });
          targetName = mentorData?.name || null;
        }
      }

      return {
        id: reviewJson.id,
        userId: reviewJson.userId,
        reviewType: reviewJson.reviewType,
        targetId: reviewJson.targetId,
        targetName,
        name: reviewJson.name,
        email: reviewJson.email,
        role: reviewJson.role,
        rating: reviewJson.rating,
        text: reviewJson.text,
        status: reviewJson.status,
        rejectionReason: reviewJson.rejectionReason,
        approvedAt: reviewJson.approvedAt,
        approvedBy: reviewJson.approvedBy,
        rejectedAt: reviewJson.rejectedAt,
        rejectedBy: reviewJson.rejectedBy,
        createdAt: reviewJson.created_at,
        updatedAt: reviewJson.updated_at,
        imageUrl: reviewJson.user?.details?.imageURL || null,
        user: {
          id: reviewJson.user?.id,
          email: reviewJson.user?.email,
          username: reviewJson.user?.details?.username
        },
        approver: reviewJson.approver ? {
          id: reviewJson.approver.id,
          name: reviewJson.approver.details?.firstName && reviewJson.approver.details?.lastName
            ? `${reviewJson.approver.details.firstName} ${reviewJson.approver.details.lastName}`
            : reviewJson.approver.details?.username || reviewJson.approver.email
        } : null,
        rejecter: reviewJson.rejecter ? {
          id: reviewJson.rejecter.id,
          name: reviewJson.rejecter.details?.firstName && reviewJson.rejecter.details?.lastName
            ? `${reviewJson.rejecter.details.firstName} ${reviewJson.rejecter.details.lastName}`
            : reviewJson.rejecter.details?.username || reviewJson.rejecter.email
        } : null
      };
    }));

    res.status(200).json({
      success: true,
      reviews: reviewsWithImages,
      total: reviewsWithImages.length
    });

  } catch (err) {
    console.error('❌ [GET ALL REVIEWS] Error:', err);
    next(err);
  }
});

// ===============================
// GET /api/reviews/pending
// Вземи всички pending reviews (ADMIN)
// ===============================
reviewsController.get('/pending', isAuth, rbac.checkPermission('review', 'read'), async (req, res, next) => {
  try {
    const { reviewType } = req.query;

    const where = { status: 'pending' };
    
    if (reviewType && reviewType !== 'all') {
      where.reviewType = reviewType;
    }

    const reviews = await review.findAll({
      where,
      include: [
        {
          model: user_account,
          as: 'user',
          attributes: ['id', 'email'],
          include: [
            {
              model: user_details,
              as: 'details',
              attributes: ['imageURL', 'firstName', 'lastName', 'username']
            }
          ]
        },
        {
          model: user_account,
          as: 'approver',
          attributes: ['id', 'email'],
          include: [
            {
              model: user_details,
              as: 'details',
              attributes: ['firstName', 'lastName', 'username']
            }
          ]
        },
        {
          model: user_account,
          as: 'rejecter',
          attributes: ['id', 'email'],
          include: [
            {
              model: user_details,
              as: 'details',
              attributes: ['firstName', 'lastName', 'username']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const reviewsWithImages = reviews.map(r => {
      const reviewJson = r.get({ plain: true });
      
      return {
        id: reviewJson.id,
        userId: reviewJson.userId,
        reviewType: reviewJson.reviewType,
        targetId: reviewJson.targetId,
        name: reviewJson.name,
        email: reviewJson.email,
        role: reviewJson.role,
        rating: reviewJson.rating,
        text: reviewJson.text,
        status: reviewJson.status,
        rejectionReason: reviewJson.rejectionReason,
        approvedAt: reviewJson.approvedAt,
        approvedBy: reviewJson.approvedBy,
        rejectedAt: reviewJson.rejectedAt,
        rejectedBy: reviewJson.rejectedBy,
        createdAt: reviewJson.created_at,
        updatedAt: reviewJson.updated_at,
        imageUrl: reviewJson.user?.details?.imageURL || null,
        user: {
          id: reviewJson.user?.id,
          email: reviewJson.user?.email,
          username: reviewJson.user?.details?.username
        },
        approver: reviewJson.approver ? {
          id: reviewJson.approver.id,
          name: reviewJson.approver.details?.firstName && reviewJson.approver.details?.lastName
            ? `${reviewJson.approver.details.firstName} ${reviewJson.approver.details.lastName}`
            : reviewJson.approver.details?.username || reviewJson.approver.email
        } : null,
        rejecter: reviewJson.rejecter ? {
          id: reviewJson.rejecter.id,
          name: reviewJson.rejecter.details?.firstName && reviewJson.rejecter.details?.lastName
            ? `${reviewJson.rejecter.details.firstName} ${reviewJson.rejecter.details.lastName}`
            : reviewJson.rejecter.details?.username || reviewJson.rejecter.email
        } : null
      };
    });

    res.status(200).json({
      success: true,
      reviews: reviewsWithImages,
      total: reviewsWithImages.length
    });

  } catch (err) {
    console.error('❌ [GET PENDING REVIEWS] Error:', err);
    next(err);
  }
});

// ===============================
// PATCH /api/reviews/:id/approve
// Одобри review (ADMIN/MODERATOR) + ИЗПРАТИ НОТИФИКАЦИЯ + КАЛКУЛИРАЙ RATING
// ===============================
reviewsController.patch('/:id/approve', isAuth, rbac.checkPermission('review', 'approve'), async (req, res, next) => {
  try {
    const reviewId = parseInt(req.params.id);
    const adminId = req.user.userId;

    const reviewData = await review.findByPk(reviewId);

    if (!reviewData) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (reviewData.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Review is already approved'
      });
    }

    await reviewData.update({
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: adminId,
      rejectionReason: null,
      rejectedAt: null,
      rejectedBy: null
    });

    // ✅ ИЗПРАТИ USER NOTIFICATION
    const reviewTypeLabels = {
      academy: 'академията',
      mentor: 'ментор',
      course: 'курс',
      lecture: 'лекция'
    };

    await user_notification.create({
      userId: reviewData.userId,
      type: 'review_approved',
      title: 'Вашето ревю беше одобрено! ✅',
      message: `Вашето ревю за ${reviewTypeLabels[reviewData.reviewType] || reviewData.reviewType} беше одобрено и вече е публично видимо. Благодарим ви за отзива!`,
      data: {
        reviewId: reviewData.id,
        reviewType: reviewData.reviewType,
        rating: reviewData.rating,
        approvedBy: adminId
      },
      read: false
    });

    // ✅ RECALCULATE RATING BASED ON REVIEW TYPE
    if (reviewData.targetId) {
      try {
        if (reviewData.reviewType === 'mentor') {
          await calculateAndUpdateMentorRating(reviewData.targetId);
        } else if (reviewData.reviewType === 'course') {
          await calculateAndUpdateCourseRating(reviewData.targetId);
        } else if (reviewData.reviewType === 'lecture') {
          await calculateAndUpdateLectureRating(reviewData.targetId);
        }
      } catch (error) {
        console.error(`❌ Error updating ${reviewData.reviewType} rating:`, error);
        // Не спираме процеса, само логваме грешката
      }
    }

    res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      review: reviewData
    });

  } catch (err) {
    console.error('❌ [APPROVE REVIEW] Error:', err);
    next(err);
  }
});

// ===============================
// PATCH /api/reviews/:id/reject
// Отхвърли review (ADMIN/MODERATOR) + ИЗПРАТИ НОТИФИКАЦИЯ
// ===============================
reviewsController.patch('/:id/reject', isAuth, rbac.checkPermission('review', 'reject'), async (req, res, next) => {
  try {
    const reviewId = parseInt(req.params.id);
    const adminId = req.user.userId;
    const { rejectionReason } = req.body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const reviewData = await review.findByPk(reviewId);

    if (!reviewData) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    await reviewData.update({
      status: 'rejected',
      rejectionReason: rejectionReason.trim(),
      rejectedAt: new Date(),
      rejectedBy: adminId,
      approvedAt: null,
      approvedBy: null
    });

    // ✅ ИЗПРАТИ USER NOTIFICATION С ПРИЧИНА
    const rejectTypeLabels = {
      academy: 'академията',
      mentor: 'ментор',
      course: 'курс',
      lecture: 'лекция'
    };

    await user_notification.create({
      userId: reviewData.userId,
      type: 'review_rejected',
      title: 'Вашето ревю беше отхвърлено ❌',
      message: `Вашето ревю за ${rejectTypeLabels[reviewData.reviewType] || reviewData.reviewType} беше отхвърлено.`,
      data: {
        reviewId: reviewData.id,
        reviewType: reviewData.reviewType,
        rating: reviewData.rating,
        rejectionReason: rejectionReason.trim(),
        rejectedBy: adminId
      },
      read: false
    });

    res.status(200).json({
      success: true,
      message: 'Review rejected successfully',
      review: reviewData
    });

  } catch (err) {
    console.error('❌ [REJECT REVIEW] Error:', err);
    next(err);
  }
});

// ===============================
// DELETE /api/reviews/:id
// Изтрий review (ADMIN) + ИЗПРАТИ НОТИФИКАЦИЯ + RECALCULATE RATING
// ===============================
reviewsController.delete('/:id', isAuth, rbac.checkPermission('review', 'delete'), async (req, res, next) => {
  try {
    const reviewId = parseInt(req.params.id);

    const reviewData = await review.findByPk(reviewId);

    if (!reviewData) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const userId = reviewData.userId;
    const reviewType = reviewData.reviewType;
    const rating = reviewData.rating;
    const targetId = reviewData.targetId;
    const wasApproved = reviewData.status === 'approved';

    // ✅ ИЗПРАТИ USER NOTIFICATION ПРЕДИ ИЗТРИВАНЕ
    const deleteTypeLabels = {
      academy: 'академията',
      mentor: 'ментор',
      course: 'курс',
      lecture: 'лекция'
    };

    await user_notification.create({
      userId: userId,
      type: 'review_deleted',
      title: 'Вашето ревю беше изтрито 🗑️',
      message: `Вашето ревю за ${deleteTypeLabels[reviewType] || reviewType} беше изтрито от администратор.`,
      data: {
        reviewId: reviewId,
        reviewType: reviewType,
        rating: rating,
        deletedReason: reviewData.rejectionReason || 'Не е посочена причина'
      },
      read: false
    });

    await reviewData.destroy();

    // ✅ АКО Е APPROVED REVIEW → RECALCULATE RATING
    if (targetId && wasApproved) {
      try {
        if (reviewType === 'mentor') {
          await calculateAndUpdateMentorRating(targetId);
        } else if (reviewType === 'course') {
          await calculateAndUpdateCourseRating(targetId);
        } else if (reviewType === 'lecture') {
          await calculateAndUpdateLectureRating(targetId);
        }
      } catch (error) {
        console.error(`❌ Error updating ${reviewType} rating after deletion:`, error);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (err) {
    console.error('❌ [DELETE REVIEW] Error:', err);
    next(err);
  }
});

module.exports = reviewsController;