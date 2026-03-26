'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('forum_reactions', {
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
      target_type: {
        type: Sequelize.ENUM('post', 'comment'),
        allowNull: false,
      },
      target_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      emoji: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addConstraint('forum_reactions', {
      fields: ['user_id', 'target_type', 'target_id'],
      type: 'unique',
      name: 'forum_reactions_unique_per_user',
    });

    await queryInterface.addIndex('forum_reactions', ['target_type', 'target_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('forum_reactions');
  },
};
