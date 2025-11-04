'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Add accumulated statistics columns
    await queryInterface.addColumn('mentors', 'accumulated_online_minutes', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total accumulated online minutes from all completed sessions (persistent, never resets)'
    });

    await queryInterface.addColumn('mentors', 'accumulated_messages_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total accumulated messages sent by mentor (persistent)'
    });

    await queryInterface.addColumn('mentors', 'accumulated_response_time_sum', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Sum of all response times in minutes for averaging (persistent)'
    });

    await queryInterface.addColumn('mentors', 'accumulated_response_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Count of responses for calculating average response time (persistent)'
    });

    await queryInterface.addColumn('mentors', 'accumulated_completed_sessions', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Total number of completed sessions (persistent)'
    });

    await queryInterface.addColumn('mentors', 'last_session_synced_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
      comment: 'Timestamp of last Firebase session sync'
    });

    // ✅ Add index for performance
    await queryInterface.addIndex('mentors', ['last_session_synced_at'], {
      name: 'idx_mentors_last_session_synced'
    });

    console.log('✅ Added accumulated stats columns to mentors table');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('mentors', 'idx_mentors_last_session_synced');
    await queryInterface.removeColumn('mentors', 'last_session_synced_at');
    await queryInterface.removeColumn('mentors', 'accumulated_completed_sessions');
    await queryInterface.removeColumn('mentors', 'accumulated_response_count');
    await queryInterface.removeColumn('mentors', 'accumulated_response_time_sum');
    await queryInterface.removeColumn('mentors', 'accumulated_messages_count');
    await queryInterface.removeColumn('mentors', 'accumulated_online_minutes');
    
    console.log('✅ Removed accumulated stats columns from mentors table');
  }
};