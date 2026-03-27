'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('forum_posts', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(350),
        allowNull: false,
        unique: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      excerpt: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'CASCADE',
      },
      space_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'forum_spaces', key: 'id' },
        onDelete: 'SET NULL',
      },
      type: {
        type: Sequelize.ENUM('discussion', 'article', 'poll', 'question'),
        allowNull: false,
        defaultValue: 'discussion',
      },
      status: {
        type: Sequelize.ENUM('published', 'pending', 'rejected', 'hidden'),
        allowNull: false,
        defaultValue: 'pending',
      },
      is_pinned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_locked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      view_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      comment_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      reaction_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      share_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      bookmark_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: [],
      },
      cover_image: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      last_activity_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      edited_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    // Post-tag junction table
    await queryInterface.createTable('forum_post_tags', {
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'forum_posts', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      tag_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'forum_tags', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true,
      },
    });

    // Indexes
    await queryInterface.addIndex('forum_posts', ['author_id']);
    await queryInterface.addIndex('forum_posts', ['space_id']);
    await queryInterface.addIndex('forum_posts', ['status']);
    await queryInterface.addIndex('forum_posts', ['last_activity_at']);
    await queryInterface.addIndex('forum_posts', ['type']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('forum_post_tags');
    await queryInterface.dropTable('forum_posts');
  },
};
