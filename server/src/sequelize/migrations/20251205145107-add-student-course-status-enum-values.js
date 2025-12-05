'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Добави липсващите стойности към ENUM
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_student_courses_status ADD VALUE IF NOT EXISTS 'active';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_student_courses_status ADD VALUE IF NOT EXISTS 'pending';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_student_courses_status ADD VALUE IF NOT EXISTS 'completed';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_student_courses_status ADD VALUE IF NOT EXISTS 'dropped';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_student_courses_status ADD VALUE IF NOT EXISTS 'rejected';
    `);
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL не позволява лесно премахване на ENUM стойности
    // За rollback би трябвало да се пресъздаде целият ENUM
    console.log('ENUM values cannot be easily removed in PostgreSQL');
  }
};