// server/src/controllers/reviewsController.js

const reviewsController = require('express').Router();
const { Op } = require('sequelize');

const { review, user_account, mentor, sequelize, user_details, user_notification } = require('../sequelize/models/index');
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
// Одобри review (ADMIN/MODERATOR) + ИЗПРАТИ НОТИФИКАЦИЯ
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
    await user_notification.create({
      userId: reviewData.userId,
      type: 'review_approved',
      title: 'Вашето ревю беше одобрено! ✅',
      message: `Вашето ревю за ${reviewData.reviewType === 'academy' ? 'академията' : reviewData.reviewType} беше одобрено и вече е публично видимо. Благодарим ви за отзива!`,
      data: {
        reviewId: reviewData.id,
        reviewType: reviewData.reviewType,
        rating: reviewData.rating,
        approvedBy: adminId
      },
      read: false
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
    await user_notification.create({
      userId: reviewData.userId,
      type: 'review_rejected',
      title: 'Вашето ревю беше отхвърлено ❌',
      message: `Вашето ревю за ${reviewData.reviewType === 'academy' ? 'академията' : reviewData.reviewType} беше отхвърлено.`,
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
// Изтрий review (ADMIN) + ИЗПРАТИ НОТИФИКАЦИЯ
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

    // ✅ ИЗПРАТИ USER NOTIFICATION ПРЕДИ ИЗТРИВАНЕ
    await user_notification.create({
      userId: userId,
      type: 'review_deleted',
      title: 'Вашето ревю беше изтрито 🗑️',
      message: `Вашето ревю за ${reviewType === 'academy' ? 'академията' : reviewType} беше изтрито от администратор.`,
      data: {
        reviewId: reviewId,
        reviewType: reviewType,
        rating: rating,
        deletedReason: reviewData.rejectionReason || 'Не е посочена причина'
      },
      read: false
    });

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