'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('user_ads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      summary: {
        type: DataTypes.STRING(32),
        allowNull: false,
        validate: {
          len: {
            args: [8, 32],
            msg: "Summary must be between 8 and 32 characters in length."
          }
        }
      },
      description: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        validate: {
          len: {
            args: [0, 1000],
            msg: "Maximum description length limit of 1000 characters is reached."
          }
        }
      },
      creation_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      expiration_date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: () => new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
      },
      approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable('user_ads');
  }
};