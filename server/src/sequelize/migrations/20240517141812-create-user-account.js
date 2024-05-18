'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_accounts', {
      id: {
        allowNull: false,
        unique: true,
        notEmpty: true,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      phone_number: {
        type: Sequelize.STRING(10),
        unique: true,
        allowNull: false,
        notEmpty: true,
        is: {
          args: /^(\+?\d{1,3})?\s*\d{9}$/,
          msg: 'Phone number is not a valid.'
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        notEmpty: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_accounts');
  }
};