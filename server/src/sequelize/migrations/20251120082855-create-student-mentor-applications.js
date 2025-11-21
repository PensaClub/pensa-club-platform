'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student_mentor_applications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      mentor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'mentors',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      rejected_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    // Index за по-бързо търсене
    await queryInterface.addIndex('student_mentor_applications', ['user_id']);
    await queryInterface.addIndex('student_mentor_applications', ['mentor_id']);
    await queryInterface.addIndex('student_mentor_applications', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('student_mentor_applications');
  }
};