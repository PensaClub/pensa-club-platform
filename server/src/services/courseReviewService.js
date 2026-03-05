// server/src/services/courseReviewService.js

const { review, course } = require('../sequelize/models/index');

/**
 * Изчисли и обнови rating за курс
 * Извиква се след approve/reject/delete на review
 * @param {number} courseId
 */
const calculateAndUpdateCourseRating = async (courseId) => {
  try {

    const approvedReviews = await review.findAll({
      where: {
        reviewType: 'course',
        targetId: courseId,
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


    await course.update(
      {
        rating: reviewsCount > 0 ? parseFloat(avgRating.toFixed(1)) : null
      },
      {
        where: { id: courseId }
      }
    );

    return {
      success: true,
      courseId,
      reviewsCount,
      avgRating: parseFloat(avgRating.toFixed(1))
    };

  } catch (error) {
    console.error('❌ [CALCULATE COURSE RATING] Error:', error);
    throw error;
  }
};

/**
 * Recalculate ratings за ВСИЧКИ курсове (migration/cleanup)
 */
const recalculateAllCourseRatings = async () => {
  try {
    const courses = await course.findAll({
      attributes: ['id']
    });

    let successCount = 0;

    for (const c of courses) {
      try {
        await calculateAndUpdateCourseRating(c.id);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to recalculate course ${c.id}:`, error);
      }
    }

    return {
      success: true,
      total: courses.length,
      successful: successCount
    };

  } catch (error) {
    console.error('❌ [RECALCULATE ALL COURSES] Error:', error);
    throw error;
  }
};

module.exports = {
  calculateAndUpdateCourseRating,
  recalculateAllCourseRatings
};
