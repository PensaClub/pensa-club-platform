'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = bcrypt.hash(process.env.admin_password, 10);

    await queryInterface.bulkInsert(
      'user_accounts',
      [
        {
          email: process.env.admin_email,
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
