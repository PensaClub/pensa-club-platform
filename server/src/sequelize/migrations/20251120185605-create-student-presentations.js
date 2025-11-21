'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student_presentations', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      presentation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'presentations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('not_submitted', 'submitted', 'graded'),
        allowNull: false,
        defaultValue: 'not_submitted',
      },
      submission_url: {
        type: Sequelize.STRING(2048),
        allowNull: true,
        defaultValue: null,
      },
      submission_text: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      graded_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      earned_credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      graded_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'user_accounts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    // Indexes
    await queryInterface.addIndex('student_presentations', ['student_id']);
    await queryInterface.addIndex('student_presentations', ['presentation_id']);
    await queryInterface.addIndex('student_presentations', ['status']);
    
    // Unique constraint
    await queryInterface.addIndex('student_presentations', ['student_id', 'presentation_id'], {
      unique: true,
      name: 'student_presentations_unique_enrollment'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('student_presentations');
  },
};