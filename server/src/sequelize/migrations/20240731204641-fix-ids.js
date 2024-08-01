'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE SEQUENCE IF NOT EXISTS user_accounts_id_seq
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE user_accounts ALTER COLUMN id SET DEFAULT nextval('user_accounts_id_seq')
    `);

    await queryInterface.sequelize.query(`
      SELECT setval('user_accounts_id_seq', COALESCE((SELECT MAX(id) FROM user_accounts), 0) + 1, false)
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE user_accounts ALTER COLUMN id DROP DEFAULT
    `);

    await queryInterface.sequelize.query(`
      DROP SEQUENCE IF EXISTS user_accounts_id_seq
    `);
  },
};
