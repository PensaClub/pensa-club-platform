// server/src/services/lectureReviewService.js

const { review, lecture } = require('../sequelize/models/index');

/**
 * Изчисли и обнови rating за лекция
 * Извиква се след approve/reject/delete на review
 * @param {number} lectureId
 */
const calculateAndUpdateLectureRating = async (lectureId) => {
  try {

    const approvedReviews = await review.findAll({
      where: {
        reviewType: 'lecture',
        targetId: lectureId,
        status: 'approved'
      },
      attributes: ['rating']
    });

    const reviewsCount = approvedReviews.length;

    let avgRating = 0.0;
    if (reviewsCount > 0) {
      const totalRating = approvedReviews.reduce((sum, r) => sum + parseFloat(r.rating), 0);
      avgRating = totalRating / reviewsCount;
    }


    await lecture.update(
      {
        rating: reviewsCount > 0 ? parseFloat(avgRating.toFixed(1)) : null
      },
      {
        where: { id: lectureId }
      }
    );

    return {
      success: true,
      lectureId,
      reviewsCount,
      avgRating: parseFloat(avgRating.toFixed(1))
    };

  } catch (error) {
    console.error('❌ [CALCULATE LECTURE RATING] Error:', error);
    throw error;
  }
};

/**
 * Recalculate ratings за ВСИЧКИ лекции (migration/cleanup)
 */
const recalculateAllLectureRatings = async () => {
  try {
    const lectures = await lecture.findAll({
      attributes: ['id']
    });

    let successCount = 0;

    for (const l of lectures) {
      try {
        await calculateAndUpdateLectureRating(l.id);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to recalculate lecture ${l.id}:`, error);
      }
    }

    return {
      success: true,
      total: lectures.length,
      successful: successCount
    };

  } catch (error) {
    console.error('❌ [RECALCULATE ALL LECTURES] Error:', error);
    throw error;
  }
};

module.exports = {
  calculateAndUpdateLectureRating,
  recalculateAllLectureRatings
};
