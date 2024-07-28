'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const adminPassword = process.env.admin_password;
    const adminEmail = process.env.admin_email;

    if (!adminPassword || !adminEmail) throw new Error('Environment variables admin_password and admin_email must be set');

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await queryInterface.bulkInsert(
      'user_accounts',
      [
        {
          email: adminEmail,
          password: hashedPassword,
          finished: true,
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_accounts', null, {});
  },
};
