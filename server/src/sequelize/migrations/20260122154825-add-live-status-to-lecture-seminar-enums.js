// migrations/XXXXXX-add-live-status-to-lecture-seminar-enums.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // PostgreSQL позволява добавяне на стойност към ENUM
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_lectures_status ADD VALUE IF NOT EXISTS 'live' BEFORE 'completed';
    `);
    
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_seminars_status ADD VALUE IF NOT EXISTS 'live' BEFORE 'completed';
    `);
  },

  async down(queryInterface, Sequelize) {
    // ВНИМАНИЕ: PostgreSQL не позволява премахване на ENUM стойност лесно
    // Това изисква пресъздаване на типа, което е сложно
    // За down migration обикновено се оставя празно или се хвърля грешка
    console.log('Cannot remove enum values in PostgreSQL without recreating the type');
  }
};