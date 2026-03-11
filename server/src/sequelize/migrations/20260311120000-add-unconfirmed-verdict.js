'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_fact_check_modules_verdict\" ADD VALUE IF NOT EXISTS 'unconfirmed';"
    );
  },

  async down() {
    // PostgreSQL does not support removing values from ENUMs
  },
};
