'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('forum_polls', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: { model: 'forum_posts', key: 'id' },
        onDelete: 'CASCADE',
      },
      question: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      options: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      is_multiple_choice: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      total_votes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.createTable('forum_poll_votes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      poll_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'forum_polls', key: 'id' },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'user_accounts', key: 'id' },
        onDelete: 'CASCADE',
      },
      option_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addConstraint('forum_poll_votes', {
      fields: ['poll_id', 'user_id', 'option_id'],
      type: 'unique',
      name: 'forum_poll_votes_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('forum_poll_votes');
    await queryInterface.dropTable('forum_polls');
  },
};
