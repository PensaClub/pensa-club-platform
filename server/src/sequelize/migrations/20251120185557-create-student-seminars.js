'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('student_seminars', {
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
      seminar_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'seminars',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      attended: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      attended_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      earned_credits: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
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
    await queryInterface.addIndex('student_seminars', ['student_id']);
    await queryInterface.addIndex('student_seminars', ['seminar_id']);
    await queryInterface.addIndex('student_seminars', ['attended']);
    
    // Unique constraint
    await queryInterface.addIndex('student_seminars', ['student_id', 'seminar_id'], {
      unique: true,
      name: 'student_seminars_unique_enrollment'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('student_seminars');
  },
};