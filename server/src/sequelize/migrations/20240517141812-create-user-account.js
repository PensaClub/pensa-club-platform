'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('user_accounts', {
      id: {
        allowNull: false,
        unique: true,
        notEmpty: true,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      phone_number: {
        type: DataTypes.STRING(16),
        unique: true,
        allowNull: false,
        notEmpty: true,
        validate: {
          len: {
            args: [8, 16],
            msg: 'Phone number is not valid.'
          },
          is: {
            args: /^(?:\+\d{7,15}|\d{10})$/,
            msg: 'Phone number is not valid.'
          },
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        notEmpty: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('user_accounts');
  }
};