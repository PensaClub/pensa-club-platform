// server/src/sequelize/migrations/YYYYMMDDHHMMSS-add-reviews-fields-to-mentors.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('mentors', 'reviews_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total number of approved reviews for this mentor'
    });

    await queryInterface.addColumn('mentors', 'reviews_avg_rating', {
      type: Sequelize.DECIMAL(2, 1),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0.0,
        max: 5.0
      },
      comment: 'Average rating from approved reviews (0.0 - 5.0)'
    });

    await queryInterface.addIndex('mentors', ['reviews_avg_rating'], {
      name: 'idx_mentors_reviews_avg_rating'
    });

    await queryInterface.addIndex('mentors', ['reviews_count'], {
      name: 'idx_mentors_reviews_count'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('mentors', 'idx_mentors_reviews_count');
    await queryInterface.removeIndex('mentors', 'idx_mentors_reviews_avg_rating');
    await queryInterface.removeColumn('mentors', 'reviews_avg_rating');
    await queryInterface.removeColumn('mentors', 'reviews_count');
  }
};