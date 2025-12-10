'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('lectures', 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn('lectures', 'short_description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'mentor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'mentors', key: 'id' },
      onDelete: 'SET NULL',
    });
    await queryInterface.addColumn('lectures', 'lecture_type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'live',
    });
    await queryInterface.addColumn('lectures', 'is_online', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn('lectures', 'address', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'meeting_password', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'video_provider', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'video_url', {
      type: Sequelize.STRING(2048),
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'thumbnail_url', {
      type: Sequelize.STRING(2048),
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'scheduled_end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'timezone', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Europe/Sofia',
    });
    await queryInterface.addColumn('lectures', 'max_participants', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'requires_registration', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn('lectures', 'is_public', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
    await queryInterface.addColumn('lectures', 'credits_for_attendance', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('lectures', 'credits_for_test', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('lectures', 'has_test', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('lectures', 'test_passing_score', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'is_published', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('lectures', 'published_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'cancelled_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'cancel_reason', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'registered_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('lectures', 'attended_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('lectures', 'views_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('lectures', 'rating', {
      type: Sequelize.DECIMAL(2, 1),
      allowNull: true,
    });
    await queryInterface.addColumn('lectures', 'tags', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    const columns = [
      'slug', 'short_description', 'category', 'mentor_id', 'lecture_type',
      'is_online', 'address', 'meeting_password', 'video_provider', 'video_url',
      'thumbnail_url', 'scheduled_end_date', 'timezone', 'max_participants',
      'requires_registration', 'is_public', 'credits_for_attendance',
      'credits_for_test', 'has_test', 'test_passing_score', 'is_published',
      'published_at', 'cancelled_at', 'cancel_reason', 'registered_count',
      'attended_count', 'views_count', 'rating', 'tags'
    ];
    for (const col of columns) {
      await queryInterface.removeColumn('lectures', col);
    }
  }
};