"use strict";
const bcrypt = require("bcrypt");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash("Test1234", 10);

    await queryInterface.bulkInsert(
      "user_accounts",
      [
        {
          email: "test@test.com",
          password: hashedPassword,
          finished: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("user_accounts", null, {});
  },
};
