'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if tables already exist (idempotent)
    const [tables] = await queryInterface.sequelize.query(
      "SELECT tablename FROM pg_tables WHERE tablename IN ('forum_bookmarks', 'forum_reports')"
    );
    if (tables.length >= 2) return; // Both tables already exist

    // Bookmarks
    await queryInterface.createTable('forum_bookmarks', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'CASCADE',
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'forum_posts', key: 'id' },
        onDelete: 'CASCADE',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addConstraint('forum_bookmarks', {
      fields: ['user_id', 'post_id'],
      type: 'unique',
      name: 'forum_bookmarks_unique',
    });

    // Reports
    await queryInterface.createTable('forum_reports', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      reporter_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'CASCADE',
      },
      target_type: {
        type: Sequelize.ENUM('post', 'comment'),
        allowNull: false,
      },
      target_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      reason: {
        type: Sequelize.ENUM('spam', 'inappropriate', 'harassment', 'misinformation', 'other'),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'reviewed', 'dismissed'),
        allowNull: false,
        defaultValue: 'pending',
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'SET NULL',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('forum_reports', ['target_type', 'target_id']);
    await queryInterface.addIndex('forum_reports', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('forum_reports');
    await queryInterface.dropTable('forum_bookmarks');
  },
};
