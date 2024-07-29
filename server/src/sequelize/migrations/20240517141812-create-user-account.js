'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('user_accounts', {
      id: {
        allowNull: false,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Email format is incorrect.',
          },
          notEmpty: {
            msg: 'Email is required.',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Password is required.',
          },
        },
      },
      finished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      reset_token: DataTypes.STRING,
      token_expiration: DataTypes.DATE,
      role: {
        type: DataTypes.STRING,
        values: ['admin', 'user', 'guest '],
        allowNull: false,
        defaultValue: 'user',
        validate: {
          isIn: {
            args: [['admin', 'user', 'guest']],
            msg: 'Role must be one of the following: admin, user or guest.',
          },
        },
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },
  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('user_accounts');
  },
};
