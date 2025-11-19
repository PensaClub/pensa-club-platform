'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Направи studentId NULLABLE
    await queryInterface.changeColumn('mentor_meetings', 'student_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'students',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 2. Drop старата meetingType колона
    await queryInterface.removeColumn('mentor_meetings', 'meeting_type');

    // 3. Създай нова meetingType колона с правилните values
    await queryInterface.addColumn('mentor_meetings', 'meeting_type', {
      type: Sequelize.ENUM('viber', 'google_meet', 'phone', 'in_person', 'other'),
      allowNull: false,
      defaultValue: 'viber'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback: върни studentId NOT NULL
    await queryInterface.changeColumn('mentor_meetings', 'student_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Rollback: върни старата meetingType
    await queryInterface.removeColumn('mentor_meetings', 'meeting_type');
    
    await queryInterface.addColumn('mentor_meetings', 'meeting_type', {
      type: Sequelize.ENUM('online', 'phone', 'in_person'),
      allowNull: false,
      defaultValue: 'online'
    });
  }
};