// server/src/services/mentorReviewService.js

const { review, mentor } = require('../sequelize/models/index');

/**
 * Изчисли и обнови rating за ментор
 * Извиква се след approve/reject/delete на review
 * @param {number} mentorId 
 */
const calculateAndUpdateMentorRating = async (mentorId) => {
  try {

    const approvedReviews = await review.findAll({
      where: {
        reviewType: 'mentor',
        targetId: mentorId,
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


    await mentor.update(
      {
        reviewsCount: reviewsCount,
        reviewsAvgRating: parseFloat(avgRating.toFixed(1)),
        rating: parseFloat(avgRating.toFixed(1)) 
      },
      {
        where: { id: mentorId }
      }
    );

    return {
      success: true,
      mentorId,
      reviewsCount,
      avgRating: parseFloat(avgRating.toFixed(1))
    };

  } catch (error) {
    console.error('❌ [CALCULATE RATING] Error:', error);
    throw error;
  }
};

/**
 * Recalculate ratings за ВСИЧКИ ментори (migration/cleanup)
 */
const recalculateAllMentorRatings = async () => {
  try {
    const mentors = await mentor.findAll({
      attributes: ['id']
    });

    let successCount = 0;

    for (const m of mentors) {
      try {
        await calculateAndUpdateMentorRating(m.id);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to recalculate mentor ${m.id}:`, error);
      }
    }

    return {
      success: true,
      total: mentors.length,
      successful: successCount
    };

  } catch (error) {
    console.error('❌ [RECALCULATE ALL] Error:', error);
    throw error;
  }
};

module.exports = {
  calculateAndUpdateMentorRating,
  recalculateAllMentorRatings
};