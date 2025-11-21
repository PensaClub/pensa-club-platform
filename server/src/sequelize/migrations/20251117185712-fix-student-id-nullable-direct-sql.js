'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Директен SQL за да сме сигурни че работи
    await queryInterface.sequelize.query(`
      ALTER TABLE mentor_meetings 
      ALTER COLUMN student_id DROP NOT NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE mentor_meetings 
      ALTER COLUMN student_id SET NOT NULL;
    `);
  }
};