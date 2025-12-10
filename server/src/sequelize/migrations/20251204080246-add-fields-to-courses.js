// server/src/sequelize/migrations/XXXXXX-add-fields-to-courses.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'slug', {
      type: Sequelize.STRING,
      allowNull: true, // временно true, после ще update-нем съществуващите
      unique: true,
    });

    await queryInterface.addColumn('courses', 'short_description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'video_provider', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'trailer_url', {
      type: Sequelize.STRING(2048),
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'start_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'estimated_hours', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'max_participants', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn('courses', 'requires_approval', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('courses', 'is_public', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('courses', 'credits_for_completion', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('courses', 'has_certificate', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('courses', 'is_draft', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });

    await queryInterface.addColumn('courses', 'published_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'enrolled_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('courses', 'completed_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('courses', 'rating', {
      type: Sequelize.DECIMAL(2, 1),
      allowNull: true,
    });

    await queryInterface.addColumn('courses', 'tags', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
    });

    await queryInterface.addColumn('courses', 'target_audience', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('courses', 'slug');
    await queryInterface.removeColumn('courses', 'short_description');
    await queryInterface.removeColumn('courses', 'video_provider');
    await queryInterface.removeColumn('courses', 'trailer_url');
    await queryInterface.removeColumn('courses', 'start_date');
    await queryInterface.removeColumn('courses', 'end_date');
    await queryInterface.removeColumn('courses', 'estimated_hours');
    await queryInterface.removeColumn('courses', 'max_participants');
    await queryInterface.removeColumn('courses', 'requires_approval');
    await queryInterface.removeColumn('courses', 'is_public');
    await queryInterface.removeColumn('courses', 'credits_for_completion');
    await queryInterface.removeColumn('courses', 'has_certificate');
    await queryInterface.removeColumn('courses', 'is_draft');
    await queryInterface.removeColumn('courses', 'published_at');
    await queryInterface.removeColumn('courses', 'enrolled_count');
    await queryInterface.removeColumn('courses', 'completed_count');
    await queryInterface.removeColumn('courses', 'rating');
    await queryInterface.removeColumn('courses', 'tags');
    await queryInterface.removeColumn('courses', 'target_audience');
  },
};