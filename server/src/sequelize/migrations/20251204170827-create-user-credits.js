'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_credits', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      total_credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      credits_by_category: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      level: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'beginner',
      },
      courses_completed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      lectures_attended: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      seminars_attended: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      presentations_viewed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      tests_passed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      certificates_earned: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_credits');
  },
};