// server/src/controllers/reviewsController.js

const reviewsController = require('express').Router();
const { Op } = require('sequelize');

const { review, user_account, mentor, sequelize,user_details } = require('../sequelize/models/index');
const isAuth = require('../middlewares/isAuth.js');
const rbac = require('../middlewares/rbac.js');
const { 
  createAcademyReviewSchema,
  createMentorReviewSchema,
  rejectReviewSchema
} = require('../schemas/reviews.schema');

// ===============================
// POST /api/reviews/academy
// Създаване на review за академията
// ===============================
// POST /api/reviews/academy
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

    // Провери дали user вече има review за академията
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

    // ✅ СЪЗДАЙ ADMIN NOTIFICATION
    const { admin_notification } = require('../sequelize/models/index');
    
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
// GET /api/reviews/academy/approved
// Вземи одобрени reviews за академията
// ===============================
// GET /api/reviews/academy/approved
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
      order: [['approvedAt', 'DESC']],
      limit: parseInt(limit)
    });

    // Transform data - добави imageUrl динамично
    const reviewsWithImages = reviews.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      role: r.role,
      rating: r.rating,
      text: r.text,
      status: r.status,
      approvedAt: r.approvedAt,
      createdAt: r.createdAt,
      imageUrl: r.user?.details?.imageURL || null,
      user: {
        id: r.user?.id,
        email: r.user?.email
      }
    }));

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
          attributes: ['id', 'email', 'role']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      reviews,
      total: reviews.length
    });

  } catch (err) {
    console.error('❌ [GET PENDING REVIEWS] Error:', err);
    next(err);
  }
});

// ===============================
// POST /api/reviews/:id/approve
// Одобри review (ADMIN)
// ===============================
reviewsController.post('/:id/approve', isAuth, rbac.checkPermission('review', 'approve'), async (req, res, next) => {
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
// POST /api/reviews/:id/reject
// Отхвърли review (ADMIN)
// ===============================
reviewsController.post('/:id/reject', isAuth, rbac.checkPermission('review', 'reject'), async (req, res, next) => {
  try {
    const reviewId = parseInt(req.params.id);
    const adminId = req.user.userId;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
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
      rejectionReason,
      rejectedAt: new Date(),
      rejectedBy: adminId,
      approvedAt: null,
      approvedBy: null
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
// Изтрий review (ADMIN)
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

    await reviewData.destroy();

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