'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('seminars', 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('seminars', 'short_description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'mentor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'mentors', key: 'id' },
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('seminars', 'seminar_type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'workshop',
    });
    await queryInterface.addColumn('seminars', 'is_online', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn('seminars', 'address', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'meeting_password', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'video_provider', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'video_url', {
      type: Sequelize.STRING(2048),
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'thumbnail_url', {
      type: Sequelize.STRING(2048),
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'scheduled_end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'timezone', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Europe/Sofia',
    });
    await queryInterface.addColumn('seminars', 'min_participants', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'requires_registration', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn('seminars', 'requires_approval', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('seminars', 'is_public', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn('seminars', 'credits_for_attendance', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('seminars', 'credits_for_participation', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('seminars', 'credits_for_test', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('seminars', 'has_test', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('seminars', 'test_passing_score', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'has_assignment', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('seminars', 'assignment_description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'is_published', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('seminars', 'published_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'cancelled_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'cancel_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'registered_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('seminars', 'attended_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('seminars', 'views_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('seminars', 'rating', {
      type: Sequelize.DECIMAL(2, 1),
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'tags', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
    });
    await queryInterface.addColumn('seminars', 'prerequisites', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('seminars', 'what_to_bring', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    const columns = [
      'slug', 'short_description', 'category', 'mentor_id', 'seminar_type',
      'is_online', 'address', 'meeting_password', 'video_provider', 'video_url',
      'thumbnail_url', 'scheduled_end_date', 'timezone', 'min_participants',
      'requires_registration', 'requires_approval', 'is_public',
      'credits_for_attendance', 'credits_for_participation', 'credits_for_test',
      'has_test', 'test_passing_score', 'has_assignment', 'assignment_description',
      'is_published', 'published_at', 'cancelled_at', 'cancel_reason',
      'registered_count', 'attended_count', 'views_count', 'rating', 'tags',
      'prerequisites', 'what_to_bring'
    ];
    for (const col of columns) {
      await queryInterface.removeColumn('seminars', col);
    }
  }
};