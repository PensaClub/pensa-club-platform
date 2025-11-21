'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_user_accounts_role ADD VALUE IF NOT EXISTS 'student';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Cannot easily remove ENUM value in PostgreSQL
    // Would require creating new type and migrating data
    console.log('Downgrade not supported for ENUM modification');
  }
};