'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Проверка дали enum типът съществува
    const [results] = await queryInterface.sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'enum_user_accounts_role'
      ) AS type_exists;
    `);

    if (!results[0].type_exists) {
      // Ако enum типът НЕ съществува, създай го
      await queryInterface.sequelize.query(`
        CREATE TYPE enum_user_accounts_role AS ENUM (
          'admin', 'moderator', 'user', 'guest', 'limited', 'mentor'
        );
      `);
    } else {
      // Ако enum типът съществува, провери дали има 'mentor' стойност
      const [enumValues] = await queryInterface.sequelize.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'mentor' 
          AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_user_accounts_role')
        ) AS has_mentor;
      `);

      if (!enumValues[0].has_mentor) {
        // Добави 'mentor' ако липсва
        await queryInterface.sequelize.query(`
          ALTER TYPE enum_user_accounts_role ADD VALUE IF NOT EXISTS 'mentor';
        `);
      } else {
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Cannot easily remove enum values in PostgreSQL
  }
};